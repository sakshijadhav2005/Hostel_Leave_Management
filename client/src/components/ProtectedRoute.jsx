import PropTypes from 'prop-types'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (roles && roles.length && !roles.includes(user.role)) {
    // Redirect to own role home
    return <Navigate to={user.role === 'admin' ? '/rector' : '/student'} replace />
  }
  return children
}

ProtectedRoute.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node,
}
