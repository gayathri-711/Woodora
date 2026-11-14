# WOODORA – Premium Furniture E-Commerce Platform

> **Crafted for Comfort. Designed for Life.**  
> A luxury, modern furniture brand and e-commerce living platform inspired by timeless Scandinavian aesthetics, Japanese joinery traditions, and European sustainable hardwoods.

---

## Brand Identity & Aesthetic System

WOODORA is built upon natural materials, architectural balance, and artisanal craftsmanship.

### Color Palette
- **Forest Green (`#263D32`)**: Primary brand identity, luxury headings, primary buttons.
- **Warm Cream (`#F7F4EE`)**: Clean, inviting section backgrounds and contrast cards.
- **Walnut Brown (`#805B42`)**: Rich accent details, badges, and hover states.
- **Soft Beige (`#E8DED0`)**: Architectural dividers, subtle borders, and structural framing.
- **Dark Charcoal (`#252525`)**: High-contrast, legible typography.
- **Antique Gold (`#C8A882`)**: Privileged ribbons, review stars, and refined highlights.

### Typography
- **Serif Headings**: `Playfair Display` & `Jost` for timeless artisan luxury.
- **Modern Sans UI**: `Plus Jakarta Sans` for crisp legibility and high-converting e-commerce interactions.

---

## Key Features & User Experience

### 1. 16-Part Editorial Homepage (`index.html`)
- **Announcement Bar**: Seasonal promotions and multi-currency/language indicators.
- **Navigation Bar**: Responsive WOODORA logo, dynamic cart count badge, live user authentication pill, and dropdowns.
- **Hero Carousel**: High-definition interior living photography with smooth slide transitions and clear CTA buttons.
- **Curated Category Grid**: 8 categories (Sofas, Chairs, Beds, Dining Tables, Wardrobes, Coffee Tables, Office Furniture, Home Decor) with zoom hover effects.
- **Bestsellers & New Arrivals**: Modern product cards with ratings, discount ribbons, quick Add to Cart, and Wishlist toggles.
- **Sustainable Forestry Showcase**: Certified French white oak and American walnut sourcing with zero-VOC finishes.
- **Atelier Lookbooks**: Real architectural interior projects (Stockholm Penthouse, Kyoto Zen Pavilion, Cotswolds Estate, Tribeca Loft).
- **Verified Client Reviews**: Testimonials from homeowners and interior architects.
- **VIP Newsletter**: Privilege access with welcome discount.
- **Footer**: Detailed showroom directories, concierge contacts, payment trust badges, and legal links.

### 2. Client Authentication & Shopping Access Gate
- **Shopping Guard**: Visitors browsing the catalog must be registered and signed in to add items to their shopping cart, save items to their personal wishlist, or proceed to checkout.
- **Interactive Auth Modal (`#woodora-auth-modal`)**: If a guest clicks any shopping action, an in-page modal appears with the exact intent message and seamless 1-click test sign-in.
- **Dedicated Split-Screen Portals**:
  - `login.html`: Editorial photography split-screen with instant demo sign-in buttons.
  - `join-now.html`: Client registration capturing role (Homeowner, Trade Architect, Hospitality) with automatic 10% coupon code (`WOODORA10`).
- **Pre-Configured Demo Accounts**:
  - **Julian Sterling**: `julian@woodora.com` | `password123` *(Homeowner / Collector)*
  - **Eleanor Vance**: `eleanor@woodora.com` | `password123` *(Interior Architect - Trade)*

### 3. Product Catalog & Live Filtering (`shop.html`)
- **Category Filters**: Filter on-the-fly across 8 furniture categories.
- **Interactive Price Range Slider**: Dual-range price filtering ($0 to $2,000).
- **Instant Search**: Real-time product search by keyword and timber type.
- **Sorting**: Price Low-to-High, Price High-to-Low, and Alphabetical (A–Z).

### 4. Interactive Product Detail Engine (`product-detail.html`)
- **Multi-Angle Gallery**: High-definition thumbnail switcher.
- **Dynamic Finish Swatches**: Clicking upholstery swatches (*Forest Green, Walnut Brown, Warm Cream, Charcoal Black*) dynamically switches the main hero image and updates finish labels.
- **Configuration & Dimension Pricing**:
  - `3-Seater (220cm)`: $780.00
  - `2-Seater (175cm)`: $620.00
  - `Sectional + Chaise`: $1,240.00
