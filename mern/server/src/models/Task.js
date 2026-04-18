import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    skipFocus: { type: Boolean, default: false },
    completedWithoutFocus: { type: Boolean, default: false },
    focusSessionCount: { type: Number, default: 0 },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, date: 1 });

export const Task = mongoose.model("Task", taskSchema);
