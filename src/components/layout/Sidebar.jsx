import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    MdDashboard,
    MdInventory,
    MdShoppingCart,
    MdLocalShipping,
    MdBarChart,
    MdHelp,
    MdSettings,
    MdLogout,
    MdPerson
} from 'react-icons/md'
import './Sidebar.css'

const Sidebar = ({ collapsed, mobileOpen }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const menuItems = [
        { path: '/admin/dashboard', icon: MdDashboard, label: 'Dashboard' },
        { path: '/admin/customers', icon: MdInventory, label: 'Inventory' },
        { path: '/admin/orders', icon: MdShoppingCart, label: 'Orders' },
        { path: '/admin/deliveries', icon: MdLocalShipping, label: 'Purchase' },
        { path: '/admin/payments', icon: MdBarChart, label: 'Reporting' },
        { path: '/admin/support', icon: MdHelp, label: 'Support' },
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
                        <h3>{user?.username || 'Nirmal Kumar P'}</h3>
                        <p className="profile-role">UIUXDesigner</p>
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

            {/* Settings & Logout */}
            <div className="sidebar-bottom">
                <Link
                    to="/admin/settings"
                    className={`nav-item ${location.pathname === '/admin/settings' ? 'active' : ''}`}
                    title={collapsed ? 'Settings' : ''}
                >
                    <MdSettings className="nav-icon" size={20} />
                    {!collapsed && <span className="nav-label">Settings</span>}
                </Link>

                <button
                    onClick={handleLogout}
                    className="nav-item logout-btn"
                    title={collapsed ? 'Logout' : ''}
                >
                    <MdLogout className="nav-icon" size={20} />
                    {!collapsed && <span className="nav-label">Logout</span>}
                </button>
            </div>
        </div>
    )
}

export default Sidebar
