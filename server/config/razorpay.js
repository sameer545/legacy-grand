const Razorpay = require("razorpay");

const instance = new Razorpay({
  // Remove VITE_ prefix for backend environment variables
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = instance;