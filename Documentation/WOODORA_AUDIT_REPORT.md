# WOODORA — Comprehensive Repository Audit & Architectural Analysis Report

**Project:** WOODORA — Luxury Furniture E-Commerce Platform  
**Tagline:** *Crafted for Comfort. Designed for Life.*  
**Date of Audit:** November 2026  
**Auditor Role:** Senior Software Architect, Full-Stack Developer & Quality Assurance Lead  
**Repository:** `https://github.com/gayathri-711/Woodora`  
**Deployment Target:** Local Node.js Runtime & Vercel Serverless Edge  

---

## 1. Executive Summary

This mandatory architectural audit examines the complete codebase of the **WOODORA** furniture e-commerce platform. Originally adapted from the legacy *Contrive Furniture Store* template, the repository has been significantly elevated in visual brand identity, styling tokens, and presentation. However, bridging the gap between an interactive frontend prototype and an enterprise-grade, production-ready furniture commerce platform requires systematically addressing architectural, persistence, authentication, administrative, and security foundations.

The audit identifies existing functional strengths to preserve, pinpoints gaps in server-side persistence and access control, and establishes the formal transformation roadmap to deliver a complete, cohesive living platform.

---

## 2. Existing Project Architecture & Technology Stack

### 2.1 Technology Stack
- **Frontend Presentation:** HTML5, CSS3, JavaScript (ES6+), jQuery 3.7.1, Bootstrap 4.6, Font Awesome 6.5.1.
- **Styling & Design System:** 
  - `assets/css/woodora.css`: Official color palette, luxury product cards, toast notifications, responsive rules.
  - `assets/css/style.css`, `shop.css`, `responsive.css`: Template foundations.
  - Fonts: `Playfair Display`, `Jost`, `Plus Jakarta Sans`.
- **Interactivity & Plugins:** Owl Carousel (sliders), AOS (scroll animations), Magnific Popup (lightbox galleries).
- **Backend Runtime:** Node.js (v24.x) runtime with built-in HTTP server (`server.js`) and native `node:sqlite` database support.
- **Serverless Integration:** Vercel edge configuration (`vercel.json`) with Node.js serverless handler (`api/contact-form.js`).
- **PHP Legacy Endpoint:** `contact-form.php` (retained for backward compatibility).

### 2.2 Directory & Asset Structure
```
ContriveFurnitureStore/
├── index.html, shop.html, product-detail.html, cart.html, checkout.html, ... (Root level pages)
├── contrive/ (Mirrored legacy directory for backwards compatibility)
├── api/
│   └── contact-form.js (Vercel serverless contact endpoint)
├── assets/
│   ├── css/ (woodora.css, style.css, shop.css, responsive.css, aos.css, ...)
│   ├── js/ (woodora.js, jquery-3.7.1.min.js, bootstrap.min.js, ...)
│   └── images/ (logo.svg, product photography, lookbooks, favicon suite, ...)
├── Documentation/
│   └── doc.html (Original theme documentation)
├── server.js (Node.js web server and static asset streamer)
├── vercel.json (Clean URL routing & API rewrites)
├── README.md & PROJECT.md
```

---

## 3. Reusable Assets & Preserved Functional Modules

The following elements are well-crafted and are preserved and expanded throughout the transformation:
1. **Brand Identity & Color Tokens:**
   - Forest Green (`#263D32`), Warm Cream (`#F7F4EE`), Walnut Brown (`#805B42`), Soft Beige (`#E8DED0`), Dark Charcoal (`#252525`), Antique Gold (`#C8A882`).
2. **High-Definition Curated Photography:**
   - Curated architectural interior photography from Unsplash, covering solid oak sofas, live-edge dining tables, velvet lounge chairs, platform beds, and showroom lookbooks.
3. **Custom Vector Logo Suite:**
   - Vector emblems (`logo.svg`, `footer-logo.svg`) and multi-resolution favicons.
