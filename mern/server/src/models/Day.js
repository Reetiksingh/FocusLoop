import mongoose from "mongoose";

const daySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true },
    intention: { type: String, default: "" },
    journal: { type: String, default: "" },
    reflectionCompleted: { type: Boolean, default: false },
    activityScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

daySchema.index({ userId: 1, date: 1 }, { unique: true });

export const Day = mongoose.model("Day", daySchema);
