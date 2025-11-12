import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RoleBasedNavigation() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center gap-4">
      <Link to="/" className="text-amber-900 hover:text-amber-600 font-medium">
        Home
      </Link>
      
      {user.role === 'student' && (
        <Link 
          to="/student-dashboard" 
          className="text-amber-900 hover:text-amber-600 font-medium"
        >
          My Dashboard
        </Link>
      )}
      
      {(user.role === 'admin' || user.role === 'rector') && (
        <Link 
          to="/rector-dashboard" 
          className="text-amber-900 hover:text-amber-600 font-medium"
        >
          Rector Dashboard
        </Link>
      )}
      
      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
      </span>
    </div>
  )
}
