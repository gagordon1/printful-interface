
const DEVELOPMENT = false;

module.exports = {
  requestOrigin : function () {return (DEVELOPMENT? "*" : "https://webstore-frontend.herokuapp.com")},

  stripeSecretKey : function () {return ( DEVELOPMENT? process.env.STRIPE_TEST_SECRET_KEY : process.env.STRIPE_LIVE_SECRET_KEY)},

  stripePublishableKey : function () {return (DEVELOPMENT? process.env.STRIPE_TEST_PUBLISHABLE_KEY : process.env.STRIPE_LIVE_PUBLISHABLE_KEY)}
}
