import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    FiHome,
    FiUsers,
    FiShoppingCart,
    FiTruck,
    FiDollarSign,
    FiLogOut
} from 'react-icons/fi'
import { MdPerson } from 'react-icons/md'
import './Sidebar.css'

const Sidebar = ({ collapsed, mobileOpen }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const menuItems = [
        { path: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/admin/customers', icon: FiUsers, label: 'Customers' },
        { path: '/admin/orders', icon: FiShoppingCart, label: 'Orders' },
        { path: '/admin/deliveries', icon: FiTruck, label: 'Deliveries' },
        { path: '/admin/payments', icon: FiDollarSign, label: 'Payments' },
    ]

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
            {/* User Profile Section */}
            <div className="sidebar-profile">
                <div className="profile-avatar">
                    <MdPerson size={40} />
                </div>
                {!collapsed && (
                    <div className="profile-info">
                        <h3>{user?.username || 'Admin'}</h3>
                        <p className="profile-role">Administrator</p>
                    </div>
                )}
            </div>

            {/* Navigation Menu */}
            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            title={collapsed ? item.label : ''}
                        >
                            <Icon className="nav-icon" size={20} />
                            {!collapsed && <span className="nav-label">{item.label}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="sidebar-bottom">
                <button
                    onClick={handleLogout}
                    className="nav-item logout-btn"
                    title={collapsed ? 'Logout' : ''}
                >
                    <FiLogOut className="nav-icon" size={20} />
                    {!collapsed && <span className="nav-label">Logout</span>}
                </button>
            </div>
        </div>
    )
}

export default Sidebar
