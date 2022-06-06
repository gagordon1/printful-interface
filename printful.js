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

  app.get("/shipping-rate", async (req, res) =>{

      const sampleData = {
          "recipient": {
            "address1": "19749 Dearborn St",
            "city": "Chatsworth",
            "country_code": "US",
            "state_code": "CA",
            "zip": 91311,
            "phone": "string"
          },
          "items": [
            {
              "variant_id": "202",
              "external_variant_id": "1001",
              "warehouse_product_variant_id": "2",
              "quantity": 10,
              "value": "2.99"
            }
          ],
          "currency": "USD",
          "locale": "en_US"
        }
      try{
        const rawResponse = await axios.post(
          process.env.PRINTFUL_SHIPPING_RATE_ENDPOINT,
          sampleData,
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
