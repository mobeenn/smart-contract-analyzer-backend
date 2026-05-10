const express = require("express");
const router = express.Router();

const analyzeContract = require("../services/aiAgent");
const { generateHash } = require("../utils/hash");
const { storeOnBlockchain } = require("../services/blockchain");

const auth = require("../middleware/auth");
const User = require("../models/User");

/* =========================
   ANALYZE CONTRACT
========================= */

router.post("/", auth, async (req, res) => {
   try {
      const { code } = req.body;

      if (!code || typeof code !== "string") {
         return res.status(400).json({
            error: "Code is required",
         });
      }

      // Find User
      const user = await User.findById(req.user.id);

      if (!user) {
         return res.status(404).json({
            error: "User not found",
         });
      }

      /* =========================
         CHECK CREDITS
      ========================= */

      if (user.credits < 20) {
         return res.status(403).json({
            error: "Your free trial credits are finished. Contact support to increase your limit.",
            contactEmail: "support@smartauditai.com",
         });
      }

      /* =========================
         DEDUCT 20 CREDITS
      ========================= */

      user.credits -= 20;

      await user.save();

      /* =========================
         AI ANALYSIS
      ========================= */

      const result = await analyzeContract(code);

      /* =========================
         HASH
      ========================= */

      const hash = generateHash(JSON.stringify(result));

      /* =========================
         BLOCKCHAIN STORE
      ========================= */

      const txHash = await storeOnBlockchain(hash);

      /* =========================
         RESPONSE
      ========================= */

      return res.json({
         success: true,

         remainingCredits: user.credits,

         ...result,

         hash,

         txHash,
      });
   } catch (err) {
      console.error(err);

      return res.status(500).json({
         error: "Internal server error",
      });
   }
});

module.exports = router;
