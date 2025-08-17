import mongoose from 'mongoose';

// The schema you will use for each entry

  const hintSchema = new mongoose.Schema({
    id : Number,
    type : String,
    content : String
  }, {_id : false}) // _id: false prevents Mongo from adding an _id to each hint object

  const sessionHistorySchema = new mongoose.Schema({
    problemQuery : {
      type : String,
      required : true
    },
    hints : [hintSchema]
  }, {timestamps : true})

// This prevents Mongoose from redefining the model on every hot-reload
export default mongoose.models.SessionHistory || mongoose.model('SessionHistory', sessionHistorySchema);