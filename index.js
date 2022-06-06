const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const fs = require('fs');




dotenv.config();

const app = express();
app.use(express.json())
const port = process.env.PORT;


// ROUTES
require('./create-payment-intent')(app);


const options = {
  headers: {
    Authorization: 'Bearer ' + process.env.PRINTFUL_AUTH_KEY
  }
}

const getProductById = (itemId) => axios.get(
  process.env.PRINTFUL_PRODUCTS_ENDPOINT + "/" +itemId,
  options
);

const parseRegionData = (data) =>{
  let out = {};
  data.map(
    obj => {
      out[obj["name"]] =
      {
        code : obj["code"],
        states: obj["states"]
      }
    }
  );
  return out;
}

const parseProductData = (data) =>{
  return {
    thumbnail : data.sync_product.thumbnail_url,
    id : data.sync_product.id,
    name : data.sync_product.name,
    retailPrice : data.sync_variants[0].retail_price,
    availableSizes : data.sync_variants.map(
      variant => variant.sku.split('_').pop()
    )
  }
}

function updateProductData(res){
  axios.get(process.env.PRINTFUL_PRODUCTS_ENDPOINT,options)
    .then(response => {
      return response.data["result"];
    })
    .then(products => {
      const data = products.map( (item) => getProductById(item.id));
      axios.all(data)
        .then(axios.spread((...response) =>{
          let data = response.map(
            (item) => parseProductData(item.data.result)
          );
          try {
            fs.writeFileSync('products.json', JSON.stringify(data));
            console.log("JSON data is saved.");
            res.send("JSON data is saved.")
          } catch (error) {
            console.error(error);
            res.send(error);
          }
        }))
        .catch(error => {
          res.send(error);
        })
      })
    .catch(error => {
      res.send(error);
    });
}

function updateRegionData(res){
  axios.get(
    process.env.PRINTFUL_COUNTRIES_ENDPOINT,
    options
  )
  .then(response =>{

      try {
        fs.writeFileSync('regions.json', JSON.stringify(
          parseRegionData(response.data.result)
        ));
        console.log("JSON data is saved.");
        res.send("JSON data is saved.")
      } catch (error) {
        console.error(error);
        res.send(error);
      }
    }
  )
  .catch(
    error => res.send(error)
  );
}


app.get('/updateProducts', (req, res) => {
  updateProductData(res);
});

app.get('/updateRegions', (req, res) => {
  updateRegionData(res);
});

//PRODUCT INTERFACE
//{
  // thumbnail : String
  // name : String
  // retailPrice : String
  // availableSizes : [String]
  // id : Number
// }

//RETURNS [
//          PRODUCT
//        ]
app.get('/products', (req, res) =>{
  try{
    res.send(require("./products.json"));
  }
  catch(error){
    res.send(error);
  }

});


app.get('/product-details/:id', (req, res) => {
  try{
    let products = require("./products.json");
    res.send(products.find((obj) => {return obj.id = req.params.id}));
  }
  catch(error){
    res.send(error);
  }
});

app.get('/regions', (req, res) => {
  try{
    res.send(require("./regions.json"));
  }
  catch(error){
    res.send(error);
  }

});



app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
