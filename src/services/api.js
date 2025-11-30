// API client service
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
const TOKEN_KEY = 'devine_token_v1'

// Token management
export const getToken = () => {
    try {
        return localStorage.getItem(TOKEN_KEY) || null
    } catch {
        return null
    }
}

export const setToken = (token) => {
    try {
        localStorage.setItem(TOKEN_KEY, token)
    } catch (e) {
        console.error('Failed to save token:', e)
    }
}

export const clearToken = () => {
    try {
        localStorage.removeItem(TOKEN_KEY)
    } catch (e) {
        console.error('Failed to clear token:', e)
    }
}

// HTTP request helper
async function request(method, path, data) {
    const url = method === 'GET'
        ? `${API_BASE}${path}${path.includes('?') ? '&' : '?'}t=${Date.now()}`
        : `${API_BASE}${path}`

    console.log(`API Request: ${method} ${url}`)

    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {}),
        },
        body: data ? JSON.stringify(data) : undefined,
    })

    if (!res.ok) {
        const text = await res.text()
        console.error(`API Error: ${res.status} ${text}`)
        throw new Error(text || `Request failed: ${res.status}`)
    }

    const json = res.status === 204 ? null : await res.json()
    console.log(`API Response ${path}:`, json)
    return json
}

// Auth endpoints
export const loginAdmin = async (username, password) => {
    const res = await request('POST', '/auth/admin/login', { username, password })
    setToken(res.token)
    return res.user
}

export const loginCustomer = async (phone, password) => {
    const res = await request('POST', '/auth/customer/login', { phone, password })
    setToken(res.token)
    return res.user
}

export const checkSession = async () => {
    const token = getToken()
    if (!token) return null

    try {
        const res = await request('GET', '/auth/me')
        return { user: res.user, role: res.role }
    } catch (e) {
        console.error('Session check failed:', e)
        clearToken()
        return null
    }
}

// Data fetching
export const fetchAllData = async () => {
    const [customers, orders, deliveries, payments] = await Promise.all([
        request('GET', '/customers'),
        request('GET', '/orders'),
        request('GET', '/deliveries'),
        request('GET', '/payments'),
    ])
    return { customers, orders, deliveries, payments }
}

export const fetchCustomerData = async (id) => {
    const [customer, orders, deliveries, payments] = await Promise.all([
        request('GET', `/customers/${id}`),
        request('GET', '/orders'),
        request('GET', '/deliveries'),
        request('GET', '/payments'),
    ])
    return { customer, orders, deliveries, payments }
}

// Customer operations
export const addCustomer = async (customerData) => {
    return await request('POST', '/customers', customerData)
}

export const updateCustomer = async (id, customerData) => {
    return await request('PUT', `/customers/${id}`, customerData)
}

export const deleteCustomer = async (id) => {
    return await request('DELETE', `/customers/${id}`)
}

// Order operations
export const placeOrder = async (customerId, quantity) => {
    return await request('POST', '/orders', { customerId, quantity })
}

export const markOrderDelivered = async (orderId) => {
    return await request('PUT', `/orders/${orderId}/delivered`)
}

// Delivery operations
export const addDelivery = async (customerId, quantity, liters) => {
    return await request('POST', '/deliveries', { customerId, quantity, liters })
}

// Payment operations
export const recordPayment = async (customerId, amount, method = 'Cash') => {
    return await request('POST', '/payments', { customerId, amount, method })
}
