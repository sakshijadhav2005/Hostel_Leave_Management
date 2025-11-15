const jwt = require('jsonwebtoken')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'
const DEBUG_AUTH = process.env.DEBUG_AUTH === 'true'

async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) {
      if (DEBUG_AUTH) console.warn('[auth] missing bearer token')
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const payload = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(payload.sub)
    if (!user) {
      if (DEBUG_AUTH) console.warn('[auth] user not found for token subject', payload.sub)
      return res.status(401).json({ error: 'Unauthorized' })
    }
    req.user = user
    next()
  } catch (e) {
    if (DEBUG_AUTH) console.warn('[auth] verification failed:', e.message)
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}

function signToken(user) {
  const payload = { sub: user._id, role: user.role }
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' })
 
  return token
}

module.exports = { authRequired, requireRole, signToken }
