require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectToDB = require("./config/connectToDB");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",                    // local dev
    /\.vercel\.app$/                            // all Vercel deployments (production + preview)
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded documents statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/doctor", require("./routes/doctorRoutes"));

app.get("/", (req, res) => res.json({ success: true, message: "Book a Doctor API" }));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler - never leak stack traces
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: "Duplicate value" });
  }
  res.status(500).json({ success: false, message: "Something went wrong" });
});

const PORT = process.env.PORT || 8000;

connectToDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
