/* ========================================
   SAGAR BAGS - Main JavaScript
   ======================================== */

// -------------------- DOM Ready --------------------
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initCartDrawer();
  initScrollAnimations();
  initTestimonialSlider();
  initSmoothScroll();
  initMobileProductCards();
  initHeroVideo();
});

// -------------------- Hero Video Speed Control --------------------
function initHeroVideo() {
  const heroVideo = document.getElementById('heroVideo');
  if (heroVideo) {
    // Slow down video to 50% speed (0.5 = half speed)
    heroVideo.playbackRate = 0.5;
  }
}

// -------------------- Mobile Product Card Tap Behavior --------------------
function initMobileProductCards() {
  // Only enable on touch devices or small screens
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (!isMobile) return;

  // Use event delegation for dynamically rendered cards
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');
    if (!card) return;

    // Ignore if clicking on interactive elements
    if (e.target.closest('.favorite-btn') ||
        e.target.closest('.add-to-cart') ||
        e.target.closest('.btn-shortlist') ||
        e.target.closest('a.btn')) {
      return;
    }

    // Navigate to product detail page
    const productId = card.dataset.productId;
    if (productId) {
      window.location.href = `product-detail.html?id=${productId}`;
    }
  });
}

// -------------------- Header Scroll Effect --------------------
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add scrolled class
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });
}

// -------------------- Mobile Menu --------------------
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });

  // Close menu when clicking nav links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header') && navMenu.classList.contains('active')) {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  });
}

// -------------------- Cart Drawer --------------------
function initCartDrawer() {
  const cartIcon = document.querySelector('.cart-icon');
  const cartDrawer = document.querySelector('.cart-drawer');
  const cartOverlay = document.querySelector('.cart-overlay');
  const cartClose = document.querySelector('.cart-close');

  if (!cartIcon || !cartDrawer) return;

  function openCart() {
    cartDrawer.classList.add('active');
    if (cartOverlay) cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  cartIcon.addEventListener('click', openCart);

  if (cartClose) {
    cartClose.addEventListener('click', closeCart);
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCart);
  }

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartDrawer.classList.contains('active')) {
      closeCart();
    }
  });
}

// -------------------- Scroll Animations --------------------
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-aos]');

  if (animatedElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animatedElements.forEach(el => observer.observe(el));
}

// -------------------- Testimonial Slider --------------------
function initTestimonialSlider() {
  const slider = document.querySelector('.testimonials-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.testimonial-card');
  const dotsContainer = slider.querySelector('.slider-dots');

  if (slides.length <= 1) return;

  let currentSlide = 0;

  // Create dots
  if (dotsContainer) {
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.classList.add('slider-dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });
  }

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    currentSlide = index;
    slides[currentSlide].classList.add('active');

    // Update dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.slider-dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % slides.length);
  }

  // Auto-play with visibility awareness (pause when tab is hidden)
  let autoPlayInterval = setInterval(nextSlide, 5000);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(autoPlayInterval);
    } else {
      autoPlayInterval = setInterval(nextSlide, 5000);
    }
  });
}

// -------------------- Smooth Scroll --------------------
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// -------------------- Toast Notifications --------------------
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');

  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success'
    ? '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';

  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Remove after delay
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// -------------------- Skeleton Loaders --------------------
function renderProductCardSkeleton() {
  return `
    <div class="product-card-skeleton">
      <div class="skeleton skeleton-image"></div>
      <div class="skeleton skeleton-badge"></div>
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text sm"></div>
      <div class="skeleton-actions">
        <div class="skeleton"></div>
        <div class="skeleton"></div>
      </div>
    </div>
  `;
}

function renderCategoryCardSkeleton() {
  return `
    <div class="category-card-skeleton">
      <div class="skeleton skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text sm"></div>
      </div>
    </div>
  `;
}

function renderTestimonialSkeleton() {
  return `
    <div class="testimonial-skeleton">
      <div class="skeleton skeleton-avatar"></div>
      <div class="skeleton skeleton-stars"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text sm"></div>
    </div>
  `;
}

function showProductsGridSkeleton(container, count = 6) {
  if (!container) return;
  container.innerHTML = Array(count).fill(renderProductCardSkeleton()).join('');
}

function showCategoriesGridSkeleton(container, count = 4) {
  if (!container) return;
  container.innerHTML = Array(count).fill(renderCategoryCardSkeleton()).join('');
}

// Export skeleton functions
window.renderProductCardSkeleton = renderProductCardSkeleton;
window.renderCategoryCardSkeleton = renderCategoryCardSkeleton;
window.showProductsGridSkeleton = showProductsGridSkeleton;
window.showCategoriesGridSkeleton = showCategoriesGridSkeleton;

