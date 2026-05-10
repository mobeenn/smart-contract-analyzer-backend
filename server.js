const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
// import dns from 'node:dns';

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const app = express();

const PORT = process.env.PORT || 3000;

/* =========================
   DATABASE
========================= */

connectDB();

/* =========================
   MIDDLEWARE
========================= */

app.use(
   cors({
      origin: "http://localhost:5173",
   }),
);

app.use(express.json());

/* =========================
   ROUTES
========================= */

const analyzeRoute = require("./routes/analyze");
const authRoute = require("./routes/auth");
const reportsRoute = require("./routes/reports");
app.use("/analyze", analyzeRoute);
app.use("/auth", authRoute);
app.use("/reports", reportsRoute);
/* =========================
   HEALTH
========================= */

app.get("/health", (req, res) => {
   res.json({
      status: "ok",
   });
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
   console.log(`✅ Server running on port ${PORT}`);
});
