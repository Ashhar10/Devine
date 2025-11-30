import './ChartCard.css'

const ChartCard = ({ title, children, wide = false }) => {
    return (
        <div className={`chart-card ${wide ? 'chart-wide' : ''}`}>
            {title && <h3 className="chart-title">{title}</h3>}
            <div className="chart-container">
                {children}
            </div>
        </div>
    )
}

export default ChartCard
