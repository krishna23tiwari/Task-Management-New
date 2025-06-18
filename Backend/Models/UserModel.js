const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isDisabled: {
    type: Boolean,
    default: false
  },

  otp: {
    type: Number
  },
  otpTimer: {
    type: Number
  }

}, { timestamps: true, versionKey: false })

module.exports = mongoose.model("user", userSchema)

