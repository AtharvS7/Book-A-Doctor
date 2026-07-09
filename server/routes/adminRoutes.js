const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getAllUsersController,
  getAllDoctorsController,
  approveDoctorController,
  rejectDoctorController,
  getAllAppointmentsController,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/getallusers", authMiddleware, getAllUsersController);
router.get("/getalldoctors", authMiddleware, getAllDoctorsController);
router.post("/getapprove", authMiddleware, approveDoctorController);
router.post("/getreject", authMiddleware, rejectDoctorController);
router.get("/getallAppointmentsAdmin", authMiddleware, getAllAppointmentsController);

module.exports = router;
