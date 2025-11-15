import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import LongLeaveForm from '../components/LongLeaveForm'
import ShortLeaveForm from '../components/ShortLeaveForm'
import LeaveCard from '../components/LeaveCard'
import { getMyLongLeaves, getMyShortLeaves, submitLongLeave, submitShortLeave, returnShortLeave, createComplaint, getUserComplaints, updateComplaintStatus } from '../lib/api'
import { Link, useNavigate } from 'react-router-dom'
import { Home as HomeIcon, X } from 'lucide-react'
import { useState, Fragment, useEffect } from 'react'
import { io } from 'socket.io-client'
import { API_URL } from '../lib/api'
import { useAuth } from '../context/AuthContext.jsx'

export default function StudentDashboard() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  // Redirect if not a student
  useEffect(() => {
    if (user && user.role !== 'student') {
      toast.error('Access denied. Students only.')
      navigate('/')
    }
  }, [user, navigate])
  const { data: lls = [] } = useQuery({ queryKey: ['me','long'], queryFn: getMyLongLeaves, refetchInterval: 5000 })
  const { data: sls = [] } = useQuery({ queryKey: ['me','short'], queryFn: getMyShortLeaves, refetchInterval: 5000 })
  const { data: complaints = [] } = useQuery({ queryKey: ['me','complaints'], queryFn: getUserComplaints, refetchInterval: 5000 })

  // Realtime updates: refresh short-leave list when backend emits updates
  useEffect(() => {
    if (!user) return
    try {
      const socket = io(API_URL, { path: '/socket.io' })
      const onShortUpdated = (payload) => {
        // Only notify and refresh when the event is for the current user
        try {
          const sid = payload?.student?.id || payload?.student_id || null
          if (sid && user.id && String(sid) === String(user.id)) {
            const status = payload?.status || 'Updated'
            toast.info(`Short leave status: ${status}`)
            qc.invalidateQueries({ queryKey: ['me','short'] })
          }
        } catch (e) { qc.invalidateQueries({ queryKey: ['me','short'] }) }
      }
      socket.on('short_leave_updated', onShortUpdated)
      socket.on('short_leave_created', onShortUpdated)
      return () => { try { socket.off('short_leave_updated', onShortUpdated); socket.off('short_leave_created', onShortUpdated); socket.close() } catch {} }
    } catch {}
  }, [qc, user])

  const longMut = useMutation({ mutationFn: submitLongLeave, onSuccess: () => { toast.success('Long leave submitted'); qc.invalidateQueries({ queryKey: ['me','long'] }) } })
  const shortMut = useMutation({ mutationFn: submitShortLeave, onSuccess: () => { toast.success('Short leave submitted'); qc.invalidateQueries({ queryKey: ['me','short'] }) } })
  const retMut = useMutation({ mutationFn: returnShortLeave, onSuccess: () => { toast.info('Marked returned'); qc.invalidateQueries({ queryKey: ['me','short'] }) } })
  const complaintMut = useMutation({ mutationFn: createComplaint, onSuccess: () => { toast.success('Complaint submitted'); qc.invalidateQueries({ queryKey: ['me','complaints'] }) } })
  const solveComplaintMut = useMutation({ mutationFn: ({ id }) => updateComplaintStatus(id, 'resolved'), onSuccess: () => { toast.success('Complaint marked as solved'); qc.invalidateQueries({ queryKey: ['me','complaints'] }) } })
  const [openLong, setOpenLong] = useState(false)
  const [openShort, setOpenShort] = useState(false)
  const [openComplaint, setOpenComplaint] = useState(false)
  const [complaintForm, setComplaintForm] = useState({ query: '' })

  function isWithinSubmissionWindow() {
    const h = new Date().getHours()
    return h >= 6 && h < 21
  }
  const canSubmit = isWithinSubmissionWindow()

  function formatLocalDateYYYYMMDD(d = new Date()) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  const [selectedDate, setSelectedDate] = useState(formatLocalDateYYYYMMDD())
  function isOnSelectedDate(ts) {
    if (!ts) return false
    const d = new Date(ts)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}` === selectedDate
  }

  const handleComplaintSubmit = (e) => {
    e.preventDefault()
    if (!complaintForm.query.trim()) {
      toast.error('Please enter your complaint')
      return
    }
    
    complaintMut.mutate({
      query: complaintForm.query.trim(),
      status: 'pending'
    })
    setComplaintForm({ query: '' })
    setOpenComplaint(false)
  }

  return (
    <Fragment>
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <header className="bg-white/80 backdrop-blur-xl border-b border-amber-200/50 sticky top-0 z-50 shadow-lg shadow-amber-500/5">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/50">
                <HomeIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">LeavePass</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/" className="text-amber-900 hover:text-amber-600 font-medium text-sm sm:text-base">Home</Link>
              <button onClick={() => { logout(); navigate('/login') }} className="border-2 border-amber-400 text-amber-800 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-amber-50 transition-all">Logout</button>
            </div>
          </div>
        </nav>
      </header>

      {/* Golden Ratio Layout: 61.8% main content, 38.2% sidebar */}
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        
        {/* Main Content Area - 61.8% of width */}
        <div className="bg-white/85 backdrop-blur-xl lg:border-r lg:border-amber-200/50 shadow-2xl shadow-amber-500/10 lg:w-[61.8%] w-full p-4 lg:p-6">
          <div className="space-y-4 lg:space-y-6">
            
            {/* Date Filter Header */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-amber-900 font-semibold text-sm sm:text-base">📅 Selected Date</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border-2 border-amber-300 rounded-lg px-3 py-2 text-sm text-amber-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>
                <div className="text-xs sm:text-sm text-amber-700">
                  {selectedDate === formatLocalDateYYYYMMDD() ? '📍 Today' : '📆 Historical View'}
                </div>
              </div>
            </div>

            {/* Today's Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 lg:p-4">
                <div className="text-lg lg:text-xl font-bold text-blue-600">
                  {lls.filter(it => isOnSelectedDate(it.submit_time)).length}
                </div>
                <div className="text-xs lg:text-sm text-blue-800 font-medium">Long Leaves</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-3 lg:p-4">
                <div className="text-lg lg:text-xl font-bold text-emerald-600">
                  {sls.filter(it => it.status === 'Pending' || isOnSelectedDate(it.out_time)).length}
                </div>
                <div className="text-xs lg:text-sm text-emerald-800 font-medium">Short Leaves</div>
              </div>
              <div className="bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200 rounded-lg p-3 lg:p-4">
                <div className="text-lg lg:text-xl font-bold text-rose-600">
                  {complaints.filter(it => isOnSelectedDate(it.created_at)).length}
                </div>
                <div className="text-xs lg:text-sm text-rose-800 font-medium">Complaints</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 lg:p-4">
                <div className="text-lg lg:text-xl font-bold text-amber-600">
                  {canSubmit ? '✅' : '⏰'}
                </div>
                <div className="text-xs lg:text-sm text-amber-800 font-medium">
                  {canSubmit ? 'Can Apply' : '6AM-9PM Only'}
                </div>
              </div>
            </div>

            {/* Long Leave Section */}
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-amber-950 mb-3 lg:mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Long Leave Applications
              </h2>
              <div className="space-y-3 lg:space-y-4">
                {lls.filter(it => isOnSelectedDate(it.submit_time)).length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 lg:p-6 text-center">
                    <div className="text-amber-600 text-sm sm:text-base">No long leave applications found for this date</div>
                  </div>
                ) : (
                  <div className="grid gap-3 lg:gap-4 sm:grid-cols-1 xl:grid-cols-2">
                    {lls.filter(it => isOnSelectedDate(it.submit_time)).map(item => (
                      <LeaveCard key={item.id}
                        title={`Long Leave • ${item.student.name}`}
                        fields={[
                          ['Room', item.student.room_no],
                          ['Hostel', item.student.hostel_no],
                          ['Reason', item.reason],
                          ['Submit', new Date(item.submit_time).toLocaleString()],
                          ['Return Date', item.return_date],
                        ]}
                        status={item.status}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Short Leave Section */}
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-amber-950 mb-3 lg:mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Short Leave Applications
              </h2>
              <div className="space-y-3 lg:space-y-4">
                {sls.filter(it => it.status === 'Pending' || isOnSelectedDate(it.out_time)).length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 lg:p-6 text-center">
                    <div className="text-amber-600 text-sm sm:text-base">No short leave applications found for this date</div>
                  </div>
                ) : (
                  <div className="grid gap-3 lg:gap-4 sm:grid-cols-1 xl:grid-cols-2">
                    {sls.filter(it => it.status === 'Pending' || isOnSelectedDate(it.out_time)).map(item => (
                      <LeaveCard key={item.id}
                        title={`Short Leave • ${item.student.name}`}
                        fields={[
                          ['Room', item.student.room_no],
                          ['Hostel', item.student.hostel_no],
                          ['Reason', item.reason],
                          ['Out', new Date(item.out_time).toLocaleString()],
                          ['Return', item.return_time ? new Date(item.return_time).toLocaleString() : '-'],
                        ]}
                        status={item.status}
                        action={item.status === 'Out' ? (
                          <button 
                            onClick={() => retMut.mutate(item.id)}
                            className="inline-flex items-center rounded-lg bg-blue-600 text-white text-xs font-semibold px-3 py-2 hover:bg-blue-700 transition-all"
                          >
                            Mark Returned
                          </button>
                        ) : null}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Complaints Section */}
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-amber-950 mb-3 lg:mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                My Complaints ({complaints.filter(it => isOnSelectedDate(it.created_at)).length})
              </h2>
              <div className="space-y-3 lg:space-y-4">
                {complaints.filter(it => isOnSelectedDate(it.created_at)).length === 0 ? (
                  <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-xl p-6 lg:p-8 text-center">
                    <div className="text-amber-600 text-4xl lg:text-5xl mb-3">📝</div>
                    <p className="text-amber-800 font-medium text-sm lg:text-base">No complaints for {selectedDate === formatLocalDateYYYYMMDD() ? 'today' : 'this date'}</p>
                    <p className="text-amber-600 text-xs lg:text-sm mt-1">Submit a complaint using the sidebar if you have any issues</p>
                  </div>
                ) : (
                  <div className="space-y-3 lg:space-y-4">
                    {complaints.filter(it => isOnSelectedDate(it.created_at)).map(complaint => (
                      <div key={complaint._id} className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-xl p-4 lg:p-5 shadow-lg shadow-amber-500/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                                complaint.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                                complaint.status === 'in_progress' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                                'bg-amber-50 text-amber-700 ring-amber-600/20'
                              }`}>
                                {complaint.status === 'resolved' ? '✅ Resolved' : complaint.status === 'in_progress' ? '🔄 In Progress' : '⏳ Pending'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(complaint.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-amber-950 text-sm lg:text-base">{complaint.query}</p>
                          </div>
                          {complaint.status !== 'resolved' && (
                            <button
                              onClick={() => solveComplaintMut.mutate({ id: complaint._id })}
                              className="inline-flex items-center rounded-lg bg-emerald-600 text-white text-xs font-semibold px-3 py-2 hover:bg-emerald-700 transition-all"
                            >
                              ✅ Mark as Solved
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Sidebar Controls - 38.2% of width */}
        <div className="bg-white/75 backdrop-blur-xl shadow-2xl shadow-amber-500/10 lg:w-[38.2%] w-full p-4 lg:p-6">
          <div className="space-y-4 lg:space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 lg:p-5">
              <h3 className="text-base lg:text-lg font-bold text-purple-900 mb-3 lg:mb-4">⚡ Quick Actions</h3>
              <div className="space-y-2 lg:space-y-3">
                <button
                  disabled={!canSubmit}
                  onClick={() => { if (!canSubmit) { toast.error('Leave applications allowed 6:00–21:00'); return } setOpenLong(true) }}
                  className={`w-full inline-flex items-center justify-center rounded-xl text-white text-sm font-bold px-4 py-3 transition-all min-h-[44px] ${canSubmit ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:shadow-amber-500/40 hover:shadow-xl' : 'bg-amber-300/60 cursor-not-allowed'}`}
                >
                  📝 Apply Long Leave
                </button>
                <button
                  disabled={!canSubmit}
                  onClick={() => { if (!canSubmit) { toast.error('Leave applications allowed 6:00–21:00'); return } setOpenShort(true) }}
                  className={`w-full inline-flex items-center justify-center rounded-xl text-white text-sm font-bold px-4 py-3 transition-all min-h-[44px] ${canSubmit ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:shadow-amber-500/40 hover:shadow-xl' : 'bg-amber-300/60 cursor-not-allowed'}`}
                >
                  ⏱️ Apply Short Leave
                </button>
                <button
                  onClick={() => setOpenComplaint(true)}
                  className="w-full inline-flex items-center justify-center rounded-xl text-white text-sm font-bold px-4 py-3 transition-all min-h-[44px] bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 hover:shadow-rose-500/40 hover:shadow-xl"
                >
                  📝 Submit Complaint
                </button>
              </div>
            </div>

            {/* Calendar Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 lg:p-5">
              <h3 className="text-base lg:text-lg font-bold text-blue-900 mb-3 lg:mb-4">📅 Calendar Info</h3>
              <div className="space-y-2 lg:space-y-3 text-xs lg:text-sm">
                <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                  <span className="text-blue-800 font-medium">Current Date</span>
                  <span className="text-blue-600 font-bold">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                  <span className="text-blue-800 font-medium">Selected Date</span>
                  <span className="text-blue-600 font-bold">{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                  <span className="text-blue-800 font-medium">Application Window</span>
                  <span className="text-blue-600 font-bold">6:00 AM - 9:00 PM</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 lg:p-5">
              <h3 className="text-base lg:text-lg font-bold text-amber-900 mb-3 lg:mb-4">💡 Tips</h3>
              <div className="space-y-2 text-xs lg:text-sm text-amber-800">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span>Select any date from the calendar to view historical leave records</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span>Leave applications are only allowed between 6:00 AM and 9:00 PM</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span>Short leaves require check-in and check-out times</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span>Long leaves require return date and emergency contact</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {openLong && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={() => setOpenLong(false)} />
        <div className="relative w-full max-w-lg bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl shadow-2xl shadow-amber-500/20 p-6">
          <button aria-label="Close" onClick={() => setOpenLong(false)} className="absolute top-3 right-3 p-2 rounded-lg hover:bg-amber-100 text-amber-900"><X className="w-5 h-5" /></button>
          <LongLeaveForm onSubmit={(d) => { if (!canSubmit) { toast.error('Leave applications allowed 6:00–21:00'); return } longMut.mutate(d); setOpenLong(false) }} onCancel={() => setOpenLong(false)} />
        </div>
      </div>
    )}
    {openShort && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={() => setOpenShort(false)} />
        <div className="relative w-full max-w-lg bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl shadow-2xl shadow-amber-500/20 p-6">
          <button aria-label="Close" onClick={() => setOpenShort(false)} className="absolute top-3 right-3 p-2 rounded-lg hover:bg-amber-100 text-amber-900"><X className="w-5 h-5" /></button>
          <ShortLeaveForm onSubmit={(d) => { if (!canSubmit) { toast.error('Leave applications allowed 6:00–21:00'); return } shortMut.mutate(d); setOpenShort(false) }} onCancel={() => setOpenShort(false)} />
        </div>
      </div>
    )}
    {openComplaint && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={() => setOpenComplaint(false)} />
        <div className="relative w-full max-w-lg bg-white/80 backdrop-blur-xl border border-rose-200 rounded-2xl shadow-2xl shadow-rose-500/20 p-6">
          <button aria-label="Close" onClick={() => setOpenComplaint(false)} className="absolute top-3 right-3 p-2 rounded-lg hover:bg-rose-100 text-rose-900"><X className="w-5 h-5" /></button>
          <div>
            <h2 className="text-xl font-bold text-rose-950 mb-4">📝 Submit Complaint</h2>
            <form onSubmit={handleComplaintSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-rose-800 mb-2">
                  Problem/Query
                </label>
                <textarea
                  value={complaintForm.query}
                  onChange={(e) => setComplaintForm({ ...complaintForm, query: e.target.value })}
                  rows={4}
                  className="w-full border-2 border-rose-300 rounded-lg px-3 py-2 text-sm text-rose-900 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                  placeholder="Describe your problem or query in detail..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-rose-700">
                <div>
                  <span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}
                </div>
                <div>
                  <span className="font-semibold">Time:</span> {new Date().toLocaleTimeString()}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpenComplaint(false)}
                  className="flex-1 px-4 py-2 border-2 border-rose-400 text-rose-800 rounded-lg font-semibold hover:bg-rose-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={complaintMut.isPending}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg font-semibold hover:from-rose-600 hover:to-red-600 transition-all disabled:opacity-50"
                >
                  {complaintMut.isPending ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
    </Fragment>
  )
}
