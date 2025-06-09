import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    linkedin: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    medium: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    instagram: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    photoURL: {
      type: String,
      required: false,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
      trim: true,
    },
    uid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
