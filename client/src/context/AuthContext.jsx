import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch (_) {
      localStorage.removeItem('user')
      return null
    }
  })

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  const value = useMemo(() => ({ token, setToken, user, setUser, logout: () => { setToken(null); setUser(null) } }), [token, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = { children: PropTypes.node }

export function useAuth() { return useContext(AuthContext) }
