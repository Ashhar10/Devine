import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import * as api from '../../services/api'
import '../admin/Customers.css'

const Payments = () => {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [customers, setCustomers] = useState([])
    const [formData, setFormData] = useState({
        customerId: '',
        amount: '',
        method: 'Cash'
    })

    useEffect(() => {
        loadPayments()
        loadCustomers()
    }, [])

    const loadPayments = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments`, {
                headers: { 'Authorization': `Bearer ${api.getToken()}` }
            })
            if (!response.ok) throw new Error('Failed to fetch payments')
            const data = await response.json()
            setPayments(data)
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
            await api.recordPayment(
                parseInt(formData.customerId),
                parseFloat(formData.amount),
                formData.method
            )
            setShowAddModal(false)
            setFormData({ customerId: '', amount: '', method: 'Cash' })
            loadPayments()
        } catch (err) {
            setError(err.message)
        }
    }

    const getCustomerName = (customerId) => {
        const customer = customers.find(c => c.id === customerId || c.id === parseInt(customerId))
        return customer ? customer.name : `Customer #${customerId}`
    }

    return (
        <AdminLayout pageTitle="Payments Management">
            <div className="customers-container">
                {error && <div className="error-banner">{error}</div>}

                <div className="page-header">
                    <div></div>
                    <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                        + Record Payment
                    </button>
                </div>

                {loading ? (
                    <div className="loading-state">Loading payments...</div>
                ) : (
                    <div className="table-container">
                        <table className="customers-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(payment => (
                                    <tr key={payment.id}>
                                        <td>#{payment.id}</td>
                                        <td>{getCustomerName(payment.customerid || payment.customerId)}</td>
                                        <td>PKR {parseFloat(payment.amount).toLocaleString()}</td>
                                        <td>
                                            <span className="badge badge-success">{payment.method}</span>
                                        </td>
                                        <td>{new Date(payment.date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {payments.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="empty-state">No payments found</td>
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
                                <h2>Record Payment</h2>
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
                                        <label>Amount *</label>
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            required
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Payment Method *</label>
                                        <select
                                            required
                                            value={formData.method}
                                            onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                                        >
                                            <option value="Cash">Cash</option>
                                            <option value="Card">Card</option>
                                            <option value="Bank Transfer">Bank Transfer</option>
                                            <option value="Online">Online</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Record Payment</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default Payments
