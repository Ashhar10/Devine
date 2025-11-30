import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import * as api from '../../services/api'
import '../admin/Customers.css'

const Deliveries = () => {
    const [deliveries, setDeliveries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [customers, setCustomers] = useState([])
    const [formData, setFormData] = useState({
        customerId: '',
        quantity: 1,
        liters: 20
    })

    useEffect(() => {
        loadDeliveries()
        loadCustomers()
    }, [])

    const loadDeliveries = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/deliveries`, {
                headers: { 'Authorization': `Bearer ${api.getToken()}` }
            })
            if (!response.ok) throw new Error('Failed to fetch deliveries')
            const data = await response.json()
            setDeliveries(data)
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
            await api.addDelivery(
                parseInt(formData.customerId),
                parseInt(formData.quantity),
                parseFloat(formData.liters)
            )
            setShowAddModal(false)
            setFormData({ customerId: '', quantity: 1, liters: 20 })
            loadDeliveries()
        } catch (err) {
            setError(err.message)
        }
    }

    const getCustomerName = (customerId) => {
        const customer = customers.find(c => c.id === customerId || c.id === parseInt(customerId))
        return customer ? customer.name : `Customer #${customerId}`
    }

    return (
        <AdminLayout pageTitle="Deliveries Management">
            <div className="customers-container">
                {error && <div className="error-banner">{error}</div>}

                <div className="page-header">
                    <div></div>
                    <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                        + Add Delivery
                    </button>
                </div>

                {loading ? (
                    <div className="loading-state">Loading deliveries...</div>
                ) : (
                    <div className="table-container">
                        <table className="customers-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Customer</th>
                                    <th>Quantity</th>
                                    <th>Liters</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveries.map(delivery => (
                                    <tr key={delivery.id}>
                                        <td>#{delivery.id}</td>
                                        <td>{getCustomerName(delivery.customerid || delivery.customerId)}</td>
                                        <td>{delivery.quantity} bottles</td>
                                        <td>{delivery.liters}L</td>
                                        <td>{new Date(delivery.date).toLocaleDateString()}</td>
                                        <td>{delivery.time || '-'}</td>
                                    </tr>
                                ))}
                                {deliveries.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="empty-state">No deliveries found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Add Delivery</h2>
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
                                    <div className="form-group">
                                        <label>Quantity (bottles) *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Liters *</label>
                                        <input
                                            type="number"
                                            min="0.1"
                                            step="0.1"
                                            required
                                            value={formData.liters}
                                            onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Add Delivery</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default Deliveries
