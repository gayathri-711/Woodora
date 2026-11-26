# WOODORA – Premium Furniture E-Commerce Platform

> **Crafted for Comfort. Designed for Life.**  
> An ultra-luxury, modern furniture brand and digital commerce living platform inspired by timeless Scandinavian aesthetics, Japanese architectural joinery, and European sustainable hardwoods.

---

## 1. Brand Identity & Design System

WOODORA communicates architectural balance, artisanal permanence, and natural materials.

### 1.1 Color Palette
- **Forest Green (`#263D32`)**: Primary brand identity, luxury headings, primary buttons.
- **Warm Cream (`#F7F4EE`)**: Clean, inviting section backgrounds and contrast cards.
- **Walnut Brown (`#805B42`)**: Rich accent details, badges, and interactive hover states.
- **Soft Beige (`#E8DED0`)**: Architectural dividers, subtle borders, and structural framing.
- **Dark Charcoal (`#252525`)**: High-contrast, legible typography.
- **Antique Gold (`#C8A882`)**: Privileged ribbons, star ratings, and refined highlights.

### 1.2 Typography
- **Serif Display Headings**: `Playfair Display` & `Jost` for timeless artisan luxury.
- **Modern Sans UI**: `Plus Jakarta Sans` for crisp legibility and high-converting e-commerce interactions.

---

## 2. Platform Architecture & Modules

```
WOODORA Platform Architecture
│
├── Customer Storefront (HTML5 / CSS3 / ES6 / jQuery / Bootstrap)
│   ├── index.html (16-Part Luxury Editorial Flagship Storefront)
│   ├── shop.html (Catalog with Live Filtering, Search & Sorting)
│   ├── product-detail.html (Dynamic Finish Swatches & Sizing Configs)
│   ├── cart.html & checkout.html (Multi-Step Checkout & Coupon Engine)
│   ├── thank-you.html (Order Confirmation & Tracking Timeline)
│   ├── about.html, services.html, portfolio.html, team.html, faq.html, contact.html
│   └── review.html (Verified Reviews Gallery & Interactive Submission Modal)
│
├── Customer Account Suite (Authenticated Private Client Area)
│   ├── account.html (Client Dashboard & Order Summary)
│   ├── my-orders.html (Complete Historical Orders & Status Tracking)
│   ├── my-wishlist.html (Saved Furnishings with 1-Click Move-to-Cart)
│   └── profile.html (Shipping Address & Trade Credentials)
│
├── Administration Operations Portal (Back-Office Atelier Control)
│   ├── admin-login.html (Secure Administrator Authentication)
│   ├── admin-dashboard.html (Live KPI Analytics, Revenue, Low-Stock Watchlist)
│   ├── admin-products.html (Catalog Inventory & Stock Management)
│   ├── admin-orders.html (Logistics & Order Status Transitions)
│   ├── admin-customers.html (Directory of Homeowners, Trade & Hospitality Buyers)
│   ├── admin-inquiries.html (Customer Inquiries & Follow-up Notes)
│   ├── admin-appointments.html (Showroom Private Consultation Schedule)
│   └── admin-coupons.html (Promotional Vouchers & Minimum Spends)
│
├── Backend REST API & Database Persistence (Node.js 24 / node:sqlite)
│   ├── server.js (HTTP Server, Static File Streamer & API Router)
│   ├── server/db.js (Native SQLite Schema, Constraints & Seed Engine)
│   ├── server/auth.js (PBKDF2 Password Hashing & Token Session Auth)
│   └── server/api.js (Domain REST Controllers: /api/*)
```

---

## 3. Authoritative SQLite Database Schema

