const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  updateProfileController,
  getDoctorAppointmentsController,
  handleStatusController,
  downloadDocumentController,
} = require("../controllers/doctorController");

const router = express.Router();

router.post("/updateprofile", authMiddleware, updateProfileController);
router.get("/getdoctorappointments", authMiddleware, getDoctorAppointmentsController);
router.post("/handlestatus", authMiddleware, handleStatusController);
router.get("/getdocumentdownload", authMiddleware, downloadDocumentController);

module.exports = router;
