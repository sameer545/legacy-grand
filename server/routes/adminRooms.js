// backend/routes/adminRooms.js (Updated - Removed Conflict Booking Logic)
const express = require("express");
const router = express.Router();
const AdminRoom = require("../models/AdminRoom");
const Booking = require("../models/Booking");
const verifyToken = require("../middleware/authMiddleware");

// Initialize admin rooms if they don't exist
const initializeAdminRooms = async () => {
  try {
    const existingRooms = await AdminRoom.countDocuments();
    
    if (existingRooms === 0) {
      const roomTypes = [
        {
          name: 'Standard Family Room',
          description: 'Deluxe Double Room (with Terrace Option)',
          price: 3500
        },
        {
          name: 'Luxury Studio Room',
          description: 'Elegant studio with premium facilities and city view',
          price: 4500
        },
        {
          name: 'Balcony View Room',
          description: 'Spacious room with private balcony and scenic views',
          price: 5500
        },
        {
          name: 'Legacy Suite',
          description: 'Premium suite with luxurious amenities and exclusive service',
          price: 7500
        }
      ];

      const adminRooms = [];
      roomTypes.forEach((roomType, typeIndex) => {
        for (let i = 1; i <= 2; i++) {
          adminRooms.push({
            roomNumber: `${(typeIndex + 1) * 100 + i}`, // 101, 102, 201, 202, etc.
            roomType: roomType.name,
            description: roomType.description,
            price: roomType.price,
            isLocked: false,
            isOccupied: false
          });
        }
      });

      await AdminRoom.insertMany(adminRooms);
      console.log('✅ Admin rooms initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing admin rooms:', error);
  }
};

// Call initialization when the route is loaded
initializeAdminRooms();

// GET all admin rooms with current status
router.get("/", verifyToken, async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const rooms = await AdminRoom.find()
      .populate('currentBookingId', 'checkIn checkOut paymentStatus')
      .sort({ roomNumber: 1 });

    // Group rooms by type for easier frontend handling
    const roomsByType = rooms.reduce((acc, room) => {
      if (!acc[room.roomType]) {
        acc[room.roomType] = [];
      }
      acc[room.roomType].push(room);
      return acc;
    }, {});

    // Calculate stats
    const stats = {
      totalRooms: rooms.length,
      availableRooms: rooms.filter(room => room.isAvailable()).length,
      lockedRooms: rooms.filter(room => room.isLocked).length,
      occupiedRooms: rooms.filter(room => room.isOccupied).length
    };

    res.json({
      rooms: roomsByType,
      stats,
      allRooms: rooms
    });

  } catch (error) {
    console.error("Error fetching admin rooms:", error);
    res.status(500).json({ error: "Failed to fetch admin rooms" });
  }
});

// POST - Toggle room lock status
router.post("/toggle-lock/:roomId", verifyToken, async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { roomId } = req.params;
    const { lockReason } = req.body;

    const room = await AdminRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Don't allow locking if room is currently occupied
    if (!room.isLocked && room.isOccupied) {
      return res.status(400).json({ 
        error: "Cannot lock room while it's occupied by a guest" 
      });
    }

    const newLockStatus = !room.isLocked;
    
    await AdminRoom.findByIdAndUpdate(roomId, {
      isLocked: newLockStatus,
      lockReason: newLockStatus ? (lockReason || 'Admin locked') : null,
      lockedBy: newLockStatus ? req.userId : null,
      lockedAt: newLockStatus ? new Date() : null
    });

    const updatedRoom = await AdminRoom.findById(roomId);

    res.json({
      success: true,
      message: `Room ${room.roomNumber} ${newLockStatus ? 'locked' : 'unlocked'} successfully`,
      room: updatedRoom
    });

  } catch (error) {
    console.error("Error toggling room lock:", error);
    res.status(500).json({ error: "Failed to toggle room lock" });
  }
});