4. **Interactive UI Components in `woodora.js`:**
   - Client-side finish swatches (Forest Green, Walnut Brown, Warm Cream, Charcoal Black).
   - Dynamic sofa sizing configurations ($780, $620, $1,240).
   - In-page Private Access modal and toast alert messaging.
   - Verified review submission modal and dynamic lookbook article loaders.

---

## 4. Critical Architecture & Security Deficiencies Identified

The audit revealed the following core architectural limitations:

### 4.1 Client-Side Only Persistence (Security & Integrity Risk)
- **Problem:** User accounts, cart items, wishlists, and coupon application were previously tracked primarily in browser `localStorage`.
- **Risk:** Sensitive operations (price calculations, order totals, discount eligibility, customer credentials) must never rely on untrusted client state. Any user could manipulate cart totals or order references in the browser console.
- **Requirement:** Establish authoritative server-side persistence using Node's native SQLite database, where orders, inventory, pricing, and user sessions are cryptographically validated and strictly enforced on the server.

### 4.2 Incomplete Customer Account Area
- **Problem:** Customers lacked dedicated portal pages to view historical orders, track fulfillment status, manage saved shipping addresses, or access their saved wishlist.
- **Requirement:** Implement `account.html`, `my-orders.html`, `my-wishlist.html`, and `profile.html` seamlessly wired to authenticated customer session APIs.

### 4.3 Missing Administration & Business Operations Portal
- **Problem:** There was no back-office administrative interface for store managers to update product stock, process incoming orders, confirm showroom appointment requests, or review customer inquiries.
- **Requirement:** Build a dedicated administration portal (`admin-login.html`, `admin-dashboard.html`, `admin-products.html`, `admin-orders.html`, `admin-customers.html`, `admin-inquiries.html`, `admin-appointments.html`, `admin-coupons.html`) backed by administrative authentication and activity logs.

### 4.4 Password Security & Authentication
- **Problem:** Initial demonstration authentication stored passwords in plaintext in client memory or mock arrays.
- **Requirement:** Upgrade to salted PBKDF2/SHA-256 cryptographic password hashing on the server, issue secure signed session tokens, and enforce role-based access control (Homeowner, Trade Architect, Hospitality, Administrator).

### 4.5 Business Calculation Centralization
- **Problem:** Tax (5%), shipping threshold ($250 for free White Glove delivery), and promotional coupon calculations (`WOODORA10` for 10% off) must be calculated on the backend during order creation to prevent tampered totals.

---

## 5. Formal Transformation Roadmap

| Phase | Domain | Implementation Targets |
| :--- | :--- | :--- |
| **Phase 1** | Repository Audit | Complete architecture audit (this document) and roadmap definition. |
| **Phase 2** | Design System | Brand token standardization, unified navigation, and responsive typography. |
| **Phase 3** | Customer Website | Refine `index.html` (16 sections), `shop.html`, `product-detail.html`, `about.html`, `services.html`, `portfolio.html`, `team.html`, `contact.html`, and `faq.html`. |
| **Phase 4** | Authentication | Server-side registration, login, role assignment, token sessions, and shopping access guard. |
| **Phase 5** | Shopping Engine | Dynamic swatches, configurations, backend cart sync, server-side coupon validation, and multi-step checkout. |
| **Phase 6** | Backend & Database | Native SQLite database engine (`server/database.js`), comprehensive schema, and REST API controllers (`/api/*`). |
| **Phase 7** | Administration Portal | Admin dashboard, inventory management, order fulfillment transitions, customer oversight, and appointment confirmations. |
| **Phase 8** | Customer Account | Customer account dashboard, order history, wishlist management, and profile settings. |
| **Phase 9** | Quality Assurance | Verification of all 7 core business journeys, responsive layout testing, and error-free execution. |
| **Phase 10** | Documentation & Handover | Complete `README.md`, `PROJECT.md`, `.env.example`, and final delivery report. |
