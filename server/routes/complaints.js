const express = require('express')
const router = express.Router()
const { createComplaint, getUserComplaints } = require('../controllers/complaintController')
const { authRequired, requireRole } = require('../middleware/auth')

// POST /api/complaints - Create a new complaint (TEMPORARILY REMOVE ROLE CHECK FOR DEBUGGING)
router.post('/', authRequired, createComplaint)

// GET /api/complaints - Get user's complaints (TEMPORARILY REMOVE ROLE CHECK FOR DEBUGGING)
router.get('/', authRequired, getUserComplaints)

module.exports = router
