const User = require('../models/User')

async function listStudents(_req, res) {
  const users = await User.find({ role: 'student' }).sort({ hostel_no: 1, room_no: 1, name: 1 })
  const result = users.map(u => ({ id: u._id, name: u.name, email: u.email, room_no: u.room_no, hostel_no: u.hostel_no, role: u.role }))
  res.json(result)
}

async function updateStudent(req, res) {
  const { id } = req.params
  const { room_no, hostel_no, ...rest } = req.body || {}
  // Disallow any fields other than room_no and hostel_no
  const forbidden = Object.keys(rest)
  if (forbidden.length > 0) {
    return res.status(400).json({ error: 'only_room_and_hostel_updatable' })
  }
  const user = await User.findById(id)
  if (!user) return res.status(404).json({ error: 'Not found' })
  if (user.role !== 'student') return res.status(400).json({ error: 'not_a_student' })
  if (room_no) user.room_no = room_no
  if (hostel_no) user.hostel_no = hostel_no
  await user.save()
  res.json({ id: user._id, name: user.name, email: user.email, room_no: user.room_no, hostel_no: user.hostel_no, role: user.role })
}

async function deleteStudent(req, res) {
  const { id } = req.params
  const user = await User.findById(id)
  if (!user) return res.status(404).json({ error: 'Not found' })
  if (user.role !== 'student') return res.status(400).json({ error: 'not_a_student' })
  await User.deleteOne({ _id: id })
  res.json({ ok: true })
}

module.exports = { listStudents, updateStudent, deleteStudent }
