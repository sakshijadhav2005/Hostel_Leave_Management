const Complaint = require('../models/Complaint')

// Create a new complaint
const createComplaint = async (req, res) => {
  console.log('=== COMPLAINT CREATION DEBUG ===')
  console.log('Request headers:', req.headers)
  console.log('Request body:', req.body)
  console.log('Request user:', req.user)
  
  try {
    const { query } = req.body
    const user = req.user

    console.log('Extracted query:', query)
    console.log('Extracted user:', user)

    if (!query) {
      return res.status(400).json({ message: 'Query is required' })
    }

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    if (!user.name || !user.room_no || !user.hostel_no) {
      return res.status(400).json({ 
        message: 'User profile incomplete. Missing name, room_no, or hostel_no',
        user: { name: user.name, room_no: user.room_no, hostel_no: user.hostel_no }
      })
    }

    const complaint = new Complaint({
      name: user.name,
      room_no: user.room_no,
      hostel_no: user.hostel_no,
      query: query.trim(),
      status: 'pending'
    })

    await complaint.save()

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint
    })
  } catch (error) {
    console.error('Error creating complaint:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get all complaints for rector
const getRectorComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ created_at: -1 })
      .lean()

    res.json(complaints)
  } catch (error) {
    console.error('Error fetching complaints:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Update complaint status (Students can only mark their own complaints as resolved)
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const user = req.user

    console.log('Updating complaint status - User:', user)
    console.log('Updating complaint status - ID:', id, 'Status:', status)

    // Students can only mark complaints as resolved
    if (user.role === 'student' && status !== 'resolved') {
      return res.status(403).json({ message: 'Students can only mark complaints as resolved' })
    }

    if (!['pending', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    // Find the complaint first
    const complaint = await Complaint.findById(id)
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' })
    }

    // Students can only update their own complaints
    if (user.role === 'student') {
      if (complaint.name !== user.name || 
          complaint.room_no !== user.room_no || 
          complaint.hostel_no !== user.hostel_no) {
        return res.status(403).json({ message: 'You can only update your own complaints' })
      }
    }

    // Update the complaint
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      id,
      { status, updated_at: new Date() },
      { new: true }
    )

    res.json({
      message: 'Complaint status updated successfully',
      complaint: updatedComplaint
    })
  } catch (error) {
    console.error('Error updating complaint:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get complaints by user (for student dashboard)
const getUserComplaints = async (req, res) => {
  try {
    // Get complaints for the authenticated user
    const user = req.user
    
    console.log('Fetching complaints for user:', user)

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    if (!user.name || !user.room_no || !user.hostel_no) {
      return res.status(400).json({ 
        message: 'User profile incomplete. Missing name, room_no, or hostel_no',
        user: { name: user.name, room_no: user.room_no, hostel_no: user.hostel_no }
      })
    }
    
    const complaints = await Complaint.find({
      name: user.name,
      room_no: user.room_no,
      hostel_no: user.hostel_no
    })
      .sort({ created_at: -1 })
      .lean()

    console.log('Found complaints:', complaints.length)
    res.json(complaints)
  } catch (error) {
    console.error('Error fetching user complaints:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  createComplaint,
  getRectorComplaints,
  updateComplaintStatus,
  getUserComplaints
}
