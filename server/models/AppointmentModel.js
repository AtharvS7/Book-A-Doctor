const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    // Denormalized snapshots so lists don't require extra joins
    userInfo: {
      type: Object,
      required: true,
    },
    doctorInfo: {
      type: Object,
      required: true,
    },
    date: {
      type: String,
      required: [true, "Appointment date is required"],
    },
    // Uploaded document metadata from multer
    document: {
      type: Object,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
