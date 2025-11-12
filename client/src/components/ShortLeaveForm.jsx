import PropTypes from 'prop-types'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ShortLeaveForm({ onSubmit }) {
  const [reason, setReason] = useState('')
  const { user } = useAuth()
  const nowDisplay = new Date().toLocaleString()

  return (
    <form
      className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl shadow-2xl shadow-amber-500/10 p-6 space-y-4"
      onSubmit={(e) => { e.preventDefault(); onSubmit({ reason }) }}
      aria-label="Apply short leave"
    >
      <h3 className="text-base font-semibold text-amber-950">Apply Short Leave</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="block text-amber-900">Name</span>
          <input value={user?.name || ''} readOnly className="mt-1 w-full rounded-lg border border-amber-200 bg-white/60 px-3 py-2 text-amber-900" />
        </label>
        <label className="text-sm">
          <span className="block text-amber-900">Room No</span>
          <input value={user?.room_no || ''} readOnly className="mt-1 w-full rounded-lg border border-amber-200 bg-white/60 px-3 py-2 text-amber-900" />
        </label>
        <label className="text-sm">
          <span className="block text-amber-900">Hostel No</span>
          <input value={user?.hostel_no || ''} readOnly className="mt-1 w-full rounded-lg border border-amber-200 bg-white/60 px-3 py-2 text-amber-900" />
        </label>
        <label className="text-sm">
          <span className="block text-amber-900">Current Date & Time</span>
          <input value={nowDisplay} readOnly className="mt-1 w-full rounded-lg border border-amber-200 bg-white/60 px-3 py-2 text-amber-900" />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="block text-amber-900">Reason</span>
          <input value={reason} onChange={(e) => setReason(e.target.value)} required className="mt-1 w-full rounded-lg border border-amber-200 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Market run" />
        </label>
      </div>
      <div>
        <button type="submit" className="inline-flex items-center rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-sm font-bold px-4 py-2.5 hover:shadow-amber-500/40 hover:shadow-xl transition-all">
          Submit
        </button>
      </div>
    </form>
  )
}

ShortLeaveForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
}

