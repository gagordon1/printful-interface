const axios  = require('axios');
const fs = require('fs');

const options = {
  headers: {
    Authorization: 'Bearer ' + process.env.PRINTFUL_AUTH_KEY
  }
}

module.exports = {
  getTaxRate : async function (countryCode, stateCode, city, zip){
    const data = {
      recipient : {
        country_code : countryCode,
        state_code : stateCode,
        city : city,
        zip : zip
      }
    }
    try{
      console.log("Sending tax data to printful...");
      const rawResponse = await axios.post(
        process.env.PRINTFUL_TAX_RATE_ENDPOINT,
        data,
        options
      );
      const content = rawResponse.data;

      return(content.result);

    }catch(error){
      console.log(error);
      return(error.message);
    }

  },
  getShippingRate : async function (address, city, countryCode, stateCode, zip, variantId){
    const data = {
        "recipient": {
          "address": address,
          "city": city,
          "country_code": countryCode,
          "state_code": stateCode,
          "zip": zip
        },
        "items": [
          {
            "variant_id": variantId,
            "quantity": 1
          }
        ],
        "currency": "USD",
        "locale": "en_US"
      }
    try{
      const rawResponse = await axios.post(
        process.env.PRINTFUL_SHIPPING_RATE_ENDPOINT,
        data,
        options
      );
      const content = rawResponse.data;

      if(content.code === 400){
        return (content.result);
      }
      else{

        return (content.result.find(obj => obj.id === "STANDARD"));
      }


    }catch(error){
      console.log(error);
      return (error.message);
    }


  }
}
