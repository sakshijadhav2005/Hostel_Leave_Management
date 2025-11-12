const mongoose = require('mongoose')

const shortleaves = new mongoose.Schema({
  student_id: { type: String, ref: 'User', required: true },
  reason: { type: String, required: true },
  out_time: { type: String, required: true },
  return_time: { type: String, default: null },
  status: { type: String, enum: ['Out', 'Returned'], required: true },
}, { timestamps: true })

module.exports = mongoose.model('ShortLeave', shortleaves)
