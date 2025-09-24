// backend/routes/paymentRoutes.js (Updated - Removed Conflict Booking)
const express = require("express");
const router = express.Router();
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const AdminRoom = require("../models/AdminRoom");
const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleware");
const { sendBookingConfirmationEmail } = require("../services/emailService");

// Create Razorpay Order with Admin Room Lock Check Only
router.post("/create-order", verifyToken, async (req, res) => {
  try {
    const { amount, currency = "INR", roomId, checkIn, checkOut } = req.body;

    // Validate required fields
    if (!amount || !roomId || !checkIn || !checkOut) {
      return res.status(400).json({ 
        success: false, 
        error: "Amount, roomId, checkIn, and checkOut are required" 
      });
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: "Room not found"
      });
    }

    // Check if room type is fully locked by admin
    const fullyLocked = await AdminRoom.isRoomTypeFullyLocked(room.name);
    if (fullyLocked) {
      return res.status(400).json({
        success: false,
        error: "This room type is currently unavailable due to maintenance",
        reason: "admin_locked"
      });
    }

    // Get available admin rooms of this type (not locked)
    const availableAdminRooms = await AdminRoom.getAvailableRoomsByType(room.name);
    
    if (availableAdminRooms.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No rooms of this type are currently available",
        reason: "all_locked"
      });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        error: "Check-out date must be after check-in date"
      });
    }

    // Create the booking
    const booking = new Booking({
      roomId,
      userId: req.userId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalAmount: amount,
      paymentStatus: 'Pending'
    });

    const savedBooking = await booking.save();

    const options = {
      amount: Math.round(amount * 100), // Razorpay works in paise, ensure integer
      currency,
      receipt: `rcpt_${savedBooking._id.toString().slice(-8)}`, // Keep under 40 chars
      notes: {
        bookingId: savedBooking._id.toString(),
        userId: req.userId,
        roomName: room.name,
        roomType: room.name
      }
    };

    const order = await razorpay.orders.create(options);
    
    // Store order ID in booking for reference
    await Booking.findByIdAndUpdate(savedBooking._id, {
      paymentId: order.id,
      paymentStatus: 'Pending'
    });

    res.json({ 
      success: true, 
      order,
      bookingId: savedBooking._id,
      availableRooms: availableAdminRooms.length
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to create order" 
    });
  }
});

// Verify Payment Signature and Update Booking with Room Assignment
router.post("/verify", verifyToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing payment details" 
      });
    }

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: "Payment verification failed" 
      });
    }

    // Payment verified successfully - update booking and assign room
    if (bookingId) {
      const booking = await Booking.findOne({ 
        _id: bookingId, 
        userId: req.userId 
      }).populate('roomId', 'name price description');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found"
        });
      }

      // Update booking status
      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          paymentStatus: 'Paid',
          paymentId: razorpay_payment_id,
          $set: {
            'payment.orderId': razorpay_order_id,
            'payment.paymentId': razorpay_payment_id,
            'payment.signature': razorpay_signature,
            'payment.paidAt': new Date()
          }
        },
        { new: true }
      ).populate('roomId', 'name price description')
       .populate('userId', 'name email');

      // Assign an available admin room (not locked)
      try {
        const roomType = booking.roomId.name;
        const availableAdminRoom = await AdminRoom.findOne({
          roomType: roomType,
          isLocked: false,
          isOccupied: false
        });

        if (availableAdminRoom) {
          await AdminRoom.findByIdAndUpdate(availableAdminRoom._id, {
            isOccupied: true,
            currentGuest: updatedBooking.userId.name,
            currentBookingId: bookingId,
            checkInDate: booking.checkIn,
            checkOutDate: booking.checkOut
          });

          console.log(`✅ Room ${availableAdminRoom.roomNumber} assigned to booking ${bookingId}`);
        } else {
          console.warn(`⚠️ No available admin room found for booking ${bookingId}, room type: ${roomType}`);
        }
      } catch (roomAssignmentError) {
        console.error('Error assigning admin room:', roomAssignmentError);
        // Don't fail the payment verification if room assignment fails
      }

      // Send confirmation email
      try {
        const emailResult = await sendBookingConfirmationEmail(
          updatedBooking,
          updatedBooking.userId,
          updatedBooking.roomId
        );

        if (emailResult.success) {
          console.log('Booking confirmation email sent successfully');
        } else {
          console.error('Failed to send booking confirmation email:', emailResult.error);
          // Don't fail the payment verification if email fails
        }
      } catch (emailError) {
        console.error('Email service error:', emailError);
        // Continue with payment verification even if email fails
      }

      res.json({ 
        success: true, 
        message: "Payment verified, booking confirmed, and room assigned. Confirmation email sent.",
        booking: updatedBooking
      });
    } else {
      res.json({ 
        success: true, 
        message: "Payment verified" 
      });
    }

  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ 
      success: false, 
      message: "Payment verification error",
      error: error.message 
    });
  }
});

// Get payment status
router.get("/status/:bookingId", verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.userId
    }).populate('roomId', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Get assigned admin room info
    const assignedAdminRoom = await AdminRoom.findOne({
      currentBookingId: bookingId
    });

    res.json({
      success: true,
      paymentStatus: booking.paymentStatus,
      paymentId: booking.paymentId,
      roomType: booking.roomId?.name,
      assignedRoom: assignedAdminRoom ? {
        roomNumber: assignedAdminRoom.roomNumber,
        roomType: assignedAdminRoom.roomType
      } : null
    });

  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check room availability before payment (simplified - only admin locks)
router.post("/check-room-availability", verifyToken, async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;

    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: "Room not found"
      });
    }

    // Check admin lock status
    const fullyLocked = await AdminRoom.isRoomTypeFullyLocked(room.name);
    if (fullyLocked) {
      return res.json({
        success: true,
        available: false,
        reason: "admin_locked",
        message: "This room type is currently unavailable due to maintenance"
      });
    }

    // Get available admin rooms (not locked)
    const availableAdminRooms = await AdminRoom.getAvailableRoomsByType(room.name);

    res.json({
      success: true,
      available: availableAdminRooms.length > 0,
      availableRooms: availableAdminRooms.length,
      totalRooms: 2,
      lockedRooms: 2 - availableAdminRooms.length,
      reason: availableAdminRooms.length > 0 ? "available" : "admin_locked"
    });

  } catch (error) {
    console.error("Error checking room availability:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Resend confirmation email endpoint
router.post("/resend-confirmation/:bookingId", verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.userId,
      paymentStatus: 'Paid'
    }).populate('roomId', 'name price description')
     .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Paid booking not found"
      });
    }

    const emailResult = await sendBookingConfirmationEmail(
      booking,
      booking.userId,
      booking.roomId
    );

    if (emailResult.success) {
      res.json({
        success: true,
        message: "Confirmation email resent successfully"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to resend confirmation email",
        error: emailResult.error
      });
    }

  } catch (error) {
    console.error("Error resending confirmation email:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;