The platform uses Node's native `node:sqlite` database (`data/woodora.sqlite`), ensuring zero-dependency, transactional reliability:
1. `users`: Credentials, PBKDF2 hash, salt, phone, and role (`Homeowner`, `Trade Architect`, `Hospitality`, `Administrator`).
2. `customer_profiles`: Company accreditation, trade tier, and notes.
3. `addresses`: Verified shipping destinations with default flags.
4. `categories`: 8 furniture categories (`Sofas`, `Chairs`, `Beds`, `Dining Tables`, `Wardrobes`, `Coffee Tables`, `Office Furniture`, `Home Decor`).
5. `products`: Comprehensive catalog with live stock, dimensions, materials, and care instructions.
6. `product_variants`: Finish colors and sizing configurations.
7. `carts` & `cart_items`: Synchronized backend carts for authenticated sessions.
8. `wishlists`: Authenticated customer wishlists.
9. `coupons`: Active promotion codes (`WOODORA10`, `ARCHITECT15`) with minimum spends.
10. `orders` & `order_items`: Authoritative order records with immutable line items, subtotal, discount, tax, shipping, and fulfillment states.
11. `inquiries`: Client messages from `contact.html`.
12. `appointments`: Showroom consultation bookings.
13. `newsletter_subscribers`: Verified VIP newsletter sign-ups.
14. `product_reviews`: Verified customer star ratings and testimonials.
15. `sessions`: Cryptographic 256-bit session tokens.
16. `admin_activity_logs`: Administrative audit trail.

---

## 4. Pre-Configured Demonstration Accounts

| Full Name | Email Address | Password | Account Role |
| :--- | :--- | :--- | :--- |
| **Julian Sterling** | `julian@woodora.com` | `password123` | Private Homeowner / Collector |
| **Eleanor Vance** | `eleanor@woodora.com` | `password123` | Interior Architect (Trade Partner) |
| **WOODORA Administrator** | `admin@woodora.com` | `admin123` | Store Administrator |

---

## 5. Quick Start & Execution

### Prerequisites
- Node.js v22+ or v24+ (utilizes built-in `node:sqlite`).

### Launch Local Server
```bash
# Start the WOODORA server
node server.js
```
The application will be live at:
- **Storefront:** [http://localhost:8000/](http://localhost:8000/)
- **Customer Account:** [http://localhost:8000/account.html](http://localhost:8000/account.html)
- **Administration Portal:** [http://localhost:8000/admin-login.html](http://localhost:8000/admin-login.html)
- **REST API:** [http://localhost:8000/api/products](http://localhost:8000/api/products)

---

## 6. REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | POST | Register new customer with role assignment |
| `/api/auth/login` | POST | Authenticate user & issue signed session token |
| `/api/auth/me` | GET | Retrieve authenticated profile, tier, and addresses |
| `/api/auth/logout` | POST | Invalidate active session token |
| `/api/products` | GET | List products with category, price, search, and sorting |
| `/api/products/:id` | GET | Single product details with variants and reviews |
| `/api/categories` | GET | List 8 furniture categories |
| `/api/cart` | GET / POST / PUT / DELETE | Synchronized backend shopping cart |
| `/api/wishlist` | GET / POST | Curated customer wishlist management |
| `/api/wishlist/move-to-cart` | POST | Transfer item from wishlist to cart |
| `/api/coupons/validate` | POST | Validate promo code (e.g. `WOODORA10`) |
| `/api/orders` | GET / POST | Create order with authoritative server calculations |
| `/api/appointments` | POST | Book private showroom appointment |
| `/api/inquiries` | POST | Submit bespoke joinery inquiry |
| `/api/newsletter` | POST | VIP collector newsletter subscription |
| `/api/admin/metrics` | GET | Executive KPI metrics and revenue totals |
| `/api/admin/orders` | GET | Admin order list with fulfillment statuses |
| `/api/admin/orders/status` | PUT | Advance order status (`Confirmed` $\to$ `Delivered`) |
| `/api/admin/products` | GET / POST / PUT | Catalog and stock quantity management |
| `/api/admin/customers` | GET | Client directory with lifetime value |
| `/api/admin/inquiries` | GET / PUT | Review and update inquiry status |
| `/api/admin/appointments` | GET / PUT | Manage showroom consultation calendar |
| `/api/admin/coupons` | GET / POST / PUT | Manage discount vouchers |

---

## 7. Verification Testing

Run the automated test suite verifying all 7 core business journeys:
```bash
node scratch/test_all_journeys.js
```
The test verifies:
- Journey 1: New Customer Registration & Catalog Discovery.
- Journey 2: Full Purchase & Checkout Workflow.
- Journey 3: Returning Customer Order History.
- Journey 4: Wishlist Lifecycle (Add $\to$ View $\to$ Move to Cart).
- Journey 5: Administration Back-Office KPI & Stock Management.
- Journey 6: Showroom Appointment Booking & Review.
- Journey 7: Trade Architect Registration & Bespoke Inquiry.