// -------------------- Product Card Rendering --------------------
function renderProductCard(product) {
  const category = getCategoryById(product.category);
  const isFavorite = typeof Favorites !== 'undefined' && Favorites.isFavorite(product.id);

  // Get first image - handle both string URLs and object format
  let productImage = '';
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    productImage = typeof firstImage === 'string' ? firstImage : (firstImage.url || firstImage.preview || '');
  }

  // Determine product badge (New, Bestseller, or Featured)
  let productBadge = '';
  if (product.badge === 'new') {
    productBadge = '<span class="product-badge product-badge-new">New</span>';
  } else if (product.badge === 'bestseller') {
    productBadge = '<span class="product-badge product-badge-bestseller">Best Seller</span>';
  } else if (product.badge === 'featured') {
    productBadge = '<span class="product-badge product-badge-featured">Featured</span>';
  }

  // Discount badge on image
  let discountBadge = '';
  if (product.discount && product.discount > 0) {
    discountBadge = `<span class="product-badge product-badge-discount">${product.discount}% OFF</span>`;
  }

  return `
    <div class="product-card card" data-category="${product.category}" data-product-id="${product.id}">
      <div class="card-image card-image-zoom" data-product-id="${product.id}">
        ${productBadge}
        ${discountBadge}
        <img src="${productImage}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
        <div class="zoom-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
        <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-product-id="${product.id}" aria-label="${isFavorite ? 'Remove from' : 'Add to'} favorites">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <span class="badge badge-primary">${category?.name || product.category}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${product.name}</h3>
        <p class="card-text">${(product.fullDesc || product.description || product.shortDesc || '').substring(0, 100)}${(product.fullDesc || product.description || product.shortDesc || '').length > 100 ? '...' : ''}</p>
        ${product.price ? `
        <div class="card-price">
          ${product.discount && product.discount > 0 ? `
            <span class="card-price-original">₹${product.price}</span>
            <span class="card-price-current">₹${(product.price * (1 - product.discount / 100)).toFixed(0)}</span>
            <span class="card-discount-badge">${product.discount}% OFF</span>
          ` : `
            <span class="card-price-current">₹${product.price}</span>
          `}
        </div>
        ` : ''}
        <div class="card-meta">
          <span class="min-order">Min Order: ${product.minOrder} pcs</span>
        </div>
        <div class="card-actions">
          <a href="product-detail.html?id=${product.id}" class="btn btn-primary btn-sm">View Details</a>
          <button class="btn btn-outline btn-sm add-to-cart" data-product-id="${product.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            Shortlist
          </button>
        </div>
      </div>
    </div>
  `;
}

// -------------------- Category Card Rendering --------------------
function renderCategoryCard(category, enable3D = false) {
  const productCount = typeof getProductsByCategory === 'function' ? getProductsByCategory(category.id).length : 0;
  const cardClass = enable3D ? 'category-card card-3d' : 'category-card';

  // Generate slug from name if not present
  const slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Default image if not set
  const image = category.image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop';

  // Icon fallback
  const icon = category.icon || '📦';

  return `
    <a href="products.html?category=${slug}" class="${cardClass}">
      <div class="category-image">
        <img src="${image}" alt="${category.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop'">
        <div class="category-overlay">
          <span class="category-icon">${icon}</span>
          <h3 class="category-name">${category.name}</h3>
          <span class="category-count">${productCount} Products</span>
        </div>
      </div>
      ${enable3D ? '<div class="card-glare"></div>' : ''}
    </a>
  `;
}

// -------------------- URL Parameters --------------------
function getURLParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    category: params.get('category'),
    id: params.get('id'),
    search: params.get('search')
  };
}

// -------------------- Format Number --------------------
function formatNumber(num) {
  return new Intl.NumberFormat('en-IN').format(num);
}

// -------------------- Debounce --------------------
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// -------------------- Image Lazy Loading --------------------
function initLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

// -------------------- Form Validation --------------------
function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll('[required]');

  inputs.forEach(input => {
    if (!input.value.trim()) {
      isValid = false;
      input.classList.add('error');
    } else {
      input.classList.remove('error');
    }

    // Email validation
    if (input.type === 'email' && input.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value)) {
        isValid = false;
        input.classList.add('error');
      }
    }

    // Phone validation
    if (input.type === 'tel' && input.value) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(input.value.replace(/\D/g, ''))) {
        isValid = false;
        input.classList.add('error');
      }
    }
  });

  return isValid;
}

// -------------------- Copy to Clipboard --------------------
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy', 'error');
  });
}

// Make functions globally available
window.showToast = showToast;
window.renderProductCard = renderProductCard;
window.renderCategoryCard = renderCategoryCard;
window.getURLParams = getURLParams;
window.debounce = debounce;
window.validateForm = validateForm;

