import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { signup } from '../lib/api'
import { useAuth } from '../context/AuthContext.jsx'

export default function Signup() {
  const navigate = useNavigate()
  const { setToken, setUser } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [room, setRoom] = useState('A-101')
  const [hostel, setHostel] = useState('H1')

  const mut = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      // Do NOT auto-login after signup; require user to login
      setToken(null)
      setUser(null)
      toast.success('Account created. Please log in.')
      navigate('/login', { replace: true })
    },
    onError: async (err) => {
      const msg = err?.response?.data?.error || 'signup_failed'
      toast.error(msg)
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl mx-auto">
        <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl shadow-2xl shadow-amber-500/10 p-6 sm:p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-xl" />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Create your account</h1>
          </div>
          <form className="space-y-4 sm:space-y-5" onSubmit={(e) => { e.preventDefault(); mut.mutate({ name, email, password, role, room_no: room, hostel_no: hostel }) }}>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              <label className="text-sm sm:text-base block">
                <span className="text-amber-900 font-medium">Name</span>
                <input 
                  value={name} 
                  onChange={(e)=>setName(e.target.value)} 
                  required 
                  className="mt-1 w-full rounded-lg border border-amber-200 bg-white/80 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" 
                  placeholder="Enter your name"
                />
              </label>
              <label className="text-sm sm:text-base block">
                <span className="text-amber-900 font-medium">Email</span>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e)=>setEmail(e.target.value)} 
                  required 
                  className="mt-1 w-full rounded-lg border border-amber-200 bg-white/80 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" 
                  placeholder="Enter your email"
                />
              </label>
              <label className="text-sm sm:text-base block">
                <span className="text-amber-900 font-medium">Password</span>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e)=>setPassword(e.target.value)} 
                  required 
                  className="mt-1 w-full rounded-lg border border-amber-200 bg-white/80 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" 
                  placeholder="Create a password"
                />
              </label>
              <label className="text-sm sm:text-base block">
                <span className="text-amber-900 font-medium">Role</span>
                <select 
                  value={role} 
                  onChange={(e)=>setRole(e.target.value)} 
                  className="mt-1 w-full rounded-lg border border-amber-200 bg-white/80 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin (Rector)</option>
                </select>
              </label>
              <label className="text-sm sm:text-base block">
                <span className="text-amber-900 font-medium">Room No</span>
                <input 
                  value={room} 
                  onChange={(e)=>setRoom(e.target.value)} 
                  required 
                  className="mt-1 w-full rounded-lg border border-amber-200 bg-white/80 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" 
                  placeholder="e.g., A-101"
                />
              </label>
              <label className="text-sm sm:text-base block">
                <span className="text-amber-900 font-medium">Hostel No</span>
                <input 
                  value={hostel} 
                  onChange={(e)=>setHostel(e.target.value)} 
                  required 
                  className="mt-1 w-full rounded-lg border border-amber-200 bg-white/80 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" 
                  placeholder="e.g., H1"
                />
              </label>
            </div>
            <button 
              disabled={mut.isPending} 
              className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-sm sm:text-base font-bold px-4 py-3 sm:px-6 sm:py-4 hover:shadow-amber-500/40 hover:shadow-xl transition-all disabled:opacity-70 min-h-[44px] sm:min-h-[48px]"
            >
              {mut.isPending ? 'Creating...' : 'Create account'}
            </button>
            <p className="text-sm sm:text-base text-amber-900/70 text-center">Already have an account? <Link to="/login" className="text-amber-700 font-medium hover:underline transition-colors">Login</Link></p>
          </form>
        </div>
      </div>
    </div>
  )
}
