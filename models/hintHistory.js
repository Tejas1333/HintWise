import mongoose from 'mongoose';

// The schema you will use for each entry
const hintHistorySchema = new mongoose.Schema({
  // The field from your client-side state was initialHintType,
  // but your API route receives it as 'type'. Let's stick to a clear name.
  initialHintType: String,
  
  // This field contains the array of hint objects
  hintResponse: [{
    id: Number,
    type: String,
    content: String
  }]
}, {
  // Adds createdAt and updatedAt timestamps automatically
  timestamps: true 
});

// This prevents Mongoose from redefining the model on every hot-reload
export default mongoose.models.HintHistory || mongoose.model('HintHistory', hintHistorySchema);