// -------------------- 360° Product Viewer --------------------
class Viewer360 {
  constructor(container, images, options = {}) {
    this.container = container;
    this.images = images;
    this.currentFrame = 0;
    this.totalFrames = images.length;
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.autoRotate = options.autoRotate !== false;
    this.autoRotateSpeed = options.autoRotateSpeed || 1500; // Default: slow rotation (~12s per cycle)
    this.sensitivity = options.sensitivity || 5;
    this.autoRotateInterval = null;
    this.hasInteracted = false;

    this.init();
  }

  init() {
    this.createViewer();
    this.bindEvents();
    this.preloadImages();
    if (this.autoRotate) {
      this.startAutoRotate();
    }
  }

  createViewer() {
    // Create viewer structure
    this.container.innerHTML = `
      <div class="viewer-360-container">
        ${this.images.map((img, i) => `
          <div class="viewer-360-frame ${i === 0 ? 'active' : ''}" data-frame="${i}">
            <img src="${img}" alt="Product view ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}">
          </div>
        `).join('')}
        <div class="viewer-360-badge">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          360°
        </div>
        <div class="viewer-360-hint">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span>Drag to rotate</span>
        </div>
        <div class="viewer-360-progress">
          ${this.images.map((_, i) => `<div class="viewer-360-dot ${i === 0 ? 'active' : ''}" data-frame="${i}"></div>`).join('')}
        </div>
      </div>
    `;

    this.frames = this.container.querySelectorAll('.viewer-360-frame');
    this.dots = this.container.querySelectorAll('.viewer-360-dot');
    this.hint = this.container.querySelector('.viewer-360-hint');
    this.viewerContainer = this.container.querySelector('.viewer-360-container');
  }

  bindEvents() {
    // Store bound references for cleanup
    this._boundDragMove = this.onDragMove.bind(this);
    this._boundDragEnd = this.onDragEnd.bind(this);
    this._boundTouchMove = this.onTouchMove.bind(this);

    // Mouse events
    this.viewerContainer.addEventListener('mousedown', this.onDragStart.bind(this));
    document.addEventListener('mousemove', this._boundDragMove);
    document.addEventListener('mouseup', this._boundDragEnd);

    // Touch events
    this.viewerContainer.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    document.addEventListener('touchmove', this._boundTouchMove, { passive: true });
    document.addEventListener('touchend', this._boundDragEnd);

    // Pause auto-rotate on hover
    this.viewerContainer.addEventListener('mouseenter', () => this.stopAutoRotate());
    this.viewerContainer.addEventListener('mouseleave', () => {
      if (this.autoRotate && !this.isDragging) this.startAutoRotate();
    });
  }

  // Cleanup method to remove global listeners
  destroy() {
    this.stopAutoRotate();
    if (this._boundDragMove) document.removeEventListener('mousemove', this._boundDragMove);
    if (this._boundDragEnd) document.removeEventListener('mouseup', this._boundDragEnd);
    if (this._boundTouchMove) document.removeEventListener('touchmove', this._boundTouchMove);
    if (this._boundDragEnd) document.removeEventListener('touchend', this._boundDragEnd);
  }

  preloadImages() {
    this.images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }

  onDragStart(e) {
    this.isDragging = true;
    this.startX = e.clientX;
    this.stopAutoRotate();
    this.hideHint();
    e.preventDefault();
  }

  onTouchStart(e) {
    this.isDragging = true;
    this.startX = e.touches[0].clientX;
    this.stopAutoRotate();
    this.hideHint();
  }

  onDragMove(e) {
    if (!this.isDragging) return;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const deltaX = clientX - this.startX;

    if (Math.abs(deltaX) > this.sensitivity) {
      const direction = deltaX > 0 ? 1 : -1;
      this.rotate(direction);
      this.startX = clientX;
    }
  }

  onTouchMove(e) {
    if (!this.isDragging || !e.touches) return;
    this.onDragMove(e);
  }

  onDragEnd() {
    this.isDragging = false;
    if (this.autoRotate) {
      setTimeout(() => {
        if (!this.isDragging) this.startAutoRotate();
      }, 2000);
    }
  }

  rotate(direction) {
    this.frames[this.currentFrame].classList.remove('active');
    this.dots[this.currentFrame].classList.remove('active');

    this.currentFrame = (this.currentFrame + direction + this.totalFrames) % this.totalFrames;

    this.frames[this.currentFrame].classList.add('active');
    this.dots[this.currentFrame].classList.add('active');
  }

  startAutoRotate() {
    if (this.autoRotateInterval) return;
    this.autoRotateInterval = setInterval(() => {
      if (!this.isDragging) this.rotate(1);
    }, this.autoRotateSpeed);
  }

  stopAutoRotate() {
    if (this.autoRotateInterval) {
      clearInterval(this.autoRotateInterval);
      this.autoRotateInterval = null;
    }
  }

