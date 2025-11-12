import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { resetPassword } from '../lib/api'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const [email, setEmail] = useState(params.get('email') || '')
  const [token, setToken] = useState(params.get('token') || '')
  const [newPassword, setNewPassword] = useState('')
  const mut = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => { toast.success('Password reset successful. Please login.'); navigate('/login') },
    onError: (e) => { const msg = e?.response?.data?.error || 'Reset failed'; toast.error(msg) }
  })
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl shadow-2xl shadow-amber-500/10 p-6 sm:p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-xl" />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Reset Password</h1>
          </div>
          <form className="space-y-4 sm:space-y-5" onSubmit={(e)=>{ e.preventDefault(); mut.mutate({ email, token, newPassword }) }}>
            <label className="text-sm sm:text-base block">
              <span className="text-amber-900 font-medium">Email Address</span>
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
              <span className="text-amber-900 font-medium">Reset Token</span>
              <input 
                value={token} 
                onChange={(e)=>setToken(e.target.value)} 
                required 
                className="mt-1 w-full rounded-lg border border-amber-200 bg-white/80 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" 
                placeholder="Enter reset token"
              />
            </label>
            <label className="text-sm sm:text-base block">
              <span className="text-amber-900 font-medium">New Password</span>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e)=>setNewPassword(e.target.value)} 
                required 
                className="mt-1 w-full rounded-lg border border-amber-200 bg-white/80 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" 
                placeholder="Create new password"
              />
            </label>
            <button 
              disabled={mut.isPending} 
              className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-sm sm:text-base font-bold px-4 py-3 sm:px-6 sm:py-4 disabled:opacity-70 hover:shadow-amber-500/40 hover:shadow-xl transition-all min-h-[44px] sm:min-h-[48px]"
            >
              {mut.isPending ? 'Resetting...' : 'Reset password'}
            </button>
            <p className="text-sm sm:text-base text-amber-900/70 text-center">Need a token? <Link to="/forgot-password" className="text-amber-700 font-medium hover:underline transition-colors">Forgot password</Link></p>
          </form>
        </div>
      </div>
    </div>
  )
}
