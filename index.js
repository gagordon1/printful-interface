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

const getProductDetails = (id) => {
  axios.get(process.env.PRINTFUL_PRODUCTS_ENDPOINT + "/" + id, options)
    .then(response => {
      const product = response.data.result;
      let productInfo = {
                  "name" : product.sync_product.name,
                  "image" : product.sync_product.thumbnail_url,
                  "retailPrice" : product.sync_variants[0].retail_price
                }
      console.log(productInfo);
      return productInfo;
    })
    .catch(error =>{
      console.error(error);
    })
}

app.get('/', (req, res) => {
  res.send('Printful Interface');
});

//get my store's products from printful api
app.get('/products', (req, res) =>{



  axios.get(process.env.PRINTFUL_PRODUCTS_ENDPOINT,options)
    .then(response => {
      return response.data["result"];
    })
    .then(products => {
      const data = products.map( item => getProductDetails(item.id));
      res.send(JSON.stringify(data));
    })
    .catch(error => {
      console.error(error);
      res.send(error);
    });


});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
