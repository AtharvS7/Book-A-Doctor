const mongoose = require("mongoose");

// Capitalize the first letter of each word (used as a setter on names)
const capitalize = (value) => {
  if (!value || typeof value !== "string") return value;
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      set: capitalize,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isdoctor: {
      type: Boolean,
      default: false,
    },
    notification: {
      type: Array,
      default: [],
    },
    seennotification: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
module.exports.capitalize = capitalize;
