import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import * as api from '../../services/api'
import '../admin/Customers.css'

const CustomerDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [customer, setCustomer] = useState(null)
    const [orders, setOrders] = useState([])
    const [deliveries, setDeliveries] = useState([])
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        loadCustomerData()
    }, [id])

    const loadCustomerData = async () => {
        try {
            setLoading(true)
            setError('')

            // Fetch customer and all related data
            const [customerRes, ordersRes, deliveriesRes, paymentsRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_BASE_URL}/customers/${id}`, {
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

            const customerData = await customerRes.json()
            const allOrders = await ordersRes.json()
            const allDeliveries = await deliveriesRes.json()
            const allPayments = await paymentsRes.json()

            setCustomer(customerData)

            // Filter for this customer
            const customerId = parseInt(id)
            setOrders(allOrders.filter(o => (o.customerid || o.customerId) === customerId))
            setDeliveries(allDeliveries.filter(d => (d.customerid || d.customerId) === customerId))
            setPayments(allPayments.filter(p => (p.customerid || p.customerId) === customerId))
        } catch (err) {
            console.error('Failed to load customer data:', err)
            setError('Failed to load customer details')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout pageTitle="Customer Details">
                <div className="loading-state">Loading customer details...</div>
            </AdminLayout>
        )
    }

    if (error || !customer) {
        return (
            <AdminLayout pageTitle="Customer Details">
                <div className="error-banner">{error || 'Customer not found'}</div>
                <button className="btn-secondary" onClick={() => navigate('/admin/customers')}>
                    Back to Customers
                </button>
            </AdminLayout>
        )
    }

    const totalSpent = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
    const totalDeliveries = deliveries.length
    const pendingOrders = orders.filter(o => o.status === 'pending').length

    return (
        <AdminLayout pageTitle={`Customer: ${customer.name}`}>
            <div className="customers-container">
                <div className="page-header">
                    <button className="btn-secondary" onClick={() => navigate('/admin/customers')}>
                        ← Back to Customers
                    </button>
                </div>

                {/* Customer Info Cards */}
                <div className="metrics-grid" style={{ marginBottom: '2rem' }}>
                    <div className="metric-card metric-blue">
                        <div className="metric-icon">📦</div>
                        <div className="metric-content">
                            <div className="metric-value">{customer.totalbottles || customer.totalBottles || 0}</div>
                            <div className="metric-label">Total Bottles</div>
                        </div>
                    </div>

                    <div className="metric-card metric-purple">
                        <div className="metric-icon">📊</div>
                        <div className="metric-content">
                            <div className="metric-value">{customer.monthlyconsumption || customer.monthlyConsumption || 0}</div>
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
                        <div className="metric-icon">💰</div>
                        <div className="metric-content">
                            <div className="metric-value">PKR {totalSpent.toLocaleString()}</div>
                            <div className="metric-label">Total Spent</div>
                        </div>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="table-container" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ padding: '1rem', margin: 0, borderBottom: '1px solid #E5E7EB' }}>
                        Customer Information
                    </h3>
                    <div style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div>
                                <strong>Name:</strong> {customer.name}
                            </div>
                            <div>
                                <strong>Phone:</strong> {customer.phone}
                            </div>
                            <div>
                                <strong>Email:</strong> {customer.email || 'N/A'}
                            </div>
                            <div>
                                <strong>City:</strong> {customer.city || 'N/A'}
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <strong>Address:</strong> {customer.address || 'N/A'}
                            </div>
                            <div>
                                <strong>Join Date:</strong> {customer.joindate || customer.joinDate
                                    ? new Date(customer.joindate || customer.joinDate).toLocaleDateString()
                                    : 'N/A'}
                            </div>
                            <div>
                                <strong>Payment Status:</strong>{' '}
                                <span className={`badge ${(customer.ispaid || customer.isPaid) ? 'badge-success' : 'badge-danger'}`}>
                                    {(customer.ispaid || customer.isPaid) ? 'Paid' : 'Unpaid'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders */}
                <div className="table-container" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ padding: '1rem', margin: 0, borderBottom: '1px solid #E5E7EB' }}>
                        Orders ({orders.length})
                    </h3>
                    <table className="customers-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Quantity</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>{order.quantity} bottles</td>
                                    <td>{new Date(order.date).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge badge-${order.status}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="empty-state">No orders</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Deliveries */}
                <div className="table-container" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ padding: '1rem', margin: 0, borderBottom: '1px solid #E5E7EB' }}>
                        Deliveries ({deliveries.length})
                    </h3>
                    <table className="customers-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Quantity</th>
                                <th>Liters</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveries.map(delivery => (
                                <tr key={delivery.id}>
                                    <td>#{delivery.id}</td>
                                    <td>{delivery.quantity} bottles</td>
                                    <td>{delivery.liters}L</td>
                                    <td>{new Date(delivery.date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {deliveries.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="empty-state">No deliveries</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Payments */}
                <div className="table-container">
                    <h3 style={{ padding: '1rem', margin: 0, borderBottom: '1px solid #E5E7EB' }}>
                        Payments ({payments.length})
                    </h3>
                    <table className="customers-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(payment => (
                                <tr key={payment.id}>
                                    <td>#{payment.id}</td>
                                    <td>PKR {parseFloat(payment.amount).toLocaleString()}</td>
                                    <td><span className="badge badge-success">{payment.method}</span></td>
                                    <td>{new Date(payment.date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="empty-state">No payments</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    )
}

export default CustomerDetail
