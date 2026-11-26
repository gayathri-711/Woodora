/**
 * WOODORA Database Engine & Schema
 * Uses Node.js native `node:sqlite` for persistent, zero-dependency database storage.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'woodora.sqlite');
const db = new DatabaseSync(DB_PATH);

// Enable foreign keys and WAL mode for high reliability
db.exec('PRAGMA foreign_keys = ON;');

/**
 * Initialize all database tables
 */
function initSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            phone TEXT,
            role TEXT NOT NULL DEFAULT 'Homeowner',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS customer_profiles (
            user_id INTEGER PRIMARY KEY,
            company_name TEXT,
            tax_id TEXT,
            trade_tier TEXT,
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS addresses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            address_line TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            postal_code TEXT NOT NULL,
            country TEXT NOT NULL,
            is_default INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            slug TEXT NOT NULL UNIQUE,
            description TEXT,
            image_url TEXT
        );

        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            slug TEXT NOT NULL,
            category_id INTEGER NOT NULL,
            price REAL NOT NULL,
            old_price REAL,
            rating REAL DEFAULT 5.0,
            reviews_count INTEGER DEFAULT 0,
            stock INTEGER NOT NULL DEFAULT 25,
            is_bestseller INTEGER DEFAULT 0,
            is_new_arrival INTEGER DEFAULT 0,
            description TEXT,
            dimensions TEXT,
            materials TEXT,
            care_instructions TEXT,
            image_url TEXT NOT NULL,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );

        CREATE TABLE IF NOT EXISTS product_variants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id TEXT NOT NULL,
            finish_name TEXT NOT NULL,
            finish_color TEXT NOT NULL,
            configuration_name TEXT,
            price_modifier REAL DEFAULT 0,
            image_url TEXT,
            stock INTEGER DEFAULT 15,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS carts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            session_id TEXT UNIQUE,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cart_id INTEGER NOT NULL,
            product_id TEXT NOT NULL,
            finish_color TEXT,
            configuration TEXT,
            quantity INTEGER NOT NULL DEFAULT 1,
            unit_price REAL NOT NULL,
            FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS wishlists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, product_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS coupons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE COLLATE NOCASE,
            discount_percent REAL NOT NULL,
            min_order_amount REAL DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            expires_at DATETIME
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_reference TEXT NOT NULL UNIQUE,
            user_id INTEGER,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT,
            shipping_address TEXT NOT NULL,
            subtotal REAL NOT NULL,
            discount REAL DEFAULT 0,
            tax REAL NOT NULL,
            shipping_fee REAL DEFAULT 0,
            grand_total REAL NOT NULL,
            payment_method TEXT NOT NULL,
            payment_status TEXT NOT NULL DEFAULT 'Paid (Simulated)',
            fulfillment_status TEXT NOT NULL DEFAULT 'Confirmed',
            delivery_instructions TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id TEXT NOT NULL,
            title TEXT NOT NULL,
            finish_color TEXT,
            configuration TEXT,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            line_total REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            inquiry_type TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'New',
            internal_notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            showroom_location TEXT NOT NULL,
            preferred_date TEXT NOT NULL,
            preferred_time TEXT NOT NULL,
            notes TEXT,
            status TEXT NOT NULL DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            consent INTEGER DEFAULT 1,
            source TEXT DEFAULT 'Website Footer',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS product_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id TEXT NOT NULL,
            user_name TEXT NOT NULL,
            user_email TEXT NOT NULL,
            rating REAL NOT NULL,
            title TEXT,
            comment TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Approved',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            expires_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS admin_activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_user_id INTEGER,
            action TEXT NOT NULL,
            target_type TEXT,
            target_id TEXT,
            details TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

/**
 * Hash password with PBKDF2
 */
function hashPassword(password, salt) {
    if (!salt) {
        salt = crypto.randomBytes(16).toString('hex');
    }
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return { hash, salt };
}

/**
 * Seed initial database records
 */
