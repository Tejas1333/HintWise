import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },

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
  },

  userProfile: {
    weak_patterns: [String],
    hint_dependency: Number,
    success_rate: Number,
  },
}, { timestamps: true });

export default mongoose.models.Session || mongoose.model("Session", sessionSchema);