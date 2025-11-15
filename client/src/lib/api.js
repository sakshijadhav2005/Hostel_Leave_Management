import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Health
export async function health() {
  const { data } = await api.get('/api/health')
  return data
}

// Auth
export async function signup(payload) {
  const { data } = await api.post('/api/auth/signup', payload)
  return data
}

export async function login(payload) {
  const { data } = await api.post('/api/auth/login', payload)
  return data
}

export async function forgotPassword({ email }) {
  const { data } = await api.post('/api/auth/forgot-password', { email })
  return data
}

export async function resetPassword({ email, token, newPassword }) {
  const { data } = await api.post('/api/auth/reset-password', { email, token, newPassword })
  return data
}

export async function changePassword({ currentPassword, newPassword }) {
  const { data } = await api.post('/api/auth/change-password', { currentPassword, newPassword })
  return data
}

export async function submitLongLeave({ reason, fromDate, toDate, emergencyContact, addressDuringLeave }) {
  const payload = {
    reason,
    // keep return_date for backward compatibility
    return_date: toDate,
    from_date: fromDate,
    to_date: toDate,
    emergency_contact: emergencyContact,
    address_during_leave: addressDuringLeave,
  }
  const { data } = await api.post('/api/long-leaves', payload)
  return data
}

export async function submitShortLeave({ reason }) {
  const { data } = await api.post('/api/short-leaves', { reason })
  return data
}

export async function returnShortLeave(id) {
  const { data } = await api.post(`/api/short-leaves/${id}/return`)
  return data
}

export async function approveLongLeave(id) {
  const { data } = await api.post(`/api/rector/long-leaves/${id}/approve`)
  return data
}

export async function rejectLongLeave(id) {
  const { data } = await api.post(`/api/rector/long-leaves/${id}/reject`)
  return data
}

export async function getMyLongLeaves() {
  const { data } = await api.get('/api/me/long-leaves')
  return data
}

export async function getMyShortLeaves() {
  const { data } = await api.get('/api/me/short-leaves')
  return data
}

export async function getRectorLongLeaves() {
  const { data } = await api.get('/api/rector/long-leaves')
  return data
}

export async function getRectorShortLeaves() {
  const { data } = await api.get('/api/rector/short-leaves')
  return data
}

export async function markShortLeaveReturned(id) {
  const { data } = await api.post(`/api/rector/short-leaves/${id}/mark-returned`)
  return data
}

export async function markShortLeaveOut(id) {
  const { data } = await api.post(`/api/rector/short-leaves/${id}/mark-out`)
  return data
}

export async function getRectorStudents() {
  const { data } = await api.get('/api/rector/students')
  return data
}

export async function updateRectorStudent(id, payload) {
  const { data } = await api.put(`/api/rector/students/${id}`, payload)
  return data
}

export async function deleteRectorStudent(id) {
  const { data } = await api.delete(`/api/rector/students/${id}`)
  return data
}

// Complaints
export async function createComplaint(payload) {
  const { data } = await api.post('/api/complaints', payload)
  return data
}

export async function getRectorComplaints() {
  const { data } = await api.get('/api/rector/complaints')
  return data
}

export async function getUserComplaints() {
  const { data } = await api.get('/api/complaints')
  return data
}

export async function updateComplaintStatus(id, status) {
  const { data } = await api.put(`/api/rector/complaints/${id}`, { status })
  return data
}

