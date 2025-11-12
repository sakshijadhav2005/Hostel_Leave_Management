import { useEffect, useMemo, useRef, useState } from 'react'
import { MessageCircle, MessagesSquare, Send, X, Mic, MicOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ChatbotWidget() {
  const { user } = useAuth() || {}
  const role = user?.role || 'guest'
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [listening, setListening] = useState(false)
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('rb_chat_' + role)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const bottomRef = useRef(null)
  const recognitionRef = useRef(null)

  const CONFIG = useMemo(() => ({
    HOSTEL_FEES: 46000,
    STUDENTS_PER_ROOM: 3,
    HOSTELS: ['H1','H2','H3','H4','H5'],
  }), [])

  const quickReplies = useMemo(() => {
    const base = [
      { k: 'fees', t: 'Hostel fees' },
      { k: 'capacity', t: 'Students per room' },
      { k: 'hostels', t: 'Number of hostels' },
      { k: 'timing', t: 'Hostel timing' },
    ]
    if (role === 'student') {
      base.push(
        { k: 'window', t: 'Submission window' },
        { k: 'submit_short', t: 'How to submit short leave' },
        { k: 'submit_long', t: 'How to submit long leave' },
        { k: 'submit_complaint', t: 'How to submit complaint' },
        { k: 'steps_short', t: 'Steps to fill short leave form' },
        { k: 'steps_long', t: 'Steps to fill long leave form' },
        { k: 'steps_complaint', t: 'Steps to fill complaint form' },
      )
    } else if (role === 'admin' || role === 'rector') {
      base.push(
        { k: 'mark_returned', t: 'Mark short leave returned' },
        { k: 'approve_reject', t: 'Approve/Reject long leave' },
        { k: 'filters', t: 'Filter by date/hostel' },
        { k: 'pdf', t: 'Download/Share PDF' },
      )
    }
    return base
  }, [role])

  useEffect(() => {
    try { sessionStorage.setItem('rb_chat_' + role, JSON.stringify(messages)) } catch {}
  }, [messages, role])

  useEffect(() => {
    if (open && bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [open, messages])

  // Init SpeechRecognition lazily when opening widget
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    if (!recognitionRef.current) {
      const rec = new SR()
      rec.lang = 'en-IN'
      rec.interimResults = true
      rec.continuous = false
      rec.onresult = (e) => {
        let finalTranscript = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const chunk = e.results[i]
          if (chunk.isFinal) finalTranscript += chunk[0].transcript
        }
        if (finalTranscript.trim()) {
          setInput(finalTranscript.trim())
          // Auto-send when final result is ready
          setTimeout(() => handleSend(), 20)
        }
      }
      rec.onerror = () => {
        setListening(false)
      }
      rec.onend = () => {
        setListening(false)
      }
      recognitionRef.current = rec
    }
    return () => {
      try { recognitionRef.current && recognitionRef.current.abort() } catch {}
      setListening(false)
    }
  }, [open])

  function addMessage(sender, text) {
    setMessages(m => [...m, { sender, text, ts: Date.now() }])
  }

  function speak(text) {
    try {
      if (!('speechSynthesis' in window)) return
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = 'en-IN'
      utter.rate = 1
      utter.pitch = 1
      window.speechSynthesis.speak(utter)
    } catch {}
  }

  function stopSpeaking() {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    } catch {}
  }

  function handleClose() {
    stopSpeaking()
    setOpen(false)
  }

  function startListening() {
    const rec = recognitionRef.current
    if (!rec) return
    try {
      // Stop any current speech so mic can capture cleanly
      if (window.speechSynthesis) window.speechSynthesis.cancel()
      rec.start()
      setListening(true)
    } catch {
      setListening(false)
    }
  }

  function stopListening() {
    const rec = recognitionRef.current
    if (!rec) return
    try { rec.stop() } catch {}
    setListening(false)
  }

  function replyFor(key, normalizedText) {
    // Friendly greetings
    if (
      key === 'greet' ||
      normalizedText === 'hi' || normalizedText === 'hii' || normalizedText === 'hiii' ||
      normalizedText === 'hello' || normalizedText === 'hey' ||
      normalizedText.includes('hi ') || normalizedText.includes(' hello') || normalizedText.includes('hey') ||
      normalizedText.includes('namaste') || normalizedText.includes('good morning') || normalizedText.includes('good evening') || normalizedText.includes('good afternoon')
    ) {
      return 'Hello! How can I help you today? Have a great day!'
    }
    if (key === 'fees' || normalizedText.includes('fee')) {
      return `The hostel fees are Rs. ${CONFIG.HOSTEL_FEES} per year.`
    }
    if (key === 'capacity' || normalizedText.includes('room') || normalizedText.includes('students per room')) {
      return `There are ${CONFIG.STUDENTS_PER_ROOM} students per room.`
    }
    if (key === 'hostels' || normalizedText.includes('hostel')) {
      return `Available hostels: ${CONFIG.HOSTELS.join(', ')} (total ${CONFIG.HOSTELS.length}).`
    }
    if (key === 'timing' || normalizedText.includes('timing') || normalizedText.includes('hours') || normalizedText.includes('open') || normalizedText.includes('close')) {
      return 'Hostel operating hours are from 6:00 AM to 9:00 PM daily. All hostel services including leave applications, entry/exit, and administrative work are available during these hours.'
    }
    if (role === 'student') {
      if (key === 'window' || normalizedText.includes('submission window') || normalizedText.includes('submit time')) {
        return 'Students can submit short/long leave applications between 6:00 AM and 9:00 PM.'
      }
      // More specific form steps should come first to avoid conflicts
      if (key === 'steps_short' || normalizedText.includes('steps to fill short leave') || normalizedText.includes('how to fill short leave form') || normalizedText.includes('steps short leave') || normalizedText.includes('short leave steps') || normalizedText.includes('short leave form steps')) {
        return 'Steps to fill Short Leave Form:\n1. Click "Short Leave" button on Student Dashboard\n2. Your Name, Room No, and Hostel No will be auto-filled\n3. Current Date & Time will be shown automatically\n4. Enter your reason for going out (e.g., "Market run", "Medical appointment")\n5. Click "Submit" button\n6. Your leave status will be "Out" until you return\n\nNote: You can only submit between 6:00 AM - 9:00 PM'
      }
      if (key === 'steps_long' || normalizedText.includes('steps to fill long leave') || normalizedText.includes('how to fill long leave form') || normalizedText.includes('steps long leave') || normalizedText.includes('long leave steps') || normalizedText.includes('long leave form steps')) {
        return 'Steps to fill Long Leave Form:\n1. Click "Long Leave" button on Student Dashboard\n2. Your Name, Room No, and Hostel No will be auto-filled\n3. Fill in the Reason for your long leave\n4. Select From Date (when you want to start leave)\n5. Select To Date (when you plan to return)\n6. Enter Emergency Contact (10-digit phone number)\n7. Fill Address During Leave (where you will stay)\n8. Click "Submit" button\n9. Wait for approval from hostel authorities\n\nNote: You can only submit between 6:00 AM - 9:00 PM'
      }
      if (key === 'steps_complaint' || normalizedText.includes('steps to fill complaint') || normalizedText.includes('how to fill complaint form') || normalizedText.includes('steps complaint') || normalizedText.includes('complaint steps') || normalizedText.includes('complaint form steps')) {
        return 'Steps to fill Complaint Form:\n1. Click "Complaint" button on Student Dashboard\n2. Verify your Name (can be edited if needed)\n3. Verify your Room No (can be edited if needed)\n4. Verify your Hostel No (can be edited if needed)\n5. Write your Problem/Query in detail in the text area\n6. Current Date & Time will be shown automatically\n7. Click "Submit Complaint" button\n8. Wait for response from hostel authorities\n\nNote: Describe your problem clearly for faster resolution'
      }
      // General submission instructions come after specific steps
      if (key === 'submit_short' || normalizedText.includes('short leave')) {
        return 'Go to Student Dashboard → Short Leave → fill reason and submit and wait for approval.'
      }
      if (key === 'submit_long' || normalizedText.includes('long leave')) {
        return 'Go to Student Dashboard → Long Leave → fill reason, dates, contacts, address and submit and wait for approval.'
      }
      if (key === 'submit_complaint' || normalizedText.includes('complaint') || normalizedText.includes('problem')) {
        return 'Go to Student Dashboard → Complaint → fill your details and problem description, then submit and wait for response.'
      }
    }
    if (role === 'rector' || role === 'admin') {
      if (key === 'mark_returned' || normalizedText.includes('returned')) {
        return 'Open Rector Dashboard → Short Leaves → Out tab → click Mark Returned.'
      }
      if (key === 'approve_reject' || normalizedText.includes('approve') || normalizedText.includes('reject')) {
        return 'Open Rector Dashboard → Long Leaves → click Approve or Reject on a row.'
      }
      if (key === 'filters' || normalizedText.includes('filter')) {
        return 'Use the date picker and hostel dropdown at the top to filter data and counts.'
      }
      if (key === 'pdf' || normalizedText.includes('pdf')) {
        return 'Use Download Short/Long/All PDF buttons; Share uses Web Share API with fallbacks.'
      }
    }
    return 'I apologize, but I am only designed to help with hostel-related questions. I can assist you with hostel fees, room capacity, leave applications, and other hostel management topics. Please ask me something related to hostel services. 😊'
  }

  function handleSend(customKey) {
    const text = customKey ? customKey : input.trim()
    if (!text) return
    addMessage('you', text)
    const norm = text.toLowerCase()
    let key = customKey ? customKey : ''
    const ans = replyFor(key, norm)
    setTimeout(() => {
      addMessage('bot', ans)
      speak(ans)
    }, 50)
    setInput('')
  }

  return (
    <>
      <div className={`fixed z-[9999] right-5 bottom-5 ${open ? 'hidden' : ''}`}>
        <button onClick={() => setOpen(true)} className="w-12 h-12 rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/30 flex items-center justify-center">
          <MessagesSquare className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {open && (
        <div className="fixed z-[9999] right-5 bottom-5 w-80 sm:w-96 bg-white/90 backdrop-blur-xl border border-amber-200 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
            <div className="font-semibold">Have a question?</div>
            <button onClick={handleClose} className="p-1 rounded hover:bg-white/20">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-3 py-2 text-sm text-amber-900/80">Choose a quick question to get started.</div>
          <div className="px-3 pb-2 flex flex-wrap gap-2">
            {quickReplies.map(q => (
              <button key={q.k} onClick={() => handleSend(q.k)} className="text-xs px-3 py-1 rounded-full border border-amber-300 text-amber-800 hover:bg-amber-50">
                {q.t}
              </button>
            ))}
          </div>
          <div className="h-64 overflow-y-auto px-3 pb-2">
            {messages.map((m, idx) => (
              <div key={idx} className={`my-2 flex ${m.sender==='you' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${m.sender==='you' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-900'} max-w-[85%] px-3 py-2 rounded-xl`}>{m.text}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="flex items-center gap-2 p-3 border-t border-amber-200 bg-white/70">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key==='Enter') handleSend() }} placeholder="Type a message or use mic" className="flex-1 border border-amber-300 rounded-xl px-3 py-2 text-sm outline-none" />
            { (window.SpeechRecognition || window.webkitSpeechRecognition) ? (
              <button onClick={() => listening ? stopListening() : startListening()} className={`p-2 rounded-xl ${listening ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'} border border-amber-300`} title={listening ? 'Stop listening' : 'Start voice input'}>
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            ) : null }
            <button onClick={() => handleSend()} className="p-2 rounded-xl bg-amber-600 text-white">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
