# WOODORA – Master E-Commerce Living Platform Architecture

## 1. System Overview
WOODORA is an enterprise-grade luxury furniture and interior design e-commerce living platform. Built on Scandinavian minimalism and Japanese architectural woodworking principles, the system delivers an end-to-end customer experience, customer account suite, backend SQLite database persistence, and back-office administration portal.

- **Brand:** WOODORA
- **Tagline:** Crafted for Comfort. Designed for Life.
- **Industry:** Furniture, Interior Architecture & Home Living
- **Primary Customers:** Homeowners, Trade Architects & Designers, Hospitality / Commercial Buyers

---

## 2. Platform Architecture

### 2.1 Customer Storefront Pages
- `index.html`: Flagship 16-section editorial homepage with hero slider, category grid, bestsellers, sustainable forestry narrative, architectural lookbooks, testimonials, and newsletter.
- `shop.html`: Full catalog with 8 categories, instant search, price slider ($0–$2,000), sorting (price low/high, A–Z, newest), and quick Add to Cart.
- `product-detail.html`: Multi-angle gallery, dynamic finish swatches (*Forest Green, Walnut Brown, Warm Cream, Charcoal Black*), sizing configurations (*3-Seater $780, 2-Seater $620, Sectional $1,240*), and product care tabs.
- `cart.html`: Real-time cart calculations, coupon discount engine (`WOODORA10`), 5% estimated tax, and free White Glove shipping over $250.
- `checkout.html`: Multi-step checkout with address validation, delivery instructions, payment method selection, and order placement.
- `thank-you.html`: Order confirmation with dynamic order reference and tracking timeline.
- `about.html`, `services.html`, `portfolio.html`, `team.html`, `faq.html`, `contact.html`, `review.html`.

### 2.2 Customer Account Suite
- `account.html`: Overview of orders, wishlist count, active privileges (`WOODORA10`), and default shipping address.
- `my-orders.html`: Order history with ordered line items, fulfillment state badges, and delivery instructions.
- `my-wishlist.html`: Saved furnishings with 1-click "Move to Cart" and instant removal.
- `profile.html`: Customer profile details, trade accreditation, and delivery address manager.

### 2.3 Administration Operations Portal
- `admin-login.html`: Dedicated administrative access portal with role verification.
- `admin-dashboard.html`: Real-time KPI cards (Revenue, Total Orders, Registered Clients, Pending Fulfillment) and low-stock alerts.
- `admin-products.html`: Catalog management with Add Product modal, stock adjustment, and category assignment.
- `admin-orders.html`: Logistics control with order status transitions (`Confirmed` $\to$ `Processing` $\to$ `Shipped` $\to$ `Delivered` $\to$ `Cancelled`).
- `admin-customers.html`: Client directory with order history and lifetime value.
- `admin-inquiries.html`: Management of client contact inquiries and internal artisan notes.
- `admin-appointments.html`: Showroom private consultation booking calendar.
- `admin-coupons.html`: Promotional voucher manager with minimum order constraints.

---

## 3. Technology Stack & Persistence

- **Frontend:** HTML5, CSS3, ES6 JavaScript, jQuery 3.7.1, Bootstrap 4.6, Font Awesome 6.5.1, Owl Carousel, AOS.
- **Backend:** Node.js v24 HTTP server, native `node:sqlite` database engine (`data/woodora.sqlite`).
- **Security:** PBKDF2 password hashing (10,000 iterations, 64-byte key with 16-byte random salt), signed session tokens, role-based authorization (`Homeowner`, `Trade Architect`, `Hospitality`, `Administrator`).
- **Calculations:** Centralized server-side validation of order totals, 5% tax rate, free shipping threshold ($250), and coupon deductions.
