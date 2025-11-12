import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { login } from '../lib/api'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setToken, setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const mut = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setToken(data.token)
      setUser(data.user)
      toast.success('Logged in')
      const dest = data.user.role === 'admin' ? '/rector' : '/student'
      const from = location.state?.from?.pathname
      navigate(from || dest, { replace: true })
    },
    onError: () => toast.error('Invalid credentials'),
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl shadow-2xl shadow-amber-500/10 p-6 sm:p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-xl" />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Sign in to LeavePass</h1>
          </div>
          <form className="space-y-4 sm:space-y-5" onSubmit={(e) => { e.preventDefault(); mut.mutate({ email, password }) }}>
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
                placeholder="Enter your password"
              />
            </label>
            <button 
              disabled={mut.isPending} 
              className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-sm sm:text-base font-bold px-4 py-3 sm:px-6 sm:py-4 hover:shadow-amber-500/40 hover:shadow-xl transition-all disabled:opacity-70 min-h-[44px] sm:min-h-[48px]"
            >
              {mut.isPending ? 'Signing in...' : 'Login'}
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm sm:text-base gap-2 sm:gap-0">
              {/* <Link to="/forgot-password" className="text-amber-700 font-medium hover:underline">Forgot password?</Link> */}
              <span className="text-amber-900/70">No account? <Link to="/signup" className="text-amber-700 font-medium hover:underline transition-colors">Signup</Link></span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
