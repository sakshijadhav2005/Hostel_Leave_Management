import PropTypes from 'prop-types'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function LongLeaveForm({ onSubmit, onCancel }) {
  const { user } = useAuth()
  const [reason, setReason] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [addressDuringLeave, setAddressDuringLeave] = useState('')

  return (
    <form
      className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl shadow-2xl shadow-amber-500/10 p-6 space-y-4"
      onSubmit={(e) => { e.preventDefault(); onSubmit({
        name: user?.name,
        roomNo: user?.room_no,
        hostelNo: user?.hostel_no,
        reason,
        fromDate,
        toDate,
        emergencyContact,
        addressDuringLeave,
        submitTime: new Date().toISOString(),
        status: 'Pending',
        return_date: toDate,
      }) }}
      aria-label="Apply long leave"
    >
      <h3 className="text-base font-semibold text-amber-950">Apply Long Leave</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="block text-amber-900">Name</span>
          <input value={user?.name || ''} disabled className="mt-1 w-full rounded-lg border border-amber-200 bg-white/60 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="block text-amber-900">Room No</span>
          <input value={user?.room_no || ''} disabled className="mt-1 w-full rounded-lg border border-amber-200 bg-white/60 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="block text-amber-900">Hostel No</span>
          <input value={user?.hostel_no || ''} disabled className="mt-1 w-full rounded-lg border border-amber-200 bg-white/60 px-3 py-2" />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="block text-amber-900">Reason</span>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} required className="mt-1 w-full rounded-lg border border-amber-200 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Reason for long leave" rows={3} />
        </label>
        <label className="text-sm">
          <span className="block text-amber-900">From Date</span>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required className="mt-1 w-full rounded-lg border border-amber-200 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </label>
        <label className="text-sm">
          <span className="block text-amber-900">To Date</span>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required className="mt-1 w-full rounded-lg border border-amber-200 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </label>
        <label className="text-sm">
          <span className="block text-amber-900">Emergency Contact</span>
          <input type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value.replace(/\D/g,''))} required className="mt-1 w-full rounded-lg border border-amber-200 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="10-digit number" />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="block text-amber-900">Address During Leave</span>
          <textarea value={addressDuringLeave} onChange={(e) => setAddressDuringLeave(e.target.value)} required className="mt-1 w-full rounded-lg border border-amber-200 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Where will you stay?" rows={3} />
        </label>
        <input type="hidden" value="Pending" readOnly />
      </div>
      <div>
        <div className="flex items-center gap-3">
          <button type="submit" className="inline-flex items-center rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-sm font-bold px-4 py-2.5 hover:shadow-amber-500/40 hover:shadow-xl transition-all">
            Submit
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="inline-flex items-center rounded-xl border border-amber-300 text-amber-900 text-sm font-medium px-4 py-2.5 hover:bg-amber-50 transition-all">
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  )
}

LongLeaveForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
}
