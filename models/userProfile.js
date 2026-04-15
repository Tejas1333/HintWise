import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },

    weak_patterns: [String],
    strong_patterns: [String],

    common_mistakes: [String],

    hint_dependency: { type: Number, default: 0 },
    success_rate: { type: Number, default: 0 },

    total_problems_solved: { type: Number, default: 0 },
    total_attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.UserProfile ||
  mongoose.model("UserProfile", userProfileSchema);