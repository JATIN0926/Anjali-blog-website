import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Diary", "Article"],
      default: "Diary",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Plan", PlanSchema);
