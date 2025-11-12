const express = require('express')
const router = express.Router()
const { getRectorComplaints, updateComplaintStatus } = require('../controllers/complaintController')
const { authRequired, requireRole } = require('../middleware/auth')

// GET /api/rector/complaints - Get all complaints for rector (ADMIN/RECTOR ONLY)
router.get('/', authRequired, requireRole('admin', 'rector'), getRectorComplaints)

// PUT /api/rector/complaints/:id - Update complaint status (STUDENTS ONLY - for self-resolution)
router.put('/:id', authRequired, requireRole('student'), updateComplaintStatus)

module.exports = router
