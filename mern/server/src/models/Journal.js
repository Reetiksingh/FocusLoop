import mongoose from "mongoose";

const journalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true },
    intention: { type: String, default: "", trim: true, maxlength: 280 },
    content: { type: String, default: "", trim: true, maxlength: 8000 }
  },
  { timestamps: true }
);

journalSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Journal = mongoose.model("Journal", journalSchema);
