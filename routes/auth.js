const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

/* ======================
   SIGNUP
====================== */

router.post("/signup", async (req, res) => {
   try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
         return res.status(400).json({
            error: "All fields are required",
         });
      }

      const existingUser = await User.findOne({ email });

      if (existingUser) {
         return res.status(400).json({
            error: "Email already exists",
         });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
         name,
         email,
         password: hashedPassword,
         credits: 100,
      });

      const token = jwt.sign(
         {
            id: user._id,
         },
         process.env.JWT_SECRET,
         {
            expiresIn: "7d",
         },
      );

      return res.json({
         message: "Signup successful",
         token,
         user: {
            id: user._id,
            name: user.name,
            email: user.email,
            credits: user.credits,
         },
      });
   } catch (err) {
      console.error(err);

      return res.status(500).json({
         error: "Server error",
      });
   }
});

/* ======================
   LOGIN
====================== */

router.post("/login", async (req, res) => {
   try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
         return res.status(400).json({
            error: "Invalid credentials",
         });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
         return res.status(400).json({
            error: "Invalid credentials",
         });
      }

      const token = jwt.sign(
         {
            id: user._id,
         },
         process.env.JWT_SECRET,
         {
            expiresIn: "7d",
         },
      );

      return res.json({
         message: "Login successful",
         token,
         user: {
            id: user._id,
            name: user.name,
            email: user.email,
            credits: user.credits,
         },
      });
   } catch (err) {
      console.error(err);

      return res.status(500).json({
         error: "Server error",
      });
   }
});

module.exports = router;
