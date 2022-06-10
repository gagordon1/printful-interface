const axios = require('axios');
const orderData = require('./printfulOrderData')


module.exports = function(app){

  app.post("/shipping-rate", async (req, res) =>{
      const items = req.body;

      res.send(orderData.getShippingRate(
        items.address,
        items.city,
        items.country_code,
        items.state_code,
        items.zip,
        items.variant_id
      ));


  });

  app.post("/tax-rate", async (req, res) =>{
      const items = req.body;

      res.send(orderData.getTaxRate(
        items.country_code,
        items.state_code,
        items.city,
        items.zip)
      );
  });

}
