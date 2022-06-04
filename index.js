const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');



dotenv.config();

const app = express();
const port = process.env.PORT;

const options = {
  headers: {
    Authorization: 'Bearer ' + process.env.PRINTFUL_AUTH_KEY
  }
}

const getProductById = (itemId) => axios.get(
  process.env.PRINTFUL_PRODUCTS_ENDPOINT + "/" +itemId,
  options
);

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


app.get('/', (req, res) => {
  res.send('Printful Interface');
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
          console.log(data);
          res.send(data);
        }))
        .catch(error => {
          console.log(error);
          res.send(error);
        })
      })
    .catch(error => {
      res.send(error);
    });
});


app.get('/product-details/:id', (req, res) => {

  axios.get(
    process.env.PRINTFUL_PRODUCTS_ENDPOINT + "/" + req.params.id,
    options
    )
  .then(
    response => {
      let result = response.data.result;
      res.send(JSON.stringify(parseProductData(result)));
    }
  )
  .catch(
    error => res.send(error)
    );

});



app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
