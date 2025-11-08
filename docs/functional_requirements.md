# Devine Water – Functional Requirements (Frontend-only)

This document captures the current app’s functionality and UX to guide a pure HTML/CSS/JavaScript conversion while preserving feature parity and responsive design.

## Roles
- Admin: Manages customers, orders, deliveries, and payments; views dashboards and customer details.
- Customer: Logs in with phone/password; places orders; views orders and delivery history; edits profile; sees payment due banner.

## Authentication & Navigation
- Login screen with Admin/Customer tabs, password toggle, admin settings modal to change admin password.
- Admin default credentials: `admin/admin` (local, editable).
- Customer login via phone/password match.
- Logout resets session and navigates to login.

## Admin – Dashboard
- Summary cards: total customers, unpaid customers count, pending orders count, total deliveries count.
- Navigation buttons: Customers, Orders, Deliveries, Payments.
- Unpaid customers list (top 5) with “View” linking to customer detail.
- Recent pending orders list (top 5).

## Admin – Customers
- List all customers (table) with: name, phone, address, city, join date, renewal date, total bottles, status (Paid/Unpaid).
- Actions: View (opens Customer Detail), Delete (with confirmation).
- Add Customer modal: form fields name, phone, password, email, address, city, join date.

## Admin – Orders
- List all orders: customer name, quantity, date, status badge.
- Add Order (popup): select customer, quantity.
- Mark order delivered (confirmation); delivered orders appear updated.

## Admin – Deliveries
- List all deliveries: date, customer, bottles, liters, amount.
- Add Delivery (popup): select customer, quantity, optional liters and amount.

## Admin – Payments
- Unpaid customers list with current monthly bill; actions: Send WhatsApp reminder; Mark Paid (records payment and advances renewal).
- Recent payments list (latest 10): customer name, amount, date.

## Admin – Customer Detail
- Header with Paid/Unpaid status badge; edit mode for name/email.
- Basic info cards: phone (read-only), join date, renewal date.
- Stats cards: total bottles, monthly consumption, current bill.
- Actions: Send reminder (WhatsApp), Record payment (quick action), Record delivery (quantity input + add).
- Delivery history list: quantity, liters, date, amount.
- Payment history list: amount and date.
- Geolocation capture to save current location.

## Customer – Dashboard
- Welcome header with gradient; address.
- Stats cards: total bottles, this month, current bill.
- Payment due banner when unpaid or past renewal, opens info dialog and WhatsApp contact.
- Actions: Place Order (popup with quantity + total calculation), Contact Us (WhatsApp), Edit Profile.
- My Orders list with status badges (pending/delivered).
- Delivery history list with amount.

## Customer – Profile
- Form for name, email, address, city, current location.
- Capture geolocation to fill current location; save updates both session user and global customers list.

## Data & State (to be replicated client-side)
- Users: Admin credentials; Customers with fields: id, name, phone, password, address, city, email, joinDate, renewalDate, totalBottles, monthlyConsumption, isPaid, deliveries[], payments[].
- Orders: id, customerId, customerName/Phone, quantity, date, time, status.
- Deliveries: id, customerId, quantity, liters, date, time.
- Payments: id, customerId, amount, date, method; displayed in Admin Payments.

## Calculations & Rules
- `PRICE_PER_BOTTLE = 45`; `LITERS_PER_BOTTLE = 18.9`.
- Monthly bill = `monthlyConsumption * PRICE_PER_BOTTLE`.
- Renewal due if `renewalDate < today` or `isPaid == false`.
- On payment: set `isPaid = true`, `monthlyConsumption = 0`, advance renewal by 1 month; push payment record.
- On delivery: increment `totalBottles` and `monthlyConsumption`; add delivery record.
- On order delivered: record delivery and mark order delivered with deliveredDate.

## UX/Design
- Responsive across mobile, tablet, desktop.
- Gradient navbar and headers; rounded cards with shadows; tables with alternating row colors.
- Animations: hover effects and simple pulses; modals and popups.

## External Integrations
- WhatsApp: open `wa.me` link with prefilled message.
- Geolocation: `navigator.geolocation.getCurrentPosition`.

## Conversion Targets
- Replace all backend fetches with client-side state and localStorage persistence.
- Replicate all interactions via vanilla JavaScript and DOM APIs.
- Preserve all UI layout/animations via CSS (Flexbox/Grid); avoid frameworks.