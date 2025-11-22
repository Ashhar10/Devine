/* ========================================
   DEVINE WATER V2.0 - CALENDAR MODULE
   ======================================== */

/**
 * Initialize FullCalendar
 * @param {string} elementId - ID of the calendar container
 * @param {Array} orders - List of orders
 * @param {Array} deliveries - List of deliveries
 */
export function initCalendar(elementId, orders, deliveries) {
    const calendarEl = document.getElementById(elementId);
    if (!calendarEl) return;

    // Transform data into calendar events
    const events = [
        ...orders.map(o => ({
            title: `${o.quantity} Bottles Ordered`,
            start: o.date, // Assuming YYYY-MM-DD format
            backgroundColor: '#FFC107', // Warning color for orders (pending)
            borderColor: '#FFC107',
            textColor: '#000',
            extendedProps: { type: 'order', ...o }
        })),
        ...deliveries.map(d => ({
            title: `${d.quantity} Bottles Delivered`,
            start: d.date,
            backgroundColor: '#28A745', // Success color for deliveries
            borderColor: '#28A745',
            textColor: '#FFF',
            extendedProps: { type: 'delivery', ...d }
        }))
    ];

    // Detect theme
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const themeColor = isDark ? '#1F2937' : '#FFFFFF';
    const textColor = isDark ? '#F9FAFB' : '#111827';

    // @ts-ignore - FullCalendar is loaded via CDN
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listMonth'
        },
        events: events,
        height: 'auto',
        themeSystem: 'standard',
        eventClick: function (info) {
            const props = info.event.extendedProps;
            const date = info.event.start.toLocaleDateString();
            alert(`${props.type.toUpperCase()} Details:\nDate: ${date}\nQuantity: ${props.quantity}\nStatus: ${props.status || 'Completed'}`);
        },
        // Simple styling adjustments
        eventColor: '#088395',
        dayMaxEvents: true
    });

    calendar.render();

    // Re-render on theme change to fix any potential style issues
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                calendar.render();
            }
        });
    });
    observer.observe(document.documentElement, { attributes: true });

    return calendar;
}
