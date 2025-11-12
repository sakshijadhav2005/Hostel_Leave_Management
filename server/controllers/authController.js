const bcrypt = require('bcrypt')
const crypto = require('crypto')
const User = require('../models/User')
const { sendEmail } = require('../utils/email')
const { signToken } = require('../middleware/auth')

async function signup(req, res) {
  try {
    const { name, email, password, role = 'student', room_no = '-', hostel_no = 'H1' } = req.body || {}
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password are required' })
    if (!['student','admin'].includes(role)) return res.status(400).json({ error: 'invalid role' })
    const emailNorm = String(email).trim().toLowerCase()
    const exists = await User.findOne({ email: emailNorm })
    if (exists) return res.status(409).json({ error: 'email already registered' })
    const passwordHash = await bcrypt.hash(String(password), 10)
    let user
    try {
      user = await User.create({ _id: emailNorm, name, email: emailNorm, passwordHash, room_no, hostel_no, role })
    } catch (err) {
      if (err && (err.code === 11000 || err.code === 'E11000')) {
        return res.status(409).json({ error: 'email already registered' })
      }
      throw err
    }
    const token = signToken(user)
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, room_no: user.room_no, hostel_no: user.hostel_no } })
  } catch (e) {
    res.status(500).json({ error: 'signup_failed' })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' })
    const emailNorm = String(email).trim().toLowerCase()
    const user = await User.findOne({ email: emailNorm })
    if (!user) return res.status(401).json({ error: 'invalid_credentials' })
    const ok = await bcrypt.compare(String(password), user.passwordHash || '')
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' })
    const token = signToken(user)
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, room_no: user.room_no, hostel_no: user.hostel_no } })
  } catch (e) {
    res.status(500).json({ error: 'login_failed' })
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body || {}
    if (!email) return res.status(400).json({ error: 'email_required' })
    const user = await User.findOne({ email })
    if (!user) return res.json({ ok: true }) // do not reveal existence
    const token = crypto.randomBytes(20).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    user.resetPasswordToken = token
    user.resetPasswordExpires = expires
    await user.save()
    // Email reset link
    const appUrl = process.env.APP_URL || 'http://localhost:5173'
    const link = `${appUrl}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`
    try {
      await sendEmail({
        to: email,
        subject: 'Reset your password',
        text: `Use the following link to reset your password (valid for 1 hour):\n${link}`,
        html: `<p>Use the following link to reset your password (valid for 1 hour):</p><p><a href="${link}">${link}</a></p>`
      })
    } catch {}
    // In development, also return the token to ease testing
    const isProd = (process.env.NODE_ENV || 'development') === 'production'
    return res.json(isProd ? { ok: true } : { ok: true, token })
  } catch (e) {
    return res.status(500).json({ error: 'forgot_failed' })
  }
}

async function resetPassword(req, res) {
  try {
    const { email, token, newPassword } = req.body || {}
    if (!email || !token || !newPassword) return res.status(400).json({ error: 'email_token_password_required' })
    const user = await User.findOne({ email, resetPasswordToken: token })
    if (!user) return res.status(400).json({ error: 'invalid_token' })
    if (!user.resetPasswordExpires || user.resetPasswordExpires.getTime() < Date.now()) {
      return res.status(400).json({ error: 'token_expired' })
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10)
    user.resetPasswordToken = null
    user.resetPasswordExpires = null
    await user.save()
    return res.json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: 'reset_failed' })
  }
}

async function changePassword(req, res) {
  try {
    const me = req.user
    const { currentPassword, newPassword } = req.body || {}
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'current_and_new_required' })
    const ok = await bcrypt.compare(currentPassword, me.passwordHash)
    if (!ok) return res.status(400).json({ error: 'current_incorrect' })
    me.passwordHash = await bcrypt.hash(newPassword, 10)
    await me.save()
    return res.json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: 'change_failed' })
  }
}

module.exports = { signup, login, forgotPassword, resetPassword, changePassword }
