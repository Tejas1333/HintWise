// models/hintHistory.js
import mongoose from 'mongoose';

const hintSchema = new mongoose.Schema({
  id: Number,
  type: String,
  content: String
}, { _id: false });

const sessionHistorySchema = new mongoose.Schema({
  // NEW: Add sessionId to the schema and make it the unique identifier
  sessionId: {
    type: String,
    required: true,
    unique: true // Ensures no two sessions can have the same ID
  },
  problemQuery: {
    type: String,
    required: true
  },
  hints: [hintSchema]
}, { timestamps: true });

export default mongoose.models.SessionHistory || mongoose.model('SessionHistory', sessionHistorySchema);