import AdminLayout from '../../components/layout/AdminLayout'
import './Dashboard.css'

const AdminDashboard = () => {
    return (
        <AdminLayout pageTitle="Inventory Management">
            <div className="dashboard-container">
                {/* Metric Cards Row */}
                <div className="metrics-grid">
                    <div className="metric-card metric-green">
                        <div className="metric-icon">📦</div>
                        <div className="metric-content">
                            <div className="metric-value">5483</div>
                            <div className="metric-label">Total Products</div>
                        </div>
                    </div>

                    <div className="metric-card metric-blue">
                        <div className="metric-icon">🛒</div>
                        <div className="metric-content">
                            <div className="metric-value">2859</div>
                            <div className="metric-label">Orders</div>
                        </div>
                    </div>

                    <div className="metric-card metric-purple">
                        <div className="metric-icon">📊</div>
                        <div className="metric-content">
                            <div className="metric-value">5483</div>
                            <div className="metric-label">Total Stock</div>
                        </div>
                    </div>

                    <div className="metric-card metric-orange">
                        <div className="metric-icon">⚠️</div>
                        <div className="metric-content">
                            <div className="metric-value">38</div>
                            <div className="metric-label">Out of Stock</div>
                        </div>
                    </div>
                </div>

                {/* Charts Grid - Placeholder for now */}
                <div className="charts-grid">
                    <div className="chart-card">
                        <h3 className="chart-title">Overview</h3>
                        <p className="chart-placeholder">Charts coming in Phase 5</p>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-title">Inventory Values</h3>
                        <p className="chart-placeholder">Pie Chart</p>
                    </div>

                    <div className="chart-card chart-wide">
                        <h3 className="chart-title">Expense vs Profit</h3>
                        <p className="chart-placeholder">Line Chart</p>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-title">Top 10 Stores by sales</h3>
                        <p className="chart-placeholder">Bar Chart</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminDashboard
