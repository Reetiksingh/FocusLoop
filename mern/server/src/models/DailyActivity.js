import mongoose from "mongoose";

const dailyActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true },
    completedTasks: { type: Number, default: 0 },
    focusSessions: { type: Number, default: 0 },
    reflectionSaved: { type: Boolean, default: false },
    score: { type: Number, default: 0 }
  },
  { timestamps: true }
);

dailyActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyActivity = mongoose.model("DailyActivity", dailyActivitySchema);
