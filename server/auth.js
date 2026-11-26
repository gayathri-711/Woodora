/**
 * WOODORA Authentication & Security Module
 * Secure session tokens, PBKDF2 verification, and role-based authorization.
 */

const crypto = require('crypto');
const { db, hashPassword } = require('./db');

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Verify user credentials and create a session
 */
function login(email, password) {
    if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email.trim());
    if (!user) {
        return { success: false, error: 'Invalid email or password' };
    }

    const { hash } = hashPassword(password, user.salt);
    if (hash !== user.password_hash) {
        return { success: false, error: 'Invalid email or password' };
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + SESSION_TTL_MS;

    db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, user.id, expiresAt);

    // Fetch user profile and default address
    const profile = db.prepare('SELECT * FROM customer_profiles WHERE user_id = ?').get(user.id);
    const address = db.prepare('SELECT * FROM addresses WHERE user_id = ? AND is_default = 1').get(user.id);

    return {
        success: true,
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            profile,
            defaultAddress: address
        }
    };
}

/**
 * Register a new customer
 */
function register(userData) {
    const { name, email, password, phone, role, companyName } = userData;
    if (!name || !email || !password) {
        return { success: false, error: 'Name, email, and password are required' };
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE').get(email.trim());
    if (existing) {
        return { success: false, error: 'An account with this email address already exists' };
    }

    const validRole = ['Homeowner', 'Trade Architect', 'Hospitality'].includes(role) ? role : 'Homeowner';
    const { hash, salt } = hashPassword(password);

    const result = db.prepare(`
        INSERT INTO users (name, email, password_hash, salt, phone, role)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(name.trim(), email.trim().toLowerCase(), hash, salt, phone || null, validRole);

    const userId = Number(result.lastInsertRowid);

    // Create profile
    db.prepare(`
        INSERT INTO customer_profiles (user_id, company_name, notes)
        VALUES (?, ?, ?)
    `).run(userId, companyName || null, 'Auto-registered web customer');

    // Automatically assign welcome coupon privilege
    return login(email, password);
}

/**
 * Get authenticated user from request headers or cookies
 */
function getUserFromRequest(req) {
    let token = null;

    // 1. Check Authorization header: Bearer <token>
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
    }

    // 2. Check X-Woodora-Token header
    if (!token && req.headers['x-woodora-token']) {
        token = req.headers['x-woodora-token'].trim();
    }

    // 3. Check Cookie header
    if (!token && req.headers['cookie']) {
        const match = req.headers['cookie'].match(/woodora_session=([^;]+)/);
        if (match) token = match[1].trim();
    }

    if (!token) return null;

    // Verify session in database
    const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
    if (!session) return null;

    if (Date.now() > session.expires_at) {
        // Expired
        db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
        return null;
    }

    const user = db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(session.user_id);
    if (!user) return null;

    const profile = db.prepare('SELECT * FROM customer_profiles WHERE user_id = ?').get(user.id);
    const defaultAddress = db.prepare('SELECT * FROM addresses WHERE user_id = ? AND is_default = 1').get(user.id);
    const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ?').all(user.id);

    return {
        ...user,
        profile,
        defaultAddress,
        addresses,
        token
    };
}

/**
 * Logout / invalidate session
 */
function logout(token) {
    if (token) {
        db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    }
    return { success: true };
}

module.exports = {
    login,
    register,
    getUserFromRequest,
    logout
};
