import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import * as api from '../../services/api'
import './Customers.css'

const Customers = () => {
    const navigate = useNavigate()
    const [customers, setCustomers] = useState([])
    const [filteredCustomers, setFilteredCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        totalBottles: 0,
        monthlyConsumption: 0,
        isPaid: 1
    })

    useEffect(() => {
        loadCustomers()
    }, [])

    useEffect(() => {
        const filtered = customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm) ||
            (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        setFilteredCustomers(filtered)
    }, [searchTerm, customers])

    const loadCustomers = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/customers`, {
                headers: { 'Authorization': `Bearer ${api.getToken()}` }
            })
            if (!response.ok) throw new Error('Failed to fetch customers')
            const data = await response.json()
            setCustomers(data)
            setFilteredCustomers(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingCustomer) {
                await api.updateCustomer(editingCustomer.id, formData)
            } else {
                await api.addCustomer(formData)
            }
            setShowAddModal(false)
            setEditingCustomer(null)
            resetForm()
            loadCustomers()
        } catch (err) {
            setError(err.message)
        }
    }

    const handleEdit = (customer) => {
        setEditingCustomer(customer)
        setFormData({
            name: customer.name,
            phone: customer.phone,
            email: customer.email || '',
            address: customer.address || '',
            city: customer.city || '',
            totalBottles: customer.totalbottles || customer.totalBottles || 0,
            monthlyConsumption: customer.monthlyconsumption || customer.monthlyConsumption || 0,
            isPaid: customer.ispaid !== undefined ? customer.ispaid : customer.isPaid || 1
        })
        setShowAddModal(true)
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) return
        try {
            await api.deleteCustomer(id)
            loadCustomers()
        } catch (err) {
            setError(err.message)
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            email: '',
            address: '',
            city: '',
            totalBottles: 0,
            monthlyConsumption: 0,
            isPaid: 1
        })
    }

    const handleCloseModal = () => {
        setShowAddModal(false)
        setEditingCustomer(null)
        resetForm()
    }

    return (
        <AdminLayout pageTitle="Customer Management">
            <div className="customers-container">
                {error && <div className="error-banner">{error}</div>}

                {/* Header Actions */}
                <div className="page-header">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name, phone, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                        + Add Customer
                    </button>
                </div>

                {/* Customers Table */}
                {loading ? (
                    <div className="loading-state">Loading customers...</div>
                ) : (
                    <div className="table-container">
                        <table className="customers-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>City</th>
                                    <th>Bottles</th>
                                    <th>Monthly</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map(customer => (
                                    <tr key={customer.id}>
                                        <td>{customer.name}</td>
                                        <td>{customer.phone}</td>
                                        <td>{customer.email || '-'}</td>
                                        <td>{customer.city || '-'}</td>
                                        <td>{customer.totalbottles || customer.totalBottles || 0}</td>
                                        <td>{customer.monthlyconsumption || customer.monthlyConsumption || 0}</td>
                                        <td>
                                            <span className={`badge ${(customer.ispaid || customer.isPaid) ? 'badge-success' : 'badge-danger'}`}>
                                                {(customer.ispaid || customer.isPaid) ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button className="btn-sm btn-edit" onClick={() => handleEdit(customer)}>Edit</button>
                                            <button className="btn-sm btn-delete" onClick={() => handleDelete(customer.id)}>Delete</button>
                                            <button className="btn-sm btn-view" onClick={() => navigate(`/admin/customers/${customer.id}`)}>View</button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCustomers.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="empty-state">No customers found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Add/Edit Modal */}
                {showAddModal && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
                                <button className="modal-close" onClick={handleCloseModal}>×</button>
                            </div>
                            <form onSubmit={handleSubmit} className="customer-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Address</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Total Bottles</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.totalBottles}
                                            onChange={(e) => setFormData({ ...formData, totalBottles: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Monthly Consumption</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.monthlyConsumption}
                                            onChange={(e) => setFormData({ ...formData, monthlyConsumption: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Payment Status</label>
                                        <select
                                            value={formData.isPaid}
                                            onChange={(e) => setFormData({ ...formData, isPaid: parseInt(e.target.value) })}
                                        >
                                            <option value={1}>Paid</option>
                                            <option value={0}>Unpaid</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                    <button type="submit" className="btn-primary">{editingCustomer ? 'Update' : 'Add'} Customer</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default Customers
