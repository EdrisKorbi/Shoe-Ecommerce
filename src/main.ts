import { stateManager } from './state';
import { products } from './data';
import type { AppState, User } from './types';
import { signup, login, logout, getCurrentUser, updateUserProfile } from './auth';
import emailjs from '@emailjs/browser';

let cropper: any;

emailjs.init({
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
});

async function initializeApp() {
    stateManager.setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    stateManager.setProducts(products);

    const currentUser = getCurrentUser();
    if (currentUser) {
        stateManager.setCurrentUser(currentUser);
    }

    stateManager.setLoading(false);

    renderPage();
    setupEventListeners();
    setupProfileMenu();

    stateManager.subscribe(() => {
        renderPage();
        updateCartCount();
        setupProfileMenu();
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);

// ✅ NEW: Standalone Login Page
function renderLogin(container: HTMLElement) {
    container.innerHTML = `
        <div class="login-page-wrapper">
            <!-- Background with gradient and decorative elements -->
            <div class="login-background">
                <div class="login-gradient-blob login-blob-1"></div>
                <div class="login-gradient-blob login-blob-2"></div>
                <div class="login-gradient-blob login-blob-3"></div>
            </div>

            <!-- Main content -->
            <div class="login-container">
                <div class="login-card">
                    <!-- Logo -->
                    <div class="login-logo-wrapper">
                        <div class="login-logo-text">ShoeHub</div>
                    </div>

                    <!-- Heading -->
                    <h1 class="login-heading">Login</h1>

                    <!-- Form -->
                    <form id="login-form" class="login-form">
                        <!-- Email Field -->
                        <div class="login-form-group">
                            <label for="login-email" class="login-label">Email</label>
                            <input 
                                type="email" 
                                id="login-email" 
                                class="login-input" 
                                placeholder="name@example.com" 
                                required
                            >
                        </div>

                        <!-- Password Field with Forgot Password Link -->
                        <div class="login-form-group">
                            <div class="login-password-header">
                                <label for="login-password" class="login-label">Password</label>
                                <a href="#" class="login-forgot-password">Forgot password?</a>
                            </div>
                            <input 
                                type="password" 
                                id="login-password" 
                                class="login-input" 
                                placeholder="••••••••" 
                                required
                            >
                        </div>

                        <!-- Sign In Button -->
                        <button type="submit" class="login-btn">
                            Sign In
                        </button>

                        <!-- Error Message -->
                        <div id="login-error" class="login-error" style="display: none;"></div>
                    </form>

                    <!-- Divider -->
                    <div class="login-divider">
                        <span class="login-divider-text">We'll send you a link</span>
                    </div>

                    <!-- Social/Email Login Options -->
                    <div class="login-social-options">
                        <button type="button" class="login-social-btn" title="Gmail">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                        </button>
                        <button type="button" class="login-social-btn" title="Google">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                        </button>
                        <button type="button" class="login-social-btn" title="Outlook">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2 4h7v8H2V4zm9 0h11v2H11V4zm0 4h11v2H11V8zm0 4h11v2H11v-2zM2 14h7v6H2v-6zm9-2h11v2H11v-2zm0 4h11v2H11v-2z"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Sign Up Link -->
                    <p class="login-signup-text">
                        Don't have an account? <a href="#" id="go-to-signup-link" class="login-signup-link">Sign up</a>
                    </p>
                </div>
            </div>
        </div>
    `;

    // ✅ Form submission handler (unchanged logic)
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (document.getElementById('login-email') as HTMLInputElement).value;
        const password = (document.getElementById('login-password') as HTMLInputElement).value;
        const result = await login(email, password);

        if (result.success) {
            stateManager.setCurrentUser(getCurrentUser());
            stateManager.navigateTo('home');
        } else {
            const errorDiv = document.getElementById('login-error');
            if (errorDiv) {
                errorDiv.textContent = result.error || 'Login failed';
                errorDiv.style.display = 'block';
            }
        }
    });

    // Sign up link
    document.getElementById('go-to-signup-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        stateManager.navigateTo('signup');
    });

    // Forgot password link
    document.querySelector('.login-forgot-password')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Password reset feature coming soon!');
    });

    // Social login buttons (disabled for now, just prevent default)
    document.querySelectorAll('.login-social-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Social login coming soon!');
        });
    });
}

