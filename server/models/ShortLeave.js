const mongoose = require('mongoose')

const shortleaves = new mongoose.Schema({
  student_id: { type: String, ref: 'User', required: true },
  reason: { type: String, required: true },
  out_time: { type: String, default: null },
  return_time: { type: String, default: null },
  status: { type: String, enum: ['Pending', 'Out', 'Returned'], default: 'Pending' },
}, { timestamps: true })

module.exports = mongoose.model('ShortLeave', shortleaves)
