const axios = require('axios');
const orderData = require('./printfulOrderData')


module.exports = function(app){


  // shipping-rate
  // Request : {
  //     address : String
  //     city : String
  //     country_code : String
  //     state_code : String
  //     zip : Integer
  //     catalogVariantId : Integer
  //}
  //
  // Response :  {
  //  id : "STANDARD"
  //  name : string
  //  rate : string
  //  currency : string
  //  minDeliveryDays : Number
  //  maxDeliveryDays : Number
  //}
  //
  //  Gets shipping rate and time estimation for standard shipping to
  //  a location
  app.post("/shipping-rate", async (req, res) =>{
      const items = req.body;

      const orderResponse = await orderData.getShippingRate(
        items.address,
        items.city,
        items.country_code,
        items.state_code,
        items.zip,
        items.variant_id
      )

      res.send(orderResponse);

  });

  //
  // Request : {
  //  country_code : String
  //  state_code : String
  //  city : String
  //  zip : Integer
  //}
  //
  // Response : {
  //    required : boolean
  //    rate : float
  //    shipping_taxable : false
  //  }
  //
  // Gets tax information for a location
  //
  app.post("/tax-rate", async (req, res) =>{
      const items = req.body;

      const orderResponse = await orderData.getTaxRate(
        items.country_code,
        items.state_code,
        items.city,
        items.zip
      )

      res.send(orderResponse);

    });
}