// ✅ NEW: Standalone Signup Page
function renderSignup(container: HTMLElement) {
    container.innerHTML = `
        <div class="login-page-wrapper">
            <!-- Background with gradient and decorative elements -->
            <div class="login-background">
                <div class="login-gradient-blob login-blob-1"></div>
                <div class="login-gradient-blob login-blob-2"></div>
                <div class="login-gradient-blob login-blob-3"></div>
            </div>

            <!-- Main content -->
            <div class="login-container">
                <div class="login-card">
                    <!-- Logo -->
                    <div class="login-logo-wrapper">
                        <div class="login-logo-text">ShoeHub</div>
                    </div>

                    <!-- Heading -->
                    <h1 class="login-heading">Create Account</h1>

                    <!-- Form -->
                    <form id="signup-form" class="login-form">
                        <!-- Name Field -->
                        <div class="login-form-group">
                            <label for="signup-name" class="login-label">Full Name</label>
                            <input 
                                type="text" 
                                id="signup-name" 
                                class="login-input" 
                                placeholder="John Doe" 
                                required
                            >
                        </div>

                        <!-- Email Field -->
                        <div class="login-form-group">
                            <label for="signup-email" class="login-label">Email</label>
                            <input 
                                type="email" 
                                id="signup-email" 
                                class="login-input" 
                                placeholder="name@example.com" 
                                required
                            >
                        </div>

                        <!-- Password Field -->
                        <div class="login-form-group">
                            <label for="signup-password" class="login-label">Password (min 6 chars)</label>
                            <input 
                                type="password" 
                                id="signup-password" 
                                class="login-input" 
                                placeholder="••••••••" 
                                required
                            >
                        </div>

                        <!-- Sign Up Button -->
                        <button type="submit" class="login-btn">
                            Create Account
                        </button>

                        <!-- Error Message -->
                        <div id="signup-error" class="login-error" style="display: none;"></div>
                    </form>

                    <!-- Divider -->
                    <div class="login-divider">
                        <span class="login-divider-text">Quick sign up options</span>
                    </div>

                    <!-- Social/Email Signup Options -->
                    <div class="login-social-options">
                        <button type="button" class="login-social-btn" title="Gmail">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                        </button>
                        <button type="button" class="login-social-btn" title="Google">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                        </button>
                        <button type="button" class="login-social-btn" title="Outlook">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2 4h7v8H2V4zm9 0h11v2H11V4zm0 4h11v2H11V8zm0 4h11v2H11v-2zM2 14h7v6H2v-6zm9-2h11v2H11v-2zm0 4h11v2H11v-2z"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Login Link -->
                    <p class="login-signup-text">
                        Already have an account? <a href="#" id="go-to-login-link" class="login-signup-link">Sign in</a>
                    </p>
                </div>
            </div>
        </div>
    `;

    // ✅ Form submission handler (unchanged logic)
    document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = (document.getElementById('signup-name') as HTMLInputElement).value;
        const email = (document.getElementById('signup-email') as HTMLInputElement).value;
        const password = (document.getElementById('signup-password') as HTMLInputElement).value;
        const result = await signup(email, password, name);

        if (result.success) {
            stateManager.setCurrentUser(getCurrentUser());
            stateManager.navigateTo('home');
        } else {
            const errorDiv = document.getElementById('signup-error');
            if (errorDiv) {
                errorDiv.textContent = result.error || 'Signup failed';
                errorDiv.style.display = 'block';
            }
        }
    });

    // Login link
    document.getElementById('go-to-login-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        stateManager.navigateTo('login');
    });

    // Social signup buttons (disabled for now)
    document.querySelectorAll('.login-social-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Social signup coming soon!');
        });
    });
}

