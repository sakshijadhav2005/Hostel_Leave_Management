const mongoose = require('mongoose')

const complaintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  room_no: {
    type: String,
    required: true,
    trim: true
  },
  hostel_no: {
    type: String,
    required: true,
    trim: true
  },
  query: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved'],
    default: 'pending'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Update the updated_at field before saving
complaintSchema.pre('save', function(next) {
  this.updated_at = Date.now()
  next()
})

module.exports = mongoose.model('Complaint', complaintSchema)
