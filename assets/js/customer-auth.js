/* ========================================
   SAGAR BAGS - Customer Authentication
   ======================================== */

const CustomerAuthUI = {
  isInitialized: false,

  // Initialize auth UI
  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.createLoginModal();
    this.bindEvents();
    this.checkAuthState();
  },

  // Create login modal HTML
  createLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'login-overlay';
    modal.id = 'loginModal';
    modal.innerHTML = `
      <div class="login-modal">
        <div class="login-header">
          <h3>Welcome</h3>
          <button class="login-close" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="login-tabs">
          <button class="login-tab active" data-tab="login">Login</button>
          <button class="login-tab" data-tab="register">Register</button>
        </div>

        <div class="login-body">
          <!-- Login Form -->
          <form class="login-form active" id="loginForm" data-form="login">
            <div class="form-group">
              <label for="loginEmail">Email</label>
              <input type="email" id="loginEmail" name="email" required placeholder="your@email.com">
            </div>
            <div class="form-group">
              <label for="loginPassword">Password</label>
              <input type="password" id="loginPassword" name="password" required placeholder="Enter password">
            </div>
            <div class="forgot-password">
              <a href="#" id="forgotPasswordLink">Forgot password?</a>
            </div>
            <div class="form-error" id="loginError"></div>
            <button type="submit" class="btn btn-primary btn-login">Login</button>
          </form>

          <!-- Register Form -->
          <form class="login-form" id="registerForm" data-form="register">
            <div class="form-group">
              <label for="registerName">Name (Optional)</label>
              <input type="text" id="registerName" name="name" placeholder="Your name">
            </div>
            <div class="form-group">
              <label for="registerEmail">Email</label>
              <input type="email" id="registerEmail" name="email" required placeholder="your@email.com">
            </div>
            <div class="form-group">
              <label for="registerPassword">Password</label>
              <input type="password" id="registerPassword" name="password" required placeholder="Min 6 characters" minlength="6">
            </div>
            <div class="form-group">
              <label for="registerConfirmPassword">Confirm Password</label>
              <input type="password" id="registerConfirmPassword" name="confirmPassword" required placeholder="Confirm password">
            </div>
            <div class="form-error" id="registerError"></div>
            <button type="submit" class="btn btn-primary btn-login">Create Account</button>
          </form>

          <!-- Reset Password Form -->
          <form class="login-form reset-form" id="resetForm" data-form="reset">
            <button type="button" class="back-to-login" id="backToLogin">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to login
            </button>
            <p style="margin-bottom: 1rem; color: var(--text-secondary);">Enter your email and we'll send you a link to reset your password.</p>
            <div class="form-group">
              <label for="resetEmail">Email</label>
              <input type="email" id="resetEmail" name="email" required placeholder="your@email.com">
            </div>
            <div class="form-error" id="resetError"></div>
            <div class="form-success" id="resetSuccess" style="display: none; color: var(--success); margin-bottom: 1rem;"></div>
            <button type="submit" class="btn btn-primary btn-login">Send Reset Link</button>
          </form>

          <div class="login-guest-info">
            <p>Continue as guest - your cart will be saved to this browser.</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  // Bind events
  bindEvents() {
    const modal = document.getElementById('loginModal');
    if (!modal) return;

    // Close button
    modal.querySelector('.login-close').addEventListener('click', () => this.closeModal());

    // Overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeModal();
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        this.closeModal();
      }
    });

    // Tab switching
    modal.querySelectorAll('.login-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));

    // Register form
    document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));

    // Reset form
    document.getElementById('resetForm').addEventListener('submit', (e) => this.handleReset(e));

    // Forgot password link
    document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.showResetForm();
    });

    // Back to login
    document.getElementById('backToLogin').addEventListener('click', () => {
      this.hideResetForm();
    });

    // Login button click (delegated)
    document.addEventListener('click', (e) => {
      if (e.target.closest('.login-btn') || e.target.closest('#openLoginModal')) {
        this.openModal();
      }
    });

    // User menu toggle
    document.addEventListener('click', (e) => {
      const userMenu = e.target.closest('.user-menu');
      if (userMenu) {
        const btn = e.target.closest('.user-btn');
        if (btn) {
          userMenu.classList.toggle('open');
          e.stopPropagation();
        }
      } else {
        // Close all user menus
        document.querySelectorAll('.user-menu.open').forEach(menu => {
          menu.classList.remove('open');
        });
      }
    });

    // Logout button
    document.addEventListener('click', (e) => {
      if (e.target.closest('.logout-btn')) {
        this.handleLogout();
      }
    });
  },

  // Switch tabs
  switchTab(tabName) {
    const modal = document.getElementById('loginModal');

    // Update tab buttons
    modal.querySelectorAll('.login-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update forms
    modal.querySelectorAll('.login-form').forEach(form => {
      if (form.classList.contains('reset-form')) return; // Don't toggle reset form with tabs
      form.classList.toggle('active', form.dataset.form === tabName);
    });

    // Hide reset form when switching tabs
    this.hideResetForm();

    // Clear errors
    this.clearErrors();
  },

  // Show reset password form
  showResetForm() {
    const modal = document.getElementById('loginModal');
    modal.querySelectorAll('.login-form').forEach(form => {
      form.classList.remove('active');
    });
    modal.querySelectorAll('.login-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.getElementById('resetForm').classList.add('active');
  },

  // Hide reset password form
  hideResetForm() {
    document.getElementById('resetForm').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
    document.querySelector('.login-tab[data-tab="login"]').classList.add('active');
    document.getElementById('resetSuccess').style.display = 'none';
  },

  // Open modal
  openModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.clearErrors();
  },

  // Close modal
  closeModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    this.clearErrors();
    this.hideResetForm();
  },

  // Clear all errors
  clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => {
      el.textContent = '';
      el.classList.remove('show');
    });
    document.querySelectorAll('.login-form input').forEach(input => {
      input.classList.remove('error');
    });
  },

  // Show error
  showError(formId, message) {
    const errorEl = document.getElementById(formId + 'Error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
    }
  },

  // Handle login
  async handleLogin(e) {
    e.preventDefault();
    this.clearErrors();

    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    const btn = form.querySelector('.btn-login');

    if (!email || !password) {
      this.showError('login', 'Please fill in all fields');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Logging in...';

    try {
      // Get guest cart before login
      const guestCart = Cart.getCart();

      const result = await CustomerAuth.login(email, password);

      if (result.success) {
        // Get user's saved cart from Firebase
        const userCart = await CustomerAuth.getCart() || [];

        // Merge: user's cart + guest cart (no duplicates)
        const mergedCart = [...userCart];
        guestCart.forEach(item => {
          if (!mergedCart.find(i => i.id === item.id)) {
            mergedCart.push(item);
          }
        });

        // Save merged cart to Firebase and localStorage
        localStorage.setItem(Cart.STORAGE_KEY, JSON.stringify(mergedCart));
        if (mergedCart.length > 0) {
          await CustomerAuth.saveCart(mergedCart);
        }

        Cart.updateCartCount();
        Cart.renderCartDrawer();

        this.closeModal();
        this.updateUIForLoggedInUser();

        if (typeof showToast === 'function') {
          showToast('Welcome back!', 'success');
        }
      } else {
        this.showError('login', result.error);
      }
    } catch (error) {
      this.showError('login', 'An error occurred. Please try again.');
    }

    btn.disabled = false;
    btn.textContent = 'Login';
  },

  // Handle registration
  async handleRegister(e) {
    e.preventDefault();
    this.clearErrors();

    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const btn = form.querySelector('.btn-login');

    if (!email || !password) {
      this.showError('register', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      this.showError('register', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      this.showError('register', 'Password must be at least 6 characters');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Creating account...';

    try {
      const result = await CustomerAuth.register(email, password, name);

      if (result.success) {
        // Clear local cart for new user (they start fresh)
        if (typeof Cart !== 'undefined') {
          Cart.clearCart();
        }

        this.closeModal();
        this.updateUIForLoggedInUser();

        if (typeof showToast === 'function') {
          showToast('Account created successfully!', 'success');
        }
      } else {
        this.showError('register', result.error);
      }
    } catch (error) {
      this.showError('register', 'An error occurred. Please try again.');
    }

    btn.disabled = false;
    btn.textContent = 'Create Account';
  },

  // Handle password reset
  async handleReset(e) {
    e.preventDefault();
    this.clearErrors();

    const form = e.target;
    const email = form.email.value.trim();
    const btn = form.querySelector('.btn-login');
    const successEl = document.getElementById('resetSuccess');

    if (!email) {
      this.showError('reset', 'Please enter your email');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
      const result = await CustomerAuth.resetPassword(email);

      if (result.success) {
        successEl.textContent = 'Password reset email sent! Check your inbox.';
        successEl.style.display = 'block';
        form.reset();
      } else {
        this.showError('reset', result.error);
      }
    } catch (error) {
      this.showError('reset', 'An error occurred. Please try again.');
    }

    btn.disabled = false;
    btn.textContent = 'Send Reset Link';
  },

  // Handle logout
  async handleLogout() {
    try {
      await CustomerAuth.logout();

      // Clear the local cart on logout
      if (typeof Cart !== 'undefined') {
        Cart.clearCart();
      }

      this.updateUIForGuest();

      if (typeof showToast === 'function') {
        showToast('Logged out successfully', 'success');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Check auth state on load
  checkAuthState() {
    if (typeof CustomerAuth !== 'undefined') {
      CustomerAuth.onAuthStateChanged(async (user) => {
        if (user) {
          this.updateUIForLoggedInUser();

          // Load user's cart from Firebase
          try {
            const userCart = await CustomerAuth.getCart();
            if (userCart && userCart.length > 0) {
              localStorage.setItem(Cart.STORAGE_KEY, JSON.stringify(userCart));
              Cart.updateCartCount();
              Cart.renderCartDrawer();
            }
          } catch (error) {
            console.error('Error loading user cart:', error);
          }
        } else {
          this.updateUIForGuest();
          // Clear cart for guest (logged out state)
          if (typeof Cart !== 'undefined') {
            const currentCart = Cart.getCart();
            // Only clear if there's no active session (fresh page load without login)
            // This prevents clearing cart added as guest before login
          }
        }
      });
    }
  },

  // Update UI for logged-in user
  async updateUIForLoggedInUser() {
    const authContainer = document.getElementById('authContainer');
    if (!authContainer) return;

    const user = CustomerAuth.getCurrentUser();
    if (!user) return;

    // Get user profile for name
    let displayName = user.email.split('@')[0];
    try {
      const profile = await CustomerAuth.getUserProfile();
      if (profile && profile.name) {
        displayName = profile.name;
      }
    } catch (e) {
      // Use email fallback
    }

    authContainer.innerHTML = `
      <div class="user-menu">
        <button class="user-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="user-name">${displayName}</span>
        </button>
        <div class="user-dropdown">
          <a href="account.html" class="user-dropdown-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Account
          </a>
          <button class="user-dropdown-item logout-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    `;
  },

  // Update UI for guest
  updateUIForGuest() {
    const authContainer = document.getElementById('authContainer');
    if (!authContainer) return;

    authContainer.innerHTML = `
      <button class="login-btn" id="openLoginModal">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>Login</span>
      </button>
    `;
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for Firebase to be ready
  setTimeout(() => {
    CustomerAuthUI.init();
  }, 100);
});
