import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('access_token')
        const saved = localStorage.getItem('user')
        if (token && saved) {
            setUser(JSON.parse(saved))
        }
        setLoading(false)
    }, [])

    const login = async (username, password) => {
        const res = await api.post('/auth/login/', { username, password })
        localStorage.setItem('access_token', res.data.access)
        localStorage.setItem('refresh_token', res.data.refresh)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        setUser(res.data.user)
        return res.data.user
    }

    const logout = async () => {
        try {
            const refresh = localStorage.getItem('refresh_token')
            await api.post('/auth/logout/', { refresh })
        } catch { }
        localStorage.clear()
        setUser(null)
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