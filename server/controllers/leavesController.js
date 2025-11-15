const dayjs = require('dayjs')
const LongLeave = require('../models/LongLeave')
const ShortLeave = require('../models/ShortLeave')
const { toDTO } = require('../utils/dto')
const { emitUpdate } = require('../utils/realtime')
const User = require('../models/User')
const { sendEmail } = require('../utils/email')

function now() { return dayjs().toISOString() }
function getCurrentUser(req) { return req.user }

async function createLongLeave(req, res) {
  const me = getCurrentUser(req)
  const { reason, return_date, from_date, to_date, emergency_contact, address_during_leave } = req.body || {}
  if (!reason) return res.status(400).json({ error: 'reason is required' })
  if (!to_date && !return_date) return res.status(400).json({ error: 'to_date or return_date is required' })
  if (!from_date) return res.status(400).json({ error: 'from_date is required' })
  if (!emergency_contact) return res.status(400).json({ error: 'emergency_contact is required' })
  if (!address_during_leave) return res.status(400).json({ error: 'address_during_leave is required' })
  const item = await LongLeave.create({ student_id: me._id, reason, return_date: to_date || return_date, from_date, to_date: to_date || return_date, emergency_contact, address_during_leave })
  const populated = await item.populate('student_id')
  emitUpdate('long_leave_created', populated)
  res.status(201).json(toDTO.longLeave(populated))
}

async function createShortLeave(req, res) {
  const me = getCurrentUser(req)
  const { reason } = req.body || {}
  if (!reason) return res.status(400).json({ error: 'reason is required' })
  const requestedAt = now()
  const item = await ShortLeave.create({
    student_id: me._id,
    reason,
  })
  const populated = await item.populate('student_id')
  emitUpdate('short_leave_created', populated)
  // Fire-and-forget email notification to rectors/admins
  try {
    setTimeout(async () => {
      try {
        const rectors = await User.find({ role: { $in: ['admin', 'rector'] } })
        if (rectors && rectors.length) {
          const s = populated.student_id || {}
          const when = new Date(requestedAt).toLocaleString()
          const subject = `Short Leave Request: ${s.name || 'Student'} (${s.hostel_no || '-'}-${s.room_no || '-'})`
          const text = `Student ${s.name || '-'} (Hostel ${s.hostel_no || '-'}, Room ${s.room_no || '-'}) requested a short leave at ${when}.\nReason: ${populated.reason || '-'}`
          const html = `<div>
            <p><strong>Student:</strong> ${s.name || '-'} (${s.role || 'student'})</p>
            <p><strong>Hostel:</strong> ${s.hostel_no || '-'} &nbsp; <strong>Room:</strong> ${s.room_no || '-'}</p>
            <p><strong>Requested at:</strong> ${when}</p>
            <p><strong>Reason:</strong> ${populated.reason || '-'}</p>
          </div>`
          await Promise.allSettled(
            rectors.filter(r => r.email).map(r => sendEmail({ to: r.email, subject, text, html }))
          )
        }
      } catch {}
    }, 0)
  } catch {}
  res.status(201).json(toDTO.shortLeave(populated))
}

async function returnShortLeave(req, res) {
  const { id } = req.params
  const it = await ShortLeave.findById(id)
  if (!it) return res.status(404).json({ error: 'Not found' })
  if (it.status && it.status !== 'Out') return res.status(400).json({ error: 'Already returned' })
  it.status = 'Returned'
  it.return_time = now()
  await it.save()
  const populated = await it.populate('student_id')
  emitUpdate('short_leave_updated', populated)
  res.json(toDTO.shortLeave(populated))
}

async function markShortOut(req, res) {
  const { id } = req.params
  const it = await ShortLeave.findById(id)
  if (!it) return res.status(404).json({ error: 'Not found' })
  if (it.status === 'Out') return res.status(400).json({ error: 'Already marked out' })
  if (it.status === 'Returned') return res.status(400).json({ error: 'Already returned' })
  it.status = 'Out'
  it.out_time = now()
  it.return_time = null
  await it.save()
  const populated = await it.populate('student_id')
  emitUpdate('short_leave_updated', populated)
  res.json(toDTO.shortLeave(populated))
}

async function approveLongLeave(req, res) {
  const { id } = req.params
  const it = await LongLeave.findById(id)
  if (!it) return res.status(404).json({ error: 'Not found' })
  it.status = 'Approved'
  await it.save()
  const populated = await it.populate('student_id')
  emitUpdate('long_leave_updated', populated)
  res.json(toDTO.longLeave(populated))
}

async function rejectLongLeave(req, res) {
  const { id } = req.params
  const it = await LongLeave.findById(id)
  if (!it) return res.status(404).json({ error: 'Not found' })
  it.status = 'Rejected'
  await it.save()
  const populated = await it.populate('student_id')
  emitUpdate('long_leave_updated', populated)
  res.json(toDTO.longLeave(populated))
}

async function getMyLongLeaves(req, res) {
  const me = getCurrentUser(req)
  const items = await LongLeave.find({ student_id: me._id }).sort({ submit_time: -1 }).populate('student_id')
  res.json(items.map(toDTO.longLeave))
}

async function getMyShortLeaves(req, res) {
  const me = getCurrentUser(req)
  const items = await ShortLeave.find({ student_id: me._id }).sort({ out_time: -1 }).populate('student_id')
  res.json(items.map(toDTO.shortLeave))
}

async function getRectorLongLeaves(_req, res) {
  const items = await LongLeave.find().sort({ submit_time: -1 }).populate('student_id')
  res.json(items.map(toDTO.longLeave))
}

async function getRectorShortLeaves(_req, res) {
  const items = await ShortLeave.find().sort({ out_time: -1 }).populate('student_id')
  res.json(items.map(toDTO.shortLeave))
}

async function markShortReturned(req, res) {
  const { id } = req.params
  const it = await ShortLeave.findById(id)
  if (!it) return res.status(404).json({ error: 'Not found' })
  if (it.status && it.status !== 'Out') return res.status(400).json({ error: 'Already returned' })
  it.status = 'Returned'
  it.return_time = now()
  await it.save()
  const populated = await it.populate('student_id')
  emitUpdate('short_leave_updated', populated)
  res.json(toDTO.shortLeave(populated))
}

module.exports = {
  createLongLeave,
  createShortLeave,
  returnShortLeave,
  approveLongLeave,
  rejectLongLeave,
  getMyLongLeaves,
  getMyShortLeaves,
  getRectorLongLeaves,
  getRectorShortLeaves,
  markShortReturned,
  markShortOut,
}