function renderHome(container: HTMLElement, state: AppState) {
    container.innerHTML = `
        <!-- ✅ HERO SECTION: Sale Banner -->
        <section class="hero-sale-banner">
            <div class="hero-sale-background">
                <div class="hero-sale-gradient-1"></div>
                <div class="hero-sale-gradient-2"></div>
            </div>
            <div class="container">
                <div class="hero-sale-content">
                    <div class="hero-sale-badge">LIMITED TIME</div>
                    <h1 class="hero-sale-title">SNEAKER SALE</h1>
                    <p class="hero-sale-subtitle">Up to 40% off select styles</p>
                    <div class="hero-sale-countdown" id="sale-countdown">
                        <div class="countdown-item">
                            <span class="countdown-number" id="countdown-days">3</span>
                            <span class="countdown-label">Days</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-number" id="countdown-hours">14</span>
                            <span class="countdown-label">Hours</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-number" id="countdown-mins">27</span>
                            <span class="countdown-label">Mins</span>
                        </div>
                    </div>
                    <button class="btn btn-primary hero-sale-btn">Shop Sale</button>
                </div>
            </div>
        </section>

        <!-- Rest of page unchanged -->
        <div class="container">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--spacing-lg);">
                <div>
                    <h2 style="font-size: var(--font-size-2xl); font-weight: 800;">Featured Shoes</h2>
                    <p style="color: var(--text-light);">Our hand-picked selection for you</p>
                </div>
                <button class="btn btn-outline" style="padding: var(--spacing-sm) var(--spacing-md); font-size: var(--font-size-sm);">View All</button>
            </div>

            <div class="products-grid">
                ${state.products.map(product => `
                    <div class="product-card ${!product.inStock ? 'is-out-of-stock' : ''}" data-product-id="${product.id}">
                        <div class="product-card-image-wrapper">
                            ${product.price > 15000 ? '<span class="product-card-badge">Premium</span>' : ''}
                            <img src="${product.image}" alt="${product.name}" class="product-card-image">
                        </div>
                        <div class="product-card-content">
                            <span class="product-card-category">${product.category}</span>
                            <h3 class="product-card-name">${product.name}</h3>
                            <div class="product-card-rating">
                                <span>★</span><span>★</span><span>★</span><span>★</span><span>☆</span>
                                <span class="rating-count">(${product.reviews})</span>
                            </div>
                            <div class="product-card-footer">
                                <span class="product-card-price">$${(product.price / 100).toFixed(2)}</span>
                                <span class="product-card-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                                    ${product.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const productId = Number(card.getAttribute('data-product-id'));
            stateManager.navigateTo('product-detail', productId);
        });
    });

    document.querySelector('.hero-sale-btn')?.addEventListener('click', () => {
        stateManager.navigateTo('home');
    });

    initializeSaleCountdown();
}

function initializeSaleCountdown() {
    function updateCountdown() {
        let totalSeconds = (3 * 24 * 60 * 60) + (14 * 60 * 60) + (27 * 60);

        const interval = setInterval(() => {
            const days = Math.floor(totalSeconds / (24 * 60 * 60));
            const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
            const mins = Math.floor((totalSeconds % (60 * 60)) / 60);

            const daysEl = document.getElementById('countdown-days');
            const hoursEl = document.getElementById('countdown-hours');
            const minsEl = document.getElementById('countdown-mins');

            if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
            if (minsEl) minsEl.textContent = mins.toString().padStart(2, '0');

            totalSeconds--;

            if (totalSeconds < 0) {
                clearInterval(interval);
                if (daysEl) daysEl.textContent = '0';
                if (hoursEl) hoursEl.textContent = '0';
                if (minsEl) minsEl.textContent = '0';
            }
        }, 1000);
    }

    updateCountdown();
}

