const axios  = require('axios');
const fs = require('fs');

const options = {
  headers: {
    Authorization: 'Bearer ' + process.env.PRINTFUL_AUTH_KEY
  }
}

module.exports = {
  submitOrder : async function (variantId, name, address, suite, city, countryCode, stateCode, zip){
    let opt = {
      ...options,
      params : {
        confirm : "false"
      }
    };

    let order = {
        recipient: {
            name: name,
            address1: address,
            city: city,
            country_code: countryCode,
            zip: zip
        },
        items: [
            {
                sync_variant_id: variantId,
                quantity: 1
            }
        ]
    }
    if (suite !== ""){
      order.recipient.address2 = suite;
    }
    if (stateCode !== ""){
      order.recipient.state_code = stateCode
    }

    try{
      const rawResponse = await axios.post(
        process.env.PRINTFUL_ORDERS_ENDPOINT,
        order,
        opt
      )

      const content = rawResponse.data;
      return(content);

    }
    catch(error) {
      console.log(error);
      return(error.message);
    }
  },
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
  getShippingRate : async function (address, city, countryCode, stateCode, zip, catalogVariantId){
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
            "variant_id": catalogVariantId,
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
        let out = content.result.find(obj => {return obj.id === "STANDARD"})

        return (out);
      }


    }catch(error){
      console.log(error);
      return (error.message);
    }


  }
}
