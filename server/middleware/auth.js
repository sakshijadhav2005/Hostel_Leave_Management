const jwt = require('jsonwebtoken')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

async function authRequired(req, res, next) {
  console.log('=== AUTH MIDDLEWARE DEBUG ===')
  console.log('Request URL:', req.url)
  console.log('Request method:', req.method)
  console.log('Authorization header:', req.headers.authorization)
  
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    
    console.log('Extracted token:', token ? 'Present' : 'Missing')
    
    if (!token) {
      console.log('No token provided, returning 401')
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const payload = jwt.verify(token, JWT_SECRET)
    console.log('Token payload:', payload)
    
    const user = await User.findById(payload.sub)
    console.log('Found user:', user ? user.email : 'Not found')
    
    if (!user) {
      console.log('User not found, returning 401')
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    req.user = user
    console.log('Auth successful, proceeding to next middleware')
    next()
  } catch (e) {
    console.log('Auth error:', e.message)
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
