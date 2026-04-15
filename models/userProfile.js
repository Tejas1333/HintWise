import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },

    // =====================
    // BASIC TRACKING
    // =====================
    weak_patterns: [String],
    strong_patterns: [String],
    common_mistakes: [String],

    // =====================
    // 🔥 ADVANCED ADAPTIVE (NEW)
    // =====================

    // pattern → score (e.g. dp: -3, array: +2)
    pattern_scores: {
      type: Map,
      of: Number,
      default: {},
    },

    // mistake → frequency
    mistake_stats: {
      type: Map,
      of: Number,
      default: {},
    },

    // how much user depends on hints (0 → independent, 1 → fully dependent)
    hint_dependency: {
      type: Number,
      default: 0,
    },

    // =====================
    // PERFORMANCE METRICS
    // =====================
    success_rate: { type: Number, default: 0 },
    total_problems_solved: { type: Number, default: 0 },
    total_attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.UserProfile ||
  mongoose.model("UserProfile", userProfileSchema);