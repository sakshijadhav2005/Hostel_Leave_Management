import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { forgotPassword } from '../lib/api'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
 

export default function ForgotPassword() {
  const location = useLocation()
  const initialEmail = (location.state && location.state.email) || ''
  const [email, setEmail] = useState(initialEmail)
  const mut = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      toast.success('If this email exists, a reset link/token has been sent.')
      if (data?.token) {
        toast.info(`Dev token: ${data.token}`)
        try { navigator.clipboard && navigator.clipboard.writeText(data.token) } catch {}
      }
    },
    onError: () => toast.error('Failed to request reset'),
  })
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl shadow-2xl shadow-amber-500/10 p-6 sm:p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-xl" />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Forgot Password</h1>
          </div>
          <form className="space-y-4 sm:space-y-5" onSubmit={(e)=>{ e.preventDefault(); mut.mutate({ email }) }}>
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
            <button 
              disabled={mut.isPending} 
              className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-sm sm:text-base font-bold px-4 py-3 sm:px-6 sm:py-4 disabled:opacity-70 hover:shadow-amber-500/40 hover:shadow-xl transition-all min-h-[44px] sm:min-h-[48px]"
            >
              {mut.isPending ? 'Sending...' : 'Send reset link'}
            </button>
            <p className="text-sm sm:text-base text-amber-900/70 text-center">Remembered password? <Link to="/login" className="text-amber-700 font-medium hover:underline transition-colors">Login</Link></p>
          </form>
        </div>
      </div>
    </div>
  )
}
