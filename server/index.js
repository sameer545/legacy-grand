const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const bookingRoutes = require("./routes/bookings");
const contactRoutes = require("./routes/contact");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/users");
const galleryRoutes = require("./routes/gallery");
const adminRoomRoutes = require("./routes/adminRooms");
const cookieParser = require("cookie-parser");


const app = express();
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // trust Render's proxy
}
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: [
    'https://legacy-grand-frontend.onrender.com',
    'https://legacygrandhotel.com',
    'https://www.legacygrandhotel.com',
    'http://localhost:3000' // for local development
  ],
  credentials: true
}));
app.use(express.json());

// Routes (placeholder)
app.get("/", (req, res) => {
  res.send("Legacy Grand API is running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/admin-rooms", adminRoomRoutes);

// Initialize admin rooms after successful DB connection
    const AdminRoom = require("./models/AdminRoom");
    initializeAdminRooms();
    
    async function initializeAdminRooms() {
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
          console.log('✅ Admin rooms initialized successfully with 8 rooms');
        } else {
          console.log(`✅ Admin rooms already exist: ${existingRooms} rooms found`);
        }
      } catch (error) {
        console.error('❌ Error initializing admin rooms:', error);
      }
    }

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`⚡ Server running on port ${PORT}`);
});