  hideHint() {
    if (!this.hasInteracted && this.hint) {
      this.hint.classList.add('hidden');
      this.hasInteracted = true;
    }
  }

  goToFrame(frame) {
    this.frames[this.currentFrame].classList.remove('active');
    this.dots[this.currentFrame].classList.remove('active');
    this.currentFrame = frame;
    this.frames[this.currentFrame].classList.add('active');
    this.dots[this.currentFrame].classList.add('active');
  }
}

// Initialize 360° viewers
function init360Viewers() {
  const viewers = document.querySelectorAll('[data-viewer-360]');
  viewers.forEach(viewer => {
    const imagesAttr = viewer.getAttribute('data-images');
    if (imagesAttr) {
      const images = JSON.parse(imagesAttr);
      new Viewer360(viewer, images);
    }
  });
}

// -------------------- 3D Card Tilt Effect --------------------
function init3DCardTilt() {
  const cards = document.querySelectorAll('.card-3d');

  cards.forEach(card => {
    // Add glare element if not present
    if (!card.querySelector('.card-glare')) {
      const glare = document.createElement('div');
      glare.className = 'card-glare';
      card.appendChild(glare);
    }

    const glare = card.querySelector('.card-glare');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate rotation (max 15 degrees)
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      // Apply transform
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

      // Update glare position
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.3) 0%, transparent 50%)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  });
}

// -------------------- Scroll Reveal Animations --------------------
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate, .stagger-children');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));
}

// -------------------- Counter Animation --------------------
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const startTime = performance.now();

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(start + (target - start) * easeOutQuart);

    element.textContent = current + (element.dataset.suffix || '');

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target + (element.dataset.suffix || '');
    }
  }

  requestAnimationFrame(updateCounter);
}

function initCounterAnimation() {
  const counters = document.querySelectorAll('.counter');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        entry.target.classList.add('counted');
        const target = parseInt(entry.target.dataset.target) || parseInt(entry.target.textContent);
        animateCounter(entry.target, target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));
}

// -------------------- Parallax Effect --------------------
function initParallax() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');

  if (parallaxElements.length === 0) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.5;
      const offset = scrolled * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
  }, { passive: true });
}

// -------------------- Scroll Progress Indicator --------------------
function initScrollProgress() {
  // Create progress bar if it doesn't exist
  let progressBar = document.querySelector('.scroll-progress');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.prepend(progressBar);
  }

  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.pageYOffset / windowHeight) * 100;
    progressBar.style.width = scrolled + '%';
  }, { passive: true });
}

// -------------------- Magnetic Button Effect --------------------
function initMagneticButtons() {
  const magneticBtns = document.querySelectorAll('.btn-magnetic, .btn-primary, .btn-secondary');

  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

// -------------------- Smooth Scroll with Offset --------------------
function initEnhancedSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// -------------------- Text Split Animation --------------------
function initTextSplitAnimation() {
  const splitTexts = document.querySelectorAll('[data-split-text]');

  splitTexts.forEach(el => {
    const text = el.textContent;
    el.innerHTML = text.split('').map((char, i) =>
      `<span style="animation-delay: ${i * 0.05}s">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('');
    el.classList.add('animate-letters');
  });
}

// -------------------- Floating Elements Animation --------------------
function initFloatingElements() {
  const floatingBags = document.querySelectorAll('.floating-bag');

  floatingBags.forEach((bag, index) => {
    // Add random delays and durations for more organic movement
    const delay = Math.random() * 2;
    const duration = 4 + Math.random() * 4;
    bag.style.animationDelay = `${delay}s`;
    bag.style.animationDuration = `${duration}s`;
  });
}

// -------------------- Enhanced Image Reveal --------------------
function initImageReveal() {
  const images = document.querySelectorAll('.img-reveal');

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        imageObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  images.forEach(img => imageObserver.observe(img));
}

// -------------------- Tilt Effect on Hover for Cards --------------------
function initTiltEffect() {
  const tiltElements = document.querySelectorAll('.product-card, .testimonial-card');

  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });
}

// -------------------- Initialize All Animations --------------------
function initAllAnimations() {
  initScrollReveal();
  initCounterAnimation();
  initParallax();
  initScrollProgress();
  initMagneticButtons();
  initEnhancedSmoothScroll();
  initFloatingElements();
  initImageReveal();
  initTiltEffect();
}

// Initialize animations on DOM ready
document.addEventListener('DOMContentLoaded', initAllAnimations);

// Make functions globally available
window.Viewer360 = Viewer360;
window.init360Viewers = init360Viewers;
window.init3DCardTilt = init3DCardTilt;
window.initAllAnimations = initAllAnimations;
window.initScrollReveal = initScrollReveal;
window.initCounterAnimation = initCounterAnimation;
