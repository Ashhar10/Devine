// Chart Data Helper - Loads real user data for charts
// No demo/mock data - only real user data

export async function getConsumptionData() {
    try {
        const response = await fetch(`${API_BASE}/deliveries`, {
            credentials: 'include'
        });

        if (!response.ok) return { monthly: [], daily: [] };

        const deliveries = await response.json();

        // Group by month
        const monthlyData = {};
        deliveries.forEach(delivery => {
            const date = new Date(delivery.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    delivered: 0,
                    returned: 0,
                    spent: 0
                };
            }

            monthlyData[monthKey].delivered += delivery.quantity || 0;
            monthlyData[monthKey].returned += delivery.emptyReturned || 0;
            monthlyData[monthKey].spent += delivery.amount || 0;
        });

        return { monthlyData };
    } catch (error) {
        console.error('Error loading consumption data:', error);
        return { monthlyData: {} };
    }
}

export async function getFinancialData() {
    try {
        const response = await fetch(`${API_BASE}/payments`, {
            credentials: 'include'
        });

        if (!response.ok) return { monthly: [] };

        const payments = await response.json();

        // Group by month
        const monthlyData = {};
        payments.forEach(payment => {
            const date = new Date(payment.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = 0;
            }

            monthlyData[monthKey] += payment.amount || 0;
        });

        return { monthlyData };
    } catch (error) {
        console.error('Error loading financial data:', error);
        return { monthlyData: {} };
    }
}

export function prepareChartData(monthlyData, months = 12) {
    const labels = [];
    const data = [];

    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });

        labels.push(monthLabel);
        data.push(monthlyData[monthKey] || 0);
    }

    return { labels, data };
}

export function showNoDataMessage(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: #6B7280;">
        <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-bottom: 16px; opacity: 0.5;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
        <p style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">No Data Available</p>
        <p style="font-size: 14px;">Start placing orders to see your analytics</p>
      </div>
    `;
    }
}