- **Technical Specifications**: Tabs for Dimensions & Materials, Care Instructions, and White Glove Delivery.

### 5. Shopping Cart & Checkout Workflow (`cart.html` & `checkout.html`)
- Real-time cart synchronization using browser `localStorage`.
- Line item quantity adjusters (`+` / `-`) and animated item removal.
- Privilege Coupon Code Engine (`WOODORA10` for 10% off).
- Automatic calculation of subtotal, 5% estimated tax, White Glove delivery (Free over $250), and total.
- Authenticated Checkout portal pre-filling user name and email.
- Branded Order Confirmation (`thank-you.html`) with dynamic order reference generation.

### 6. Showroom Appointments & Inquiries (`contact.html`)
- Interactive Showroom Appointment reservation modal.
- PHP Backend integration (`contact-form.php`) with input sanitization and JSON AJAX response.

---

## Technology Stack

- **Markup & Layout**: HTML5, Semantic Elements, CSS3, Flexbox, CSS Grid
- **Framework**: Bootstrap 4.6
- **Typography & Icons**: Google Fonts (Playfair Display, Plus Jakarta Sans, Jost), Font Awesome 6.5.1
- **Animations & Sliders**: AOS (Animate on Scroll), Owl Carousel 2
- **Client Scripting**: JavaScript (ES6+), jQuery 3.7.1
- **Custom Engines**:
  - `contrive/assets/css/woodora.css` – Brand tokens, responsive media queries, card styles, modal components.
  - `contrive/assets/js/woodora.js` – Auth subsystem, shopping guard, cart/wishlist engine, dynamic swatches, and toasts.
- **Backend**: Node.js static & mock server (`server.js`) and PHP endpoint (`contact-form.php`).

---

## Local Development & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/gayathri-711/Woodora.git
cd Woodora
```

### 2. Start the Local Server
Using Node.js:
```bash
node server.js
```
The server will start at **`http://localhost:8000/`**.

Or using any standard static file server / PHP development server:
```bash
# Using PHP built-in server:
php -S localhost:8000 -t contrive
```

### 3. Open in Browser
Visit **[http://localhost:8000/](http://localhost:8000/)** to explore the complete WOODORA living collection.

---

## Repository Structure

```
Woodora/
├── contrive/                     # Main Web Root Directory
│   ├── index.html                # 16-Section Brand Homepage
│   ├── shop.html                 # 8-Category Filterable Catalog
│   ├── product-detail.html       # Dynamic Swatch & Gallery Details
│   ├── cart.html                 # Real-time Shopping Cart & Math
│   ├── checkout.html             # Secure Authenticated Checkout
│   ├── thank-you.html            # Order Confirmation & Summary
│   ├── login.html                # Split-Screen Client Sign In
│   ├── join-now.html             # Client Registration Portal
│   ├── about.html                # Heritage & Sustainability Pillars
│   ├── services.html             # Bespoke Joinery & Concierge
│   ├── portfolio.html            # Architectural Residential Lookbooks
│   ├── team.html                 # Master Joiners & Artisans
│   ├── contact.html              # Showroom Consultations & Form
│   ├── faq.html                  # Guarantees & Care Guides
│   ├── contact-form.php          # PHP Form Processing Endpoint
│   └── assets/
│       ├── css/
│       │   ├── woodora.css       # Complete Custom Luxury Styling
│       │   └── style.css         # Template Framework
│       ├── js/
│       │   ├── woodora.js        # Auth, Cart, Swatches & Filtering
│       │   └── custom.js         # Navigation & Sliders
│       └── images/               # Vectors, Logos, Favicons, Photos
├── Documentation/                # Original Asset Notes
├── PROJECT.md                    # Project Architecture Overview
├── server.js                     # High-Performance Local Node Server
└── README.md                     # Repository Documentation
```

---

## License & Credits

Designed and developed for **WOODORA Atelier**. All rights reserved.  
Photography licensed via Unsplash for architectural concept and e-commerce presentation.
