import React from 'react'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

const LineChartComponent = ({
    expenseData = [],
    profitData = [],
    labels = []
}) => {
    const defaultLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const defaultExpense = [4000, 3500, 4200, 3800, 4500, 4100]
    const defaultProfit = [3000, 3200, 3500, 3300, 3800, 3600]

    const chartData = {
        labels: labels.length ? labels : defaultLabels,
        datasets: [
            {
                label: 'Expense',
                data: expenseData.length ? expenseData : defaultExpense,
                borderColor: 'rgba(239, 68, 68, 1)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: 'rgba(239, 68, 68, 1)',
            },
            {
                label: 'Profit',
                data: profitData.length ? profitData : defaultProfit,
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: 'rgba(16, 185, 129, 1)',
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    padding: 15,
                    usePointStyle: true,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    callback: function (value) {
                        return '$' + value.toLocaleString()
                    }
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    }

    return <Line data={chartData} options={options} />
}

export default LineChartComponent
