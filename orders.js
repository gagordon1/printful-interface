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
//     id : int,
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

    try{
      let items = req.body;
      const priceData = await getPriceData(items);
      const totalPrice = (priceData.retailPrice + priceData.shippingRate)*(1+priceData.taxRate);

      //create stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice*100),//convert to cents (stripe docs)
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
        receipt_email : items.recipient.email,
        shipping : {
          address : {
            line1 :items.recipient.address,
            city : items.recipient.city,
            country : items.recipient.countryCode,
            state : items.recipient.stateCode,
            postal_code :items.recipient.zipCode
          },
          name : items.recipient.name
        }

      });
      console.log("paymentIntent created...")


    //make printful order
      let response = await printful.submitOrder(
        items.variantId,
        items.recipient.name,
        items.recipient.address,
        items.recipient.suite,
        items.recipient.city,
        items.recipient.countryCode,
        items.recipient.stateCode,
        items.recipient.zipCode
      )
      const printfulResult = response.result;

      if (response.code !== 200){
        res.status(400).send("Error submitting draft order to printful")
      }
      console.log(response);
      console.log("draft order submitted to printful...")

      //make order data in mongo
      //
      const order = {
        id : printfulResult.id,
        created : printfulResult.created,
        myCosts : printfulResult.costs,
        retailPrice : priceData.retailPrice,
        customerShippingRate : priceData.shippingRate,
        customerTaxRate : priceData.taxRate,
        currency : "usd",
        productVariantid : items.variantId,
        recipient :{
          name : items.recipient.name,
          email : items.recipient.email,
          address : items.recipient.address,
          suite : items.recipient.suite,
          city : items.recipient.city,
          country : items.recipient.countryCode,
          state : items.recipient.stateCode,
          zipCode : items.recipient.zipCode
        },
        paymentComplete : false,
        shipped : false,
        cancelled : false
      };

      try{
        await mongoClient.connect();
        //Establish and verify connection
        const database = mongoClient.db("WebstoreDB")
        const orders = database.collection("Orders");
        const mongoResult = await orders.insertOne(order);
        console.log(`An order was inserted with the _id: ${mongoResult.insertedId}`);
      }catch(error){
        console.log(error);
        res.status(400).send("Could not add order to database");
      }
      finally  {
        await mongoClient.close();
      }

      res.send({
        clientSecret: paymentIntent.client_secret,
        orderId : printfulResult.id
      });

  }catch(error){
    console.log(error);
    res.send("Error creating payment intent");
  }

  });

  //  Request {
  //     orderId : Integer
  //  }
  //
  //  Response
  //    200 : If the database updated
  //    400 if there was an error updating mongo
  //
  //
  // Upon payment, find order in the database, update its state - email me to
  // confirm the order in printful
  //
  app.post('/finalize-order', async (req, res)=>{

    try{
      const items = req.body;
      await mongoClient.connect();
      //Establish and verify connection
      const database = mongoClient.db("WebstoreDB")
      const orders = database.collection("Orders");
      const filter = { id : items.orderId };
      // create a document that sets the plot of the movie
      const updateDoc = {
        $set: {
          paymentComplete: true
        }
      };
      const result = await orders.updateOne(filter, updateDoc);

      if(result.modifiedCount !== 1){
        console.log(result);
        res.status(400).send("Number of updated items did not equal 1")
      }
      else{
        console.log("Successfully updated the database.")
        res.send("Successfully updated the database.");
      }

    }catch(error){
      console.log(error);
      res.status(400).send("Could not edit the database");
    }
    finally  {
      await mongoClient.close();
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
