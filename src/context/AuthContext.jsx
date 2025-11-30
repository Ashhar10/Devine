import { createContext, useContext, useState, useEffect } from 'react'
import * as api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [role, setRole] = useState(null)
    const [loading, setLoading] = useState(true)

    // Check session on mount
    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const session = await api.checkSession()
            if (session) {
                setUser(session.user)
                setRole(session.role)
            }
        } catch (error) {
            console.error('Auth check failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const loginAdmin = async (username, password) => {
        const userData = await api.loginAdmin(username, password)
        setUser(userData)
        setRole('admin')
        return userData
    }

    const loginCustomer = async (phone, password) => {
        const userData = await api.loginCustomer(phone, password)
        setUser(userData)
        setRole('customer')
        return userData
    }

    const logout = () => {
        api.clearToken()
        setUser(null)
        setRole(null)
    }

    const value = {
        user,
        role,
        loading,
        isAuthenticated: !!user,
        isAdmin: role === 'admin',
        isCustomer: role === 'customer',
        loginAdmin,
        loginCustomer,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
