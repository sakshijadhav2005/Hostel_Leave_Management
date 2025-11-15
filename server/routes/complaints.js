const express = require('express')
const router = express.Router()
const { createComplaint, getUserComplaints } = require('../controllers/complaintController')
const { authRequired, requireRole } = require('../middleware/auth')

// POST /api/complaints - Students submit a new complaint
router.post('/', authRequired, requireRole('student'), createComplaint)

// GET /api/complaints - Students fetch their complaints
router.get('/', authRequired, requireRole('student'), getUserComplaints)

module.exports = router
