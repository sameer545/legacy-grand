const express = require("express");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/User")
const bcrypt = require("bcryptjs");
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router();

// routes/auth.js
router.post("/login", [
  check("email", "Valid email is required").isEmail(),
  check("password", "Password with 6 or more characters required").isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // HARD-CODED ADMIN ROLE
    let role = "user";
    if (email === "admin@legacygrand.com") {
      role = "admin";
    }

    const token = jwt.sign(
      { userId: user._id, role }, // include role in token
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1d' }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400000
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/validate-token", verifyToken, (req, res) => {
  res.status(200).send({ userId: req.userId, role: req.role });
});


router.post("/logout", (req, res) => {
  res.cookie("auth_token", "", {
    expires: new Date(0),
  });
  res.send();
});

module.exports = router;