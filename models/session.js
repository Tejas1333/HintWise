import mongoose from "mongoose";

const hintSchema = new mongoose.Schema(
  {
    type: String, // HINT | ATTEMPT_FEEDBACK | SOLUTION
    content: mongoose.Schema.Types.Mixed,
    step_index: Number,
    created_at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },

    problemQuery: String,

    state: {
      pattern: String,
      algorithm_steps: [String],
      current_step_index: Number,
      hint_depth: Number,
      difficulty: String,

      hint_usage_count: Number,
      mistake_count: Number,
      struggle_score: Number,

      last_analysis: Object,

      attempt_history: [
        {
          mistake_type: String,
        },
      ],

      // 🔥 NEW: FULL SESSION REPLAY
      hint_history: [hintSchema],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Session ||
  mongoose.model("Session", sessionSchema);