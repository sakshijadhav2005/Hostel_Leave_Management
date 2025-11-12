const express = require('express')
const { signup, login, forgotPassword, resetPassword, changePassword } = require('../controllers/authController')
const { authRequired } = require('../middleware/auth')

const router = express.Router()
router.post('/signup', signup)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/change-password', authRequired, changePassword)

module.exports = router
