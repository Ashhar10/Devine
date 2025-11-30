import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages
import Login from './pages/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminCustomers from './pages/admin/Customers'
import AdminCustomerDetail from './pages/admin/CustomerDetail'
import AdminOrders from './pages/admin/Orders'
import AdminDeliveries from './pages/admin/Deliveries'
import AdminPayments from './pages/admin/Payments'
import CustomerDashboard from './pages/customer/Dashboard'
import CustomerConsumption from './pages/customer/Consumption'
import CustomerFinancial from './pages/customer/Financial'
import CustomerDeliveries from './pages/customer/Deliveries'
import CustomerCalendar from './pages/customer/Calendar'
import CustomerBottleRequest from './pages/customer/BottleRequest'
import CustomerProfile from './pages/customer/Profile'

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={<ProtectedRoute requiredRole="admin" />}>
                            <Route index element={<Navigate to="/admin/dashboard" replace />} />
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="customers" element={<AdminCustomers />} />
                            <Route path="customers/:id" element={<AdminCustomerDetail />} />
                            <Route path="orders" element={<AdminOrders />} />
                            <Route path="deliveries" element={<AdminDeliveries />} />
                            <Route path="payments" element={<AdminPayments />} />
                        </Route>

                        {/* Customer Routes */}
                        <Route path="/customer" element={<ProtectedRoute requiredRole="customer" />}>
                            <Route index element={<Navigate to="/customer/dashboard" replace />} />
                            <Route path="dashboard" element={<CustomerDashboard />} />
                            <Route path="consumption" element={<CustomerConsumption />} />
                            <Route path="financial" element={<CustomerFinancial />} />
                            <Route path="deliveries" element={<CustomerDeliveries />} />
                            <Route path="calendar" element={<CustomerCalendar />} />
                            <Route path="bottle-request" element={<CustomerBottleRequest />} />
                            <Route path="profile" element={<CustomerProfile />} />
                        </Route>

                        {/* Default redirect */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App
