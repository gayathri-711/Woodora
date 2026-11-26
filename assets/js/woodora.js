/**
 * WOODORA - Luxury Furniture E-Commerce Engine
 * Complete Authentication, Shopping Guard, Cart, Wishlist, Catalog Filtering, Product Details, and Checkout.
 */

(function($) {
    'use strict';

    // User Authentication & Session Storage Keys
    const USER_SESSION_KEY = 'woodora_active_user';
    const USERS_DB_KEY = 'woodora_registered_users';
    const CART_KEY = 'woodora_cart_items';
    const WISHLIST_KEY = 'woodora_wishlist_items';
    const COUPON_KEY = 'woodora_applied_coupon';

    // Default Pre-Registered Demo Users (1-click testable)
    const DEFAULT_USERS = [
        {
            name: 'Julian Sterling',
            email: 'julian@woodora.com',
            password: 'password123',
            role: 'Private Homeowner / Collector'
        },
        {
            name: 'Eleanor Vance',
            email: 'eleanor@woodora.com',
            password: 'password123',
            role: 'Interior Architect (Trade Member)'
        }
    ];

    function getRegisteredUsers() {
        try {
            const stored = localStorage.getItem(USERS_DB_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
            localStorage.setItem(USERS_DB_KEY, JSON.stringify(DEFAULT_USERS));
            return DEFAULT_USERS;
        } catch(e) {
            return DEFAULT_USERS;
        }
    }

    // Default Initial Catalog with Real High-Definition Furniture Photography
    const DEFAULT_PRODUCTS = [
        {
            id: 'wdr-1',
            title: 'Nordic Minimalist Oak Sofa',
            category: 'Sofas',
            categorySlug: 'sofas',
            price: 780.00,
            oldPrice: 950.00,
            image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
            badge: 'Bestseller',
            badgeClass: 'badge-discount',
            rating: 4.9,
            reviews: 142,
            colors: ['#263D32', '#805B42', '#F7F4EE', '#252525']
        },
        {
            id: 'wdr-2',
            title: 'Artisan Solid Walnut Dining Table',
            category: 'Dining Tables',
            categorySlug: 'dining-tables',
            price: 640.00,
            oldPrice: 820.00,
            image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
            badge: 'Solid Wood',
            badgeClass: 'badge-solidwood',
            rating: 5.0,
            reviews: 98,
            colors: ['#805B42', '#3D2817', '#E8DED0']
        },
        {
            id: 'wdr-3',
            title: 'Ergonomic Velvet Lounge Chair',
            category: 'Chairs',
            categorySlug: 'chairs',
            price: 320.00,
            oldPrice: 420.00,
            image: 'https://images.unsplash.com/photo-1580481077197-2eb102d53c6c?auto=format&fit=crop&w=800&q=80',
            badge: 'New',
            badgeClass: 'badge-new',
            rating: 4.8,
            reviews: 64,
            colors: ['#263D32', '#C8A882', '#674732']
        },
        {
            id: 'wdr-4',
            title: 'Japanese Low Platform Bed',
            category: 'Beds',
            categorySlug: 'beds',
            price: 1150.00,
            oldPrice: 1400.00,
            image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
            badge: 'Artisan',
            badgeClass: 'badge-solidwood',
            rating: 4.9,
            reviews: 87,
            colors: ['#805B42', '#E8DED0']
        },
        {
            id: 'wdr-5',
            title: 'Architectural Marble Coffee Table',
            category: 'Coffee Tables',
            categorySlug: 'coffee-tables',
            price: 290.00,
            oldPrice: 380.00,
            image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
            badge: '-25% OFF',
            badgeClass: 'badge-discount',
            rating: 4.7,
            reviews: 52,
            colors: ['#F7F4EE', '#252525', '#805B42']
        },
        {
            id: 'wdr-6',
            title: 'Minimalist Modular Wardrobe',
            category: 'Wardrobes',
            categorySlug: 'wardrobes',
            price: 920.00,
            oldPrice: 1180.00,
            image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80',
            badge: 'Popular',
            badgeClass: 'badge-new',
            rating: 4.9,
            reviews: 73,
            colors: ['#263D32', '#805B42']
        },
        {
            id: 'wdr-7',
            title: 'Executive Walnut Office Desk',
            category: 'Office Furniture',
            categorySlug: 'office-furniture',
            price: 540.00,
            oldPrice: 690.00,
            image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
            badge: 'Ergonomic',
            badgeClass: 'badge-solidwood',
            rating: 4.8,
            reviews: 45,
            colors: ['#805B42', '#252525']
        },
        {
            id: 'wdr-8',
            title: 'Ceramic Sculptural Floor Vase & Decor',
            category: 'Home Decor',
            categorySlug: 'home-decor',
            price: 145.00,
            oldPrice: 195.00,
            image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
            badge: 'Handcrafted',
            badgeClass: 'badge-new',
            rating: 4.9,
            reviews: 110,
            colors: ['#E8DED0', '#263D32', '#F7F4EE']
        },
        {
            id: 'wdr-9',
            title: 'Bouclé Curved Armchair',
            category: 'Chairs',
            categorySlug: 'chairs',
            price: 380.00,
            oldPrice: 490.00,
            image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80',
            badge: 'Trending',
            badgeClass: 'badge-discount',
            rating: 5.0,
            reviews: 58,
            colors: ['#F7F4EE', '#805B42', '#263D32']
        }
    ];

    // Initial default cart items with real photos
    const INITIAL_CART = [
        {
            id: 'wdr-1',
            title: 'Nordic Minimalist Oak Sofa',
            price: 780.00,
            quantity: 1,
            color: 'Forest Green',
            size: '3-Seater',
            image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'wdr-2',
            title: 'Artisan Solid Walnut Dining Table',
            price: 640.00,
            quantity: 1,
            color: 'Walnut Brown',
            size: 'L (8-Seater)',
            image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'wdr-5',
            title: 'Architectural Marble Coffee Table',
            price: 290.00,
            quantity: 2,
            color: 'Warm Cream',
            size: 'Standard',
            image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80'
        }
    ];

    window.Woodora = {
        products: DEFAULT_PRODUCTS,

        // Authentication Subsystem
        auth: {
            isLoggedIn: function() {
                try {
                    const user = localStorage.getItem(USER_SESSION_KEY);
                    return !!user && JSON.parse(user) !== null;
                } catch(e) {
                    return false;
                }
            },

            getUser: function() {
                try {
                    const user = localStorage.getItem(USER_SESSION_KEY);
                    return user ? JSON.parse(user) : null;
                } catch(e) {
                    return null;
                }
            },

            login: function(email, password) {
                const users = getRegisteredUsers();
                const cleanEmail = (email || '').trim().toLowerCase();
                const matched = users.find(function(u) {
                    return u.email.toLowerCase() === cleanEmail && u.password === password;
                });

                if (matched) {
                    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(matched));
                    window.Woodora.updateHeaderAuth();
                    window.Woodora.showToast('Welcome, ' + matched.name, 'You are now signed in to your WOODORA account.');
                    return { success: true, user: matched };
                } else {
                    return { success: false, message: 'Invalid email or password. You can also click "Quick Demo Sign In" below.' };
                }
            },

            register: function(name, email, password, role) {
                const users = getRegisteredUsers();
                const cleanEmail = (email || '').trim().toLowerCase();
                const exists = users.find(function(u) { return u.email.toLowerCase() === cleanEmail; });
                if (exists) {
                    return { success: false, message: 'An account with this email already exists. Please sign in.' };
                }

                const newUser = {
                    name: (name || 'Valued Member').trim(),
                    email: cleanEmail,
                    password: password,
                    role: role || 'Private Homeowner / Collector',
                    joinedAt: new Date().toISOString()
                };

                users.push(newUser);
                try {
                    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
                    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(newUser));
                } catch(e) {}

                window.Woodora.updateHeaderAuth();
                window.Woodora.showToast('Account Created!', 'Welcome to WOODORA, ' + newUser.name + '.');
                return { success: true, user: newUser };
            },

            logout: function() {
                try {
                    localStorage.removeItem(USER_SESSION_KEY);
                } catch(e) {}
                window.Woodora.updateHeaderAuth();
                window.Woodora.showToast('Signed Out', 'You have been safely signed out.');
                setTimeout(function() {
                    window.location.reload();
                }, 500);
            },

            // Authentication Guard: if guest, opens modal with intent explanation
            requireAuth: function(callback, intentMsg) {
                if (this.isLoggedIn()) {
                    if (typeof callback === 'function') callback();
                    return true;
                }

                // Not logged in: open the sleek auth modal
                window.Woodora.openAuthModal(callback, intentMsg);
                return false;
            }
        },

        // Update Header Navigation to reflect User Authentication Status
        updateHeaderAuth: function() {
            const user = this.auth.getUser();
            $('.last_list .user-auth-pill, .last_list .admin').remove();

            if (user) {
                // User is Logged In
                const firstName = (user.name || 'Member').split(' ')[0];
                $('.last_list').append(
                    '<div class="user-auth-pill d-inline-flex align-items-center ml-2" style="background: #F7F4EE; padding: 4px 12px; border-radius: 20px; border: 1px solid #E8DED0;">' +
                        '<i class="fa-solid fa-circle-user mr-1" style="color: #805B42; font-size: 16px;"></i>' +
                        '<a href="account.html" class="font-size-13 font-weight-bold mr-2 text-dark text-decoration-none d-none d-sm-inline" title="Open My Account">' + firstName + '</a>' +
                        '<button class="btn-woodora-logout btn p-0 border-0 text-muted" title="Sign Out (' + user.email + ')" style="background: none; font-size: 13px; cursor: pointer;"><i class="fa-solid fa-arrow-right-from-bracket"></i></button>' +
                    '</div>'
                );
            } else {
                // User is Guest
                $('.last_list').append(
                    '<a class="admin btn-open-auth-modal" href="login.html" title="Client Sign In / Register"><i class="fa-regular fa-user"></i> <span class="d-none d-xl-inline ml-1 font-size-13 font-weight-600">Sign In</span></a>'
                );
            }
        },

        // Open Luxury Auth Modal
        openAuthModal: function(pendingActionCallback, intentMsg) {
            window._pendingShopAction = pendingActionCallback;
            let $modal = $('#woodora-auth-modal');

            if ($modal.length === 0) {
                const modalHtml = 
                    '<div class="modal fade" id="woodora-auth-modal" tabindex="-1" role="dialog" aria-hidden="true" style="z-index: 105000;">' +
                        '<div class="modal-dialog modal-dialog-centered" style="max-width: 480px;">' +
                            '<div class="modal-content rounded-lg border-0 shadow-lg overflow-hidden" style="background: #FFFFFF; border-radius: 12px;">' +
                                '<div class="modal-header py-4 px-4 border-0 position-relative" style="background: linear-gradient(135deg, #263D32 0%, #1A2C23 100%); color: #F7F4EE;">' +
                                    '<div>' +
                                        '<div class="d-flex align-items-center mb-1">' +
                                            '<i class="fa-solid fa-leaf mr-2" style="color: #C8A882; font-size: 18px;"></i>' +
                                            '<span style="font-family: \'Playfair Display\', serif; font-size: 20px; font-weight: 700; color: #F7F4EE;">WOODORA Private Access</span>' +
                                        '</div>' +
                                        '<p class="mb-0 font-size-13 text-auth-intent" style="color: rgba(247, 244, 238, 0.85);">Please sign in or register to curate and purchase handcrafted furniture.</p>' +
                                    '</div>' +
                                    '<button type="button" class="close text-white" data-dismiss="modal" aria-label="Close" style="opacity: 0.85; font-size: 26px; position: absolute; right: 18px; top: 16px;">&times;</button>' +
                                '</div>' +
                                '<div class="modal-body p-4">' +
                                    '<!-- Nav Tabs -->' +
                                    '<ul class="nav nav-pills nav-justified mb-3 p-1 rounded" style="background: #F7F4EE; border: 1px solid #E8DED0;">' +
                                        '<li class="nav-item"><a class="nav-link active font-weight-bold font-size-13 py-2 text-dark" data-toggle="pill" href="#tab-auth-login">Sign In</a></li>' +
                                        '<li class="nav-item"><a class="nav-link font-weight-bold font-size-13 py-2 text-dark" data-toggle="pill" href="#tab-auth-register">Create Account</a></li>' +
                                    '</ul>' +
                                    '<div class="tab-content pt-2">' +
                                        '<!-- Tab 1: Sign In -->' +
                                        '<div class="tab-pane fade show active" id="tab-auth-login">' +
                                            '<div class="alert py-2 px-3 font-size-12 mb-3" style="background: #F4EFEB; border: 1px solid #E8DED0; color: #263D32;">' +
                                                '<i class="fa-solid fa-circle-info mr-1" style="color: #805B42;"></i> <strong>Demo Member:</strong> julian@woodora.com &bull; pass: password123' +
                                            '</div>' +
                                            '<form id="modal-login-form">' +
                                                '<div class="form-group mb-3">' +
                                                    '<label class="font-size-13 font-weight-600 text-dark mb-1">Email Address</label>' +
                                                    '<input type="email" class="form-control auth-login-email" required value="julian@woodora.com" style="border-color: #E8DED0;">' +
                                                '</div>' +
                                                '<div class="form-group mb-3">' +
                                                    '<label class="font-size-13 font-weight-600 text-dark mb-1">Password</label>' +
                                                    '<input type="password" class="form-control auth-login-password" required value="password123" style="border-color: #E8DED0;">' +
                                                '</div>' +
                                                '<div class="auth-error-msg text-danger font-size-13 mb-3" style="display: none;"></div>' +
                                                '<button type="submit" class="primary_btn w-100 text-center py-2 mb-2 font-size-14 font-weight-600">Sign In & Continue Shopping</button>' +
                                                '<button type="button" class="btn btn-block py-2 btn-quick-demo-login font-size-13 font-weight-600" style="background: #F7F4EE; color: #805B42; border: 1px dashed #805B42;">' +
                                                    '<i class="fa-solid fa-bolt mr-1"></i> Quick 1-Click Demo Sign In (Julian)' +
                                                '</button>' +
                                            '</form>' +
                                        '</div>' +
                                        '<!-- Tab 2: Register -->' +
                                        '<div class="tab-pane fade" id="tab-auth-register">' +
                                            '<form id="modal-register-form">' +
                                                '<div class="form-group mb-2">' +
                                                    '<label class="font-size-13 font-weight-600 text-dark mb-1">Full Name</label>' +
                                                    '<input type="text" class="form-control auth-reg-name" required placeholder="Julian Sterling" style="border-color: #E8DED0;">' +
                                                '</div>' +
                                                '<div class="form-group mb-2">' +
                                                    '<label class="font-size-13 font-weight-600 text-dark mb-1">Email Address</label>' +
                                                    '<input type="email" class="form-control auth-reg-email" required placeholder="julian@example.com" style="border-color: #E8DED0;">' +
                                                '</div>' +
                                                '<div class="form-group mb-2">' +
                                                    '<label class="font-size-13 font-weight-600 text-dark mb-1">Password (Min. 6 chars)</label>' +
                                                    '<input type="password" class="form-control auth-reg-password" minlength="6" required placeholder="••••••" style="border-color: #E8DED0;">' +
                                                '</div>' +
                                                '<div class="form-group mb-3">' +
                                                    '<label class="font-size-13 font-weight-600 text-dark mb-1">Client Category</label>' +
                                                    '<select class="form-control auth-reg-role font-size-13" style="border-color: #E8DED0;">' +
                                                        '<option>Private Homeowner / Collector</option>' +
                                                        '<option>Interior Designer (Trade Member)</option>' +
                                                        '<option>Architect / Hospitality</option>' +
                                                    '</select>' +
                                                '</div>' +
                                                '<div class="auth-reg-error-msg text-danger font-size-13 mb-3" style="display: none;"></div>' +
                                                '<button type="submit" class="primary_btn w-100 text-center py-2 font-size-14 font-weight-600">Create Account & Shop</button>' +
                                            '</form>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="modal-footer py-2 px-4 border-top text-center justify-content-center font-size-12" style="background: #FAF8F5;">' +
                                    '<span class="text-muted"><i class="fa-solid fa-shield-halved mr-1" style="color: #263D32;"></i> 256-Bit Encrypted Member Portal</span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';

                $('body').append(modalHtml);
                $modal = $('#woodora-auth-modal');

                // Bind Quick 1-Click Demo Login
                $(document).on('click', '.btn-quick-demo-login', function(e) {
                    e.preventDefault();
                    window.Woodora.auth.login('julian@woodora.com', 'password123');
                    $modal.modal('hide');
                    if (typeof window._pendingShopAction === 'function') {
                        const act = window._pendingShopAction;
                        window._pendingShopAction = null;
                        setTimeout(act, 300);
                    }
                });

                // Bind Modal Login Submit
                $(document).on('submit', '#modal-login-form', function(e) {
                    e.preventDefault();
                    const email = $modal.find('.auth-login-email').val();
                    const pass = $modal.find('.auth-login-password').val();
                    const res = window.Woodora.auth.login(email, pass);
                    if (res.success) {
                        $modal.modal('hide');
                        if (typeof window._pendingShopAction === 'function') {
                            const act = window._pendingShopAction;
                            window._pendingShopAction = null;
                            setTimeout(act, 300);
                        }
                    } else {
                        $modal.find('.auth-error-msg').text(res.message).show();
                    }
                });

                // Bind Modal Register Submit
                $(document).on('submit', '#modal-register-form', function(e) {
                    e.preventDefault();
                    const name = $modal.find('.auth-reg-name').val();
                    const email = $modal.find('.auth-reg-email').val();
                    const pass = $modal.find('.auth-reg-password').val();
                    const role = $modal.find('.auth-reg-role').val();
                    const res = window.Woodora.auth.register(name, email, pass, role);
                    if (res.success) {
                        $modal.modal('hide');
                        if (typeof window._pendingShopAction === 'function') {
                            const act = window._pendingShopAction;
                            window._pendingShopAction = null;
                            setTimeout(act, 300);
                        }
                    } else {
                        $modal.find('.auth-reg-error-msg').text(res.message).show();
                    }
                });
            }

            if (intentMsg) {
                $modal.find('.text-auth-intent').text(intentMsg);
            }
            $modal.modal('show');
        },

        // Cart Management
        getCart: function() {
            try {
                const stored = localStorage.getItem(CART_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        parsed.forEach(function(item) {
                            var matched = DEFAULT_PRODUCTS.find(function(p) { return p.id === item.id; });
                            if (matched && (!item.image || item.image.indexOf('shop-image') !== -1)) {
                                item.image = matched.image;
                            }
                        });
                        return parsed;
                    }
                }
                localStorage.setItem(CART_KEY, JSON.stringify(INITIAL_CART));
                return INITIAL_CART;
            } catch (e) {
                return INITIAL_CART;
            }
        },

        saveCart: function(items) {
            try {
                localStorage.setItem(CART_KEY, JSON.stringify(items));
            } catch (e) {}
            this.updateCartBadge();
        },

        getCartCount: function() {
            const items = this.getCart();
            return items.reduce(function(sum, item) {
                return sum + (parseInt(item.quantity, 10) || 1);
            }, 0);
        },

        updateCartBadge: function() {
            const count = this.getCartCount();
            $('.last_list .cart span, .header .cart span').text(count);
        },

        addToCart: function(product) {
            const cart = this.getCart();
            const existingIndex = cart.findIndex(function(item) {
                return item.id === product.id && item.color === product.color && item.size === product.size;
            });

            if (existingIndex > -1) {
                cart[existingIndex].quantity += (product.quantity || 1);
            } else {
                cart.push({
                    id: product.id || 'wdr-' + Date.now(),
                    title: product.title || 'WOODORA Furniture Piece',
                    price: parseFloat(product.price) || 299.00,
                    quantity: product.quantity || 1,
                    color: product.color || 'Forest Green',
                    size: product.size || 'Standard',
                    image: product.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
                });
            }

            this.saveCart(cart);
            this.showToast('Added to Cart', product.title);
        },

        removeFromCart: function(id, color, size) {
            let cart = this.getCart();
            cart = cart.filter(function(item) {
                if (item.id !== id) return true;
                if (color && item.color !== color) return true;
                if (size && item.size !== size) return true;
                return false;
            });
            this.saveCart(cart);
        },

        updateQuantity: function(id, quantity, color, size) {
            const cart = this.getCart();
            const item = cart.find(function(it) {
                return it.id === id && (!color || it.color === color) && (!size || it.size === size);
            });
            if (item) {
                item.quantity = Math.max(1, parseInt(quantity, 10) || 1);
                this.saveCart(cart);
            }
        },

        // Wishlist
        getWishlist: function() {
            try {
                const stored = localStorage.getItem(WISHLIST_KEY);
                return stored ? JSON.parse(stored) : [];
            } catch (e) {
                return [];
            }
        },

        toggleWishlist: function(id, title) {
            let wishlist = this.getWishlist();
            const index = wishlist.indexOf(id);
            let added = false;
            if (index > -1) {
                wishlist.splice(index, 1);
            } else {
                wishlist.push(id);
                added = true;
            }
            try {
                localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
            } catch (e) {}

            if (added) {
                this.showToast('Wishlist Updated', (title || 'Item') + ' saved to your curated wishlist.');
            } else {
                this.showToast('Wishlist Updated', (title || 'Item') + ' removed from your wishlist.');
            }
            return added;
        },

        // Toast Notification
        showToast: function(title, message) {
            let $toast = $('#woodora-toast');
            if ($toast.length === 0) {
                $('body').append(
                    '<div id="woodora-toast">' +
                        '<div class="toast-icon"><i class="fa-solid fa-leaf"></i></div>' +
                        '<div>' +
                            '<strong class="d-block" style="font-size: 13px; letter-spacing: 0.5px; color: #C8A882;">' + title + '</strong>' +
                            '<div class="toast-text">' + message + '</div>' +
                        '</div>' +
                        '<a href="cart.html" class="toast-view-btn">View Cart</a>' +
                    '</div>'
                );
                $toast = $('#woodora-toast');
            } else {
                $toast.find('strong').text(title);
                $toast.find('.toast-text').text(message);
            }

            $toast.addClass('show');
            if (window._woodoraToastTimeout) clearTimeout(window._woodoraToastTimeout);
            window._woodoraToastTimeout = setTimeout(function() {
                $toast.removeClass('show');
            }, 3800);
        }
    };

    // DOM Ready Initialization
    $(document).ready(function() {
        // Initialize Cart Counter & Header Auth State
        window.Woodora.updateCartBadge();
        window.Woodora.updateHeaderAuth();

        // Bind Header Sign In modal trigger
        $(document).on('click', '.btn-open-auth-modal', function(e) {
            e.preventDefault();
            window.Woodora.openAuthModal(null, 'Sign in to access your saved orders, wishlist, and trade benefits.');
        });

        // Bind Header Logout
        $(document).on('click', '.btn-woodora-logout', function(e) {
            e.preventDefault();
            window.Woodora.auth.logout();
        });

        // Bind Wishlist Heart Toggles (AUTH GUARDED)
        $(document).on('click', '.wishlist-toggle, .woodora-wishlist-btn', function(e) {
            e.preventDefault();
            const $btn = $(this);
            window.Woodora.auth.requireAuth(function() {
                const id = $btn.data('id') || 'wdr-general';
                const title = $btn.data('title') || $btn.closest('.woodora-product-card, .feature-box, .types_content').find('h4, .product-title').first().text().trim();
                const isAdded = window.Woodora.toggleWishlist(id, title);
                if (isAdded) {
                    $btn.addClass('active');
                    $btn.find('i').removeClass('fa-regular').addClass('fa-solid');
                } else {
                    $btn.removeClass('active');
                    $btn.find('i').removeClass('fa-solid').addClass('fa-regular');
                }
            }, 'Please sign in or register to save items to your personal wishlist.');
        });

        // Bind Quick Add to Cart Buttons (AUTH GUARDED)
        $(document).on('click', '.btn-quick-cart, .add-to-cart-quick', function(e) {
            e.preventDefault();
            const $btn = $(this);
            window.Woodora.auth.requireAuth(function() {
                const id = $btn.data('id');
                const title = $btn.data('title') || $btn.closest('.woodora-product-card, .feature-box').find('.product-title, h4').first().text().trim();
                const price = parseFloat($btn.data('price')) || parseFloat($btn.closest('.woodora-product-card, .feature-box').find('.current-price, .price1').text().replace(/[^0-9.]/g, '')) || 299.00;
                const image = $btn.data('image') || $btn.closest('.woodora-product-card, .feature-box').find('img').first().attr('src') || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';

                window.Woodora.addToCart({
                    id: id || 'wdr-' + Date.now(),
                    title: title,
                    price: price,
                    quantity: 1,
                    image: image,
                    color: 'Walnut / Forest Green',
                    size: 'Standard'
                });
            }, 'Please sign in or register to add items to your shopping cart.');
        });

        // Guard Proceed to Checkout Button
        $(document).on('click', 'a[href="checkout.html"], .btn-proceed-checkout', function(e) {
            if (!window.Woodora.auth.isLoggedIn()) {
                e.preventDefault();
                window.Woodora.openAuthModal(function() {
                    window.location.href = 'checkout.html';
                }, 'Please sign in or register to proceed to secure checkout.');
            }
        });

        // Initialize Cart Page if present
        if ($('.cart-con, .shopping-cart, .shopping-cart-info').length > 0) {
            renderCartPage();
        }

        // Initialize Checkout Page if present
        if ($('.checkout-con, form.checkout-form, #checkout-form').length > 0) {
            if (!window.Woodora.auth.isLoggedIn()) {
                window.Woodora.openAuthModal(function() {
                    renderCheckoutPage();
                }, 'Please sign in or register to access the secure checkout portal.');
            } else {
                renderCheckoutPage();
            }
        }

        // Initialize Shop Catalog Page if present
        if ($('.shop-con, .shop-box-wrapper, .shop-products-con').length > 0) {
            initShopCatalog();
        }

        // Initialize Product Detail Page if present
        if ($('.types-con, .types2-con').length > 0) {
            initProductDetail();
        }
    });

    /**
     * CART PAGE LOGIC
     */
    function renderCartPage() {
        const $container = $('.shopping-cart-info');
        if ($container.length === 0) return;

        function refreshCartTable() {
            const items = window.Woodora.getCart();
            $container.empty();

            if (items.length === 0) {
                $container.html(
                    '<div class="text-center py-5" data-aos="fade-up">' +
                        '<i class="fa-solid fa-basket-shopping" style="font-size: 54px; color: #805B42; margin-bottom: 20px;"></i>' +
                        '<h3 style="font-family: \'Playfair Display\', serif;">Your Shopping Cart is Empty</h3>' +
                        '<p class="text">Explore our collection of handcrafted solid wood furniture and artisanal decor.</p>' +
                        '<a href="shop.html" class="primary_btn mt-3">Explore Collections</a>' +
                    '</div>'
                );
                calculateTotals();
                return;
            }

            items.forEach(function(item, idx) {
                const lineTotal = (parseFloat(item.price) * parseInt(item.quantity, 10)).toFixed(2);
                const html =
                    '<div class="product d-sm-flex d-block align-items-center" data-id="' + item.id + '" data-color="' + (item.color || '') + '" data-size="' + (item.size || '') + '">' +
                        '<div class="product-details">' +
                            '<div class="product-image box1">' +
                                '<figure class="mb-0"><img src="' + item.image + '" alt="' + item.title + '" class="img-fluid" style="width: 75px; height: 75px; border-radius: 6px; object-fit: cover;"></figure>' +
                            '</div>' +
                            '<div class="product-content">' +
                                '<span class="product-title font-weight-bold" style="font-family: \'Playfair Display\', serif; font-size: 17px;">' + item.title + '</span>' +
                                '<span class="product-color text">Finish: <span>' + (item.color || 'Walnut') + '</span></span>' +
                                '<span class="product-size text mb-0">Size: <span>' + (item.size || 'Standard') + '</span></span>' +
                            '</div>' +
                        '</div>' +
                        '<div class="product-price"><span>$' + parseFloat(item.price).toFixed(2) + '</span></div>' +
                        '<div class="product-quantity d-flex">' +
                            '<div class="product-qty-details">' +
                                '<button class="value-button decrease-button btn-cart-decrease" type="button">-</button>' +
                                '<div class="number">' + item.quantity + '</div>' +
                                '<button class="value-button increase-button btn-cart-increase" type="button">+</button>' +
                            '</div>' +
                        '</div>' +
                        '<div class="product-line-price"><span>$' + lineTotal + '</span></div>' +
                        '<div class="product-removal">' +
                            '<button class="remove-product btn-cart-remove" title="Remove Item"><i class="fas fa-times"></i></button>' +
                        '</div>' +
                    '</div>';
                $container.append(html);
            });

            // Update heading item count
            const totalQty = items.reduce(function(acc, it) { return acc + (parseInt(it.quantity, 10) || 1); }, 0);
            $('.product-detail-box .heading span:last-child').text('(' + (totalQty < 10 ? '0' : '') + totalQty + ' Items)');

            calculateTotals();
        }

        function calculateTotals() {
            const items = window.Woodora.getCart();
            let subtotal = 0;
            items.forEach(function(item) {
                subtotal += (parseFloat(item.price) * parseInt(item.quantity, 10));
            });

            // Shipping: Free if subtotal > 250, otherwise $15.00
            const shipping = subtotal > 250 || subtotal === 0 ? 0 : 15.00;
            const tax = subtotal * 0.05; // 5% tax

            // Coupon discount
            let discount = 0;
            const coupon = localStorage.getItem(COUPON_KEY);
            if (coupon === 'WOODORA10') {
                discount = subtotal * 0.10;
            }

            const total = Math.max(0, subtotal + shipping + tax - discount);

            $('#cart-subtotal').text('$' + subtotal.toFixed(2));
            $('#cart-tax').text('$' + tax.toFixed(2));
            $('#cart-shipping').text(shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2));
            $('#cart-total').text('$' + total.toFixed(2));

            if ($('#cart-discount-row').length > 0) {
                if (discount > 0) {
                    $('#cart-discount-row').show().find('.discount-val').text('-$' + discount.toFixed(2));
                } else {
                    $('#cart-discount-row').hide();
                }
            }
        }

        // Quantity handlers
        $container.off('click', '.btn-cart-increase').on('click', '.btn-cart-increase', function() {
            const $row = $(this).closest('.product');
            const id = $row.data('id');
            const color = $row.data('color');
            const size = $row.data('size');
            const $num = $row.find('.number');
            let current = parseInt($num.text(), 10) || 1;
            current++;
            $num.text(current);
            window.Woodora.updateQuantity(id, current, color, size);
            refreshCartTable();
        });

        $container.off('click', '.btn-cart-decrease').on('click', '.btn-cart-decrease', function() {
            const $row = $(this).closest('.product');
            const id = $row.data('id');
            const color = $row.data('color');
            const size = $row.data('size');
            const $num = $row.find('.number');
            let current = parseInt($num.text(), 10) || 1;
            if (current > 1) {
                current--;
                $num.text(current);
                window.Woodora.updateQuantity(id, current, color, size);
                refreshCartTable();
            }
        });

        $container.off('click', '.btn-cart-remove').on('click', '.btn-cart-remove', function() {
            const $row = $(this).closest('.product');
            const id = $row.data('id');
            const color = $row.data('color');
            const size = $row.data('size');
            $row.fadeOut(300, function() {
                window.Woodora.removeFromCart(id, color, size);
                refreshCartTable();
            });
        });

        // Coupon code form
        $('#apply-coupon-btn, .apply-coupon').off('click').on('click', function(e) {
            e.preventDefault();
            const code = ($('#coupon-code-input').val() || '').trim().toUpperCase();
            if (code === 'WOODORA10') {
                localStorage.setItem(COUPON_KEY, code);
                window.Woodora.showToast('Coupon Applied!', '10% privilege discount applied to your order.');
                calculateTotals();
            } else {
                alert('Invalid code. Try "WOODORA10" for 10% privilege discount.');
            }
        });

        refreshCartTable();
    }

    /**
     * CHECKOUT PAGE LOGIC
     */
    function renderCheckoutPage() {
        const items = window.Woodora.getCart();
        const $orderSummaryList = $('.checkout-order-items, .order-review-table tbody');

        // Pre-fill user data if available
        const user = window.Woodora.auth.getUser();
        if (user) {
            const parts = (user.name || '').split(' ');
            if ($('#fname').length && !$('#fname').val()) $('#fname').val(parts[0] || '');
            if ($('#lname').length && !$('#lname').val()) $('#lname').val(parts.slice(1).join(' ') || '');
            if ($('#email').length && !$('#email').val()) $('#email').val(user.email || '');
        }
        
        if ($orderSummaryList.length > 0) {
            $orderSummaryList.empty();
            let subtotal = 0;

            items.forEach(function(item) {
                const lineTotal = (parseFloat(item.price) * parseInt(item.quantity, 10));
                subtotal += lineTotal;
                $orderSummaryList.append(
                    '<tr>' +
                        '<td>' +
                            '<strong>' + item.title + '</strong> &times; ' + item.quantity +
                            '<div style="font-size: 12px; color: #66635D;">' + (item.color || 'Walnut') + ' | ' + (item.size || 'Standard') + '</div>' +
                        '</td>' +
                        '<td class="text-right">$' + lineTotal.toFixed(2) + '</td>' +
                    '</tr>'
                );
            });

            const shipping = subtotal > 250 || subtotal === 0 ? 0 : 15.00;
            const tax = subtotal * 0.05;
            let discount = 0;
            if (localStorage.getItem(COUPON_KEY) === 'WOODORA10') {
                discount = subtotal * 0.10;
            }
            const total = Math.max(0, subtotal + shipping + tax - discount);

            $('.checkout-subtotal').text('$' + subtotal.toFixed(2));
            $('.checkout-shipping').text(shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2));
            $('.checkout-tax').text('$' + tax.toFixed(2));
            $('.checkout-total').text('$' + total.toFixed(2));
        }

        // Place Order Handler
        $('#place-order-btn, .btn-place-order').off('click').on('click', function(e) {
            e.preventDefault();
            const form = document.querySelector('#checkout-form, form');
            if (form && !form.checkValidity()) {
                form.reportValidity();
                return;
            }

            // Save order record
            const orderId = 'WDR-' + Math.floor(100000 + Math.random() * 900000);
            sessionStorage.setItem('woodora_last_order', JSON.stringify({
                orderId: orderId,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                items: window.Woodora.getCart()
            }));

            // Reset cart
            localStorage.removeItem(CART_KEY);
            window.Woodora.updateCartBadge();

            // Redirect to Thank You page
            window.location.href = 'thank-you.html?order=' + orderId;
        });
    }

    /**
     * SHOP CATALOG PAGE LOGIC (Filtering & Sorting)
     */
    function initShopCatalog() {
        const $productGrid = $('.shop-products-con');
        if ($productGrid.length === 0) return;

        let activeCategory = 'all';
        let minPrice = 0;
        let maxPrice = 2000;
        let searchQuery = '';

        function filterProducts() {
            $productGrid.find('.col-xl-4, .col-lg-6, .woodora-card-col').each(function() {
                const $col = $(this);
                const cat = ($col.data('category') || '').toLowerCase();
                const price = parseFloat($col.data('price')) || parseFloat($col.find('.price1, .current-price').text().replace(/[^0-9.]/g, '')) || 0;
                const title = ($col.find('h4, .product-title').text() || '').toLowerCase();

                let matchCategory = (activeCategory === 'all' || cat.indexOf(activeCategory) !== -1);
                let matchPrice = (price >= minPrice && price <= maxPrice);
                let matchSearch = (!searchQuery || title.indexOf(searchQuery) !== -1 || cat.indexOf(searchQuery) !== -1);

                if (matchCategory && matchPrice && matchSearch) {
                    $col.stop(true, true).fadeIn(250);
                } else {
                    $col.stop(true, true).fadeOut(250);
                }
            });
        }

        // Category Filter Clicks
        $('.widget-categories .cat-item a, .filter-category-btn').on('click', function(e) {
            e.preventDefault();
            $('.widget-categories .cat-item').removeClass('active');
            $(this).parent().addClass('active');

            const text = $(this).text().toLowerCase();
            if (text.indexOf('sofa') !== -1) activeCategory = 'sofa';
            else if (text.indexOf('chair') !== -1) activeCategory = 'chair';
            else if (text.indexOf('bed') !== -1) activeCategory = 'bed';
            else if (text.indexOf('dining') !== -1 || text.indexOf('table') !== -1) activeCategory = 'table';
            else if (text.indexOf('wardrobe') !== -1) activeCategory = 'wardrobe';
            else if (text.indexOf('coffee') !== -1) activeCategory = 'coffee';
            else if (text.indexOf('office') !== -1) activeCategory = 'office';
            else if (text.indexOf('decor') !== -1) activeCategory = 'decor';
            else activeCategory = 'all';

            filterProducts();
        });

        // Search Form Filter
        $('#widget-search-form-sidebar, .shop-search-form').on('submit', function(e) {
            e.preventDefault();
            searchQuery = $(this).find('input[type="text"], input[type="search"]').val().trim().toLowerCase();
            filterProducts();
        });

        $('#widget-search-form-sidebar input').on('input', function() {
            searchQuery = $(this).val().trim().toLowerCase();
            filterProducts();
        });

        // Price Sliders
        const $lower = $('#lower');
        const $upper = $('#upper');
        if ($lower.length > 0 && $upper.length > 0) {
            function handlePriceChange() {
                const l = parseFloat($lower.val()) * 20;
                const u = parseFloat($upper.val()) * 30;
                minPrice = Math.min(l, u);
                maxPrice = Math.max(l, u);
                $('#one').val(minPrice);
                $('#two').val(maxPrice);
                filterProducts();
            }
            $lower.on('input change', handlePriceChange);
            $upper.on('input change', handlePriceChange);
        }

        // Sorting
        $('#toolbar select').on('change', function() {
            const val = $(this).val();
            const $items = $productGrid.find('.col-xl-4, .col-lg-6, .woodora-card-col').get();
            $items.sort(function(a, b) {
                const priceA = parseFloat($(a).find('.price1, .current-price').text().replace(/[^0-9.]/g, '')) || 0;
                const priceB = parseFloat($(b).find('.price1, .current-price').text().replace(/[^0-9.]/g, '')) || 0;
                const titleA = $(a).find('h4, .product-title').text().trim();
                const titleB = $(b).find('h4, .product-title').text().trim();

                if (val === 'price-low') return priceA - priceB;
                if (val === 'price-high') return priceB - priceA;
                if (val === 'name-az') return titleA.localeCompare(titleB);
                return 0;
            });
            $.each($items, function(idx, it) {
                $productGrid.append(it);
            });
        });
    }

    /**
     * PRODUCT DETAIL PAGE LOGIC (Interactive Swatches, Gallery, Sizes, Auth Guard)
     */
    function initProductDetail() {
        // Thumbnail switcher
        $('.product2-tab .nav-tabs .nav-link').on('click', function(e) {
            e.preventDefault();
            const targetId = $(this).data('target');
            $('.product2-tab .nav-tabs .nav-link').removeClass('active').css('border-color', '#E8DED0');
            $(this).addClass('active').css('border-color', '#805B42');
            $('.product2-tab .tab-content .tab-pane').removeClass('active show');
            $(targetId).addClass('active show');
        });

        // Color Swatches with dynamic photo switching
        const COLOR_MAP = {
            'Forest Green': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85',
            'Walnut Brown': 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1000&q=85',
            'Warm Cream': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=85',
            'Charcoal Black': 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=85'
        };

        $('.types_content .colors li, .product-swatches .swatch').on('click', function() {
            const colorName = $(this).attr('title') || 'Forest Green';
            $(this).siblings().removeClass('active').css({'outline': 'none'});
            $(this).addClass('active').css({'outline': '2px solid #805B42', 'outline-offset': '2px'});

            // Update label
            $('.types_content .colors .heading').html('Selected Upholstery & Finish: <strong style="color: #263D32;">' + colorName + '</strong>');

            // Swap main photo if matching image exists
            if (COLOR_MAP[colorName]) {
                const $activeImg = $('.product2-tab .tab-pane.active img');
                $activeImg.fadeOut(150, function() {
                    $activeImg.attr('src', COLOR_MAP[colorName]).fadeIn(200);
                });
            }
        });

        // Size / Configuration Selector with dynamic price updating
        const CONFIG_PRICES = {
            '3-Seater': { price: 780.00, oldPrice: 950.00, save: '$170 (18% OFF)' },
            '2-Seater': { price: 620.00, oldPrice: 750.00, save: '$130 (17% OFF)' },
            'Sectional': { price: 1240.00, oldPrice: 1490.00, save: '$250 (17% OFF)' }
        };

        $('.types_content .sizes li, .product-sizes li').on('click', function() {
            const text = $(this).text().trim();
            $(this).siblings().removeClass('active').css({'background': '#FFFFFF', 'color': '#252525', 'border-color': '#E8DED0'});
            $(this).addClass('active').css({'background': '#263D32', 'color': '#F7F4EE', 'border-color': '#263D32'});

            // Match configuration price
            let cfg = null;
            if (text.indexOf('2-Seater') !== -1) cfg = CONFIG_PRICES['2-Seater'];
            else if (text.indexOf('Sectional') !== -1) cfg = CONFIG_PRICES['Sectional'];
            else cfg = CONFIG_PRICES['3-Seater'];

            if (cfg) {
                $('.types_content .price').text('$' + cfg.price.toFixed(2));
                $('.types_content .old-price').text('$' + cfg.oldPrice.toFixed(2));
                $('.types_content .badge-success').text('Save ' + cfg.save);
            }
        });

        // Add to Cart from Detail Page (AUTH GUARDED)
        $('.types_content .primary_btn, .btn-detail-add-cart').off('click').on('click', function(e) {
            e.preventDefault();
            window.Woodora.auth.requireAuth(function() {
                const title = $('.types_content h2, .types_content h4').first().text().trim() || 'Nordic Minimalist Oak Sofa';
                const price = parseFloat($('.types_content .price').first().text().replace(/[^0-9.]/g, '')) || 780.00;
                const qty = parseInt($('.types_content .number').first().text(), 10) || 1;
                const img = $('.product2-tab .tab-pane.active img').first().attr('src') || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85';
                const color = $('.types_content .colors li.active').attr('title') || 'Forest Green';
                const size = $('.types_content .sizes li.active').text().trim() || '3-Seater (220cm)';

                window.Woodora.addToCart({
                    id: 'wdr-detail-01',
                    title: title,
                    price: price,
                    quantity: qty,
                    image: img,
                    color: color,
                    size: size
                });
            }, 'Please sign in or register to purchase this handcrafted piece.');
        });
    }

})(jQuery);