function seedDatabase() {
    // Check if categories already exist
    const catCheck = db.prepare('SELECT COUNT(*) as count FROM categories').get();
    if (catCheck.count > 0) return; // already seeded

    console.log('[WOODORA Database] Seeding initial store data...');

    // 1. Seed Categories
    const categories = [
        { name: 'Sofas', slug: 'sofas', description: 'Architectural lounge suites and Scandinavian daybeds', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' },
        { name: 'Chairs', slug: 'chairs', description: 'Ergonomic artisan dining and velvet accent chairs', image: 'https://images.unsplash.com/photo-1580481077197-2eb102d53c6c?auto=format&fit=crop&w=800&q=80' },
        { name: 'Beds', slug: 'beds', description: 'Japanese low platform beds and upholstered bed frames', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80' },
        { name: 'Dining Tables', slug: 'dining-tables', description: 'Live-edge solid walnut and French oak dining tables', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80' },
        { name: 'Wardrobes', slug: 'wardrobes', description: 'Minimalist solid oak storage systems and armoires', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80' },
        { name: 'Coffee Tables', slug: 'coffee-tables', description: 'Carrara marble and fluted timber accent centerpieces', image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80' },
        { name: 'Office Furniture', slug: 'office-furniture', description: 'Executive timber desks and architectural shelving', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80' },
        { name: 'Home Decor', slug: 'home-decor', description: 'Artisanal ceramics, woven wool throws, and lamps', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80' }
    ];

    const insertCat = db.prepare('INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)');
    categories.forEach(c => insertCat.run(c.name, c.slug, c.description, c.image));

    // 2. Seed Products
    const products = [
        {
            id: 'wdr-1',
            title: 'Nordic Minimalist Oak Sofa',
            slug: 'nordic-minimalist-oak-sofa',
            category_id: 1, // Sofas
            price: 780.00,
            old_price: 950.00,
            rating: 4.9,
            reviews_count: 142,
            stock: 35,
            is_bestseller: 1,
            is_new_arrival: 0,
            description: 'Handcrafted from FSC-certified French White Oak with premium down-blend feather cushions and Belgian linen upholstery. Engineered for generational durability with mortise and tenon joinery.',
            dimensions: 'Width: 220cm | Depth: 95cm | Height: 78cm | Seat Height: 44cm',
            materials: 'Solid French White Oak, High-Resilience Eco Foam, 100% Belgian Linen Upholstery',
            care_instructions: 'Vacuum gently with upholstery attachment. Spot clean with mild solvent-free cleaner. Treat timber with natural beeswax bi-annually.',
            image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'wdr-2',
            title: 'Artisan Solid Walnut Dining Table',
            slug: 'artisan-solid-walnut-dining-table',
            category_id: 4, // Dining Tables
            price: 640.00,
            old_price: 820.00,
            rating: 5.0,
            reviews_count: 98,
            stock: 20,
            is_bestseller: 1,
            is_new_arrival: 0,
            description: 'A striking statement dining piece sculpted from sustainably harvested American Walnut. Features subtle chamfered edges, exposed dowel details, and an organic natural oil matte finish.',
            dimensions: 'Length: 200cm | Width: 95cm | Height: 75cm (Seats 6-8 comfortably)',
            materials: 'Solid American Black Walnut, Zero-VOC Organic Hardwax Oil finish',
            care_instructions: 'Wipe down with a damp lint-free cloth. Use coasters for hot vessels. Reapply wood balm every 6 to 12 months.',
            image_url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'wdr-3',
            title: 'Ergonomic Velvet Lounge Chair',
            slug: 'ergonomic-velvet-lounge-chair',
            category_id: 2, // Chairs
            price: 320.00,
            old_price: 420.00,
            rating: 4.8,
            reviews_count: 64,
            stock: 40,
            is_bestseller: 0,
            is_new_arrival: 1,
            description: 'Sculptural lounge chair featuring contoured ergonomic lumbar support, hand-stitched matte cotton velvet, and reinforced walnut-stained ash wood legs.',
            dimensions: 'Width: 78cm | Depth: 82cm | Height: 84cm | Seat Height: 42cm',
            materials: 'Solid Ash frame, Cotton Velvet, High-Density Cushioning, Brushed Brass accents',
            care_instructions: 'Brush lightly with a velvet brush. Avoid direct continuous sunlight exposure.',
            image_url: 'https://images.unsplash.com/photo-1580481077197-2eb102d53c6c?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'wdr-4',
            title: 'Japanese Low Platform Bed',
            slug: 'japanese-low-platform-bed',
            category_id: 3, // Beds
            price: 1150.00,
            old_price: 1400.00,
            rating: 4.9,
            reviews_count: 76,
            stock: 18,
            is_bestseller: 1,
            is_new_arrival: 0,
            description: 'Inspired by traditional Japanese tatami architecture. Zero-metal interlocking timber joinery crafted with precision timber grooves. Features wide floating ledges.',
            dimensions: 'Queen (Fits 160x200cm mattress): Width 190cm, Length 230cm, Platform Height 22cm',
            materials: 'Solid French White Oak, Solid Pine internal slat foundation',
            care_instructions: 'Clean with damp cloth and dry immediately. No harsh chemical cleaners.',
            image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'wdr-5',
            title: 'Fluted Walnut Credenza & Wardrobe',
            slug: 'fluted-walnut-credenza-wardrobe',
            category_id: 5, // Wardrobes
            price: 920.00,
            old_price: 1150.00,
            rating: 4.7,
            reviews_count: 42,
            stock: 15,
            is_bestseller: 0,
            is_new_arrival: 1,
            description: 'Architectural fluted timber doors concealing generous bespoke wardrobe organization. Push-to-open soft closing European Blum hinges with solid bronze hardware.',
            dimensions: 'Width: 160cm | Depth: 55cm | Height: 120cm',
            materials: 'Solid Walnut tambour slatted fronts, Walnut veneer carcass, solid brass pulls',
            care_instructions: 'Dust fluted slats with micro-fiber duster. Maintain humidity between 40-60%.',
            image_url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'wdr-6',
            title: 'Carrara Marble & Oak Coffee Table',
            slug: 'carrara-marble-oak-coffee-table',
            category_id: 6, // Coffee Tables
            price: 450.00,
            old_price: 580.00,
            rating: 5.0,
            reviews_count: 89,
            stock: 28,
            is_bestseller: 1,
            is_new_arrival: 0,
            description: 'Genuine honed Italian Carrara marble resting on a tripod solid French oak pedestal base. Each stone top exhibits unique organic grey feather veining.',
            dimensions: 'Diameter: 90cm | Height: 40cm | Marble thickness: 20mm',
            materials: 'Honed Italian Carrara Marble, Solid French Oak base',
            care_instructions: 'Sealed with food-safe stone protector. Clean spills immediately to avoid acid etching.',
            image_url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'wdr-7',
            title: 'Architectural Oak Executive Desk',
            slug: 'architectural-oak-executive-desk',
            category_id: 7, // Office Furniture
            price: 890.00,
            old_price: 1100.00,
            rating: 4.9,
            reviews_count: 38,
            stock: 12,
            is_bestseller: 0,
            is_new_arrival: 1,
            description: 'Minimalist study desk engineered for timeless focus. Includes hidden magnetic cable management channel, solid oak drawers, and leather-lined stationery tray.',
            dimensions: 'Width: 150cm | Depth: 70cm | Height: 75cm',
            materials: 'Solid French White Oak, Top-grain Saddle Leather drawer inlay',
            care_instructions: 'Condition leather with saddle balm. Wipe oak with soft dry cloth.',
            image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'wdr-8',
            title: 'Sculptural Ceramic Vessel & Lamp',
            slug: 'sculptural-ceramic-vessel-lamp',
            category_id: 8, // Home Decor
            price: 180.00,
            old_price: 240.00,
            rating: 4.9,
            reviews_count: 112,
            stock: 50,
            is_bestseller: 1,
            is_new_arrival: 0,
            description: 'Hand-thrown stoneware lamp featuring rough chamotte clay texture, warm linen shade, and hand-finished antique brass rotary switch with dimmable warm LED.',
            dimensions: 'Base Diameter: 24cm | Total Height: 48cm | Shade Diameter: 35cm',
            materials: 'Hand-thrown Stoneware, Belgian Natural Linen shade, Brass hardware',
            care_instructions: 'Unplug before cleaning. Dust shade with dry lint brush.',
            image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80'
        }
    ];

    const insertProd = db.prepare(`
        INSERT INTO products (id, title, slug, category_id, price, old_price, rating, reviews_count, stock, is_bestseller, is_new_arrival, description, dimensions, materials, care_instructions, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    products.forEach(p => {
        insertProd.run(p.id, p.title, p.slug, p.category_id, p.price, p.old_price, p.rating, p.reviews_count, p.stock, p.is_bestseller, p.is_new_arrival, p.description, p.dimensions, p.materials, p.care_instructions, p.image_url);
    });

    // 3. Seed Users
    const insertUser = db.prepare(`
        INSERT INTO users (name, email, password_hash, salt, phone, role)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    // Julian Sterling (Homeowner)
    const julianAuth = hashPassword('password123');
    const julianResult = insertUser.run('Julian Sterling', 'julian@woodora.com', julianAuth.hash, julianAuth.salt, '+1 (555) 342-8921', 'Homeowner');

    // Eleanor Vance (Trade Architect)
    const eleanorAuth = hashPassword('password123');
    const eleanorResult = insertUser.run('Eleanor Vance', 'eleanor@woodora.com', eleanorAuth.hash, eleanorAuth.salt, '+1 (555) 781-4502', 'Trade Architect');

    // Administrator
    const adminAuth = hashPassword('admin123');
    insertUser.run('WOODORA Administrator', 'admin@woodora.com', adminAuth.hash, adminAuth.salt, '+1 (555) 900-1000', 'Administrator');

    // 4. Seed Customer Profiles & Addresses
    const insertProfile = db.prepare(`INSERT INTO customer_profiles (user_id, company_name, tax_id, trade_tier, notes) VALUES (?, ?, ?, ?, ?)`);
    insertProfile.run(Number(julianResult.lastInsertRowid), null, null, 'Private Collector', 'Prefers white oak finishes with neutral linen');
    insertProfile.run(Number(eleanorResult.lastInsertRowid), 'Vance Studio Architecture', 'US-TRADE-891024', 'Trade Partner (Tier 1)', 'Authorized for trade commercial discount');

    const insertAddr = db.prepare(`INSERT INTO addresses (user_id, address_line, city, state, postal_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, 1)`);
    insertAddr.run(Number(julianResult.lastInsertRowid), '742 Evergreen Terrace', 'Springfield', 'OR', '97477', 'United States');
    insertAddr.run(Number(eleanorResult.lastInsertRowid), '120 Franklin St, Studio 4B', 'New York', 'NY', '10013', 'United States');

    // 5. Seed Welcome Coupon
    const insertCoupon = db.prepare(`INSERT INTO coupons (code, discount_percent, min_order_amount, is_active, expires_at) VALUES (?, ?, ?, ?, ?)`);
    insertCoupon.run('WOODORA10', 10.0, 100.0, 1, '2028-12-31 23:59:59');
    insertCoupon.run('ARCHITECT15', 15.0, 500.0, 1, '2028-12-31 23:59:59');

    // 6. Seed Sample Orders for Julian & Eleanor
    const insertOrder = db.prepare(`
        INSERT INTO orders (order_reference, user_id, customer_name, customer_email, customer_phone, shipping_address, subtotal, discount, tax, shipping_fee, grand_total, payment_method, payment_status, fulfillment_status, delivery_instructions, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertOrderItem = db.prepare(`
        INSERT INTO order_items (order_id, product_id, title, finish_color, configuration, quantity, unit_price, line_total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const orderRef1 = 'WDR-2026-90412';
    const o1 = insertOrder.run(
        orderRef1,
        Number(julianResult.lastInsertRowid),
        'Julian Sterling',
        'julian@woodora.com',
        '+1 (555) 342-8921',
        '742 Evergreen Terrace, Springfield, OR 97477, United States',
        1420.00,
        142.00,
        63.90,
        0.00,
        1341.90,
        'Credit Card (Stripe)',
        'Paid (Verified)',
        'Delivered',
        'Please call 30 minutes before arrival. White Glove assembly in 2nd-floor living room.',
        '2026-10-15 14:32:00'
    );
    insertOrderItem.run(Number(o1.lastInsertRowid), 'wdr-1', 'Nordic Minimalist Oak Sofa', 'Forest Green', '3-Seater (220cm)', 1, 780.00, 780.00);
    insertOrderItem.run(Number(o1.lastInsertRowid), 'wdr-2', 'Artisan Solid Walnut Dining Table', 'Walnut Brown', '200cm standard', 1, 640.00, 640.00);

    const orderRef2 = 'WDR-2026-90884';
    const o2 = insertOrder.run(
        orderRef2,
        Number(julianResult.lastInsertRowid),
        'Julian Sterling',
        'julian@woodora.com',
        '+1 (555) 342-8921',
        '742 Evergreen Terrace, Springfield, OR 97477, United States',
        450.00,
        45.00,
        20.25,
        0.00,
        425.25,
        'Apple Pay',
        'Paid (Verified)',
        'Shipped',
        'Gate code #4410. Place carefully in foyer.',
        '2026-11-20 09:15:00'
    );
    insertOrderItem.run(Number(o2.lastInsertRowid), 'wdr-6', 'Carrara Marble & Oak Coffee Table', 'Warm Cream', '90cm Tripod', 1, 450.00, 450.00);

    // 7. Seed Sample Inquiries & Appointments
    const insertInquiry = db.prepare(`INSERT INTO inquiries (name, email, phone, inquiry_type, message, status, internal_notes) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    insertInquiry.run('Marcus Chen', 'marcus.chen@designstudio.ca', '+1 (604) 991-2245', 'Bespoke Joinery', 'We have a luxury penthouse in Vancouver requiring a 3.4m continuous walnut dining board with matching benches. Could you provide a preliminary quote?', 'In Progress', 'Assigned to Senior Joinery Consultant Arthur Thorne');
    insertInquiry.run('Sophia Laurent', 'sophia@laurentinteriors.fr', '+33 6 45 12 89 00', 'Trade Account Request', 'Requesting trade verification for our Paris architectural bureau. We specify 40+ hospitality rooms per quarter.', 'New', 'Pending review of commercial portfolio credentials');

    const insertAppt = db.prepare(`INSERT INTO appointments (name, email, phone, showroom_location, preferred_date, preferred_time, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    insertAppt.run('Julian Sterling', 'julian@woodora.com', '+1 (555) 342-8921', 'Manhattan Atelier, NY', '2026-12-05', '14:00', 'Review fabric swatches for custom sectional suite', 'Confirmed');
    insertAppt.run('Eleanor Vance', 'eleanor@woodora.com', '+1 (555) 781-4502', 'Copenhagen Showroom, Denmark', '2026-12-12', '10:30', 'Selecting dining collection for private villa commission', 'Pending');

    // 8. Seed Newsletter Subscribers
    const insertNews = db.prepare(`INSERT INTO newsletter_subscribers (email, consent, source) VALUES (?, ?, ?)`);
    insertNews.run('julian@woodora.com', 1, 'Website Footer');
    insertNews.run('eleanor@woodora.com', 1, 'VIP Concierge');

    console.log('[WOODORA Database] Initialization and seeding complete.');
}

// Run schema initialization and seed data on startup
initSchema();
seedDatabase();

module.exports = {
    db,
    hashPassword
};
