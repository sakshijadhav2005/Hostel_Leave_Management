const express = require('express')
const { authRequired, requireRole } = require('../middleware/auth')
const {
  createLongLeave,
  createShortLeave,
  returnShortLeave,
  getMyLongLeaves,
  getMyShortLeaves,
} = require('../controllers/leavesController')

const router = express.Router()

// student
router.post('/long-leaves', authRequired, requireRole('student'), createLongLeave)
router.post('/short-leaves', authRequired, requireRole('student'), createShortLeave)
router.post('/short-leaves/:id/return', authRequired, requireRole('student'), returnShortLeave)
router.get('/me/long-leaves', authRequired, requireRole('student'), getMyLongLeaves)
router.get('/me/short-leaves', authRequired, requireRole('student'), getMyShortLeaves)

module.exports = router