function renderProductDetail(appElement: HTMLElement, state: AppState): void {
    const product = state.products.find(p => p.id === state.selectedProductId);

    if (!product) {
        appElement.innerHTML = `
            <div class="container" style="padding: 2rem;">
                <h2>Product not found</h2>
                <button id="back-home-btn">Back to Home</button>
            </div>
        `;

        const backBtn = document.getElementById('back-home-btn');
        backBtn?.addEventListener('click', () => {
            stateManager.navigateTo('home');
        });

        return;
    }

    let selectedSize: number | null = product.sizes?.[0] ?? null;
    let quantity = 1;

    appElement.innerHTML = `
        <section class="product-detail-page" style="margin-top:2rem;">
            <div class="product-detail-container" style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:start;">
                
                <div class="product-image-wrapper" style="background:#f8f8f8;padding:2rem;border-radius:16px;">
                    <img 
                        src="${product.image}" 
                        alt="${product.name}" 
                        style="width:100%;max-width:420px;display:block;margin:auto;"
                    />
                </div>

                <div class="product-info">
                    <p style="text-transform:uppercase;letter-spacing:1px;color:#777;margin-bottom:0.5rem;">
                        ${product.category ?? 'Product'}
                    </p>

                    <h1 style="font-size:3rem;margin:0 0 1rem 0;">${product.name}</h1>

                    <p style="font-size:2rem;font-weight:700;margin:0 0 1rem 0;">
                        $${(product.price / 100).toFixed(2)}
                    </p>

                    <p style="color:#666;line-height:1.6;margin-bottom:1.5rem;">
                        ${product.description}
                    </p>

                    <div style="margin-bottom:1rem;">
                        <h4 style="margin-bottom:0.75rem;">Select Size</h4>
                        <div id="size-options" style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                            ${(product.sizes ?? []).map(size => `
                                <button 
                                    class="size-btn ${size === selectedSize ? 'active' : ''}" 
                                    data-size="${size}"
                                    style="
                                        padding:0.6rem 0.9rem;
                                        border:1px solid #ddd;
                                        border-radius:8px;
                                        background:${size === selectedSize ? 'var(--secondary-color)' : '#fff'};
                                        color:${size === selectedSize ? '#fff' : '#111'};
                                        cursor:pointer;
                                    "
                                >
                                    ${size}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div style="margin-bottom:1rem;">
                        <h4 style="margin-bottom:0.75rem;">Color</h4>
                        <select id="color-select" style="width:100%;padding:0.9rem;border:1px solid #ddd;border-radius:8px;">
                            <option value="">Choose a color...</option>
                            ${(product.colors ?? []).map(color => `
                                <option value="${color}">${color}</option>
                            `).join('')}
                        </select>
                    </div>

                    <div style="margin-bottom:1.5rem;">
                        <h4 style="margin-bottom:0.75rem;">Quantity</h4>
                        <div style="display:flex;align-items:center;gap:0.75rem;">
                            <button id="qty-decrease" style="padding:0.4rem 0.8rem;">-</button>
                            <span id="qty-value" style="min-width:20px;text-align:center;">1</span>
                            <button id="qty-increase" style="padding:0.4rem 0.8rem;">+</button>
                        </div>
                    </div>

                    <button 
                        id="add-to-cart-btn"
                        ${!product.inStock ? 'disabled' : ''}
                        style="
                            width:100%;
                            padding:1rem;
                            border:none;
                            border-radius:10px;
                            background:${product.inStock ? 'var(--secondary-color)' : '#ccc'};
                            color:white;
                            font-size:1rem;
                            font-weight:600;
                            cursor:${product.inStock ? 'pointer' : 'not-allowed'};
                            margin-bottom: 20px;
                            opacity:${product.inStock ? '1' : '0.6'};
                        "
                    >
                        ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>

                        <div id="cart-error" style="
                            margin-top: 12px;
                            padding: 10px 14px;
                            background-color: #fee2e2;
                            color: #b91c1c;
                            border: 1px solid #fecaca;
                            border-radius: 8px;
                            font-size: 14px;
                            display: none;
                            align-items: center;
                            gap: 8px;
                        ">
                            <span style="font-weight: 700;">⚠</span>
                            <span id="cart-error-text"></span>
                        </div>
                    ${state.successMessage
            ? `
                        <div class="success-message" style="
                            margin-top: 12px;
                            color: #155724;
                            background-color: #d4edda;
                            border: 1px solid #c3e6cb;
                            padding: 10px;
                            border-radius: 6px;
                            font-size: 14px;
                        ">
                            ${state.successMessage}
                        </div>


                    `
            : ''
        }
                </div>
            </div>
        </section>
    `;

    const sizeButtons = appElement.querySelectorAll('.size-btn');
    const colorSelect = document.getElementById('color-select') as HTMLSelectElement;
    const qtyValue = document.getElementById('qty-value') as HTMLSpanElement;
    const qtyDecrease = document.getElementById('qty-decrease') as HTMLButtonElement;
    const qtyIncrease = document.getElementById('qty-increase') as HTMLButtonElement;
    const addToCartBtn = document.getElementById('add-to-cart-btn') as HTMLButtonElement;

    colorSelect.addEventListener('change', () => {
        const errorDiv = document.getElementById('cart-error') as HTMLDivElement;

        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }
    });

    sizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedSize = Number((button as HTMLButtonElement).dataset.size);

            sizeButtons.forEach(btn => {
                const b = btn as HTMLButtonElement;
                b.style.background = '#fff';
                b.style.color = '#111';
                b.style.border = '1px solid #ddd';
            });

            const clickedBtn = button as HTMLButtonElement;
            clickedBtn.style.background = 'var(--secondary-color)';
            clickedBtn.style.color = '#fff';
            clickedBtn.style.border = 'none';
        });
    });

    qtyDecrease.addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            qtyValue.textContent = String(quantity);
        }
    });

    qtyIncrease.addEventListener('click', () => {
        quantity++;
        qtyValue.textContent = String(quantity);
    });

    // Only attach click handler if product is in stock
    if (product.inStock) {
        addToCartBtn.addEventListener('click', () => {
            const errorDiv = document.getElementById('cart-error') as HTMLDivElement;

            if (errorDiv) {
                errorDiv.textContent = '';
                errorDiv.style.display = 'none';
            }

            if (!selectedSize) {
                if (errorDiv) {
                    errorDiv.textContent = 'Please select a size.';
                    errorDiv.style.display = 'block';
                }
                errorDiv.style.display = 'flex';

                addToCartBtn.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });

                return;
            }

            if (!colorSelect.value || colorSelect.value === 'default') {
                if (errorDiv) {
                    errorDiv.textContent = 'Please select a color.';
                    errorDiv.style.display = 'block';
                }

                addToCartBtn.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });

                return;
            }

            addToCartBtn.disabled = true;
            addToCartBtn.textContent = 'Adding...';

            setTimeout(() => {
                for (let i = 0; i < quantity; i++) {
                    stateManager.addToCart(product, selectedSize!, colorSelect.value);
                }

                stateManager.setSuccessMessage(`${quantity} item(s) added to cart!`);

                addToCartBtn.textContent = '✓ Added';
                addToCartBtn.style.backgroundColor = 'var(--success-color)';

                setTimeout(() => {
                    document.getElementById('add-to-cart-btn')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                }, 50);

                setTimeout(() => {
                    addToCartBtn.disabled = false;
                    addToCartBtn.textContent = 'Add to Cart';
                    addToCartBtn.style.backgroundColor = 'var(--secondary-color)';
                }, 1500);
            }, 600);
        });
    }
}

function renderCart(container: HTMLElement, state: AppState) {
    if (state.cart.length === 0) {
        container.innerHTML = `
            <div class="container" style="padding: var(--spacing-2xl) 0; text-align: center;">
                <div class="cart-container">
                    <div style="font-size: 64px; margin-bottom: var(--spacing-lg);">🛒</div>
                    <h2 style="font-size: var(--font-size-2xl); font-weight: 800; margin-bottom: var(--spacing-md);">Your Cart is Empty</h2>
                    <button id="continue-shopping-btn" class="btn btn-primary" style="max-width: 300px; margin: 0 auto;">Start Shopping</button>
                </div>
            </div>
        `;
        document.getElementById('continue-shopping-btn')?.addEventListener('click', () => stateManager.navigateTo('home'));
        return;
    }

    const total = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    container.innerHTML = `
        <div class="container" style="padding: var(--spacing-xl) 0;">
            <h1 style="font-size: var(--font-size-2xl); font-weight: 800; margin-bottom: var(--spacing-xl);">Shopping Cart</h1>
            <div class="cart-container" style="margin: 0; max-width: 100%;">
                ${state.cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-image">
                        <div>
                            <h3 style="font-weight: 700; margin-bottom: var(--spacing-xs);">${item.product.name}</h3>
                            <p style="color: var(--text-light); font-size: var(--font-size-sm);">
                            Size: <strong>${item.selectedSize}</strong> · Color: <strong style="text-transform: capitalize;">${item.selectedColor}</strong>
                            </p>
                            <p style="font-weight: 600; margin-top: var(--spacing-sm);">$${(item.product.price / 100).toFixed(2)} × ${item.quantity}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="font-weight: 800; font-size: var(--font-size-lg); margin-bottom: var(--spacing-md);">$${((item.product.price * item.quantity) / 100).toFixed(2)}</p>
                            <button class="remove-btn btn" data-product-id="${item.product.id}" data-size="${item.selectedSize}" data-color="${item.selectedColor}" style="padding: var(--spacing-xs) var(--spacing-sm); font-size: 12px; background-color: #fee2e2; color: var(--error-color);">Remove</button>
                        </div>
                    </div>
                `).join('')}
                <div class="cart-total-section">
                    <div style="display: flex; justify-content: flex-end; gap: var(--spacing-xl); margin-bottom: var(--spacing-lg);">
                        <span style="color: var(--text-light); font-weight: 600; font-size: var(--font-size-lg);">Total:</span>
                        <span style="font-weight: 800; font-size: var(--font-size-2xl); color: var(--primary-color);">$${(total / 100).toFixed(2)}</span>
                    </div>
                    <button class="btn btn-primary" id="checkout-btn" style="min-width: 250px;">Proceed to Checkout</button>
                </div>
            </div>
        </div>
    `;

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget as HTMLElement;
            stateManager.removeFromCart(Number(target.dataset.productId), Number(target.dataset.size), target.dataset.color!);
        });
    });

    document.getElementById('checkout-btn')?.addEventListener('click', () => {
        const checkoutSection = document.querySelector('.cart-total-section');
        if (!checkoutSection) return;
        const currentUserEmail = state.currentUser?.email ?? '';
        checkoutSection.innerHTML = `
            <div style="text-align: left; max-width: 400px; margin-left: auto;">
                <h3 style="font-weight: 800; margin-bottom: var(--spacing-md);">Checkout</h3>
                <div class="form-group">
                    <input type="email" id="checkout-email" class="form-control" value="${currentUserEmail}" placeholder="your@email.com">
                </div>
                <button id="confirm-purchase-btn" class="btn btn-primary" style="width: 100%;">Complete Purchase</button>
                <div id="checkout-message" style="margin-top: var(--spacing-md); text-align: center; display: none;"></div>
            </div>
        `;

        document.getElementById('confirm-purchase-btn')?.addEventListener('click', () => {
            const emailInput = document.getElementById('checkout-email') as HTMLInputElement;
            const messageDiv = document.getElementById('checkout-message');
            const confirmBtn = document.getElementById('confirm-purchase-btn') as HTMLButtonElement;

            // ── Regex email validation ─────────────────────────────────────────
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value.trim())) {
                if (messageDiv) {
                    messageDiv.textContent = '⚠️ Please enter a valid email address.';
                    messageDiv.style.color = 'var(--error-color)';
                    messageDiv.style.display = 'block';
                }
                emailInput.focus();
                return; // Stop — do NOT touch button state
            }

            // ── Email is valid — simulate processing with guaranteed completion ─
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Processing...';
            if (messageDiv) {
                messageDiv.textContent = 'Processing your order...';
                messageDiv.style.color = 'var(--text-light)';
                messageDiv.style.display = 'block';
            }

            // ── 1. SEND EMAIL (async) ───────────────────────────────────────
            emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                {
                    email: emailInput.value.trim(),
                    order_id: Date.now().toString(),
                    orders: state.cart.map(item => ({
                        name: item.product.name,
                        units: item.quantity,
                        total_price: ((item.product.price / 100) * item.quantity).toFixed(2),
                        price: (item.product.price / 100).toFixed(2),
                        image_url: item.product.image,
                        size: item.selectedSize,
                        color: item.selectedColor,
                    })),
                    cost: {
                        shipping: '0.00',
                        tax: '0.00',
                        total: (total / 100).toFixed(2),
                    }
                }
            )
                .catch(() => {
                    console.error('⚠️ Email failed to send (demo mode anyway)');
                });

            // ── 2. ALWAYS COMPLETE THE UI FLOW ───────────────────────────────
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Complete Purchase';
            if (messageDiv) messageDiv.style.display = 'none';

            checkoutSection.innerHTML = `
    <div class="order-confirmation" style="text-align:center;
    margin-top:var(--spacing-lg);
    font-size:var(--font-size-lg);
    color:var(--success-color);">
      ✅ Order placed! (Demo mode)
    </div>
  `;

            // ── 3. Clear cart and reset UI after a short delay ────────────────
            setTimeout(() => {
                stateManager.clearCart();
            }, 1500);
        });
    });
}


function renderSettings(container: HTMLElement, state: AppState) {
    if (!state.currentUser) return;

    let pendingAvatar: string | null = null;

    container.innerHTML = `
        <div class="container" style="max-width: 600px; padding: var(--spacing-2xl) 0;">
            <div class="cart-container">
                <h2 style="font-weight: 800; margin-bottom: var(--spacing-xl);">Account Settings</h2>

                <div style="text-align: center; margin-bottom: var(--spacing-2xl);">
                    <div id="profile-pic-display" class="user-avatar" style="width: 120px; height: 120px; margin: 0 auto var(--spacing-md) auto; font-size: 40px; border: 4px solid var(--border-color);">
                        ${state.currentUser.profilePicture
            ? `<img src="${state.currentUser.profilePicture}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
            : state.currentUser.name.charAt(0).toUpperCase()
        }
                    </div>

                    <input type="file" id="profile-pic-input" accept="image/*" style="display: none;">
                    <button type="button" id="change-pic-btn" class="btn btn-outline" style="padding: var(--spacing-xs) var(--spacing-md); font-size: 12px;">
                        Change Picture
                    </button>
                </div>

                <div id="cropper-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 3000; align-items: center; justify-content: center; padding: var(--spacing-lg);">
                    <div style="background: white; padding: var(--spacing-lg); border-radius: var(--radius-lg); max-width: 500px; width: 100%;">
                        <h3 style="margin-bottom: var(--spacing-lg);">Crop Your Profile Picture</h3>
                        <div style="max-height: 400px; overflow: hidden; margin-bottom: var(--spacing-lg);">
                            <img id="cropper-image" style="max-width: 100%;">
                        </div>
                        <div style="display: flex; gap: var(--spacing-md);">
                            <button type="button" id="crop-cancel-btn" class="btn btn-outline" style="flex: 1;">Cancel</button>
                            <button type="button" id="crop-confirm-btn" class="btn btn-primary" style="flex: 1;">Crop</button>
                        </div>
                    </div>
                </div>

                <form id="settings-form">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" id="settings-name" class="form-control" value="${state.currentUser.name}">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" class="form-control" value="${state.currentUser.email}" disabled style="background-color: var(--bg-light);">
                    </div>

                    <button type="button" id="settings-save-btn" class="btn btn-primary" style="width: 100%; margin-top: var(--spacing-md);">
                        Save
                    </button>

                    <button type="button" id="settings-logout-btn" class="btn btn-outline" style="width: 100%; margin-top: var(--spacing-md); border-color: var(--error-color); color: var(--error-color);">
                        Logout
                    </button>
                </form>

                <div id="settings-message" style="margin-top: var(--spacing-md); text-align: center; display: none;"></div>
            </div>
        </div>
    `;

    const picInput = document.getElementById('profile-pic-input') as HTMLInputElement;
    const msg = document.getElementById('settings-message') as HTMLDivElement;

    document.getElementById('change-pic-btn')?.addEventListener('click', () => {
        picInput.value = '';
        picInput.click();
    });

    picInput.addEventListener('change', (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {
            const modal = document.getElementById('cropper-modal');
            const cropperImg = document.getElementById('cropper-image') as HTMLImageElement;

            if (!modal || !cropperImg) return;

            cropperImg.src = event.target?.result as string;
            modal.style.display = 'flex';

            if (cropper) {
                cropper.destroy();
                cropper = null;
            }

            cropper = new (window as any).Cropper(cropperImg, {
                aspectRatio: 1,
                viewMode: 1,
            });
        };

        reader.readAsDataURL(file);
    });

    document.getElementById('crop-cancel-btn')?.addEventListener('click', () => {
        document.getElementById('cropper-modal')!.style.display = 'none';

        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    });

    document.getElementById('crop-confirm-btn')?.addEventListener('click', () => {
        if (!cropper) return;

        const base64 = cropper
            .getCroppedCanvas({
                width: 128,
                height: 128,
            })
            .toDataURL('image/jpeg', 0.7);

        pendingAvatar = base64;

        const profilePicDisplay = document.getElementById('profile-pic-display');

        if (profilePicDisplay) {
            profilePicDisplay.innerHTML = `
                <img src="${base64}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
            `;
        }

        document.getElementById('cropper-modal')!.style.display = 'none';

        cropper.destroy();
        cropper = null;

        msg.textContent = 'Profile picture ready. Click Save.';
        msg.style.color = 'var(--text-light)';
        msg.style.display = 'block';
    });

    document.getElementById('settings-logout-btn')?.addEventListener('click', () => {
        logout();
        stateManager.setCurrentUser(null);
        stateManager.navigateTo('login');
    });

    document.getElementById('settings-save-btn')?.addEventListener('click', async () => {

        const newName = (document.getElementById('settings-name') as HTMLInputElement).value.trim();

        if (!newName) {
            msg.textContent = 'Name is required.';
            msg.style.color = 'var(--error-color)';
            msg.style.display = 'block';
            return;
        }

        const updates: Partial<User> = {
            name: newName,
        };

        if (pendingAvatar) {
            updates.profilePicture = pendingAvatar;
        }

        console.log('Saving updates:', updates);

        const result = await updateUserProfile(updates);

        if (!result.success) {
            msg.textContent = result.error || 'Could not save settings.';
            msg.style.color = 'var(--error-color)';
            msg.style.display = 'block';
            return;
        }

        pendingAvatar = null;

        const updatedUser = getCurrentUser();
        stateManager.setCurrentUser(updatedUser);

        const avatarBtn = document.getElementById('user-avatar-btn');

        if (avatarBtn && updatedUser?.profilePicture) {
            avatarBtn.innerHTML = `
                <img src="${updatedUser.profilePicture}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
            `;
        }

        msg.textContent = 'Settings saved!';
        msg.style.color = 'var(--success-color)';
        msg.style.display = 'block';

        setTimeout(() => {
            renderPage();
        }, 700);
    });
}
function renderPage() {
    const state = stateManager.getState();
    const appElement = document.getElementById('app');
    const headerElement = document.getElementById('main-header');
    if (!appElement) return;
    if (headerElement) headerElement.style.display = state.currentUser ? 'block' : 'none';
    if (!state.currentUser) {
        appElement.innerHTML = '';
        state.currentPage === 'signup' ? renderSignup(appElement) : renderLogin(appElement);
        return;
    }
    appElement.innerHTML = '';
    window.scrollTo(0, 0);
    switch (state.currentPage) {
        case 'home': renderHome(appElement, state); break;
        case 'product-detail': renderProductDetail(appElement, state); break;
        case 'cart': renderCart(appElement, state); break;
        case 'settings': renderSettings(appElement, state); break;
        default: renderHome(appElement, state);
    }
}

function setupEventListeners() {
    document.querySelectorAll('[data-page]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = (e.currentTarget as HTMLElement).dataset.page as any;
            stateManager.navigateTo(page);
        });
    });
    document.getElementById('logo-btn')?.addEventListener('click', () => stateManager.navigateTo('home'));
}

function updateCartCount() {
    const state = stateManager.getState();
    const count = state.cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) cartCountElement.textContent = count.toString();
}

function setupProfileMenu() {
    const avatarBtn = document.getElementById('user-avatar-btn');
    const dropdown = document.getElementById('user-menu-dropdown');
    if (!avatarBtn || !dropdown) return;
    const state = stateManager.getState();
    if (state.currentUser) {
        if (state.currentUser.profilePicture) {
            avatarBtn.innerHTML = `<img src="${state.currentUser.profilePicture}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        } else {
            avatarBtn.textContent = state.currentUser.name.charAt(0).toUpperCase();
            avatarBtn.innerHTML = state.currentUser.name.charAt(0).toUpperCase();
        }
    }
    avatarBtn.onclick = (e) => { e.stopPropagation(); dropdown.classList.toggle('show'); };
    document.getElementById('settings-btn')?.addEventListener('click', () => { dropdown.classList.remove('show'); stateManager.navigateTo('settings'); });
    document.getElementById('logout-btn')?.addEventListener('click', () => { dropdown.classList.remove('show'); logout(); stateManager.setCurrentUser(null); stateManager.navigateTo('login'); });
    document.onclick = (e) => { if (!dropdown.contains(e.target as Node)) dropdown.classList.remove('show'); };
}