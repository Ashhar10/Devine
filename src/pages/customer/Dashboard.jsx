import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { FiSun, FiMoon, FiChevronDown, FiChevronUp, FiCalendar, FiList } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
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
    const [darkMode, setDarkMode] = useState(false)
    const [viewMode, setViewMode] = useState('normal') // 'normal' or 'calendar'
    const [selectedDate, setSelectedDate] = useState(new Date())

    // Collapsible sections state
    const [sectionsOpen, setSectionsOpen] = useState({
        orders: true,
        deliveries: true,
        payments: true
    })

    // Cache data in localStorage
    const CACHE_KEY = `customer_data_${user?.id}`
    const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true'
        setDarkMode(savedDarkMode)
        if (savedDarkMode) {
            document.body.classList.add('dark-mode')
        }
    }, [])

    useEffect(() => {
        if (user?.id) {
            loadCustomerData()
        }
    }, [user])

    const loadCustomerData = async () => {
        try {
            const cached = localStorage.getItem(CACHE_KEY)
            if (cached) {
                const { data, timestamp } = JSON.parse(cached)
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setCustomerData(data.customer)
                    setOrders(data.orders)
                    setDeliveries(data.deliveries)
                    setPayments(data.payments)
                    setLoading(false)
                    return
                }
            }

            setLoading(true)
            setError('')

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

            const customerId = user.id
            const filteredOrders = allOrders.filter(o => (o.customerid || o.customerId) === customerId)
            const filteredDeliveries = allDeliveries.filter(d => (d.customerid || d.customerId) === customerId)
            const filteredPayments = allPayments.filter(p => (p.customerid || p.customerId) === customerId)

            setCustomerData(customer)
            setOrders(filteredOrders)
            setDeliveries(filteredDeliveries)
            setPayments(filteredPayments)

            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data: { customer, orders: filteredOrders, deliveries: filteredDeliveries, payments: filteredPayments },
                timestamp: Date.now()
            }))
        } catch (err) {
            console.error('Failed to load customer data:', err)
            setError('Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    const toggleDarkMode = () => {
        const newMode = !darkMode
        setDarkMode(newMode)
        localStorage.setItem('darkMode', newMode.toString())
        document.body.classList.toggle('dark-mode', newMode)
    }

    const toggleSection = (section) => {
        setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }))
    }

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'normal' ? 'calendar' : 'normal')
    }

    const handleWhatsAppOrder = () => {
        const phone = '923001234567'
        const message = encodeURIComponent(`Hi, I'd like to order water bottles. My customer ID is ${user.id}`)
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    }

    const handleWhatsAppHelp = () => {
        const phone = '923001234567'
        const message = encodeURIComponent(`Hi, I need help with my account. Customer ID: ${user.id}`)
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    }

    // Get events for calendar
    const calendarEvents = useMemo(() => {
        const events = {}

        orders.forEach(order => {
            const date = new Date(order.date).toDateString()
            if (!events[date]) events[date] = []
            events[date].push({ type: 'order', ...order })
        })

        deliveries.forEach(delivery => {
            const date = new Date(delivery.date).toDateString()
            if (!events[date]) events[date] = []
            events[date].push({ type: 'delivery', ...delivery })
        })

        payments.forEach(payment => {
            const date = new Date(payment.date).toDateString()
            if (!events[date]) events[date] = []
            events[date].push({ type: 'payment', ...payment })
        })

        return events
    }, [orders, deliveries, payments])

    const tileContent = ({ date }) => {
        const dateStr = date.toDateString()
        const dayEvents = calendarEvents[dateStr]
        if (!dayEvents) return null

        return (
            <div className="calendar-dots">
                {dayEvents.some(e => e.type === 'order') && <span className="dot dot-blue" />}
                {dayEvents.some(e => e.type === 'delivery') && <span className="dot dot-green" />}
                {dayEvents.some(e => e.type === 'payment') && <span className="dot dot-purple" />}
            </div>
        )
    }

    const stats = useMemo(() => ({
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalBottles: customerData?.totalbottles || customerData?.totalBottles || 0,
        monthlyConsumption: customerData?.monthlyconsumption || customerData?.monthlyConsumption || 0,
        totalDeliveries: deliveries.length
    }), [orders, deliveries, customerData])

    const selectedDateEvents = calendarEvents[selectedDate.toDateString()] || []

    if (loading) {
        return (
            <div className="customer-dashboard">
                <div className="loading-state">Loading your dashboard...</div>
            </div>
        )
    }

    return (
        <div className="customer-dashboard">
            <header className="customer-header">
                <div className="welcome-section">
                    <h1>Welcome, {customerData?.name}!</h1>
                    <p>Manage your water delivery service</p>
                </div>
                <div className="header-actions">
                    <button
                        className="view-toggle"
                        onClick={toggleViewMode}
                        title={viewMode === 'normal' ? 'Calendar View' : 'Normal View'}
                    >
                        {viewMode === 'normal' ? <FiCalendar size={20} /> : <FiList size={20} />}
                    </button>
                    <button className="theme-toggle" onClick={toggleDarkMode} title={darkMode ? 'Light Mode' : 'Dark Mode'}>
                        {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                    </button>
                    <div className="year-badge">{new Date().getFullYear()}</div>
                </div>
            </header>

            {error && <div className="error-banner">{error}</div>}

            <div className="quick-actions">
                <button className="whatsapp-btn order-btn" onClick={handleWhatsAppOrder}>
                    <FaWhatsapp size={24} />
                    <span>Order Water</span>
                </button>
                <button className="whatsapp-btn help-btn" onClick={handleWhatsAppHelp}>
                    <FaWhatsapp size={24} />
                    <span>Contact Us (Help)</span>
                </button>
            </div>

            <div className="metrics-grid">
                <div className="metric-card metric-blue">
                    <div className="metric-icon">💧</div>
                    <div className="metric-content">
                        <div className="metric-value">{stats.totalBottles}</div>
                        <div className="metric-label">Available Bottles</div>
                    </div>
                </div>

                <div className="metric-card metric-purple">
                    <div className="metric-icon">📊</div>
                    <div className="metric-content">
                        <div className="metric-value">{stats.monthlyConsumption}</div>
                        <div className="metric-label">Monthly Consumption</div>
                    </div>
                </div>

                <div className="metric-card metric-orange">
                    <div className="metric-icon">🛒</div>
                    <div className="metric-content">
                        <div className="metric-value">{stats.pendingOrders}</div>
                        <div className="metric-label">Pending Orders</div>
                    </div>
                </div>

                <div className="metric-card metric-green">
                    <div className="metric-icon">✅</div>
                    <div className="metric-content">
                        <div className="metric-value">{stats.totalDeliveries}</div>
                        <div className="metric-label">Total Deliveries</div>
                    </div>
                </div>
            </div>

            {viewMode === 'calendar' ? (
                <div className="calendar-view">
                    <div className="calendar-container">
                        <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                            tileContent={tileContent}
                            className={darkMode ? 'dark-calendar' : ''}
                        />
                        <div className="calendar-legend">
                            <div className="legend-item">
                                <span className="dot dot-blue" />
                                <span>Orders</span>
                            </div>
                            <div className="legend-item">
                                <span className="dot dot-green" />
                                <span>Deliveries</span>
                            </div>
                            <div className="legend-item">
                                <span className="dot dot-purple" />
                                <span>Payments</span>
                            </div>
                        </div>
                    </div>

                    <div className="calendar-events">
                        <h3>Events on {selectedDate.toLocaleDateString()}</h3>
                        {selectedDateEvents.length === 0 ? (
                            <div className="empty-message">No events on this date</div>
                        ) : (
                            <div className="events-list">
                                {selectedDateEvents.map((event, idx) => (
                                    <div key={idx} className={`event-item event-${event.type}`}>
                                        {event.type === 'order' && (
                                            <>
                                                <div className="event-icon">🛒</div>
                                                <div className="event-details">
                                                    <div className="event-title">Order #{event.id}</div>
                                                    <div className="event-subtitle">{event.quantity} bottles</div>
                                                </div>
                                                <span className={`badge badge-${event.status}`}>{event.status}</span>
                                            </>
                                        )}
                                        {event.type === 'delivery' && (
                                            <>
                                                <div className="event-icon">🚚</div>
                                                <div className="event-details">
                                                    <div className="event-title">Delivery</div>
                                                    <div className="event-subtitle">{event.quantity} bottles ({event.liters}L)</div>
                                                </div>
                                            </>
                                        )}
                                        {event.type === 'payment' && (
                                            <>
                                                <div className="event-icon">💰</div>
                                                <div className="event-details">
                                                    <div className="event-title">Payment</div>
                                                    <div className="event-subtitle">PKR {parseFloat(event.amount).toLocaleString()}</div>
                                                </div>
                                                <span className="badge badge-success">{event.method}</span>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="content-grid">
                    <div className="content-card">
                        <div className="card-header" onClick={() => toggleSection('orders')}>
                            <h2 className="card-title">Recent Orders</h2>
                            {sectionsOpen.orders ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                        {sectionsOpen.orders && (
                            <div className="orders-list">
                                {orders.slice(0, 5).map(order => (
                                    <div key={order.id} className="order-item">
                                        <div>
                                            <div className="order-id">Order #{order.id}</div>
                                            <div className="order-detail">{order.quantity} bottles</div>
                                        </div>
                                        <div>
                                            <span className={`badge badge-${order.status}`}>{order.status}</span>
                                            <div className="order-date">{new Date(order.date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                ))}
                                {orders.length === 0 && <div className="empty-message">No orders yet</div>}
                            </div>
                        )}
                    </div>

                    <div className="content-card">
                        <div className="card-header" onClick={() => toggleSection('deliveries')}>
                            <h2 className="card-title">Recent Deliveries</h2>
                            {sectionsOpen.deliveries ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                        {sectionsOpen.deliveries && (
                            <div className="orders-list">
                                {deliveries.slice(0, 5).map(delivery => (
                                    <div key={delivery.id} className="order-item">
                                        <div>
                                            <div className="order-id">{delivery.quantity} bottles</div>
                                            <div className="order-detail">{delivery.liters}L total</div>
                                        </div>
                                        <div className="order-date">{new Date(delivery.date).toLocaleDateString()}</div>
                                    </div>
                                ))}
                                {deliveries.length === 0 && <div className="empty-message">No deliveries yet</div>}
                            </div>
                        )}
                    </div>

                    <div className="content-card full-width">
                        <div className="card-header" onClick={() => toggleSection('payments')}>
                            <h2 className="card-title">Payment History</h2>
                            {sectionsOpen.payments ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                        {sectionsOpen.payments && (
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
                                                <td>PKR {parseFloat(payment.amount).toLocaleString()}</td>
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
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CustomerDashboard
