// backend/routes/bookings.js
const express = require("express");
const Booking = require("../models/Booking");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// Save booking after payment
// âœ… Create booking route
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('Creating booking with data:', req.body);
    
    const { roomId, checkIn, checkOut, totalAmount } = req.body;
    
    const booking = new Booking({
      roomId,
      userId: req.user.id, // From verifyToken middleware
      checkIn,
      checkOut,
      totalAmount,
      paymentStatus: 'Pending'
    });

    const savedBooking = await booking.save();
    
    // Populate room and user details for response
    await savedBooking.populate('roomId', 'name price');
    await savedBooking.populate('userId', 'firstName lastName email');
    
    console.log('Booking saved successfully:', savedBooking);
    res.status(201).json(savedBooking);
    
  } catch (error) {
    console.error('Booking Save Error:', error);
    res.status(500).json({ 
      message: 'Error creating booking', 
      error: error.message 
    });
  }
});

// GET user's bookings
router.get("/user", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
      .populate('roomId', 'name description price image')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// GET all bookings (admin only)
router.get("/admin", verifyToken, async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const bookings = await Booking.find()
      .populate('roomId', 'name description price')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// UPDATE booking status (admin only)
router.put("/:id/status", verifyToken, async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { paymentStatus } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({ message: "Booking status updated", booking });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ error: "Failed to update booking status" });
  }
});

module.exports = router;