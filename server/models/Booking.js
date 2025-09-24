// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Cancelled'],
    default: 'Pending'
  },
  paymentId: {
    type: String // Razorpay payment ID
  },
  totalAmount: {
    type: Number,
    required: true
  },
  // Enhanced payment details
  payment: {
    orderId: String,      // Razorpay order ID
    paymentId: String,    // Razorpay payment ID
    signature: String,    // Razorpay signature
    paidAt: Date,         // Payment completion timestamp
    method: String,       // Payment method (card, netbanking, etc.)
    amount: Number        // Amount paid (for verification)
  }
}, {
  timestamps: true // Creates createdAt and updatedAt automatically
});

// Index for faster queries
bookingSchema.index({ userId: 1, paymentStatus: 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;