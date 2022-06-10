const axios  = require('axios');
const fs = require('fs');


const options = {
  headers: {
    Authorization: 'Bearer ' + process.env.PRINTFUL_AUTH_KEY
  }
}

const getProductById = (itemId) => axios.get(
  process.env.PRINTFUL_PRODUCTS_ENDPOINT + "/" +itemId,
  options
);

const parseRegionData = (data) =>{
  let out = {};
  data.map(
    obj => {
      out[obj["name"]] =
      {
        code : obj["code"],
        states: obj["states"]
      }
    }
  );
  return out;
}

const parseProductData = (data) =>{
  return {
    thumbnail : data.sync_product.thumbnail_url,
    id : data.sync_product.id,
    name : data.sync_product.name,
    retailPrice : data.sync_variants[0].retail_price,
    variants : data.sync_variants.map(
      variant => {return {
          id: variant.id,
          size : variant.sku.split('_').pop(),
          name : variant.name,
          catalogVariantId : variant.variant_id
        }
      }
    )
  }
}


module.exports = {
  getSyncProduct : function(itemId){
    return getProductById(itemId)
  },
  updateProductData : function (res){
    axios.get(process.env.PRINTFUL_PRODUCTS_ENDPOINT,options)
      .then(response => {
        return response.data["result"];
      })
      .then(products => {
        const data = products.map( (item) => getProductById(item.id));
        axios.all(data)
          .then(axios.spread((...response) =>{
            let data = response.map(
              (item) => parseProductData(item.data.result)
            );
            try {

              fs.writeFileSync('products.json', JSON.stringify(data));
              console.log("JSON data is saved.");
              res.send("JSON data is saved.")
            } catch (error) {
              console.error(error);
              res.send(error);
            }
          }))
          .catch(error => {
            res.send(error);
          })
        })
      .catch(error => {
        res.send(error);
      });
  },

  updateRegionData : function (res){
    axios.get(
      process.env.PRINTFUL_COUNTRIES_ENDPOINT,
      options
    )
    .then(response =>{

        try {
          fs.writeFileSync('regions.json', JSON.stringify(
            parseRegionData(response.data.result)
          ));
          console.log("JSON data is saved.");
          res.send("JSON data is saved.")
        } catch (error) {
          console.error(error);
          res.send(error);
        }
      }
    )
    .catch(
      error => res.send(error)
    );
  }
}
