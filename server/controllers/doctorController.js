const fs = require("fs");
const path = require("path");
const Doctor = require("../models/DocModel");
const User = require("../models/UserModel");
const Appointment = require("../models/AppointmentModel");

// POST /api/doctor/updateprofile (protected) - doctor edits their own profile
const updateProfileController = async (req, res, next) => {
  try {
    const { userId, ...updates } = req.body;
    delete updates.status; // a doctor cannot change their own approval status

    const doctor = await Doctor.findOneAndUpdate({ userId }, updates, {
      new: true,
      runValidators: true,
    });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Profile updated", data: doctor });
  } catch (error) {
    next(error);
  }
};

// GET /api/doctor/getdoctorappointments (protected)
const getDoctorAppointmentsController = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.body.userId });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    const appointments = await Appointment.find({ doctorId: doctor._id }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

// POST /api/doctor/handlestatus (protected) { appointmentId, status }
const handleStatusController = async (req, res, next) => {
  try {
    const { appointmentId, status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Notify the patient
    const patient = await User.findById(appointment.userId);
    if (patient) {
      patient.notification.push({
        type: "appointment-status-updated",
        message: `Your appointment is now ${status}`,
        onClickPath: "/userhome",
      });
      await patient.save();
    }

    return res
      .status(200)
      .json({ success: true, message: `Appointment ${status}`, data: appointment });
  } catch (error) {
    next(error);
  }
};

// GET /api/doctor/getdocumentdownload?appointid=<id> (protected)
const downloadDocumentController = async (req, res, next) => {
  try {
    const { appointid } = req.query;
    const appointment = await Appointment.findById(appointid);
    if (!appointment || !appointment.document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    // Only the assigned doctor or the owning patient may download
    const doctor = await Doctor.findOne({ userId: req.body.userId });
    const isOwner = String(appointment.userId) === String(req.body.userId);
    const isAssignedDoctor = doctor && String(appointment.doctorId) === String(doctor._id);
    if (!isOwner && !isAssignedDoctor) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const filePath = path.resolve(appointment.document.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File missing on server" });
    }

    return res.download(filePath, appointment.document.originalname);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfileController,
  getDoctorAppointmentsController,
  handleStatusController,
  downloadDocumentController,
};
