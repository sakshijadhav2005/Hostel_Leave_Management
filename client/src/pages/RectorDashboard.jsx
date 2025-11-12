


import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getRectorLongLeaves, getRectorShortLeaves, approveLongLeave, rejectLongLeave, getRectorStudents, updateRectorStudent, deleteRectorStudent, markShortLeaveReturned, getRectorComplaints, updateComplaintStatus } from '../lib/api'
import { Link, useNavigate } from 'react-router-dom'
import { Home as HomeIcon } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import jsPDF from 'jspdf'
import { io } from 'socket.io-client'
import { API_URL } from '../lib/api'

export default function RectorDashboard() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  // Redirect if not admin/rector
  useEffect(() => {
    if (user && !['admin', 'rector'].includes(user.role)) {
      toast.error('Access denied. Admin/Rector only.')
      navigate('/')
    }
  }, [user, navigate])
  const { data: lls = [] } = useQuery({ queryKey: ['r','long'], queryFn: getRectorLongLeaves })
  const { data: sls = [] } = useQuery({ queryKey: ['r','short'], queryFn: getRectorShortLeaves, refetchInterval: 5000 })
  const { data: studs = [] } = useQuery({ queryKey: ['r','students'], queryFn: getRectorStudents })
  const { data: complaints = [] } = useQuery({ queryKey: ['r','complaints'], queryFn: getRectorComplaints })
  const upd = useMutation({ mutationFn: ({ id, payload }) => updateRectorStudent(id, payload), onSuccess: () => { toast.success('Student updated'); qc.invalidateQueries({ queryKey: ['r','students'] }) } })
  const del = useMutation({ mutationFn: deleteRectorStudent, onSuccess: () => { toast.success('Student deleted'); qc.invalidateQueries({ queryKey: ['r','students'] }) } })

  const approve = useMutation({ mutationFn: approveLongLeave, onSuccess: () => { toast.success('Approved'); qc.invalidateQueries({ queryKey: ['r','long'] }) } })
  const reject = useMutation({ mutationFn: rejectLongLeave, onSuccess: () => { toast.error('Rejected'); qc.invalidateQueries({ queryKey: ['r','long'] }) } })
  const markRet = useMutation({ mutationFn: markShortLeaveReturned, onSuccess: () => { toast.success('Marked returned'); qc.invalidateQueries({ queryKey: ['r','short'] }) } })
  const [tab, setTab] = useState('short')
  const [selectedDate, setSelectedDate] = useState(formatLocalDateYYYYMMDD())
  const [selectedHostel, setSelectedHostel] = useState('All')

  useEffect(() => {
    const socket = io(API_URL, { transports: ['websocket'], path: '/socket.io' })
    const onShortLeaveCreated = (payload) => {
      const s = payload?.student || {}
      const msg = `${s.name || 'A student'} from Hostel ${s.hostel_no || '-'} Room ${s.room_no || '-'} is OUT. Reason: ${payload?.reason || '-'} at ${payload?.out_time ? new Date(payload.out_time).toLocaleString() : ''}`
      toast.info(msg)
      // System notification if permitted
      try {
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('Student OUT', { body: msg })
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(p => { if (p === 'granted') new Notification('Student OUT', { body: msg }) })
          }
        }
      } catch {}
      // Refresh list immediately
      qc.invalidateQueries({ queryKey: ['r','short'] })
    }
    socket.on('short_leave_created', onShortLeaveCreated)
    return () => { try { socket.off('short_leave_created', onShortLeaveCreated); socket.close() } catch {} }
  }, [qc])

  const filteredCurrent = (
    tab === 'long'
      ? lls.filter(it => isOnDate(it.submit_time, selectedDate))
      : tab === 'short'
        ? sls.filter(it => isOnDate(it.out_time, selectedDate))
        : tab === 'complaints'
          ? complaints.filter(it => isOnDate(it.created_at, selectedDate))
          : studs
  )
  const grouped = filteredCurrent.reduce((acc, item) => {
    const hostel = tab === 'students' ? (item.hostel_no || 'Unknown') 
                  : tab === 'complaints' ? (item.hostel_no || 'Unknown')
                  : (item.student?.hostel_no || 'Unknown')
    ;(acc[hostel] ||= []).push(item)
    return acc
  }, {})
  const hostels = Object.keys(grouped).sort()
  const visibleHostels = selectedHostel === 'All' ? hostels : hostels.filter(h => h === selectedHostel)

  function formatLocalDateYYYYMMDD(d = new Date()) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  function isOnDate(ts, dateStr) {
    if (!ts) return false
    const d = new Date(ts)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}` === dateStr
  }
  function groupByHostel(items, pickHostel) {
    return items.reduce((acc, it) => { const h = pickHostel(it) || 'Unknown'; (acc[h] ||= []).push(it); return acc }, {})
  }

  function drawTable(doc, startX, startY, columns, rows) {
    const pageHeight = doc.internal.pageSize.getHeight()
    const marginY = 40
    const headerH = 18
    let y = startY
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
    columns.forEach(col => { doc.rect(startX, y, col.w, headerH); doc.text(col.title, startX + 3, y + 12); startX += col.w })
    y += headerH
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
    rows.forEach(row => {
      const wrapped = row.map((cell, i) => doc.splitTextToSize(String(cell ?? '-'), columns[i].w - 6))
      const rowH = Math.max(16, Math.max(...wrapped.map(w => w.length)) * 10 + 6)
      if (y + rowH > pageHeight - marginY) {
        doc.addPage(); y = marginY
        let hx = startX; doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
        columns.forEach(col => { doc.rect(hx, y, col.w, headerH); doc.text(col.title, hx + 3, y + 12); hx += col.w })
        y += headerH; doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
      }
      let cx = startX
      columns.forEach((col, i) => { doc.rect(cx, y, col.w, rowH); let ty = y + 12; wrapped[i].forEach(line => { doc.text(line, cx + 3, ty); ty += 10 }); cx += col.w })
      y += rowH
    })
    return y
  }

  function generatePdf(type) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const marginX = 40
    let y = 50
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16)
    doc.text(`${type === 'short' ? 'Short Leave' : 'Long Leave'} - ${selectedDate}`, marginX, y)
    y += 14; doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
    try { doc.text(new Date(`${selectedDate}T00:00:00`).toLocaleDateString(), marginX, y) } catch { doc.text(selectedDate, marginX, y) }
    y += 16
    const data = type === 'short' ? sls.filter(it => isOnDate(it.out_time, selectedDate)) : lls.filter(it => isOnDate(it.submit_time, selectedDate))
    const groupedBy = groupByHostel(data, it => it.student.hostel_no)
    let hostelsList = Object.keys(groupedBy).sort(); if (selectedHostel !== 'All') hostelsList = hostelsList.filter(h => h === selectedHostel)
    hostelsList.forEach((h, i) => {
      if (y > 740) { doc.addPage(); y = 50 }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text(`Hostel ${h}`, marginX, y); y += 10
      const cols = type === 'short'
        ? [{title:'Name',w:100},{title:'Room',w:50},{title:'Reason',w:120},{title:'Out',w:95},{title:'Return',w:95},{title:'Status',w:45}]
        : [{title:'Name',w:90},{title:'Room',w:50},{title:'Reason',w:115},{title:'From',w:60},{title:'To',w:60},{title:'Submitted',w:100},{title:'Status',w:40}]
      const rows = groupedBy[h].map(it => type === 'short'
        ? [it.student.name, it.student.room_no, it.reason, new Date(it.out_time).toLocaleString(), it.return_time ? new Date(it.return_time).toLocaleString() : '-', it.status]
        : [it.student.name, it.student.room_no, it.reason, it.from_date ? new Date(it.from_date).toLocaleDateString() : '-', it.to_date ? new Date(it.to_date).toLocaleDateString() : (it.return_date ? new Date(it.return_date).toLocaleDateString() : '-'), new Date(it.submit_time).toLocaleString(), it.status])
      y = drawTable(doc, marginX, y + 6, cols, rows)
      if (i < hostelsList.length - 1) y += 8
    })
    return doc
  }

  function generateCombinedPdf(dateStr = selectedDate) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const marginX = 40
    let y = 50
    doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.text(`Leaves - ${dateStr}`, marginX, y)
    y += 14; doc.setFont('helvetica','normal'); doc.setFontSize(10)
    try { doc.text(new Date(`${dateStr}T00:00:00`).toLocaleDateString(), marginX, y) } catch { doc.text(dateStr, marginX, y) }
    y += 16
    const shortData = sls.filter(it => isOnDate(it.out_time, dateStr))
    const shortGrouped = groupByHostel(shortData, it => it.student.hostel_no)
    let shortHostels = Object.keys(shortGrouped).sort(); if (selectedHostel !== 'All') shortHostels = shortHostels.filter(h => h === selectedHostel)
    if (shortHostels.length) {
      doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.text('Short Leaves', marginX, y); y += 14
      shortHostels.forEach(h => {
        if (y > 740) { doc.addPage(); y = 50 }
        doc.setFont('helvetica','bold'); doc.text(`Hostel ${h}`, marginX, y); y += 10
        const cols = [{title:'Name',w:100},{title:'Room',w:50},{title:'Reason',w:120},{title:'Out',w:95},{title:'Return',w:95},{title:'Status',w:45}]
        const rows = shortGrouped[h].map(it => [it.student.name, it.student.room_no, it.reason, new Date(it.out_time).toLocaleString(), it.return_time ? new Date(it.return_time).toLocaleString() : '-', it.status])
        y = drawTable(doc, marginX, y + 6, cols, rows)
      })
      y += 16
    }
    const longData = lls.filter(it => isOnDate(it.submit_time, dateStr))
    const longGrouped = groupByHostel(longData, it => it.student.hostel_no)
    let longHostels = Object.keys(longGrouped).sort(); if (selectedHostel !== 'All') longHostels = longHostels.filter(h => h === selectedHostel)
    if (longHostels.length) {
      doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.text('Long Leaves', marginX, y); y += 14
      longHostels.forEach(h => {
        if (y > 740) { doc.addPage(); y = 50 }
        doc.setFont('helvetica','bold'); doc.text(`Hostel ${h}`, marginX, y); y += 10
        const cols = [{title:'Name',w:90},{title:'Room',w:50},{title:'Reason',w:115},{title:'From',w:60},{title:'To',w:60},{title:'Submitted',w:100},{title:'Status',w:40}]
        const rows = longGrouped[h].map(it => [it.student.name, it.student.room_no, it.reason, it.from_date ? new Date(it.from_date).toLocaleDateString() : '-', it.to_date ? new Date(it.to_date).toLocaleDateString() : (it.return_date ? new Date(it.return_date).toLocaleDateString() : '-'), new Date(it.submit_time).toLocaleString(), it.status])
        y = drawTable(doc, marginX, y + 6, cols, rows)
      })
    }
    return doc
  }

  function downloadPdf(type) { const doc = generatePdf(type); doc.save(`${type}-leaves-${selectedDate}.pdf`) }
  function downloadAllPdf(dateStr = selectedDate) { const doc = generateCombinedPdf(dateStr); doc.save(`all-leaves-${dateStr}.pdf`) }
  async function sharePdf(type) {
    try {
      const doc = generatePdf(type)
      const blob = doc.output('blob')
      const file = new File([blob], `${type}-leaves-${selectedDate}.pdf`, { type: 'application/pdf' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Leave Report', text: 'Daily leave report' }); return }
      const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${type}-leaves-${selectedDate}.pdf`; document.body.appendChild(link); link.click(); URL.revokeObjectURL(link.href); link.remove()
      const message = encodeURIComponent('Daily leave report downloaded. Please find the PDF in your downloads and share.')
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      window.open(isMobile ? `whatsapp://send?text=${message}` : `https://wa.me/?text=${message}`, '_blank')
    } catch { toast.error('Share not supported on this device') }
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <header className="bg-white/80 backdrop-blur-xl border-b border-amber-200/50 sticky top-0 z-50 shadow-lg shadow-amber-500/5">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/50">
                <HomeIcon className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">LeavePass</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-amber-900 hover:text-amber-600 font-medium">Home</Link>
              <button onClick={() => { logout(); navigate('/login') }} className="border-2 border-amber-400 text-amber-800 px-3 py-1.5 rounded-xl font-bold text-sm hover:bg-amber-50 transition-all">Logout</button>
            </div>
          </div>
        </nav>
      </header>
      {/* Golden Ratio Layout: Desktop - 61.8% main, 38.2% sidebar, Mobile - Stacked */}
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        {/* Main Content Area - Golden Ratio 61.8% */}
        <div className="bg-white/85 backdrop-blur-xl lg:border-r lg:border-amber-200/50 shadow-2xl shadow-amber-500/10 lg:w-[61.8%] w-full p-4 lg:p-6">
          <div className="space-y-4 lg:space-y-6">
          {/* Responsive Tab Navigation */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button onClick={() => setTab('short')} className={`${tab==='short' ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg' : 'border-2 border-amber-400 text-amber-800 hover:bg-amber-50'} px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-sm transition-all flex-1`}>Short Leave</button>
            <button onClick={() => setTab('long')} className={`${tab==='long' ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg' : 'border-2 border-amber-400 text-amber-800 hover:bg-amber-50'} px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-sm transition-all flex-1`}>Long Leave</button>
            <button onClick={() => setTab('students')} className={`${tab==='students' ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg' : 'border-2 border-amber-400 text-amber-800 hover:bg-amber-50'} px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-sm transition-all flex-1`}>Students</button>
            <button onClick={() => setTab('complaints')} className={`${tab==='complaints' ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg' : 'border-2 border-amber-400 text-amber-800 hover:bg-amber-50'} px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-sm transition-all flex-1`}>Complaints</button>
          </div>

          {visibleHostels.map((h) => (
            <section key={h}>
              <div className="mb-2">
                <span className="px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-amber-800 text-xs font-semibold backdrop-blur-sm inline-block">Hostel {h}</span>
              </div>
              <h2 className="text-lg font-bold text-amber-950 mb-3">{tab === 'long' ? 'Long Leave Requests' : tab === 'short' ? 'Short Leave Requests' : tab === 'complaints' ? 'Complaints' : 'Students'}</h2>
              {tab === 'students' ? (
                <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-xl p-0 overflow-hidden shadow-lg shadow-amber-500/10">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
                      <tr>
                        <th className="text-left px-4 py-2 text-amber-900">Name</th>
                        <th className="text-left px-4 py-2 text-amber-900">Email</th>
                        <th className="text-left px-4 py-2 text-amber-900">Room</th>
                        <th className="text-left px-4 py-2 text-amber-900">Hostel</th>
                        <th className="text-left px-4 py-2 text-amber-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped[h].map(item => (
                        <tr key={item.id} className="border-b last:border-b-0 border-amber-100">
                          <td className="px-4 py-2">
                            <input id={`name-${item.id}`} defaultValue={item.name} readOnly className="w-full border border-amber-200 rounded px-2 py-1 bg-amber-50/50 text-amber-900/70" />
                          </td>
                          <td className="px-4 py-2">
                            <input id={`email-${item.id}`} defaultValue={item.email} readOnly className="w-full border border-amber-200 rounded px-2 py-1 bg-amber-50/50 text-amber-900/70" />
                          </td>
                          <td className="px-4 py-2">
                            <input id={`room-${item.id}`} defaultValue={item.room_no} className="w-full border border-amber-200 rounded px-2 py-1 bg-white/80" />
                          </td>
                          <td className="px-4 py-2">
                            <input id={`hostel-${item.id}`} defaultValue={item.hostel_no} className="w-full border border-amber-200 rounded px-2 py-1 bg-white/80" />
                          </td>
                          <td className="px-4 py-2 flex gap-2">
                            <button onClick={() => {
                              const room_no = document.getElementById(`room-${item.id}`).value.trim()
                              const hostel_no = document.getElementById(`hostel-${item.id}`).value.trim()
                              const payload = {}
                              if (room_no && room_no !== item.room_no) payload.room_no = room_no
                              if (hostel_no && hostel_no !== item.hostel_no) payload.hostel_no = hostel_no
                              if (Object.keys(payload).length === 0) { toast.info('No changes'); return }
                              upd.mutate({ id: item.id, payload })
                            }} className="inline-flex items-center rounded-md bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">Update</button>
                            <button onClick={() => del.mutate(item.id)} className="inline-flex items-center rounded-md bg-rose-600 text-white text-xs font-semibold px-3 py-1.5 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : tab === 'complaints' ? (
                <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-xl p-0 overflow-hidden shadow-lg shadow-amber-500/10">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
                      <tr>
                        <th className="text-left px-4 py-2 text-amber-900">Name</th>
                        <th className="text-left px-4 py-2 text-amber-900">Room</th>
                        <th className="text-left px-4 py-2 text-amber-900">Hostel</th>
                        <th className="text-left px-4 py-2 text-amber-900">Problem/Query</th>
                        <th className="text-left px-4 py-2 text-amber-900">Date</th>
                        <th className="text-left px-4 py-2 text-amber-900">Time</th>
                        <th className="text-left px-4 py-2 text-amber-900">Status</th>
                        <th className="text-left px-4 py-2 text-amber-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped[h].map(item => (
                        <tr key={item._id} className="border-b last:border-b-0 border-amber-100">
                          <td className="px-4 py-2 text-amber-950">{item.name}</td>
                          <td className="px-4 py-2">{item.room_no}</td>
                          <td className="px-4 py-2">{item.hostel_no}</td>
                          <td className="px-4 py-2 max-w-xs truncate" title={item.query}>{item.query}</td>
                          <td className="px-4 py-2">{new Date(item.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-2">{new Date(item.created_at).toLocaleTimeString()}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                              item.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                              item.status === 'in_progress' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                              'bg-amber-50 text-amber-700 ring-amber-600/20'
                            }`}>
                              {item.status === 'resolved' ? 'Resolved' : item.status === 'in_progress' ? 'In Progress' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="text-xs text-gray-500">View Only</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-6">
                  {tab === 'long' ? (
                    <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-xl overflow-hidden shadow-lg shadow-amber-500/10">
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
                          <tr>
                            <th className="text-left px-4 py-2 text-amber-900">Name</th>
                            <th className="text-left px-4 py-2 text-amber-900">Room</th>
                            <th className="text-left px-4 py-2 text-amber-900">Hostel</th>
                            <th className="text-left px-4 py-2 text-amber-900">Reason</th>
                            <th className="text-left px-4 py-2 text-amber-900">From</th>
                            <th className="text-left px-4 py-2 text-amber-900">To</th>
                            <th className="text-left px-4 py-2 text-amber-900">Submitted</th>
                            <th className="text-left px-4 py-2 text-amber-900">Status</th>
                            <th className="text-left px-4 py-2 text-amber-900">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grouped[h].map(item => (
                            <tr key={item.id} className="border-b last:border-b-0 border-amber-100">
                              <td className="px-4 py-2 text-amber-950">{item.student.name}</td>
                              <td className="px-4 py-2">{item.student.room_no}</td>
                              <td className="px-4 py-2">{item.student.hostel_no}</td>
                              <td className="px-4 py-2">{item.reason}</td>
                              <td className="px-4 py-2">{item.from_date ? new Date(item.from_date).toLocaleDateString() : '-'}</td>
                              <td className="px-4 py-2">{item.to_date ? new Date(item.to_date).toLocaleDateString() : (item.return_date ? new Date(item.return_date).toLocaleDateString() : '-')}</td>
                              <td className="px-4 py-2">{new Date(item.submit_time).toLocaleString()}</td>
                              <td className="px-4 py-2"><StatusBadge status={item.status} /></td>
                              <td className="px-4 py-2">{item.status === 'Pending' ? (
                                <div className="flex gap-2">
                                  <button onClick={() => approve.mutate(item.id)} className="inline-flex items-center rounded-md bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">Approve</button>
                                  <button onClick={() => reject.mutate(item.id)} className="inline-flex items-center rounded-md bg-rose-600 text-white text-xs font-semibold px-3 py-1.5 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500">Reject</button>
                                </div>
                              ) : null}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-xl overflow-hidden shadow-lg shadow-amber-500/10">
                        <div className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 text-sm font-semibold text-amber-900">Out</div>
                        <table className="w-full text-sm">
                          <thead>
                            <tr>
                              <th className="text-left px-4 py-2 text-amber-900">Name</th>
                              <th className="text-left px-4 py-2 text-amber-900">Room</th>
                              <th className="text-left px-4 py-2 text-amber-900">Hostel</th>
                              <th className="text-left px-4 py-2 text-amber-900">Reason</th>
                              <th className="text-left px-4 py-2 text-amber-900">Out</th>
                              <th className="text-left px-4 py-2 text-amber-900">Return</th>
                              <th className="text-left px-4 py-2 text-amber-900">Status</th>
                              <th className="text-left px-4 py-2 text-amber-900">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {grouped[h].filter(x => x.status === 'Out').map(item => (
                              <tr key={item.id} className="border-b last:border-b-0 border-amber-100">
                                <td className="px-4 py-2 text-amber-950">{item.student.name}</td>
                                <td className="px-4 py-2">{item.student.room_no}</td>
                                <td className="px-4 py-2">{item.student.hostel_no}</td>
                                <td className="px-4 py-2">{item.reason}</td>
                                <td className="px-4 py-2">{new Date(item.out_time).toLocaleString()}</td>
                                <td className="px-4 py-2">{item.return_time ? new Date(item.return_time).toLocaleString() : '-'}</td>
                                <td className="px-4 py-2"><StatusBadge status={item.status} /></td>
                                <td className="px-4 py-2"><button onClick={() => markRet.mutate(item.id)} className="inline-flex items-center rounded-md bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Mark Returned</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-xl overflow-hidden shadow-lg shadow-amber-500/10">
                        <div className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 text-sm font-semibold text-amber-900">Returned</div>
                        <table className="w-full text-sm">
                          <thead>
                            <tr>
                              <th className="text-left px-4 py-2 text-amber-900">Name</th>
                              <th className="text-left px-4 py-2 text-amber-900">Room</th>
                              <th className="text-left px-4 py-2 text-amber-900">Hostel</th>
                              <th className="text-left px-4 py-2 text-amber-900">Reason</th>
                              <th className="text-left px-4 py-2 text-amber-900">Out</th>
                              <th className="text-left px-4 py-2 text-amber-900">Return</th>
                              <th className="text-left px-4 py-2 text-amber-900">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {grouped[h].filter(x => x.status === 'Returned').map(item => (
                              <tr key={item.id} className="border-b last:border-b-0 border-amber-100">
                                <td className="px-4 py-2 text-amber-950">{item.student.name}</td>
                                <td className="px-4 py-2">{item.student.room_no}</td>
                                <td className="px-4 py-2">{item.student.hostel_no}</td>
                                <td className="px-4 py-2">{item.reason}</td>
                                <td className="px-4 py-2">{new Date(item.out_time).toLocaleString()}</td>
                                <td className="px-4 py-2">{item.return_time ? new Date(item.return_time).toLocaleString() : '-'}</td>
                                <td className="px-4 py-2"><span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset">{item.status}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}
            </section>
          ))}
          </div>
        </div>

        {/* Sidebar - Golden Ratio 38.2% */}
        <div className="bg-white/75 backdrop-blur-xl shadow-2xl shadow-amber-500/10 lg:w-[38.2%] w-full p-4 lg:p-6">
          <div className="space-y-4 lg:space-y-6">
            
            {/* Date and Hostel Filters */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 lg:p-4 shadow-lg">
              <h3 className="text-base lg:text-lg font-bold text-amber-900 mb-3 lg:mb-4">Filters & Controls</h3>
              
              <div className="space-y-3 lg:space-y-4">
                <div>
                  <label className="block text-xs lg:text-sm font-semibold text-amber-800 mb-1 lg:mb-2">Select Date</label>
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    className="w-full border-2 border-amber-300 rounded-lg lg:rounded-xl px-3 lg:px-4 py-2 text-xs lg:text-sm text-amber-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-amber-500" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs lg:text-sm font-semibold text-amber-800 mb-1 lg:mb-2">Filter by Hostel</label>
                  <select 
                    value={selectedHostel} 
                    onChange={(e) => setSelectedHostel(e.target.value)} 
                    className="w-full border-2 border-amber-300 rounded-lg lg:rounded-xl px-3 lg:px-4 py-2 text-xs lg:text-sm text-amber-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="All">All Hostels</option>
                    {hostels.map(h => (<option key={h} value={h}>{h}</option>))}
                  </select>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 lg:p-4 shadow-lg">
              <h3 className="text-base lg:text-lg font-bold text-blue-900 mb-3 lg:mb-4">Today's Statistics</h3>
              {(() => {
                const todaysShort = sls.filter(it => isOnDate(it.out_time, selectedDate) && (selectedHostel === 'All' || it.student?.hostel_no === selectedHostel))
                const outCount = todaysShort.filter(x => x.status === 'Out').length
                const returnedCount = todaysShort.filter(x => x.status === 'Returned').length
                const pendingLong = lls.filter(it => isOnDate(it.submit_time, selectedDate) && it.status === 'Pending' && (selectedHostel === 'All' || it.student?.hostel_no === selectedHostel)).length
                const todaysComplaints = complaints.filter(it => isOnDate(it.created_at, selectedDate) && (selectedHostel === 'All' || it.hostel_no === selectedHostel))
                const pendingComplaints = todaysComplaints.filter(x => x.status === 'pending').length
                
                return (
                  <div className="space-y-2 lg:space-y-3">
                    <div className="flex justify-between items-center p-2 lg:p-3 bg-blue-100 rounded-lg">
                      <span className="text-xs lg:text-sm font-semibold text-blue-800">Currently Out</span>
                      <span className="text-lg lg:text-xl font-bold text-blue-600">{outCount}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 lg:p-3 bg-emerald-100 rounded-lg">
                      <span className="text-xs lg:text-sm font-semibold text-emerald-800">Returned</span>
                      <span className="text-lg lg:text-xl font-bold text-emerald-600">{returnedCount}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 lg:p-3 bg-amber-100 rounded-lg">
                      <span className="text-xs lg:text-sm font-semibold text-amber-800">Pending Long Leaves</span>
                      <span className="text-lg lg:text-xl font-bold text-amber-600">{pendingLong}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 lg:p-3 bg-rose-100 rounded-lg">
                      <span className="text-xs lg:text-sm font-semibold text-rose-800">Pending Complaints</span>
                      <span className="text-lg lg:text-xl font-bold text-rose-600">{pendingComplaints}</span>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Download & Share Actions */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-3 lg:p-4 shadow-lg">
              <h3 className="text-base lg:text-lg font-bold text-purple-900 mb-3 lg:mb-4">Export & Share</h3>
              <div className="space-y-2 lg:space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button 
                    onClick={() => downloadPdf('short')} 
                    className="px-3 py-2 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-md"
                  >
                    Download Short
                  </button>
                  <button 
                    onClick={() => sharePdf('short')} 
                    className="px-3 py-2 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl text-xs font-semibold border-2 border-amber-400 text-amber-800 hover:bg-amber-50 transition-all"
                  >
                    Share Short
                  </button>
                  <button 
                    onClick={() => downloadPdf('long')} 
                    className="px-3 py-2 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-md"
                  >
                    Download Long
                  </button>
                  <button 
                    onClick={() => sharePdf('long')} 
                    className="px-3 py-2 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl text-xs font-semibold border-2 border-amber-400 text-amber-800 hover:bg-amber-50 transition-all"
                  >
                    Share Long
                  </button>
                </div>
                <button 
                  onClick={() => downloadAllPdf(selectedDate)} 
                  className="w-full px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg lg:rounded-xl text-xs lg:text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md"
                >
                  Download All Reports
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    </>
  )
}




