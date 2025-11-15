const mongoose = require('mongoose')

const longleaves = new mongoose.Schema({
  student_id: { type: String, ref: 'User', required: true },
  reason: { type: String, required: true },
  submit_time: { type: String, default: () => new Date().toISOString() },
  return_date: { type: String, required: true },
  from_date: { type: String, required: true },
  to_date: { type: String, required: true },
  emergency_contact: { type: String, required: true },
  address_during_leave: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
}, { timestamps: true })

module.exports = mongoose.model('LongLeave',longleaves)
