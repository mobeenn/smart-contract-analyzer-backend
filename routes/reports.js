const express = require("express");

const router = express.Router();

const { getAllReports } = require("../services/blockchain");

/* =========================
   GET ALL BLOCKCHAIN REPORTS
========================= */

router.get("/", async (req, res) => {
   try {
      const reports = await getAllReports();

      return res.json({
         success: true,

         total: reports.length,

         reports,
      });
   } catch (err) {
      console.error(err);

      return res.status(500).json({
         error: "Failed to fetch blockchain reports",
      });
   }
});

module.exports = router;
