const mongoose = require('mongoose')

const longleaves = new mongoose.Schema({
  student_id: { type: String, ref: 'User', required: true },
  reason: { type: String, required: true },
  submit_time: { type: String, required: true },
  return_date: { type: String, required: true },
  from_date: { type: String, required: true },
  to_date: { type: String, required: true },
  emergency_contact: { type: String, required: true },
  address_during_leave: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], required: true },
}, { timestamps: true })

module.exports = mongoose.model('LongLeave',longleaves)
