import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

// use a plain axios instance for auth checks — bypasses interceptors
const authApi = axios.create({
  baseURL:         '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // use plain axios — not the interceptor version
    // so a 401 here does NOT trigger a refresh loop
    authApi.get('/auth/me/')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))   // silently set null — no retry
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    const res = await authApi.post('/auth/login/', { username, password })
    setUser(res.data.user)
    return res.data.user
  }

  const logout = async () => {
    try {
      await authApi.post('/auth/logout/', {})
    } catch {}
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}