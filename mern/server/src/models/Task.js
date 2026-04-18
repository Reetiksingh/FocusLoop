import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    status: { type: String, enum: ["planned", "in_progress", "completed"], default: "planned" },
    requiresFocus: { type: Boolean, default: true },
    completedWithoutFocus: { type: Boolean, default: false },
    focusSessionCount: { type: Number, default: 0 },
    lastFocusedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, date: 1 });

export const Task = mongoose.model("Task", taskSchema);