// POST - Sync room availability with bookings (simplified - only updates occupancy)
router.post("/sync-with-bookings", verifyToken, async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all paid bookings for today
    const activeBookings = await Booking.find({
      paymentStatus: 'Paid',
      checkIn: { $lte: today },
      checkOut: { $gt: today }
    }).populate('roomId', 'name')
      .populate('userId', 'name');

    // Reset all rooms to not occupied (but preserve lock status)
    await AdminRoom.updateMany(
      {},
      {
        $set: {
          isOccupied: false,
          currentGuest: null,
          currentBookingId: null,
          checkInDate: null,
          checkOutDate: null
        }
      }
    );

    // Assign bookings to available rooms of the same type (not locked)
    const assignmentResults = [];
    
    for (const booking of activeBookings) {
      if (!booking.roomId) continue;

      const roomType = booking.roomId.name;
      
      // Find an available room of this type (not locked and not occupied)
      const availableRoom = await AdminRoom.findOne({
        roomType: roomType,
        isLocked: false,
        isOccupied: false
      });

      if (availableRoom) {
        await AdminRoom.findByIdAndUpdate(availableRoom._id, {
          isOccupied: true,
          currentGuest: booking.userId?.name || 'Online Booking',
          currentBookingId: booking._id,
          checkInDate: booking.checkIn,
          checkOutDate: booking.checkOut
        });

        assignmentResults.push({
          bookingId: booking._id,
          roomNumber: availableRoom.roomNumber,
          guestName: booking.userId?.name || 'Online Booking',
          roomType: roomType
        });
      } else {
        assignmentResults.push({
          bookingId: booking._id,
          error: `No available rooms of type: ${roomType} (may be locked by admin)`,
          roomType: roomType
        });
      }
    }

    // Get updated stats
    const updatedRooms = await AdminRoom.find().sort({ roomNumber: 1 });
    const stats = {
      totalRooms: updatedRooms.length,
      availableRooms: updatedRooms.filter(room => room.isAvailable()).length,
      lockedRooms: updatedRooms.filter(room => room.isLocked).length,
      occupiedRooms: updatedRooms.filter(room => room.isOccupied).length
    };

    res.json({
      success: true,
      message: 'Room availability synced with bookings',
      assignmentResults,
      stats,
      syncedAt: new Date()
    });

  } catch (error) {
    console.error("Error syncing rooms with bookings:", error);
    res.status(500).json({ error: "Failed to sync rooms with bookings" });
  }
});

// GET room availability for booking system (simplified - admin locks only)
router.get("/availability/:roomType", async (req, res) => {
  try {
    const { roomType } = req.params;

    // Check if any rooms of this type are available (not locked)
    const availableRooms = await AdminRoom.getAvailableRoomsByType(roomType);
    const fullyLocked = await AdminRoom.isRoomTypeFullyLocked(roomType);

    if (fullyLocked) {
      return res.json({
        available: false,
        reason: 'admin_locked',
        message: 'This room type is currently unavailable due to maintenance'
      });
    }

    res.json({
      available: availableRooms.length > 0,
      availableRooms: availableRooms.length,
      totalRooms: 2,
      lockedRooms: 2 - availableRooms.length,
      reason: availableRooms.length > 0 ? 'available' : 'admin_locked'
    });

  } catch (error) {
    console.error("Error checking room availability:", error);
    res.status(500).json({ error: "Failed to check room availability" });
  }
});

// GET detailed room status for admin dashboard
router.get("/status", verifyToken, async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const roomTypeStats = await AdminRoom.aggregate([
      {
        $group: {
          _id: '$roomType',
          total: { $sum: 1 },
          locked: { $sum: { $cond: ['$isLocked', 1, 0] } },
          occupied: { $sum: { $cond: ['$isOccupied', 1, 0] } },
          available: { 
            $sum: { 
              $cond: [
                { $and: [{ $eq: ['$isLocked', false] }, { $eq: ['$isOccupied', false] }] }, 
                1, 
                0
              ] 
            } 
          }
        }
      }
    ]);

    res.json({
      success: true,
      roomTypeStats,
      timestamp: new Date()
    });

  } catch (error) {
    console.error("Error fetching room status:", error);
    res.status(500).json({ error: "Failed to fetch room status" });
  }
});

module.exports = router;