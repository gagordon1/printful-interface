const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');



dotenv.config();

const app = express();
const port = process.env.PORT;

app.get('/', (req, res) => {
  res.send('Printful Interface');
});

//get my store's products from printful api
app.get('/products', (req, res) =>{

  let options = {
    headers: {
      Authorization: 'Bearer ' + process.env.PRINTFUL_AUTH_KEY
    }
  }

  axios.get(process.env.PRINTFUL_PRODUCTS_ENDPOINT,options)
    .then(response => {
      console.log(`statusCode: ${response.status}`);
      console.log(response.data["result"]);
      res.send(response.data["result"]);
    })
    .catch(error => {
      console.error(error);
      res.send(error);
    });


});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
