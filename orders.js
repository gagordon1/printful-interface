const printful = require('./printfulOrderData');
const printfulStore = require('./printfulStoreData');


const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY)

async function getPriceData(items) {

  const taxData = await printful.getTaxRate(
    items.recipient.countryCode,
    items.recipient.stateCode,
    items.recipient.city,
    items.recipient.zipCode
  )

  const shippingData = await printful.getShippingRate(
    items.recipient.address,
    items.recipient.city,
    items.recipient.countryCode,
    items.recipient.stateCode,
    items.recipient.zipCode,
    items.catalogVariantId
  );
  const productData = await printfulStore.getSyncProduct(items.id);


  const syncProduct = productData.data.result.sync_variants.find(
    obj => {return obj.id === items.variantId}
  )
  const retailPrice = Number(syncProduct.retail_price);
  const shippingRate = Number(shippingData.rate);
  const taxRate = Number(taxData.rate);
  return {
    retailPrice : retailPrice,
    shippingRate : shippingRate,
    taxRate : taxRate
  };
}

// Create payment Intent and make a draft order w/printful
// submit order to my database
// REQUEST:
// {
//     variantId : int,
//     catalogVariantId : int,
//     recipient :{
//                    name : string,
//                    email : string,
//                    address1 : string,
//                    suite : string, (optional)
//                    city : string,
//                    countryCode : string,
//                    stateCode : string,
//                    zipCode : string
//                 },
//      emailNotifs : boolean
//}
// RESPONSE:
// 200 if successful payment intent creation and printful order a
// response body is id for the order
// 400 and message if shipping bad
// 400 and message if card bad
module.exports = function(app, mongoClient){
  app.post("/create-payment-intent", async (req, res) => {
    let items = req.body;
    try{
      const priceData = await getPriceData(items);
      const totalPrice = (priceData.retailPrice + priceData.shippingRate)*(1+priceData.taxRate);

      //Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice*100),//convert to cents (stripe docs)
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      //make order data in mongo
      //


      //make order draft in printful




      res.send({
        clientSecret: paymentIntent.client_secret,
      });

      res.send("hi");
    }catch(error){
      res.send(error.message)
    }






  });

  app.get('/stripe-config', (req, res) =>{
    try{
      res.send(process.env.STRIPE_TEST_PUBLISHABLE_KEY);
    }
    catch(error){
      res.send(error);
    }

  });

}
