/* ========================================
   SAGAR BAGS - Quote Cart System
   ======================================== */

const Cart = {
  STORAGE_KEY: 'sagarbags_cart',
  ACTIVE_CARTS_KEY: 'sagarbags_active_carts',
  WHATSAPP_NUMBER: '919869509070',

  // Initialize cart
  init() {
    this.updateCartCount();
    this.renderCartDrawer();
    this.bindEvents();
    // Sync cart with admin tracking on page load
    this.syncCartToAdmin();
    // Listen for auth state changes to sync cart
    this.listenForAuthChanges();
  },

  // Listen for authentication state changes
  listenForAuthChanges() {
    if (typeof CustomerAuth !== 'undefined') {
      CustomerAuth.onAuthStateChanged(async (user) => {
        if (user) {
          // User just logged in - cart should already be merged by CustomerAuthUI
          // Just sync to Firebase
          await this.syncCartToFirebaseUser();
        }
      });
    }
  },

  // Sync cart to Firebase for logged-in user
  async syncCartToFirebaseUser() {
    if (typeof CustomerAuth === 'undefined' || !CustomerAuth.isLoggedIn()) {
      return;
    }

    const cart = this.getCart();
    try {
      await CustomerAuth.saveCart(cart);
    } catch (error) {
      console.error('Error syncing cart to user:', error);
    }
  },

  // Get cart from localStorage
  getCart() {
    const cart = localStorage.getItem(this.STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  },

  // Save cart to localStorage
  saveCart(cart) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    this.updateCartCount();
    // Sync with admin panel tracking
    this.syncCartToAdmin();
    // Sync to Firebase for logged-in users
    this.syncCartToFirebaseUser();
  },

  // Sync cart to admin panel for tracking (Firebase + localStorage fallback)
  syncCartToAdmin() {
    const cart = this.getCart();

    // Generate or get session ID
    let sessionId = sessionStorage.getItem('sagarbags_user_session');
    if (!sessionId) {
      sessionId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('sagarbags_user_session', sessionId);
    }

    const cartData = cart.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      image: item.image
    }));

    // Sync to Firebase if available
    if (typeof FirebaseDB !== 'undefined') {
      FirebaseDB.syncCart(cartData).catch(err => {
        console.log('Firebase sync failed, using localStorage fallback:', err);
      });
    }

    // Also keep localStorage as fallback
    const activeCarts = this.getActiveCarts();
    const existingIndex = activeCarts.findIndex(c => c.sessionId === sessionId);

    const cartEntry = {
      sessionId: sessionId,
      items: cartData,
      itemCount: cart.length,
      lastUpdated: new Date().toISOString(),
      createdAt: existingIndex !== -1 ? activeCarts[existingIndex].createdAt : new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 100),
      status: 'active'
    };

    if (existingIndex !== -1) {
      activeCarts[existingIndex] = cartEntry;
    } else if (cart.length > 0) {
      activeCarts.unshift(cartEntry);
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const filteredCarts = activeCarts.filter(c => {
      if (c.itemCount === 0 && c.lastUpdated < oneHourAgo) return false;
      return true;
    }).slice(0, 100);

    localStorage.setItem(this.ACTIVE_CARTS_KEY, JSON.stringify(filteredCarts));
  },

  // Get active carts (for admin sync)
  getActiveCarts() {
    const data = localStorage.getItem(this.ACTIVE_CARTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Add item to cart
  addToCart(productId) {
    const cart = this.getCart();
    const product = getProductById(productId);

    if (!product) {
      console.error('Product not found:', productId);
      return false;
    }

    // Check if already in cart
    const existingIndex = cart.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
      showToast(`${product.name} is already in your quote cart`, 'info');
      return false;
    }

    cart.push({
      id: productId,
      name: product.name,
      category: product.category,
      image: product.images[0],
      minOrder: product.minOrder
    });

    this.saveCart(cart);
    this.renderCartDrawer();
    showToast(`${product.name} added to quote cart`, 'success');
    return true;
  },

  // Remove item from cart
  removeFromCart(productId) {
    let cart = this.getCart();
    const item = cart.find(i => i.id === productId);
    cart = cart.filter(item => item.id !== productId);
    this.saveCart(cart);
    this.renderCartDrawer();
    if (item) {
      showToast(`${item.name} removed from cart`, 'success');
    }
  },

  // Clear cart
  clearCart() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.updateCartCount();
    this.renderCartDrawer();
  },

  // Get cart count
  getCartCount() {
    const cart = this.getCart();
    return cart.length;
  },

  // Update cart count badge
  updateCartCount() {
    const count = this.getCartCount();
    const badges = document.querySelectorAll('.cart-count');
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  // Generate WhatsApp message
  generateWhatsAppMessage() {
    const cart = this.getCart();
    if (cart.length === 0) return '';

    let message = '🛍️ *Quote Request from Sagar Bags Website*\n\n';
    message += '📦 *Products I\'m interested in:*\n\n';

    cart.forEach((item, index) => {
      const category = getCategoryById(item.category);
      message += `${index + 1}. *${item.name}*\n`;
      message += `   Category: ${category ? category.name : item.category}\n`;
      if (item.minOrder) {
        message += `   Min Order: ${item.minOrder} pcs\n`;
      }
      message += '\n';
    });

    message += '-------------------\n';
    message += 'Please share pricing and details for these products.\n';
    message += 'Looking forward to your response!';

    return encodeURIComponent(message);
  },

  // Send via WhatsApp
  sendViaWhatsApp() {
    const message = this.generateWhatsAppMessage();
    if (!message) {
      showToast('Your cart is empty', 'error');
      return;
    }
    const url = `https://wa.me/${this.WHATSAPP_NUMBER}?text=${message}`;
    window.open(url, '_blank');
  },

  // Generate email body
  generateEmailBody() {
    const cart = this.getCart();
    if (cart.length === 0) return { subject: '', body: '' };

    const subject = 'Quote Request - Sagar Bags';
    let body = 'Quote Request from Sagar Bags Website\n\n';
    body += 'Products I\'m interested in:\n\n';

    cart.forEach((item, index) => {
      const category = getCategoryById(item.category);
      body += `${index + 1}. ${item.name}\n`;
      body += `   Category: ${category ? category.name : item.category}\n`;
      if (item.minOrder) {
        body += `   Min Order: ${item.minOrder} pcs\n`;
      }
      body += '\n';
    });

    body += '-------------------\n';
    body += 'Please share pricing and details for these products.\n\n';
    body += 'Contact Details:\n';
    body += 'Name: [Your Name]\n';
    body += 'Company: [Your Company]\n';
    body += 'Phone: [Your Phone]\n';

    return {
      subject: encodeURIComponent(subject),
      body: encodeURIComponent(body)
    };
  },

  // Send via Email
  sendViaEmail() {
    const { subject, body } = this.generateEmailBody();
    if (!body) {
      showToast('Your cart is empty', 'error');
      return;
    }
    // Using mailto - can be replaced with actual email in production
    const url = `mailto:info@sagarbags.com?subject=${subject}&body=${body}`;
    window.location.href = url;
  },

  // Render cart drawer
  renderCartDrawer() {
    const cartBody = document.querySelector('.cart-body');
    const cartFooter = document.querySelector('.cart-footer');
    if (!cartBody) return;

    const cart = this.getCart();

    if (cart.length === 0) {
      cartBody.innerHTML = `
        <div class="cart-empty">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p>Your quote cart is empty</p>
          <a href="products.html" class="btn btn-primary btn-sm">Browse Products</a>
        </div>
      `;
      if (cartFooter) cartFooter.style.display = 'none';
      return;
    }

    if (cartFooter) cartFooter.style.display = 'block';

    cartBody.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-category">${getCategoryById(item.category)?.name || item.category}</div>
          ${item.minOrder ? `<div class="cart-item-min-order">Min: ${item.minOrder} pcs</div>` : ''}
          <button class="cart-item-remove" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `).join('');

    // Bind remove events
    this.bindCartItemEvents();
  },

  // Bind cart item events
  bindCartItemEvents() {
    // Remove buttons
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.removeFromCart(id);
      });
    });
  },

  // Bind global events
  bindEvents() {
    // WhatsApp button
    const whatsappBtn = document.querySelector('.btn-whatsapp');
    if (whatsappBtn) {
      whatsappBtn.addEventListener('click', () => this.sendViaWhatsApp());
    }

    // Email button
    const emailBtn = document.querySelector('.btn-email');
    if (emailBtn) {
      emailBtn.addEventListener('click', () => this.sendViaEmail());
    }

    // Add to cart buttons (delegated)
    document.addEventListener('click', (e) => {
      if (e.target.closest('.add-to-cart')) {
        const btn = e.target.closest('.add-to-cart');
        const productId = btn.dataset.productId;
        this.addToCart(productId);
      }
    });
  }
};

// Initialize cart when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
});
