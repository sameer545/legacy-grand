const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { check, validationResult } = require("express-validator");

const router = express.Router();

// Register
router.post("/register", [
  check("name", "Name is required").isString(),
  check("email", "Email is required").isEmail(),
  check("password", "Password with 6 or more characters required").isLength({ min:6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
  {
    return res.status(400).json({ message: errors.array() });
  }
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });

        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1d' }
        );

        console.log("Generated token:", token);

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 86400000
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ error: err.message }); // Show full error during debug
    }
});

module.exports = router;
