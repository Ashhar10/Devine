import { useState } from 'react'
import { MdMenu, MdClose } from 'react-icons/md'
import Sidebar from './Sidebar'
import './AdminLayout.css'

const AdminLayout = ({ children, pageTitle }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

    return (
        <div className="admin-layout">
            <Sidebar collapsed={sidebarCollapsed} mobileOpen={mobileSidebarOpen} />

            {/* Mobile Overlay */}
            {mobileSidebarOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            <div className={`admin-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                {/* Top Header */}
                <header className="admin-header">
                    <button
                        className="menu-toggle-btn"
                        onClick={() => {
                            if (window.innerWidth <= 1024) {
                                setMobileSidebarOpen(!mobileSidebarOpen)
                            } else {
                                setSidebarCollapsed(!sidebarCollapsed)
                            }
                        }}
                    >
                        {mobileSidebarOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
                    </button>

                    <h1 className="page-title">{pageTitle || 'Dashboard'}</h1>

                    <div className="header-actions">
                        <span className="current-year">{new Date().getFullYear()}</span>
                    </div>
                </header>

                {/* Main Content */}
                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
