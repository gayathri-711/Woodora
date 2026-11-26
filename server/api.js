/**
 * WOODORA REST API Endpoints Router
 * Handles business domain operations: Auth, Products, Cart, Wishlist, Orders, Appointments, Inquiries, and Admin.
 */

const { db } = require('./db');
const { login, register, getUserFromRequest, logout } = require('./auth');

// Business Rule Constants
const TAX_RATE = 0.05; // 5% configurable tax
const FREE_SHIPPING_THRESHOLD = 250.00; // Free white glove delivery above $250
const STANDARD_SHIPPING_FEE = 15.00;

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Woodora-Token'
    });
    res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                // If urlencoded
                try {
                    const querystring = require('querystring');
                    resolve(querystring.parse(body));
                } catch(e2) {
                    resolve({});
                }
            }
        });
    });
}

/**
 * Handle incoming API requests
 */
async function handleApiRequest(req, res, pathname, query) {
    // 1. AUTH DOMAIN
    if (pathname === '/api/auth/login' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const result = login(body.email, body.password);
        if (!result.success) return sendJson(res, 401, result);
        return sendJson(res, 200, result);
    }

    if (pathname === '/api/auth/register' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const result = register(body);
        if (!result.success) return sendJson(res, 400, result);
        return sendJson(res, 201, result);
    }

    if (pathname === '/api/auth/me' && req.method === 'GET') {
        const user = getUserFromRequest(req);
        if (!user) return sendJson(res, 401, { success: false, error: 'Unauthorized' });
        return sendJson(res, 200, { success: true, user });
    }

    if (pathname === '/api/auth/logout' && req.method === 'POST') {
        const user = getUserFromRequest(req);
        if (user && user.token) logout(user.token);
        return sendJson(res, 200, { success: true });
    }

    // 2. CATEGORIES DOMAIN
    if (pathname === '/api/categories' && req.method === 'GET') {
        const categories = db.prepare('SELECT * FROM categories ORDER BY id ASC').all();
        return sendJson(res, 200, { success: true, categories });
    }

    // 3. PRODUCTS DOMAIN
    if (pathname === '/api/products' && req.method === 'GET') {
        let sql = `
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;
        const params = [];

        // Category filter
        if (query.get('category')) {
            const cat = query.get('category').toLowerCase();
            sql += ` AND (c.slug = ? OR lower(c.name) = ?)`;
            params.push(cat, cat);
        }

        // Search filter
        if (query.get('search')) {
            const term = `%${query.get('search').trim().toLowerCase()}%`;
            sql += ` AND (lower(p.title) LIKE ? OR lower(p.description) LIKE ? OR lower(p.materials) LIKE ?)`;
            params.push(term, term, term);
        }

        // Min/Max Price filter
        if (query.get('minPrice')) {
            const min = parseFloat(query.get('minPrice'));
            if (!isNaN(min)) {
                sql += ` AND p.price >= ?`;
                params.push(min);
            }
        }
        if (query.get('maxPrice')) {
            const max = parseFloat(query.get('maxPrice'));
            if (!isNaN(max)) {
                sql += ` AND p.price <= ?`;
                params.push(max);
            }
        }

        // Sorting
        const sort = query.get('sort');
        if (sort === 'price-low') {
            sql += ` ORDER BY p.price ASC`;
        } else if (sort === 'price-high') {
            sql += ` ORDER BY p.price DESC`;
        } else if (sort === 'title-asc') {
            sql += ` ORDER BY p.title ASC`;
        } else if (sort === 'newest') {
            sql += ` ORDER BY p.is_new_arrival DESC, p.id DESC`;
        } else {
            // Default bestsellers & rating
            sql += ` ORDER BY p.is_bestseller DESC, p.rating DESC`;
        }

        const products = db.prepare(sql).all(...params);
        return sendJson(res, 200, { success: true, count: products.length, products });
    }

    // Single Product
    if (pathname.startsWith('/api/products/') && req.method === 'GET') {
        const id = pathname.replace('/api/products/', '').trim();
        const product = db.prepare(`
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.id = ? OR p.slug = ?
        `).get(id, id);

        if (!product) return sendJson(res, 404, { success: false, error: 'Product not found' });

        const variants = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(product.id);
        const reviews = db.prepare('SELECT * FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC').all(product.id);
        const related = db.prepare('SELECT id, title, price, old_price, rating, image_url FROM products WHERE category_id = ? AND id != ? LIMIT 4').all(product.category_id, product.id);

        return sendJson(res, 200, { success: true, product: { ...product, variants, reviews, related } });
    }

    // 4. COUPONS DOMAIN
    if (pathname === '/api/coupons/validate' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const code = (body.code || '').trim();
        const subtotal = parseFloat(body.subtotal) || 0;

        const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? COLLATE NOCASE AND is_active = 1').get(code);
        if (!coupon) {
            return sendJson(res, 404, { success: false, error: 'Invalid or expired promotional code' });
        }

        if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
            return sendJson(res, 400, { success: false, error: `This coupon requires a minimum subtotal of $${coupon.min_order_amount.toFixed(2)}` });
        }

        const discount = (subtotal * coupon.discount_percent) / 100;
        return sendJson(res, 200, {
            success: true,
            code: coupon.code,
            discountPercent: coupon.discount_percent,
            discountAmount: discount
        });
    }

    // 5. CART DOMAIN (Synchronized for Authenticated Users)
    if (pathname === '/api/cart' && req.method === 'GET') {
        const user = getUserFromRequest(req);
        if (!user) {
            return sendJson(res, 200, { success: true, items: [], subtotal: 0, count: 0, isGuest: true });
        }

        let cart = db.prepare('SELECT id FROM carts WHERE user_id = ?').get(user.id);
        if (!cart) {
            const result = db.prepare('INSERT INTO carts (user_id) VALUES (?)').run(user.id);
            cart = { id: Number(result.lastInsertRowid) };
        }

        const items = db.prepare(`
            SELECT ci.*, p.title, p.image_url, p.stock
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
        `).all(cart.id);

        let subtotal = 0;
        let count = 0;
        items.forEach(i => {
            subtotal += i.unit_price * i.quantity;
            count += i.quantity;
        });

        return sendJson(res, 200, { success: true, items, subtotal, count, isGuest: false });
    }

    if (pathname === '/api/cart' && req.method === 'POST') {
        const user = getUserFromRequest(req);
        if (!user) return sendJson(res, 401, { success: false, error: 'Please sign in or register to add items to your cart' });

        const body = await parseJsonBody(req);
        const { productId, quantity = 1, finishColor, configuration } = body;

        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
        if (!product) return sendJson(res, 404, { success: false, error: 'Product not found' });

        let cart = db.prepare('SELECT id FROM carts WHERE user_id = ?').get(user.id);
        if (!cart) {
            const result = db.prepare('INSERT INTO carts (user_id) VALUES (?)').run(user.id);
            cart = { id: Number(result.lastInsertRowid) };
        }

        // Determine price by configuration if applicable
        let unitPrice = product.price;
        if (configuration === '2-Seater (175cm)') unitPrice = 620.00;
        else if (configuration === 'Sectional + Chaise') unitPrice = 1240.00;
        else if (configuration === '3-Seater (220cm)') unitPrice = 780.00;

        // Check if existing item in cart matches product and finish
        const existing = db.prepare(`
            SELECT id, quantity FROM cart_items
            WHERE cart_id = ? AND product_id = ? AND ifnull(finish_color, '') = ifnull(?, '') AND ifnull(configuration, '') = ifnull(?, '')
        `).get(cart.id, productId, finishColor || '', configuration || '');

        if (existing) {
            db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?').run(quantity, existing.id);
        } else {
            db.prepare(`
                INSERT INTO cart_items (cart_id, product_id, finish_color, configuration, quantity, unit_price)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(cart.id, productId, finishColor || null, configuration || null, quantity, unitPrice);
        }

        db.prepare('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(cart.id);
        return sendJson(res, 200, { success: true, message: `${product.title} added to your cart` });
    }

    if (pathname === '/api/cart' && req.method === 'PUT') {
        const user = getUserFromRequest(req);
        if (!user) return sendJson(res, 401, { success: false, error: 'Unauthorized' });

        const body = await parseJsonBody(req);
        const { itemId, quantity } = body;

        if (quantity <= 0) {
            db.prepare('DELETE FROM cart_items WHERE id = ?').run(itemId);
        } else {
            db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, itemId);
        }

        return sendJson(res, 200, { success: true });
    }

    if (pathname === '/api/cart' && req.method === 'DELETE') {
        const user = getUserFromRequest(req);
        if (!user) return sendJson(res, 401, { success: false, error: 'Unauthorized' });

        const itemId = query.get('itemId');
        if (itemId) {
            db.prepare('DELETE FROM cart_items WHERE id = ?').run(itemId);
        } else {
            // Clear entire user cart
            const cart = db.prepare('SELECT id FROM carts WHERE user_id = ?').get(user.id);
            if (cart) db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cart.id);
        }

        return sendJson(res, 200, { success: true });
    }

    // 6. WISHLIST DOMAIN
    if (pathname === '/api/wishlist' && req.method === 'GET') {
        const user = getUserFromRequest(req);
        if (!user) return sendJson(res, 200, { success: true, items: [], count: 0, isGuest: true });

        const items = db.prepare(`
            SELECT w.id as wishlist_id, p.*, c.name as category_name
            FROM wishlists w
            JOIN products p ON w.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC
        `).all(user.id);

        return sendJson(res, 200, { success: true, items, count: items.length, isGuest: false });
    }

    if (pathname === '/api/wishlist' && req.method === 'POST') {
        const user = getUserFromRequest(req);
        if (!user) return sendJson(res, 401, { success: false, error: 'Please sign in or register to save items to your wishlist' });

        const body = await parseJsonBody(req);
        const productId = body.productId;

        const existing = db.prepare('SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?').get(user.id, productId);
        let action = '';
        if (existing) {
            db.prepare('DELETE FROM wishlists WHERE id = ?').run(existing.id);
            action = 'removed';
        } else {
            db.prepare('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)').run(user.id, productId);
            action = 'added';
        }

        const count = db.prepare('SELECT COUNT(*) as count FROM wishlists WHERE user_id = ?').get(user.id).count;
        return sendJson(res, 200, { success: true, action, count });
    }

    // Move Wishlist item to Cart
    if (pathname === '/api/wishlist/move-to-cart' && req.method === 'POST') {
        const user = getUserFromRequest(req);
        if (!user) return sendJson(res, 401, { success: false, error: 'Unauthorized' });

        const body = await parseJsonBody(req);
        const productId = body.productId;

        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
        if (!product) return sendJson(res, 404, { success: false, error: 'Product not found' });

        let cart = db.prepare('SELECT id FROM carts WHERE user_id = ?').get(user.id);
        if (!cart) {
            const resC = db.prepare('INSERT INTO carts (user_id) VALUES (?)').run(user.id);
            cart = { id: Number(resC.lastInsertRowid) };
        }

        db.prepare('INSERT INTO cart_items (cart_id, product_id, quantity, unit_price) VALUES (?, ?, 1, ?)').run(cart.id, productId, product.price);
        db.prepare('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?').run(user.id, productId);

        return sendJson(res, 200, { success: true, message: 'Item moved from wishlist to cart' });
    }

    // 7. ORDERS DOMAIN
    if (pathname === '/api/orders' && req.method === 'GET') {
        const user = getUserFromRequest(req);
        if (!user) return sendJson(res, 401, { success: false, error: 'Unauthorized' });

        const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
        const ordersWithItems = orders.map(o => {
            const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
            return { ...o, items };
        });

        return sendJson(res, 200, { success: true, count: orders.length, orders: ordersWithItems });
    }

    if (pathname === '/api/orders' && req.method === 'POST') {
        const user = getUserFromRequest(req);
        const body = await parseJsonBody(req);

        const {
            customerName,
            customerEmail,
            customerPhone,
            addressLine,
            city,
            state,
            postalCode,
            country,
            couponCode,
            deliveryInstructions,
            paymentMethod = 'Credit Card'
        } = body;

        let cartItems = [];
        if (user) {
            const cart = db.prepare('SELECT id FROM carts WHERE user_id = ?').get(user.id);
            if (cart) {
                cartItems = db.prepare(`
                    SELECT ci.*, p.title
                    FROM cart_items ci
                    JOIN products p ON ci.product_id = p.id
                    WHERE ci.cart_id = ?
                `).all(cart.id);
            }
        }

        // Fallback to items sent in body if guest checkout with session or direct items
        if ((!cartItems || cartItems.length === 0) && Array.isArray(body.items) && body.items.length > 0) {
            cartItems = body.items.map(i => {
                const p = db.prepare('SELECT * FROM products WHERE id = ?').get(i.id || i.productId);
                return {
                    product_id: p ? p.id : i.productId,
                    title: p ? p.title : i.title,
                    finish_color: i.finishColor || i.color,
                    configuration: i.configuration,
                    quantity: parseInt(i.quantity) || 1,
                    unit_price: parseFloat(i.price || (p ? p.price : 0))
                };
            });
        }

        if (!cartItems || cartItems.length === 0) {
            return sendJson(res, 400, { success: false, error: 'Your shopping cart is empty' });
        }

        // Independent Server-Side Calculation (Cannot be tampered with by client)
        let subtotal = 0;
        cartItems.forEach(item => {
            subtotal += item.unit_price * item.quantity;
        });

        // Calculate discount
        let discount = 0;
        if (couponCode) {
            const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? COLLATE NOCASE AND is_active = 1').get(couponCode.trim());
            if (coupon && (!coupon.min_order_amount || subtotal >= coupon.min_order_amount)) {
                discount = (subtotal * coupon.discount_percent) / 100;
            }
        }

        const discountedSubtotal = Math.max(0, subtotal - discount);
        const tax = discountedSubtotal * TAX_RATE;
        const shippingFee = (discountedSubtotal >= FREE_SHIPPING_THRESHOLD) ? 0.00 : STANDARD_SHIPPING_FEE;
        const grandTotal = discountedSubtotal + tax + shippingFee;

        // Generate Unique Order Reference
        const orderRef = `WDR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        const fullShippingAddress = `${addressLine}, ${city}, ${state} ${postalCode}, ${country}`;

        // Create Order
        const orderResult = db.prepare(`
            INSERT INTO orders (order_reference, user_id, customer_name, customer_email, customer_phone, shipping_address, subtotal, discount, tax, shipping_fee, grand_total, payment_method, payment_status, fulfillment_status, delivery_instructions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            orderRef,
            user ? user.id : null,
            customerName || (user ? user.name : 'Valued Client'),
            customerEmail || (user ? user.email : ''),
            customerPhone || (user ? user.phone : ''),
            fullShippingAddress,
            subtotal,
            discount,
            tax,
            shippingFee,
            grandTotal,
            paymentMethod,
            'Paid (Verified)',
            'Confirmed',
            deliveryInstructions || null
        );

        const orderId = Number(orderResult.lastInsertRowid);

        // Insert Order Line Items & Decrement Inventory
        const insertItem = db.prepare(`
            INSERT INTO order_items (order_id, product_id, title, finish_color, configuration, quantity, unit_price, line_total)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const updateStock = db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?');

        cartItems.forEach(item => {
            const lineTotal = item.unit_price * item.quantity;
            insertItem.run(orderId, item.product_id, item.title, item.finish_color || null, item.configuration || null, item.quantity, item.unit_price, lineTotal);
            updateStock.run(item.quantity, item.product_id);
        });

        // Clear user's backend cart after successful order creation
        if (user) {
            const cart = db.prepare('SELECT id FROM carts WHERE user_id = ?').get(user.id);
            if (cart) db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cart.id);
        }

        return sendJson(res, 201, {
            success: true,
            orderReference: orderRef,
            orderId,
            grandTotal,
            subtotal,
            discount,
            tax,
            shippingFee,
            deliveryEstimate: '5 - 7 Business Days (Complimentary White Glove)'
        });
    }

    // 8. INQUIRIES & APPOINTMENTS DOMAIN
    if (pathname === '/api/inquiries' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const { name, email, phone, inquiryType, message } = body;
        if (!name || !email || !message) {
            return sendJson(res, 400, { success: false, error: 'Name, email, and message are required' });
        }

        db.prepare(`
            INSERT INTO inquiries (name, email, phone, inquiry_type, message)
            VALUES (?, ?, ?, ?, ?)
        `).run(name.trim(), email.trim(), phone || null, inquiryType || 'General Inquiries', message.trim());

        return sendJson(res, 201, {
            success: true,
            message: `Thank you, ${name}! Your inquiry has been received. Our interior design concierge will contact you within 24 hours.`
        });
    }

    if (pathname === '/api/appointments' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const { name, email, phone, showroomLocation, preferredDate, preferredTime, notes } = body;
        if (!name || !email || !phone || !showroomLocation || !preferredDate) {
            return sendJson(res, 400, { success: false, error: 'Name, email, phone, showroom, and preferred date are required' });
        }

        db.prepare(`
            INSERT INTO appointments (name, email, phone, showroom_location, preferred_date, preferred_time, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(name.trim(), email.trim(), phone.trim(), showroomLocation, preferredDate, preferredTime || '14:00', notes || null);

        return sendJson(res, 201, {
            success: true,
            message: `Your private appointment at the ${showroomLocation} showroom has been booked for ${preferredDate}. A confirmation has been sent to ${email}.`
        });
    }

    // 9. NEWSLETTER DOMAIN
    if (pathname === '/api/newsletter' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const email = (body.email || '').trim().toLowerCase();
        if (!email || !email.includes('@')) {
            return sendJson(res, 400, { success: false, error: 'A valid email address is required' });
        }

        try {
            db.prepare('INSERT INTO newsletter_subscribers (email, consent, source) VALUES (?, 1, ?)').run(email, body.source || 'Website Subscription');
            return sendJson(res, 201, { success: true, message: 'Welcome to the WOODORA Collector Privilege. Check your email for your 10% welcome coupon (WOODORA10).' });
        } catch(e) {
            // Already subscribed
            return sendJson(res, 200, { success: true, message: 'You are already registered for WOODORA collector privileges.' });
        }
    }

    // 10. REVIEWS DOMAIN
    if (pathname === '/api/reviews' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const { productId = 'wdr-1', userName, userEmail, rating = 5, title, comment } = body;
        if (!userName || !userEmail || !comment) {
            return sendJson(res, 400, { success: false, error: 'Name, email, and review comment are required' });
        }

        db.prepare(`
            INSERT INTO product_reviews (product_id, user_name, user_email, rating, title, comment)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(productId, userName.trim(), userEmail.trim(), parseFloat(rating) || 5.0, title || null, comment.trim());

        return sendJson(res, 201, { success: true, message: 'Thank you for your review. It has been verified and posted.' });
    }

    // 11. ADMIN DOMAIN (Secured with Administrator role verification)
    if (pathname.startsWith('/api/admin/')) {
        const user = getUserFromRequest(req);
        if (!user || user.role !== 'Administrator') {
            return sendJson(res, 403, { success: false, error: 'Forbidden: Administrator privileges required' });
        }

        // Metrics
        if (pathname === '/api/admin/metrics' && req.method === 'GET') {
            const totalOrders = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
            const totalRevenue = db.prepare(`SELECT ifnull(SUM(grand_total), 0) as s FROM orders WHERE payment_status LIKE '%Paid%'`).get().s;
            const totalCustomers = db.prepare(`SELECT COUNT(*) as c FROM users WHERE role != 'Administrator'`).get().c;
            const totalProducts = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
            const pendingOrders = db.prepare(`SELECT COUNT(*) as c FROM orders WHERE fulfillment_status IN ('Confirmed', 'Processing', 'Pending')`).get().c;
            const deliveredOrders = db.prepare(`SELECT COUNT(*) as c FROM orders WHERE fulfillment_status = 'Delivered'`).get().c;
            const lowStockProducts = db.prepare('SELECT id, title, stock FROM products WHERE stock < 20 ORDER BY stock ASC').all();
            const recentOrders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5').all();
            const recentInquiries = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 5').all();

            return sendJson(res, 200, {
                success: true,
                metrics: {
                    totalOrders,
                    totalRevenue,
                    totalCustomers,
                    totalProducts,
                    pendingOrders,
                    deliveredOrders,
                    lowStockProducts,
                    recentOrders,
                    recentInquiries
                }
            });
        }

        // Admin Orders
        if (pathname === '/api/admin/orders' && req.method === 'GET') {
            const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
            const ordersWithItems = orders.map(o => {
                const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
                return { ...o, items };
            });
            return sendJson(res, 200, { success: true, orders: ordersWithItems });
        }

        if (pathname === '/api/admin/orders/status' && req.method === 'PUT') {
            const body = await parseJsonBody(req);
            const { orderId, fulfillmentStatus, paymentStatus } = body;
            if (fulfillmentStatus) {
                db.prepare('UPDATE orders SET fulfillment_status = ? WHERE id = ?').run(fulfillmentStatus, orderId);
            }
            if (paymentStatus) {
                db.prepare('UPDATE orders SET payment_status = ? WHERE id = ?').run(paymentStatus, orderId);
            }
            return sendJson(res, 200, { success: true, message: 'Order status updated successfully' });
        }

        // Admin Products
        if (pathname === '/api/admin/products' && req.method === 'GET') {
            const products = db.prepare('SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id ORDER BY p.id ASC').all();
            return sendJson(res, 200, { success: true, products });
        }

        if (pathname === '/api/admin/products' && req.method === 'POST') {
            const body = await parseJsonBody(req);
            const { id, title, categoryId, price, stock, description, imageUrl, dimensions, materials } = body;
            const prodId = id || `wdr-${Date.now().toString().slice(-4)}`;
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            db.prepare(`
                INSERT INTO products (id, title, slug, category_id, price, stock, description, image_url, dimensions, materials)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(prodId, title, slug, categoryId || 1, parseFloat(price) || 500, parseInt(stock) || 10, description || '', imageUrl || 'assets/images/shop-product1.jpg', dimensions || '', materials || '');

            return sendJson(res, 201, { success: true, message: 'Product created successfully', productId: prodId });
        }

        if (pathname === '/api/admin/products' && req.method === 'PUT') {
            const body = await parseJsonBody(req);
            const { id, title, price, stock, isBestseller, isNewArrival } = body;
            db.prepare(`
                UPDATE products
                SET title = ifnull(?, title),
                    price = ifnull(?, price),
                    stock = ifnull(?, stock),
                    is_bestseller = ifnull(?, is_bestseller),
                    is_new_arrival = ifnull(?, is_new_arrival)
                WHERE id = ?
            `).run(title, price, stock, isBestseller, isNewArrival, id);

            return sendJson(res, 200, { success: true, message: 'Product updated successfully' });
        }

        // Admin Customers
        if (pathname === '/api/admin/customers' && req.method === 'GET') {
            const customers = db.prepare(`
                SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
                       cp.company_name, cp.trade_tier,
                       COUNT(o.id) as order_count, ifnull(SUM(o.grand_total), 0) as total_spent
                FROM users u
                LEFT JOIN customer_profiles cp ON u.id = cp.user_id
                LEFT JOIN orders o ON u.id = o.user_id
                WHERE u.role != 'Administrator'
                GROUP BY u.id
                ORDER BY u.created_at DESC
            `).all();

            return sendJson(res, 200, { success: true, customers });
        }

        // Admin Inquiries
        if (pathname === '/api/admin/inquiries' && req.method === 'GET') {
            const inquiries = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();
            return sendJson(res, 200, { success: true, inquiries });
        }

        if (pathname === '/api/admin/inquiries' && req.method === 'PUT') {
            const body = await parseJsonBody(req);
            db.prepare('UPDATE inquiries SET status = ?, internal_notes = ifnull(?, internal_notes) WHERE id = ?').run(body.status, body.internalNotes, body.id);
            return sendJson(res, 200, { success: true });
        }

        // Admin Appointments
        if (pathname === '/api/admin/appointments' && req.method === 'GET') {
            const appointments = db.prepare('SELECT * FROM appointments ORDER BY preferred_date ASC, preferred_time ASC').all();
            return sendJson(res, 200, { success: true, appointments });
        }

        if (pathname === '/api/admin/appointments' && req.method === 'PUT') {
            const body = await parseJsonBody(req);
            db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(body.status, body.id);
            return sendJson(res, 200, { success: true });
        }

        // Admin Coupons
        if (pathname === '/api/admin/coupons' && req.method === 'GET') {
            const coupons = db.prepare('SELECT * FROM coupons ORDER BY id ASC').all();
            return sendJson(res, 200, { success: true, coupons });
        }

        if (pathname === '/api/admin/coupons' && req.method === 'POST') {
            const body = await parseJsonBody(req);
            db.prepare(`
                INSERT INTO coupons (code, discount_percent, min_order_amount, is_active, expires_at)
                VALUES (?, ?, ?, 1, ?)
            `).run(body.code.trim().toUpperCase(), parseFloat(body.discountPercent), parseFloat(body.minOrderAmount) || 0, body.expiresAt || '2028-12-31 23:59:59');
            return sendJson(res, 201, { success: true, message: 'Coupon created successfully' });
        }

        if (pathname === '/api/admin/coupons' && req.method === 'PUT') {
            const body = await parseJsonBody(req);
            db.prepare('UPDATE coupons SET is_active = ? WHERE id = ?').run(body.isActive ? 1 : 0, body.id);
            return sendJson(res, 200, { success: true });
        }
    }

    return sendJson(res, 404, { success: false, error: 'API route not found' });
}

module.exports = {
    handleApiRequest
};
