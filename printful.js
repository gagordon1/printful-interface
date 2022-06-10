const axios = require('axios');
const orderData = require('./printfulOrderData')


module.exports = function(app){




  app.get("/submit-order", async (req, res) => {

    let opt = {
      ...options,
      params : {
        confirm : "false"
      }
    };

    const sampleData = {
        "recipient": {
            "name": "John Doe",
            "address1": "19749 Dearborn St",
            "city": "Chatsworth",
            "state_code": "CA",
            "country_code": "US",
            "zip": "91311"
        },
        "items": [
            {
                "sync_variant_id": 3289105663,
                "quantity": 1
            }
        ]
    }
    try{
      const rawResponse = await axios.post(
        process.env.PRINTFUL_ORDERS_ENDPOINT,
        sampleData,
        opt
      )

      const content = rawResponse.data;

      console.log(content);
      res.send(content);

    }
    catch(error) {
      console.log(error);
      res.send(error.message);
    }


  });

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
