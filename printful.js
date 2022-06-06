const axios = require('axios');

const options = {
  headers: {
    Authorization: 'Bearer ' + process.env.PRINTFUL_AUTH_KEY
  }
}

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

      const data = {
          "recipient": {
            "address": items.address,
            "city": items.city,
            "country_code": items.country_code,
            "state_code": items.state_code,
            "zip": items.zip
          },
          "items": [
            {
              "variant_id": items.variant_id,
              "quantity": 1
            }
          ],
          "currency": "USD",
          "locale": "en_US"
        }
      try{
        console.log("Sending data to printful...");
        console.log(data);
        const rawResponse = await axios.post(
          process.env.PRINTFUL_SHIPPING_RATE_ENDPOINT,
          data,
          options
        );
        const content = rawResponse.data;

        console.log(content);
        res.send(content);

      }catch(error){
        console.log(error);
        res.send(error.message);
      }


  });

}
