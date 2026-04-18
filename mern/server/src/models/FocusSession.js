import mongoose from "mongoose";

const focusSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
    sessionType: { type: String, enum: ["focus", "break", "longbreak"], required: true },
    durationMinutes: { type: Number, required: true },
    ambientSound: { type: String, default: "" },
    completed: { type: Boolean, default: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true }
  },
  { timestamps: true }
);

focusSessionSchema.index({ userId: 1, date: 1 });

export const FocusSession = mongoose.model("FocusSession", focusSessionSchema);
