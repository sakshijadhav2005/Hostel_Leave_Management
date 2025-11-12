const express = require('express')
const { authRequired, requireRole } = require('../middleware/auth')
const { getRectorLongLeaves, getRectorShortLeaves, approveLongLeave, rejectLongLeave, markShortReturned } = require('../controllers/leavesController')
const { listStudents, updateStudent, deleteStudent } = require('../controllers/rectorController')

const router = express.Router()

// rector leaves
router.get('/long-leaves', authRequired, requireRole('admin'), getRectorLongLeaves)
router.get('/short-leaves', authRequired, requireRole('admin'), getRectorShortLeaves)
router.post('/short-leaves/:id/mark-returned', authRequired, requireRole('admin'), markShortReturned)
router.post('/long-leaves/:id/approve', authRequired, requireRole('admin'), approveLongLeave)
router.post('/long-leaves/:id/reject', authRequired, requireRole('admin'), rejectLongLeave)

// rector students
router.get('/students', authRequired, requireRole('admin'), listStudents)
router.put('/students/:id', authRequired, requireRole('admin'), updateStudent)
router.delete('/students/:id', authRequired, requireRole('admin'), deleteStudent)

module.exports = router
