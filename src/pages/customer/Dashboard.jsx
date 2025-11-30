import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import * as api from '../../services/api'
import './CustomerDashboard.css'

const CustomerDashboard = () => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [customerData, setCustomerData] = useState(null)
    const [orders, setOrders] = useState([])
    const [deliveries, setDeliveries] = useState([])
    const [payments, setPayments] = useState([])
    const [error, setError] = useState('')

    useEffect(() => {
        if (user?.id) {
            loadCustomerData()
        }
    }, [user])

    const loadCustomerData = async () => {
        try {
            setLoading(true)
            setError('')

            // Fetch customer details and related data
            const [customerRes, ordersRes, deliveriesRes, paymentsRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_BASE_URL}/customers/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${api.getToken()}` }
                }),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/orders`, {
                    headers: { 'Authorization': `Bearer ${api.getToken()}` }
                }),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/deliveries`, {
                    headers: { 'Authorization': `Bearer ${api.getToken()}` }
                }),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/payments`, {
                    headers: { 'Authorization': `Bearer ${api.getToken()}` }
                })
            ])

            const customer = await customerRes.json()
            const allOrders = await ordersRes.json()
            const allDeliveries = await deliveriesRes.json()
            const allPayments = await paymentsRes.json()

            setCustomerData(customer)

            // Filter for current customer
            setOrders(allOrders.filter(o => (o.customerid || o.customerId) === user.id))
            setDeliveries(allDeliveries.filter(d => (d.customerid || d.customerId) === user.id))
            setPayments(allPayments.filter(p => (p.customerid || p.customerId) === user.id))
        } catch (err) {
            console.error('Failed to load customer data:', err)
            setError('Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="customer-dashboard">
                <div className="loading-state">Loading your dashboard...</div>
            </div>
        )
    }

    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const totalBottles = customerData?.totalbottles || customerData?.totalBottles || 0
    const monthlyConsumption = customerData?.monthlyconsumption || customerData?.monthlyConsumption || 0

    return (
        <div className="customer-dashboard">
            {/* Header */}
            <header className="customer-header">
                <div className="welcome-section">
                    <h1>Welcome, {customerData?.name}!</h1>
                    <p>Here's your water delivery overview</p>
                </div>
                <div className="year-badge">{new Date().getFullYear()}</div>
            </header>

            {error && <div className="error-banner">{error}</div>}

            {/* Overview Cards */}
            <div className="metrics-grid">
                <div className="metric-card metric-blue">
                    <div className="metric-icon">💧</div>
                    <div className="metric-content">
                        <div className="metric-value">{totalBottles}</div>
                        <div className="metric-label">Available Bottles</div>
                    </div>
                </div>

                <div className="metric-card metric-purple">
                    <div className="metric-icon">📊</div>
                    <div className="metric-content">
                        <div className="metric-value">{monthlyConsumption}</div>
                        <div className="metric-label">Monthly Consumption</div>
                    </div>
                </div>

                <div className="metric-card metric-orange">
                    <div className="metric-icon">🛒</div>
                    <div className="metric-content">
                        <div className="metric-value">{pendingOrders}</div>
                        <div className="metric-label">Pending Orders</div>
                    </div>
                </div>

                <div className="metric-card metric-green">
                    <div className="metric-icon">✅</div>
                    <div className="metric-content">
                        <div className="metric-value">{deliveries.length}</div>
                        <div className="metric-label">Total Deliveries</div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="content-grid">
                {/* Recent Orders */}
                <div className="content-card">
                    <h2 className="card-title">Recent Orders</h2>
                    <div className="orders-list">
                        {orders.slice(0, 5).map(order => (
                            <div key={order.id} className="order-item">
                                <div>
                                    <div className="order-id">Order #{order.id}</div>
                                    <div className="order-detail">{order.quantity} bottles</div>
                                </div>
                                <div>
                                    <span className={`badge badge-${order.status}`}>
                                        {order.status}
                                    </span>
                                    <div className="order-date">
                                        {new Date(order.date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && (
                            <div className="empty-message">No orders yet</div>
                        )}
                    </div>
                </div>

                {/* Recent Deliveries */}
                <div className="content-card">
                    <h2 className="card-title">Recent Deliveries</h2>
                    <div className="orders-list">
                        {deliveries.slice(0, 5).map(delivery => (
                            <div key={delivery.id} className="order-item">
                                <div>
                                    <div className="order-id">{delivery.quantity} bottles</div>
                                    <div className="order-detail">{delivery.liters}L total</div>
                                </div>
                                <div className="order-date">
                                    {new Date(delivery.date).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                        {deliveries.length === 0 && (
                            <div className="empty-message">No deliveries yet</div>
                        )}
                    </div>
                </div>

                {/* Payment History */}
                <div className="content-card full-width">
                    <h2 className="card-title">Payment History</h2>
                    <div className="table-container">
                        <table className="payments-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.slice(0, 5).map(payment => (
                                    <tr key={payment.id}>
                                        <td>#{payment.id}</td>
                                        <td>${parseFloat(payment.amount).toFixed(2)}</td>
                                        <td><span className="badge badge-success">{payment.method}</span></td>
                                        <td>{new Date(payment.date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {payments.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="empty-message">No payments recorded</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CustomerDashboard
