const User = require("../models/UserModel");
const Doctor = require("../models/DocModel");
const Appointment = require("../models/AppointmentModel");

// GET /api/admin/getallusers
const getAllUsersController = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/getalldoctors - any status
const getAllDoctorsController = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/getapprove  { doctorId, status, userId(of the doctor's account) }
const approveDoctorController = async (req, res, next) => {
  try {
    const { doctorId } = req.body;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    doctor.status = "approved";
    await doctor.save();

    const doctorUser = await User.findById(doctor.userId);
    if (doctorUser) {
      doctorUser.isdoctor = true;
      doctorUser.notification.push({
        type: "doctor-account-approved",
        message: "Congratulations, your doctor application has been approved",
        onClickPath: "/userhome",
      });
      await doctorUser.save();
    }

    return res
      .status(200)
      .json({ success: true, message: "Doctor approved successfully", data: doctor });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/getreject  { doctorId }
const rejectDoctorController = async (req, res, next) => {
  try {
    const { doctorId } = req.body;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    doctor.status = "rejected";
    await doctor.save();

    const doctorUser = await User.findById(doctor.userId);
    if (doctorUser) {
      doctorUser.isdoctor = false;
      doctorUser.notification.push({
        type: "doctor-account-rejected",
        message: "Sorry, your doctor application has been rejected",
        onClickPath: "/userhome",
      });
      await doctorUser.save();
    }

    return res
      .status(200)
      .json({ success: true, message: "Doctor rejected", data: doctor });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/getallAppointmentsAdmin
const getAllAppointmentsController = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsersController,
  getAllDoctorsController,
  approveDoctorController,
  rejectDoctorController,
  getAllAppointmentsController,
};
