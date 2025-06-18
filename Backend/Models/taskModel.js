const mongoose = require("mongoose")
const { type } = require("os")
const Schema = mongoose.Schema

const taskSchema = new Schema({
  title: String,
  content: String,
  category: String,
  color: String,

  // Both assignedTo and userId now reference the same 'user' collection
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  isDisabled: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  image: {
    type: String,
  }
}, { timestamps: true })

module.exports = mongoose.model("tasks", taskSchema)