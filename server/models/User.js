const mongoose = require('mongoose')

const users = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  room_no: { type: String, required: true },
  hostel_no: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin', 'rector'], required: true },
  fcm_token: { type: String, default: null },
  webpush_subscriptions: { type: [Object], default: [] },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
}, { timestamps: true })

module.exports = mongoose.model('User', users)
