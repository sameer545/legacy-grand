// backend/routes/rooms.js (Updated - Removed Conflict Booking)
const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const AdminRoom = require("../models/AdminRoom");
const Booking = require("../models/Booking");
const verifyToken = require("../middleware/authMiddleware");

// GET all rooms with availability check (admin locks only)
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find();
    
    // Add availability status considering admin locks only
    const roomsWithAvailability = await Promise.all(
      rooms.map(async (room) => {
        // Check if this room type is fully locked by admin
        const fullyLocked = await AdminRoom.isRoomTypeFullyLocked(room.name);
        
        // Get available rooms of this type (not locked)
        const availableRooms = await AdminRoom.getAvailableRoomsByType(room.name);
        
        return {
          ...room.toObject(),
          available: !fullyLocked && room.available && availableRooms.length > 0,
          adminLocked: fullyLocked,
          availableCount: availableRooms.length
        };
      })
    );
    
    res.json(roomsWithAvailability);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// GET /api/rooms/:id
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    
    // Check admin lock status only
    const fullyLocked = await AdminRoom.isRoomTypeFullyLocked(room.name);
    const availableRooms = await AdminRoom.getAvailableRoomsByType(room.name);
    
    const roomWithAvailability = {
      ...room.toObject(),
      available: !fullyLocked && room.available && availableRooms.length > 0,
      adminLocked: fullyLocked,
      availableCount: availableRooms.length
    };
    
    res.json(roomWithAvailability);
  } catch (err) {
    console.error("Error fetching room by ID:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// CHECK room availability (simplified - admin locks only)
router.post("/check-availability", async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;
    
    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check admin lock status first
    const fullyLocked = await AdminRoom.isRoomTypeFullyLocked(room.name);
    
    // If all rooms of this type are locked by admin
    if (fullyLocked) {
      return res.status(400).json({ 
        error: "This room type is already booked",
        available: false,
        reason: "admin_locked"
      });
    }

    // Check if room is available in general
    if (!room.available) {
      return res.status(404).json({ 
        error: "Room not available",
        available: false,
        reason: "room_disabled"
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // Validate dates
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ 
        error: "Check-out date must be after check-in date",
        available: false,
        reason: "invalid_dates"
      });
    }

    // Get available admin rooms of this type (not locked)
    const availableAdminRooms = await AdminRoom.getAvailableRoomsByType(room.name);
    
    // Room is available if there are unlocked admin rooms
    const availableForBooking = availableAdminRooms.length > 0;
    
    res.json({ 
      available: availableForBooking,
      message: availableForBooking 
        ? "Room is available for the selected dates" 
        : "Room is not available - locked by admin",
      reason: availableForBooking ? "available" : "admin_locked",
      availableRooms: availableAdminRooms.length,
      totalRooms: 2,
      lockedRooms: 2 - availableAdminRooms.length
    });
    
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ error: "Failed to check availability" });
  }
});

// GET room type availability (simplified)
router.get("/availability/:roomType", async (req, res) => {
  try {
    const { roomType } = req.params;

    // Find the room type in the main Room collection
    const roomTypeData = await Room.findOne({ name: roomType });
    if (!roomTypeData) {
      return res.status(404).json({ error: "Room type not found" });
    }

    // Check admin lock status
    const fullyLocked = await AdminRoom.isRoomTypeFullyLocked(roomType);
    
    if (fullyLocked) {
      return res.json({
        available: false,
        reason: 'admin_locked',
        message: 'This room type is already booked',
        availableRooms: 0,
        totalRooms: 2,
        lockedRooms: 2
      });
    }

    // Get available admin rooms (not locked)
    const availableAdminRooms = await AdminRoom.getAvailableRoomsByType(roomType);

    res.json({
      available: availableAdminRooms.length > 0,
      availableRooms: availableAdminRooms.length,
      totalRooms: 2,
      lockedRooms: 2 - availableAdminRooms.length,
      reason: availableAdminRooms.length > 0 ? 'available' : 'admin_locked'
    });

  } catch (error) {
    console.error("Error checking room availability:", error);
    res.status(500).json({ error: "Failed to check room availability" });
  }
});

// POST (admin only)
router.post("/", verifyToken, async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const room = new Room(req.body);
    const saved = await room.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE room (admin only)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    
    res.json(room);
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ error: "Failed to update room" });
  }
});

// DELETE room (admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    
    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ error: "Failed to delete room" });
  }
});

// GET room availability calendar for admin (simplified)
router.get("/:id/calendar", verifyToken, async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const { month, year } = req.query;
    
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Get bookings for the specified month/year
    const startDate = new Date(year || new Date().getFullYear(), month || new Date().getMonth(), 1);
    const endDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()) + 1, 0);

    const bookings = await Booking.find({
      roomId: id,
      paymentStatus: 'Paid',
      $or: [
        { checkIn: { $gte: startDate, $lte: endDate } },
        { checkOut: { $gte: startDate, $lte: endDate } },
        { checkIn: { $lte: startDate }, checkOut: { $gte: endDate } }
      ]
    }).populate('userId', 'name email');

    // Get admin room status for this room type
    const adminRooms = await AdminRoom.find({ roomType: room.name });

    res.json({
      room,
      month: startDate.getMonth(),
      year: startDate.getFullYear(),
      bookings: bookings.map(booking => ({
        id: booking._id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guestName: booking.userId?.name || 'Unknown',
        guestEmail: booking.userId?.email || 'Unknown',
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus
      })),
      adminRooms: adminRooms.map(adminRoom => ({
        roomNumber: adminRoom.roomNumber,
        isLocked: adminRoom.isLocked,
        lockReason: adminRoom.lockReason,
        isOccupied: adminRoom.isOccupied
      }))
    });
    
  } catch (error) {
    console.error("Error fetching room calendar:", error);
    res.status(500).json({ error: "Failed to fetch room calendar" });
  }
});

module.exports = router;