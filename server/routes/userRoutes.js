const express = require("express");
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  registerController,
  loginController,
  getUserDataController,
  registerDocController,
  getAllApprovedDoctorsController,
  bookAppointmentController,
  markAllSeenController,
  deleteAllNotificationController,
  getUserAppointmentsController,
  getDocsForUserController,
} = require("../controllers/userController");

const router = express.Router();

// Multer storage for appointment documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Public
router.post("/register", registerController);
router.post("/login", loginController);
router.get("/getalldoctorsu", getAllApprovedDoctorsController);

// Protected
router.post("/getuserdata", authMiddleware, getUserDataController);
router.post("/registerdoc", authMiddleware, registerDocController);
// multer parses the multipart body first, then auth attaches userId
router.post("/getappointment", upload.single("image"), authMiddleware, bookAppointmentController);
router.post("/getallnotification", authMiddleware, markAllSeenController);
router.post("/deleteallnotification", authMiddleware, deleteAllNotificationController);
router.get("/getuserappointments", authMiddleware, getUserAppointmentsController);
router.get("/getDocsforuser", authMiddleware, getDocsForUserController);

module.exports = router;
