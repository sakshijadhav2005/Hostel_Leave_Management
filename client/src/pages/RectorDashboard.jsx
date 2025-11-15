


import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getRectorLongLeaves, getRectorShortLeaves, approveLongLeave, rejectLongLeave, getRectorStudents, updateRectorStudent, deleteRectorStudent, markShortLeaveReturned, markShortLeaveOut, getRectorComplaints, updateComplaintStatus } from '../lib/api'
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
  
  const upd = useMutation({
    mutationFn: ({ id, payload }) => updateRectorStudent(id, payload),
    onSuccess: () => { toast.success('Student updated'); qc.invalidateQueries({ queryKey: ['r','students'] }) },
    onError: (err) => { const msg = err?.response?.data?.error || err?.message || 'Update failed'; toast.error(msg) }
  })
  const del = useMutation({
    mutationFn: deleteRectorStudent,
    onSuccess: () => { toast.success('Student deleted'); qc.invalidateQueries({ queryKey: ['r','students'] }) },
    onError: (err) => { const msg = err?.response?.data?.error || err?.message || 'Delete failed'; toast.error(msg) }
  })

  const approve = useMutation({
    mutationFn: approveLongLeave,
    onSuccess: () => { toast.success('Approved'); qc.invalidateQueries({ queryKey: ['r','long'] }) },
    onError: (err) => { const msg = err?.response?.data?.error || err?.message || 'Approve failed'; toast.error(msg) }
  })
  const reject = useMutation({
    mutationFn: rejectLongLeave,
    onSuccess: () => { toast.error('Rejected'); qc.invalidateQueries({ queryKey: ['r','long'] }) },
    onError: (err) => { const msg = err?.response?.data?.error || err?.message || 'Reject failed'; toast.error(msg) }
  })
  const markRet = useMutation({
    mutationFn: markShortLeaveReturned,
    onSuccess: () => { toast.success('Marked returned'); qc.invalidateQueries({ queryKey: ['r','short'] }) },
    onError: (err) => { const msg = err?.response?.data?.error || err?.message || 'Mark returned failed'; toast.error(msg) }
  })
  const markOut = useMutation({
    mutationFn: markShortLeaveOut,
    onSuccess: () => { toast.success('Marked Out'); qc.invalidateQueries({ queryKey: ['r','short'] }) },
    onError: (err) => { const msg = err?.response?.data?.error || err?.message || 'Mark out failed'; toast.error(msg) }
  })
  const [tab, setTab] = useState('short')
  const [selectedDate, setSelectedDate] = useState(formatLocalDateYYYYMMDD())
  const [selectedHostel, setSelectedHostel] = useState('All')

  useEffect(() => {
    const socket = io(API_URL, { path: '/socket.io' })
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
        ? // include pending requests (no out_time yet) as well as leaves with out_time on the selected date
          sls.filter(it => it.status === 'Pending' || isOnDate(it.out_time, selectedDate))
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

  function formatDateTime(dateStr) {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return '-'
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return '-'
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return '-'
    }
  }

  function formatDate(dateStr) {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return '-'
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return '-'
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return '-'
    }
  }

  function safeString(value) {
    if (value === null || value === undefined || value === 'null' || value === 'undefined') return '-'
    return String(value).trim() || '-'
  }

  function drawTable(doc, startX, startY, columns, rows) {
    const pageHeight = doc.internal.pageSize.getHeight()
    const marginY = 50
    const headerH = 22
    let y = startY
    
    // Draw header with better styling
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    let hx = startX
    columns.forEach(col => { 
      doc.rect(hx, y, col.w, headerH, 'S') // Stroke only, no fill
      doc.setTextColor(0, 0, 0) // Black text
      // Center header text in its column
      doc.text(col.title, hx + col.w / 2, y + 14, { align: 'center' })
      hx += col.w 
    })
    y += headerH
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0) // Black text
    
    rows.forEach((row, rowIndex) => {
      const processedRow = row.map(cell => safeString(cell))
      const wrapped = processedRow.map((cell, i) => doc.splitTextToSize(cell, columns[i].w - 8))
      const rowH = Math.max(18, Math.max(...wrapped.map(w => w.length)) * 11 + 8)
      
      if (y + rowH > pageHeight - marginY) {
        doc.addPage()
        y = 60
        // Redraw header on new page
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        let nhx = startX
        columns.forEach(col => { 
          doc.rect(nhx, y, col.w, headerH, 'S')
          doc.setTextColor(0, 0, 0)
          doc.text(col.title, nhx + col.w / 2, y + 14, { align: 'center' })
          nhx += col.w 
        })
        y += headerH
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(0, 0, 0)
      }
      
      // Alternate row colors for better readability
      if (rowIndex % 2 === 0) {
        doc.setFillColor(252, 252, 252) // Very light gray
        doc.rect(startX, y, columns.reduce((sum, col) => sum + col.w, 0), rowH, 'F')
      }
      
      let cx = startX
      columns.forEach((col, i) => { 
        const align = col.align || 'left'
        doc.rect(cx, y, col.w, rowH, 'S') // Stroke only
        let ty = y + 13
        wrapped[i].forEach(line => { 
          if (align === 'center') {
            doc.text(line, cx + col.w / 2, ty, { align: 'center' })
          } else if (align === 'right') {
            doc.text(line, cx + col.w - 4, ty, { align: 'right' })
          } else {
            doc.text(line, cx + 4, ty)
          }
          ty += 11 
        })
        cx += col.w 
      })
      y += rowH
    })
    return y
  }

  function generatePdf(type) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const marginX = 40
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 50
    
    // Enhanced Header
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(0, 0, 0)
    const title = `${type === 'short' ? 'Short Leave Report' : 'Long Leave Report'}`
    const titleWidth = doc.getTextWidth(title)
    doc.text(title, (pageWidth - titleWidth) / 2, y) // Center the title
    
    y += 25
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.text(`Date: ${formatDate(selectedDate)}`, marginX, y)
    doc.text(`Generated: ${formatDateTime(new Date().toISOString())}`, pageWidth - 200, y)
    
    y += 20
    doc.setLineWidth(1)
    doc.line(marginX, y, pageWidth - marginX, y) // Horizontal line
    y += 20
    
    const data = type === 'short' ? sls.filter(it => isOnDate(it.out_time, selectedDate)) : lls.filter(it => isOnDate(it.submit_time, selectedDate))
    const groupedBy = groupByHostel(data, it => it.student.hostel_no)
    let hostelsList = Object.keys(groupedBy).sort()
    if (selectedHostel !== 'All') hostelsList = hostelsList.filter(h => h === selectedHostel)
    
    let totalRecords = 0
    
    hostelsList.forEach((h, i) => {
      if (y > 720) { doc.addPage(); y = 60 }
      
      // Hostel header with better styling
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text(`Hostel ${h}`, marginX, y)
      
      const hostelRecords = groupedBy[h].length
      totalRecords += hostelRecords
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(`(${hostelRecords} record${hostelRecords !== 1 ? 's' : ''})`, marginX + 80, y)
      y += 18
      
      const cols = type === 'short'
        ? [
            { title: 'Name', w: 110, align: 'left' },
            { title: 'Room', w: 50, align: 'center' },
            { title: 'Reason', w: 130, align: 'left' },
            { title: 'Out Time', w: 100, align: 'center' },
            { title: 'Return Time', w: 100, align: 'center' },
            { title: 'Status', w: 55, align: 'center' },
          ]
        : [
            { title: 'Name', w: 100, align: 'left' },
            { title: 'Room', w: 45, align: 'center' },
            { title: 'Reason', w: 120, align: 'left' },
            { title: 'From Date', w: 70, align: 'center' },
            { title: 'To Date', w: 70, align: 'center' },
            { title: 'Submitted', w: 100, align: 'center' },
            { title: 'Status', w: 50, align: 'center' },
          ]
      
      const rows = groupedBy[h].map(it => type === 'short'
        ? [safeString(it.student?.name), safeString(it.student?.room_no), safeString(it.reason), formatDateTime(it.out_time), formatDateTime(it.return_time), safeString(it.status)]
        : [safeString(it.student?.name), safeString(it.student?.room_no), safeString(it.reason), formatDate(it.from_date), formatDate(it.to_date || it.return_date), formatDateTime(it.submit_time), safeString(it.status)])
      
      y = drawTable(doc, marginX, y + 6, cols, rows)
      if (i < hostelsList.length - 1) y += 15
    })
    
    // Add summary at the end
    if (y > 720) { doc.addPage(); y = 60 }
    y += 20
    doc.setLineWidth(1)
    doc.line(marginX, y, pageWidth - marginX, y)
    y += 20
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Summary:', marginX, y)
    y += 18
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Total ${type} leave records: ${totalRecords}`, marginX, y)
    y += 14
    doc.text(`Hostels covered: ${hostelsList.length}`, marginX, y)
    y += 14
    doc.text(`Report generated on: ${formatDateTime(new Date().toISOString())}`, marginX, y)
    
    return doc
  }

  function generateCombinedPdf(dateStr = selectedDate) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const marginX = 40
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 50
    
    // Enhanced Header
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(0, 0, 0)
    const title = 'Complete Leave Report'
    const titleWidth = doc.getTextWidth(title)
    doc.text(title, (pageWidth - titleWidth) / 2, y)
    
    y += 25
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.text(`Date: ${formatDate(dateStr)}`, marginX, y)
    doc.text(`Generated: ${formatDateTime(new Date().toISOString())}`, pageWidth - 200, y)
    
    y += 20
    doc.setLineWidth(1)
    doc.line(marginX, y, pageWidth - marginX, y)
    y += 20
    
    const shortData = sls.filter(it => isOnDate(it.out_time, dateStr))
    const shortGrouped = groupByHostel(shortData, it => it.student.hostel_no)
    let shortHostels = Object.keys(shortGrouped).sort()
    if (selectedHostel !== 'All') shortHostels = shortHostels.filter(h => h === selectedHostel)
    
    let totalShortLeaves = 0
    let totalLongLeaves = 0
    
    if (shortHostels.length) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('SHORT LEAVES', marginX, y)
      y += 20
      
      shortHostels.forEach(h => {
        if (y > 720) { doc.addPage(); y = 60 }
        
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text(`Hostel ${h}`, marginX, y)
        
        const hostelRecords = shortGrouped[h].length
        totalShortLeaves += hostelRecords
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text(`(${hostelRecords} record${hostelRecords !== 1 ? 's' : ''})`, marginX + 80, y)
        y += 18
        
        const cols = [
          { title: 'Name', w: 110, align: 'left' },
          { title: 'Room', w: 50, align: 'center' },
          { title: 'Reason', w: 130, align: 'left' },
          { title: 'Out Time', w: 100, align: 'center' },
          { title: 'Return Time', w: 100, align: 'center' },
          { title: 'Status', w: 55, align: 'center' },
        ]
        const rows = shortGrouped[h].map(it => [safeString(it.student?.name), safeString(it.student?.room_no), safeString(it.reason), formatDateTime(it.out_time), formatDateTime(it.return_time), safeString(it.status)])
        y = drawTable(doc, marginX, y + 6, cols, rows)
        y += 15
      })
      y += 20
    }
    
    const longData = lls.filter(it => isOnDate(it.submit_time, dateStr))
    const longGrouped = groupByHostel(longData, it => it.student.hostel_no)
    let longHostels = Object.keys(longGrouped).sort()
    if (selectedHostel !== 'All') longHostels = longHostels.filter(h => h === selectedHostel)
    
    if (longHostels.length) {
      if (y > 720) { doc.addPage(); y = 60 }
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('LONG LEAVES', marginX, y)
      y += 20
      
      longHostels.forEach(h => {
        if (y > 720) { doc.addPage(); y = 60 }
        
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text(`Hostel ${h}`, marginX, y)
        
        const hostelRecords = longGrouped[h].length
        totalLongLeaves += hostelRecords
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text(`(${hostelRecords} record${hostelRecords !== 1 ? 's' : ''})`, marginX + 80, y)
        y += 18
        
        const cols = [
          { title: 'Name', w: 100, align: 'left' },
          { title: 'Room', w: 45, align: 'center' },
          { title: 'Reason', w: 120, align: 'left' },
          { title: 'From Date', w: 70, align: 'center' },
          { title: 'To Date', w: 70, align: 'center' },
          { title: 'Submitted', w: 100, align: 'center' },
          { title: 'Status', w: 50, align: 'center' },
        ]
        const rows = longGrouped[h].map(it => [safeString(it.student?.name), safeString(it.student?.room_no), safeString(it.reason), formatDate(it.from_date), formatDate(it.to_date || it.return_date), formatDateTime(it.submit_time), safeString(it.status)])
        y = drawTable(doc, marginX, y + 6, cols, rows)
        y += 15
      })
    }
    
    // Add comprehensive summary
    if (y > 720) { doc.addPage(); y = 60 }
    y += 20
    doc.setLineWidth(1)
    doc.line(marginX, y, pageWidth - marginX, y)
    y += 20
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Summary:', marginX, y)
    y += 18
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Total short leave records: ${totalShortLeaves}`, marginX, y)
    y += 14
    doc.text(`Total long leave records: ${totalLongLeaves}`, marginX, y)
    y += 14
    doc.text(`Total leave records: ${totalShortLeaves + totalLongLeaves}`, marginX, y)
    y += 14
    doc.text(`Hostels covered: ${new Set([...shortHostels, ...longHostels]).size}`, marginX, y)
    y += 14
    doc.text(`Report generated on: ${formatDateTime(new Date().toISOString())}`, marginX, y)
    
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
                    <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-xl overflow-hidden lg:overflow-visible shadow-lg shadow-amber-500/10">
                      <div className="space-y-3 p-4 lg:hidden">
                        {grouped[h].map(item => (
                          <div key={`card-${item.id}`} className="border border-amber-200 rounded-xl bg-white/85 p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="text-sm font-semibold text-amber-950">{item.student.name}</h3>
                                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-amber-900/80">
                                  <div>
                                    <dt>Room</dt>
                                    <dd className="font-semibold text-amber-950">{item.student.room_no}</dd>
                                  </div>
                                  <div>
                                    <dt>Hostel</dt>
                                    <dd className="font-semibold text-amber-950">{item.student.hostel_no}</dd>
                                  </div>
                                  <div className="col-span-2">
                                    <dt>Reason</dt>
                                    <dd className="font-semibold text-amber-950 break-words">{item.reason}</dd>
                                  </div>
                                  <div>
                                    <dt>From</dt>
                                    <dd className="font-semibold text-amber-950">{item.from_date ? new Date(item.from_date).toLocaleDateString() : '-'}</dd>
                                  </div>
                                  <div>
                                    <dt>To</dt>
                                    <dd className="font-semibold text-amber-950">{item.to_date ? new Date(item.to_date).toLocaleDateString() : (item.return_date ? new Date(item.return_date).toLocaleDateString() : '-')}</dd>
                                  </div>
                                  <div className="col-span-2">
                                    <dt>Submitted</dt>
                                    <dd className="font-semibold text-amber-950">{new Date(item.submit_time).toLocaleString()}</dd>
                                  </div>
                                </dl>
                              </div>
                              <StatusBadge status={item.status} />
                            </div>
                            {item.status === 'Pending' ? (
                              <div className="mt-4 flex items-center gap-2">
                                <button
                                  onClick={() => approve.mutate(item.id)}
                                  className="inline-flex items-center rounded-lg bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => reject.mutate(item.id)}
                                  className="inline-flex items-center rounded-lg bg-rose-600 text-white text-xs font-semibold px-3 py-1.5 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                      <div className="hidden lg:block">
                        <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-sm">
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
                                  <button onClick={() => approve.mutate(item.id)} className="inline-flex items-center rounded-md bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">Accept</button>
                                  <button onClick={() => reject.mutate(item.id)} className="inline-flex items-center rounded-md bg-rose-600 text-white text-xs font-semibold px-3 py-1.5 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500">Reject</button>
                                </div>
                              ) : null}</td>
                            </tr>
                          ))}
                        </tbody>
                        </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-xl overflow-hidden shadow-lg shadow-amber-500/10">
                        <div className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 text-sm font-semibold text-amber-900">Pending</div>
                        <table className="w-full text-sm">
                          <thead>
                            <tr>
                              <th className="text-left px-4 py-2 text-amber-900">Name</th>
                              <th className="text-left px-4 py-2 text-amber-900">Room</th>
                              <th className="text-left px-4 py-2 text-amber-900">Hostel</th>
                              <th className="text-left px-4 py-2 text-amber-900">Reason</th>
                              <th className="text-left px-4 py-2 text-amber-900">Requested</th>
                              <th className="text-left px-4 py-2 text-amber-900">Status</th>
                              <th className="text-left px-4 py-2 text-amber-900">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {grouped[h].filter(x => x.status === 'Pending').map(item => (
                              <tr key={item.id} className="border-b last:border-b-0 border-amber-100">
                                <td className="px-4 py-2 text-amber-950">{item.student.name}</td>
                                <td className="px-4 py-2">{item.student.room_no}</td>
                                <td className="px-4 py-2">{item.student.hostel_no}</td>
                                <td className="px-4 py-2">{item.reason}</td>
                                <td className="px-4 py-2">{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</td>
                                <td className="px-4 py-2"><StatusBadge status={item.status} /></td>
                                <td className="px-4 py-2">
                                  <button onClick={() => {
                                      if (!window.confirm(`Approve short leave for ${item.student?.name || 'student'}?`)) return;
                                      markOut.mutate(item.id)
                                    }}
                                    className="inline-flex items-center rounded-md bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 mr-2">Approve</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-xl overflow-hidden shadow-lg shadow-amber-500/10">
                        <div className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 text-sm font-semibold text-amber-900">Out</div>

                        {/* Mobile cards (visible < lg) */}
                        <div className="space-y-3 p-4 lg:hidden">
                          {grouped[h].filter(x => x.status === 'Out').map(item => (
                            <div key={`short-out-card-${item.id}`} className="border border-amber-200 rounded-xl bg-white/85 p-4 shadow-sm">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="text-sm font-semibold text-amber-950">{item.student.name}</h3>
                                  <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-amber-900/80">
                                    <div>
                                      <dt>Room</dt>
                                      <dd className="font-semibold text-amber-950">{item.student.room_no}</dd>
                                    </div>
                                    <div>
                                      <dt>Hostel</dt>
                                      <dd className="font-semibold text-amber-950">{item.student.hostel_no}</dd>
                                    </div>
                                    <div className="col-span-2">
                                      <dt>Reason</dt>
                                      <dd className="font-semibold text-amber-950 break-words">{item.reason}</dd>
                                    </div>
                                    <div>
                                      <dt>Out</dt>
                                      <dd className="font-semibold text-amber-950">{item.out_time ? new Date(item.out_time).toLocaleString() : '-'}</dd>
                                    </div>
                                    <div>
                                      <dt>Return</dt>
                                      <dd className="font-semibold text-amber-950">{item.return_time ? new Date(item.return_time).toLocaleString() : '-'}</dd>
                                    </div>
                                  </dl>
                                </div>
                                <StatusBadge status={item.status} />
                              </div>
                              <div className="mt-4 flex items-center gap-2">
                                <button onClick={() => { if (!window.confirm(`Mark returned for ${item.student?.name || 'student'}?`)) return; markRet.mutate(item.id) }} className="inline-flex items-center rounded-lg bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Return</button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Desktop table (visible >= lg) */}
                        <table className="w-full text-sm hidden lg:table">
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
                                <td className="px-4 py-2 flex gap-2">
                                  <button onClick={() => { if (!window.confirm(`Mark returned for ${item.student?.name || 'student'}?`)) return; markRet.mutate(item.id) }} className="inline-flex items-center rounded-md bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Return</button>
                                </td>
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




