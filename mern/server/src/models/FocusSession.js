import mongoose from "mongoose";

const focusSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
    date: { type: String, required: true, index: true },
    sessionType: { type: String, enum: ["focus", "break", "longbreak"], default: "focus" },
    plannedMinutes: { type: Number, required: true, min: 0, max: 60 },
    remainingSeconds: { type: Number, required: true, min: 0, max: 3600 },
    ambientSound: { type: String, default: "" },
    status: { type: String, enum: ["running", "paused", "completed", "cancelled"], default: "running" },
    startedAt: { type: Date, default: Date.now },
    lastResumedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

focusSessionSchema.index({ userId: 1, status: 1 });
focusSessionSchema.index({ userId: 1, date: 1 });

export const FocusSession = mongoose.model("FocusSession", focusSessionSchema);
