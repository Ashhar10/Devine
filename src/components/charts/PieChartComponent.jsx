import React from 'react'
import { Pie } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const PieChartComponent = ({ data = [], labels = [], title = 'Pie Chart' }) => {
    const chartData = {
        labels: labels.length ? labels : ['Category A', 'Category B', 'Category C'],
        datasets: [
            {
                label: title,
                data: data.length ? data : [300, 150, 100],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',   // Purple
                    'rgba(59, 130, 246, 0.8)',   // Blue
                    'rgba(16, 185, 129, 0.8)',   // Green
                    'rgba(245, 158, 11, 0.8)',   // Orange
                    'rgba(239, 68, 68, 0.8)',    // Red
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)',
                ],
                borderWidth: 2,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || ''
                        const value = context.parsed || 0
                        const total = context.dataset.data.reduce((a, b) => a + b, 0)
                        const percentage = ((value / total) * 100).toFixed(1)
                        return `${label}: ${value} (${percentage}%)`
                    }
                }
            }
        }
    }

    return <Pie data={chartData} options={options} />
}

export default PieChartComponent
