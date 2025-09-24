// models/AdminRoom.js
const mongoose = require('mongoose');

const adminRoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  roomType: {
    type: String,
    required: true,
    enum: ['Standard Family Room', 'Luxury Studio Room', 'Balcony View Room', 'Legacy Suite']
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lockReason: {
    type: String,
    default: null
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  lockedAt: {
    type: Date,
    default: null
  },
  // Current occupancy details (synced from bookings)
  isOccupied: {
    type: Boolean,
    default: false
  },
  currentGuest: {
    type: String,
    default: null
  },
  currentBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  checkInDate: {
    type: Date,
    default: null
  },
  checkOutDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
adminRoomSchema.index({ roomType: 1, isLocked: 1 });
adminRoomSchema.index({ roomNumber: 1 });
adminRoomSchema.index({ isOccupied: 1 });

// Method to check if room is available (not locked and not occupied)
adminRoomSchema.methods.isAvailable = function() {
  return !this.isLocked && !this.isOccupied;
};

// Static method to get available rooms by type
adminRoomSchema.statics.getAvailableRoomsByType = async function(roomType) {
  return await this.find({
    roomType: roomType,
    isLocked: false,
    isOccupied: false
  });
};

// Static method to check if room type is fully locked
adminRoomSchema.statics.isRoomTypeFullyLocked = async function(roomType) {
  const lockedCount = await this.countDocuments({
    roomType: roomType,
    isLocked: true
  });
  return lockedCount >= 2; // All 2 rooms of this type are locked
};

// Static method to check if room type is fully occupied
adminRoomSchema.statics.isRoomTypeFullyOccupied = async function(roomType) {
  const occupiedOrLockedCount = await this.countDocuments({
    roomType: roomType,
    $or: [
      { isOccupied: true },
      { isLocked: true }
    ]
  });
  return occupiedOrLockedCount >= 2; // All 2 rooms are either occupied or locked
};

const AdminRoom = mongoose.model('AdminRoom', adminRoomSchema);
module.exports = AdminRoom;