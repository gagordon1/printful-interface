const express = require('express');
const dotenv = require('dotenv');
const config = require("./config")

dotenv.config();

const app = express();
app.use(express.json())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', config.requestOrigin());
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  next();
});

const port = process.env.PORT;

const { MongoClient } = require("mongodb");
// Connection URI
const uri = process.env.MONGODB_URI;
// Create a new MongoClient
const client = new MongoClient(uri);


// ROUTES
require('./orders')(app, client);
require('./printful')(app);
const printfulStoreData = require('./printfulStoreData');

app.get('/', (req,res) =>{
  res.send("Webstore Backend Server");
});

app.get('/updateProducts', (req, res) => {
  try{
    printfulStoreData.updateProductData(res);
  }catch(error){
    res.send("Error updating Product Data...");
  }

});

app.get('/updateRegions', (req, res) => {
  try{
    printfulStoreData.updateRegionData(res);
  }catch(error){
  res.send("Error updating Region Data..");
}

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
    res.send(products.find((obj) => {return obj.id == req.params.id}));
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
