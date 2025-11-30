import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import * as api from '../../services/api'
import '../admin/Customers.css'
import './Orders.css'

const Orders = () => {
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [showAddModal, setShowAddModal] = useState(false)
    const [formData, setFormData] = useState({
        customerId: '',
        quantity: 1
    })
    const [customers, setCustomers] = useState([])

    useEffect(() => {
        loadOrders()
        loadCustomers()
    }, [])

    useEffect(() => {
        const filtered = statusFilter === 'all'
            ? orders
            : orders.filter(order => order.status === statusFilter)
        setFilteredOrders(filtered)
    }, [statusFilter, orders])

    const loadOrders = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders`, {
                headers: { 'Authorization': `Bearer ${api.getToken()}` }
            })
            if (!response.ok) throw new Error('Failed to fetch orders')
            const data = await response.json()
            setOrders(data)
            setFilteredOrders(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const loadCustomers = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/customers`, {
                headers: { 'Authorization': `Bearer ${api.getToken()}` }
            })
            if (!response.ok) throw new Error('Failed to fetch customers')
            const data = await response.json()
            setCustomers(data)
        } catch (err) {
            console.error('Failed to load customers:', err)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await api.placeOrder(parseInt(formData.customerId), parseInt(formData.quantity))
            setShowAddModal(false)
            setFormData({ customerId: '', quantity: 1 })
            loadOrders()
        } catch (err) {
            setError(err.message)
        }
    }

    const handleMarkDelivered = async (orderId) => {
        try {
            await api.markOrderDelivered(orderId)
            loadOrders()
        } catch (err) {
            setError(err.message)
        }
    }

    const getCustomerName = (customerId) => {
        const customer = customers.find(c => c.id === customerId || c.id === parseInt(customerId))
        return customer ? customer.name : `Customer #${customerId}`
    }

    return (
        <AdminLayout pageTitle="Orders Management">
            <div className="customers-container">
                {error && <div className="error-banner">{error}</div>}

                {/* Header Actions */}
                <div className="page-header">
                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('all')}
                        >
                            All ({orders.length})
                        </button>
                        <button
                            className={`filter-tab ${statusFilter === 'pending' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('pending')}
                        >
                            Pending ({orders.filter(o => o.status === 'pending').length})
                        </button>
                        <button
                            className={`filter-tab ${statusFilter === 'delivered' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('delivered')}
                        >
                            Delivered ({orders.filter(o => o.status === 'delivered').length})
                        </button>
                        <button
                            className={`filter-tab ${statusFilter === 'cancelled' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('cancelled')}
                        >
                            Cancelled ({orders.filter(o => o.status === 'cancelled').length})
                        </button>
                    </div>
                    <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                        + New Order
                    </button>
                </div>

                {/* Orders Table */}
                {loading ? (
                    <div className="loading-state">Loading orders...</div>
                ) : (
                    <div className="table-container">
                        <table className="customers-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th>Quantity</th>
                                    <th>Order Date</th>
                                    <th>Delivered Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>{getCustomerName(order.customerid || order.customerId)}</td>
                                        <td>{order.quantity} bottles</td>
                                        <td>{new Date(order.date).toLocaleDateString()}</td>
                                        <td>
                                            {order.delivereddate || order.deliveredDate
                                                ? new Date(order.delivereddate || order.deliveredDate).toLocaleDateString()
                                                : '-'}
                                        </td>
                                        <td>
                                            <span className={`badge badge-${order.status}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            {order.status === 'pending' && (
                                                <button
                                                    className="btn-sm btn-edit"
                                                    onClick={() => handleMarkDelivered(order.id)}
                                                >
                                                    Mark Delivered
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="empty-state">No orders found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Add Order Modal */}
                {showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Create New Order</h2>
                                <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleSubmit} className="customer-form">
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Customer *</label>
                                        <select
                                            required
                                            value={formData.customerId}
                                            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                        >
                                            <option value="">Select Customer</option>
                                            {customers.map(customer => (
                                                <option key={customer.id} value={customer.id}>
                                                    {customer.name} ({customer.phone})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Quantity (bottles) *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Create Order
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default Orders
