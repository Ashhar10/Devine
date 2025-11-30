import { useEffect, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { fetchAllData } from '../../services/api'
import * as api from '../../services/api'
import './Dashboard.css'

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalCustomers: 0,
        totalOrders: 0,
        totalStock: 0,
        outOfStock: 0
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            setLoading(true)
            setError('')

            // Fetch stats from backend
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stats`, {
                headers: {
                    'Authorization': `Bearer ${api.getToken()}`
                }
            })

            if (!response.ok) throw new Error('Failed to fetch stats')

            const data = await response.json()
            setStats({
                totalCustomers: data.totalCustomers || 0,
                totalOrders: data.totalOrders || 0,
                totalStock: data.totalStock || 0,
                outOfStock: data.outOfStock || 0
            })
        } catch (err) {
            console.error('Failed to load stats:', err)
            setError('Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout pageTitle="Inventory Management">
                <div className="dashboard-container">
                    <div className="loading-state">Loading dashboard...</div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout pageTitle="Inventory Management">
            <div className="dashboard-container">
                {error && <div className="error-banner">{error}</div>}

                {/* Metric Cards Row */}
                <div className="metrics-grid">
                    <div className="metric-card metric-green">
                        <div className="metric-icon">📦</div>
                        <div className="metric-content">
                            <div className="metric-value">{stats.totalCustomers}</div>
                            <div className="metric-label">Total Customers</div>
                        </div>
                    </div>

                    <div className="metric-card metric-blue">
                        <div className="metric-icon">🛒</div>
                        <div className="metric-content">
                            <div className="metric-value">{stats.totalOrders}</div>
                            <div className="metric-label">Orders</div>
                        </div>
                    </div>

                    <div className="metric-card metric-purple">
                        <div className="metric-icon">📊</div>
                        <div className="metric-content">
                            <div className="metric-value">{stats.totalStock}</div>
                            <div className="metric-label">Total Stock (Bottles)</div>
                        </div>
                    </div>

                    <div className="metric-card metric-orange">
                        <div className="metric-icon">⚠️</div>
                        <div className="metric-content">
                            <div className="metric-value">{stats.outOfStock}</div>
                            <div className="metric-label">Out of Stock</div>
                        </div>
                    </div>
                </div>

                {/* Charts Grid - To be implemented in Phase 5 */}
                <div className="charts-grid">
                    <div className="chart-card">
                        <h3 className="chart-title">Overview</h3>
                        <p className="chart-placeholder">Charts coming in Phase 5</p>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-title">Inventory Values</h3>
                        <p className="chart-placeholder">Pie Chart</p>
                    </div>

                    <div className="chart-card chart-wide">
                        <h3 className="chart-title">Expense vs Profit</h3>
                        <p className="chart-placeholder">Line Chart</p>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-title">Top 10 Customers by Consumption</h3>
                        <p className="chart-placeholder">Bar Chart</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminDashboard
