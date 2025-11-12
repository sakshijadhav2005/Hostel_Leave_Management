import { Link, NavLink, Route, Routes, useNavigate, Navigate, useLocation } from 'react-router-dom'
import Shell from './layouts/Shell'
import StudentDashboard from './pages/StudentDashboard'
import RectorDashboard from './pages/RectorDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { useAuth } from './context/AuthContext.jsx'
import Home from './pages/Home'
import ChatbotWidget from './components/ChatbotWidget'
// import ForgotPassword from './pages/ForgotPassword'
// import ResetPassword from './pages/ResetPassword'
// import ChangePassword from './pages/ChangePassword'

function App() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Render landing page outside Shell for full-bleed styling
  if (location.pathname === '/') {
    return (<>
      <Home />
      <ChatbotWidget />
    </>)
  }
  // Render auth pages outside Shell for full-bleed styling
  if (location.pathname === '/login') {
    return (<>
      <Login />
      <ChatbotWidget />
    </>)
  }
  if (location.pathname === '/signup') {
    return (<>
      <Signup />
      <ChatbotWidget />
    </>)
  }
  if (location.pathname === '/forgot-password') {
    return (<>
      <ForgotPassword />
      <ChatbotWidget />
    </>)
  }
  if (location.pathname === '/reset-password') {
    return (<>
      <ResetPassword />
      <ChatbotWidget />
    </>)
  }
  if (location.pathname === '/change-password') {
    return (<>
      <ChangePassword />
      <ChatbotWidget />
    </>)
  }
  if (location.pathname === '/student') {
    return (
      <ProtectedRoute roles={["student"]}>
        <StudentDashboard />
      </ProtectedRoute>
    )
  }
  if (location.pathname === '/rector') {
    return (
      <ProtectedRoute roles={["admin"]}>
        <RectorDashboard />
      </ProtectedRoute>
    )
  }
  return (
    <Shell
      header={
        <div className="flex items-center gap-4">
          <Link to="/" className="font-semibold tracking-tight">Hostel Leave</Link>
          <nav className="hidden sm:flex gap-3 text-sm">
            {user?.role === 'student' && (
              <NavLink to="/student" className={({isActive}) => isActive ? 'text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'}>Student</NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/rector" className={({isActive}) => isActive ? 'text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'}>Rector</NavLink>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {!user ? (
              <>
                <NavLink to="/login" className={({isActive}) => isActive ? 'text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'}>Login</NavLink>
                <NavLink to="/signup" className={({isActive}) => isActive ? 'text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'}>Signup</NavLink>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-600">{user.name} • {user.role}</span>
                <button onClick={() => { logout(); navigate('/login') }} className="text-sm text-gray-600 hover:text-gray-900">Logout</button>
              </>
            )}
          </div>
        </div>
      }
      secondary={
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-white shadow-sm">
            <h3 className="text-sm font-semibold mb-2">Tips</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Use Student to apply for Long/Short leave.</li>
              <li>Rector can approve or mark returns.</li>
            </ul>
          </div>
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ProtectedRoute roles={["student","admin"]}><ChangePassword /></ProtectedRoute>} /> */}
        <Route path="/student" element={<ProtectedRoute roles={["student"]}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/rector" element={<ProtectedRoute roles={["admin"]}><RectorDashboard /></ProtectedRoute>} />
      </Routes>
      <ChatbotWidget />
    </Shell>
  )
}

export default App
