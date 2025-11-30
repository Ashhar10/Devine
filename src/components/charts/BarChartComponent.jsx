import React from 'react'
import { Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

const BarChartComponent = ({ data = [], labels = [] }) => {
    const defaultLabels = [
        'Customer A',
        'Customer B',
        'Customer C',
        'Customer D',
        'Customer E'
    ]
    const defaultData = [85, 72, 68, 55, 48]

    const chartData = {
        labels: labels.length ? labels : defaultLabels,
        datasets: [
            {
                label: 'Consumption (bottles)',
                data: data.length ? data : defaultData,
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(139, 92, 246, 1)',
                ],
                borderWidth: 2,
                borderRadius: 6,
            },
        ],
    }

    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = context.parsed.x
                        const total = context.dataset.data.reduce((a, b) => a + b, 0)
                        const percentage = ((value / total) * 100).toFixed(1)
                        return `${value} bottles (${percentage}%)`
                    }
                }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    callback: function (value) {
                        return value
                    }
                }
            },
            y: {
                grid: {
                    display: false
                }
            }
        }
    }

    return <Bar data={chartData} options={options} />
}

export default BarChartComponent
