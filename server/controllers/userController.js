const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const Doctor = require("../models/DocModel");
const Appointment = require("../models/AppointmentModel");

// POST /api/user/register
const registerController = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, type } = req.body;
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide name, email and password" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists with this email" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      password: hashed,
      phone: phone || "",
      type: type === "admin" ? "admin" : "user",
    });

    return res
      .status(201)
      .json({ success: true, message: "Registered successfully", data: { id: user._id } });
  } catch (error) {
    next(error);
  }
};

// POST /api/user/login
const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: "1d" });

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/user/getuserdata (protected)
const getUserDataController = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// POST /api/user/registerdoc (protected) - apply to become a doctor
const registerDocController = async (req, res, next) => {
  try {
    const { userId, ...doctorFields } = req.body;

    const existing = await Doctor.findOne({ userId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already applied as a doctor",
      });
    }

    const doctor = await Doctor.create({ userId, status: "pending", ...doctorFields });

    // Notify all admins about the new application
    const admins = await User.find({ type: "admin" });
    await Promise.all(
      admins.map((admin) => {
        admin.notification.push({
          type: "apply-doctor-request",
          message: `${doctor.fullName} has applied as a doctor`,
          data: { doctorId: doctor._id, name: doctor.fullName },
          onClickPath: "/adminhome",
        });
        return admin.save();
      })
    );

    return res
      .status(201)
      .json({ success: true, message: "Doctor application submitted", data: doctor });
  } catch (error) {
    next(error);
  }
};

// GET /api/user/getalldoctorsu - list approved doctors only
const getAllApprovedDoctorsController = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ status: "approved" });
    return res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    next(error);
  }
};

// POST /api/user/getappointment (protected, multer field "image") - book appointment
const bookAppointmentController = async (req, res, next) => {
  try {
    const { userId, doctorId, date } = req.body;
    if (!doctorId || !date) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor and date are required" });
    }

    const doctor = await Doctor.findById(doctorId);
    const user = await User.findById(userId).select("-password");
    if (!doctor || !user) {
      return res.status(404).json({ success: false, message: "Doctor or user not found" });
    }

    const appointment = await Appointment.create({
      userId,
      doctorId,
      userInfo: user.toObject(),
      doctorInfo: doctor.toObject(),
      date,
      document: req.file
        ? {
            filename: req.file.filename,
            originalname: req.file.originalname,
            path: req.file.path,
            mimetype: req.file.mimetype,
          }
        : null,
      status: "pending",
    });

    // Notify the doctor's user account
    const doctorUser = await User.findById(doctor.userId);
    if (doctorUser) {
      doctorUser.notification.push({
        type: "new-appointment-request",
        message: `New appointment request from ${user.fullName}`,
        data: { appointmentId: appointment._id, name: user.fullName },
        onClickPath: "/userhome",
      });
      await doctorUser.save();
    }

    return res
      .status(201)
      .json({ success: true, message: "Appointment booked successfully", data: appointment });
  } catch (error) {
    next(error);
  }
};

// POST /api/user/getallnotification (protected) - mark all as seen
const markAllSeenController = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.seennotification.push(...user.notification);
    user.notification = [];
    const updated = await user.save();
    const safe = updated.toObject();
    delete safe.password;
    return res
      .status(200)
      .json({ success: true, message: "All notifications marked as read", data: safe });
  } catch (error) {
    next(error);
  }
};

// POST /api/user/deleteallnotification (protected)
const deleteAllNotificationController = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.notification = [];
    user.seennotification = [];
    const updated = await user.save();
    const safe = updated.toObject();
    delete safe.password;
    return res
      .status(200)
      .json({ success: true, message: "All notifications deleted", data: safe });
  } catch (error) {
    next(error);
  }
};

// GET /api/user/getuserappointments (protected)
const getUserAppointmentsController = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ userId: req.body.userId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

// GET /api/user/getDocsforuser (protected) - documents linked to the user's appointments
const getDocsForUserController = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({
      userId: req.body.userId,
      document: { $ne: null },
    }).sort({ createdAt: -1 });

    const docs = appointments.map((a) => ({
      appointmentId: a._id,
      doctorName: a.doctorInfo?.fullName,
      date: a.date,
      document: a.document,
      status: a.status,
    }));

    return res.status(200).json({ success: true, data: docs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
