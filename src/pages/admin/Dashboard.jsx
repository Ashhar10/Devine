import { useEffect, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import ChartCard from '../../components/charts/ChartCard'
import PieChartComponent from '../../components/charts/PieChartComponent'
import LineChartComponent from '../../components/charts/LineChartComponent'
import BarChartComponent from '../../components/charts/BarChartComponent'
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

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stats`, {
                headers: { 'Authorization': `Bearer ${api.getToken()}` }
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

                {/* Charts Grid */}
                <div className="charts-grid">
                    <ChartCard title="Inventory Status">
                        <PieChartComponent
                            data={[stats.totalStock, stats.outOfStock, stats.totalOrders]}
                            labels={['In Stock', 'Out of Stock', 'Pending Orders']}
                        />
                    </ChartCard>

                    <ChartCard title="Customer Overview">
                        <PieChartComponent
                            data={[stats.totalCustomers - stats.outOfStock, stats.outOfStock]}
                            labels={['Active Customers', 'Needs Restock']}
                        />
                    </ChartCard>

                    <ChartCard title="Expense vs Revenue" wide>
                        <LineChartComponent />
                    </ChartCard>

                    <ChartCard title="Top 5 Customers by Bottles">
                        <BarChartComponent />
                    </ChartCard>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminDashboard
