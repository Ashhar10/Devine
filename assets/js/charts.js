/* ========================================
   DEVINE WATER V2.0 - CHART ANALYTICS
   ======================================== */

/**
 * Initialize Chart.js with default configuration
 */
export function initCharts() {
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted').trim();
    Chart.defaults.scale.grid.color = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim();

    // Update charts on theme change
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                updateChartTheme();
            }
        });
    });

    observer.observe(document.documentElement, { attributes: true });
}

function updateChartTheme() {
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted').trim();
    const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim();

    Chart.helpers.each(Chart.instances, (chart) => {
        if (chart.options.scales) {
            if (chart.options.scales.x) {
                chart.options.scales.x.grid.color = gridColor;
                chart.options.scales.x.ticks.color = textColor;
            }
            if (chart.options.scales.y) {
                chart.options.scales.y.grid.color = gridColor;
                chart.options.scales.y.ticks.color = textColor;
            }
        }
        chart.update();
    });
}

/**
 * Render Revenue Trend Chart
 * @param {string} canvasId - ID of the canvas element
 * @param {Array} data - Array of revenue data points
 * @param {Array} labels - Array of date labels
 */
export function renderRevenueChart(canvasId, data, labels) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue (Rs)',
                data: data,
                borderColor: '#088395',
                backgroundColor: 'rgba(8, 131, 149, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#FFFFFF',
                pointBorderColor: '#088395',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: '#F9FAFB',
                    bodyColor: '#F9FAFB',
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { borderDash: [4, 4] }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

/**
 * Render Order Status Chart
 * @param {string} canvasId
 * @param {Object} stats - { pending, delivered, cancelled }
 */
export function renderOrderStatusChart(canvasId, stats) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pending', 'Delivered', 'Cancelled'],
            datasets: [{
                data: [stats.pending, stats.delivered, stats.cancelled],
                backgroundColor: ['#FFC107', '#28A745', '#DC3545'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, padding: 20 }
                }
            }
        }
    });
}

/**
 * Render Customer Growth Chart
 * @param {string} canvasId
 * @param {Array} data
 * @param {Array} labels
 */
export function renderCustomerGrowthChart(canvasId, data, labels) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'New Customers',
                data: data,
                backgroundColor: '#05BFDB',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { borderDash: [4, 4] }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}
