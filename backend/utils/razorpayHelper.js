const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in INR (in paise)
 * @param {string} currency - Currency code (default: 'INR')
 * @param {string} receipt - Unique receipt/order id
 * @param {object} notes - Additional notes (optional)

 */
async function createOrder(amount, currency = 'INR', receipt, notes = {}) {
  console.log(amount, "====>>>>>>>>>>")
  const options = {
    amount: Math.round(amount), // amount in paise
    currency,
    receipt,
    payment_capture: 1,
    notes,
  };
  return await razorpay.orders.create(options);
}

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean}
 */
function verifySignature(orderId, paymentId, signature) {
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(orderId + '|' + paymentId);
  const generatedSignature = hmac.digest('hex');
  return generatedSignature === signature;
}

module.exports = {
  createOrder,
  verifySignature,
}; 