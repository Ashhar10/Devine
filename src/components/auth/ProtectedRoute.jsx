import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ requiredRole }) => {
    const { user, role, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loader-content">
                    <div className="water-drop"></div>
                    <p style={{ color: 'var(--color-primary)', marginTop: '1rem' }}>Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (requiredRole && role !== requiredRole) {
        // Redirect to correct dashboard based on role
        return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/customer/dashboard'} replace />
    }

    return <Outlet />
}

export default ProtectedRoute
