/* ========================================
   SAGAR BAGS - Admin Panel JavaScript
   ======================================== */

// ==================== Admin App ====================
const AdminApp = {
  currentSection: 'dashboard',
  editingItem: null,
  uploadedImages: [], // Store uploaded images for current product
  uploadedImageFiles: [], // Store actual file objects for Azure upload
  sasToken: null, // Azure SAS token for image uploads
  productsCache: [], // Cache products from Firebase
  categoriesCache: [], // Cache categories from Firebase
  testimonialsCache: [], // Cache testimonials from Firebase

  // ==================== Initialization ====================
  async init() {
    this.checkAuth();
    this.setupNavigation();
    this.setupMobileMenu();
    this.setupImageUpload();
    this.setupCategoryImageUpload();
    this.initCustomColorInputs();
    await this.loadSasToken();
    await this.loadDashboard();
    this.setupEventListeners();
    this.updateInquiryBadge();
    this.updateCartBadge();
  },

  // Sync Firebase cache to localStorage so AdminData stays in sync
  syncCacheToLocalStorage() {
    if (this.productsCache.length > 0) {
      localStorage.setItem('sagarbags_products', JSON.stringify(this.productsCache));
    }
    if (this.categoriesCache.length > 0) {
      localStorage.setItem('sagarbags_categories', JSON.stringify(this.categoriesCache));
    }
    if (this.testimonialsCache.length > 0) {
      localStorage.setItem('sagarbags_testimonials', JSON.stringify(this.testimonialsCache));
    }
  },

  // Load SAS token from Firebase settings
  async loadSasToken() {
    if (typeof FirebaseDB !== 'undefined') {
      try {
        this.sasToken = await FirebaseDB.getSetting('azure_sas_token');
      } catch (err) {
        console.log('Could not load SAS token:', err);
      }
    }
  },

  checkAuth() {
    // Firebase Auth check is handled in admin-dashboard.html
    // This is kept for backwards compatibility
    if (typeof FirebaseAuth !== 'undefined') {
      // Firebase handles auth
      return;
    }
    // Fallback to session storage
    const session = sessionStorage.getItem('sagarbags_session');
    if (!session) {
      window.location.href = 'admin.html';
      return;
    }
    const sessionData = JSON.parse(session);
    if (!sessionData.loggedIn) {
      window.location.href = 'admin.html';
    }
  },

  // ==================== Navigation ====================
  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const section = item.dataset.section;
        this.navigateTo(section);
      });
    });
  },

  navigateTo(section) {
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`.nav-item[data-section="${section}"]`)?.classList.add('active');

    // Update page title
    const titles = {
      dashboard: 'Dashboard',
      products: 'Products',
      categories: 'Categories',
      testimonials: 'Testimonials',
      homepage: 'Homepage Settings',
      inquiries: 'Inquiries',
      carts: 'Active Carts',
      settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';

    // Show section
    document.querySelectorAll('.admin-section').forEach(s => {
      s.classList.remove('active');
    });
    document.getElementById(`section-${section}`)?.classList.add('active');

    // Load section data
    this.currentSection = section;
    this.loadSection(section);

    // Close mobile menu
    this.closeMobileMenu();
  },

  loadSection(section) {
    switch (section) {
      case 'dashboard':
        this.loadDashboard();
        break;
      case 'products':
        this.loadProducts();
        break;
      case 'categories':
        this.loadCategories();
        break;
      case 'testimonials':
        this.loadTestimonials();
        break;
      case 'homepage':
        this.loadHomepageSettings();
        break;
      case 'inquiries':
        this.loadInquiries();
        break;
      case 'carts':
        this.loadActiveCarts();
        break;
      case 'settings':
        this.loadSettings();
        break;
    }
  },

  // ==================== Mobile Menu ====================
  setupMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.admin-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    menuBtn?.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });

    overlay?.addEventListener('click', () => {
      this.closeMobileMenu();
    });
  },

  closeMobileMenu() {
    document.querySelector('.admin-sidebar')?.classList.remove('open');
    document.querySelector('.sidebar-overlay')?.classList.remove('active');
  },

  // ==================== Dashboard ====================
  async loadDashboard() {
    let products = [];
    let categories = [];
    let testimonials = [];
    let inquiries = [];
    let activeCarts = [];

    if (typeof FirebaseDB !== 'undefined') {
      try {
        // Fetch all data from Firebase in parallel
        const [productsRes, categoriesRes, testimonialsRes, inquiriesRes, cartsRes] = await Promise.all([
          FirebaseDB.getProducts(),
          FirebaseDB.getCategories(),
          FirebaseDB.getTestimonials(),
          FirebaseDB.getInquiries(),
          FirebaseDB.getActiveCarts()
        ]);
        products = productsRes;
        categories = categoriesRes;
        testimonials = testimonialsRes;
        inquiries = inquiriesRes;
        activeCarts = cartsRes.filter(c => c.itemCount > 0);

        // Update caches
        this.productsCache = products;
        this.categoriesCache = categories;
        this.testimonialsCache = testimonials;
        // Sync to localStorage for filter functions
        this.syncCacheToLocalStorage();
      } catch (err) {
        console.log('Firebase fetch failed, using localStorage:', err);
        products = AdminData.getProducts();
        categories = AdminData.getCategories();
        testimonials = AdminData.getTestimonials();
        inquiries = AdminData.getInquiries();
        activeCarts = AdminData.getActiveCarts().filter(c => c.itemCount > 0);
      }
    } else {
      products = AdminData.getProducts();
      categories = AdminData.getCategories();
      testimonials = AdminData.getTestimonials();
      inquiries = AdminData.getInquiries();
      activeCarts = AdminData.getActiveCarts().filter(c => c.itemCount > 0);
    }

    // Update stats
    document.getElementById('statProducts').textContent = products.length;
    document.getElementById('statCategories').textContent = categories.length;
    document.getElementById('statTestimonials').textContent = testimonials.length;
    document.getElementById('statInquiries').textContent = inquiries.length;

    // Update active carts stat if element exists
    const cartStat = document.getElementById('statActiveCarts');
    if (cartStat) {
      cartStat.textContent = activeCarts.length;
    }

    // Load recent inquiries
    this.renderRecentInquiries(inquiries.slice(0, 5));

    // Load recent active carts
    this.renderRecentCarts(activeCarts.slice(0, 3));
  },

  renderRecentCarts(carts) {
    const container = document.getElementById('recentCarts');
    if (!container) return;

    if (carts.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 2rem;">
          <p style="color: var(--text-muted);">No active carts yet</p>
        </div>
      `;
      return;
    }

    container.innerHTML = carts.map(cart => {
      const timeAgo = this.getTimeAgo(cart.lastUpdated);
      return `
        <div class="inquiry-item" style="padding: 1rem 0; border-bottom: 1px solid var(--border-subtle);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="badge badge-info">${cart.itemCount} items</span>
              <span style="font-weight: 500; color: var(--text-primary);">Visitor Cart</span>
            </div>
            <span style="font-size: 0.8125rem; color: var(--text-muted);">${timeAgo}</span>
          </div>
          <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.25rem;">
            ${cart.items.slice(0, 4).map(item => `
              <div style="flex-shrink: 0; width: 50px; height: 50px; border-radius: 6px; overflow: hidden; background: var(--bg-elevated); border: 1px solid var(--border-subtle);">
                ${item.image
          ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;" title="${item.name}">`
          : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      </svg>
                    </div>`
        }
              </div>
            `).join('')}
            ${cart.items.length > 4 ? `
              <div style="flex-shrink: 0; width: 50px; height: 50px; border-radius: 6px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.75rem; font-weight: 600;">
                +${cart.items.length - 4}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  },

  renderRecentInquiries(inquiries) {
    const container = document.getElementById('recentInquiries');
    if (!container) return;

    if (inquiries.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 2rem;">
          <p style="color: var(--text-muted);">No inquiries yet</p>
        </div>
      `;
      return;
    }

    container.innerHTML = inquiries.map(inq => {
      const productNames = inq.products && inq.products.length > 0
        ? inq.products.map(p => p.name || p.category || 'Product').join(', ')
        : 'General inquiry';
      return `
      <div class="inquiry-item" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--border-subtle);">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            ${inq.status === 'unread' ? '<span class="badge badge-gold">New</span>' : ''}
            <span style="font-weight: 500; color: var(--text-primary);">${inq.name}</span>
          </div>
          <p style="font-size: 0.875rem; color: var(--text-muted);">${inq.company || ''} - ${productNames}</p>
        </div>
        <span style="font-size: 0.8125rem; color: var(--text-muted);">${AdminData.formatDate(inq.createdAt)}</span>
      </div>
    `}).join('');
  },

  // Cache for inquiries to keep badge and list in sync
  inquiriesCache: [],

  async updateInquiryBadge() {
    let count = 0;
    if (typeof FirebaseDB !== 'undefined') {
      try {
        // Use cached inquiries if available, otherwise fetch fresh
        if (this.inquiriesCache.length === 0) {
          this.inquiriesCache = await FirebaseDB.getInquiries();
        }
        count = this.inquiriesCache.filter(i => i.status === 'unread').length;
      } catch (err) {
        console.log('Error fetching inquiries for badge:', err);
        count = AdminData.getUnreadInquiryCount();
      }
    } else {
      count = AdminData.getUnreadInquiryCount();
    }
    const badge = document.getElementById('inquiryBadge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline' : 'none';
    }
  },

  async updateCartBadge() {
    let count = 0;
    if (typeof FirebaseDB !== 'undefined') {
      try {
        const carts = await FirebaseDB.getActiveCarts();
        count = carts.filter(c => c.itemCount > 0 && c.status === 'active').length;
      } catch (err) {
        count = AdminData.getActiveCartCount();
      }
    } else {
      count = AdminData.getActiveCartCount();
    }
    const badge = document.getElementById('cartBadge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline' : 'none';
    }
  },

  // ==================== Products ====================
  async loadProducts() {
    let products = [];
    let categories = [];

    if (typeof FirebaseDB !== 'undefined') {
      try {
        products = await FirebaseDB.getProducts();
        categories = await FirebaseDB.getCategories();
        this.productsCache = products;
        this.categoriesCache = categories;
        // Sync to localStorage for filter functions
        this.syncCacheToLocalStorage();
      } catch (err) {
        console.log('Firebase fetch failed, using AdminData:', err);
        products = AdminData.getProducts();
        categories = AdminData.getCategories();
      }
    } else {
      products = AdminData.getProducts();
      categories = AdminData.getCategories();
    }

    this.renderProductsTable(products, categories);
    this.populateCategoryFilter(categories);
  },

  renderProductsTable(products, categories) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    if (products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 3rem;">
            <div class="empty-state">
              <p>No products found. Add your first product!</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = products.map(product => {
      const category = categories.find(c => c.id === product.category);
      return `
        <tr>
          <td>
            <div style="width: 50px; height: 50px; background: var(--bg-elevated); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              ${product.images && product.images[0]
          ? `<img src="${product.images[0]}" alt="${product.name}" class="table-image" onerror="this.parentElement.innerHTML='📦'">`
          : '📦'}
            </div>
          </td>
          <td>
            <div style="font-weight: 500; color: var(--text-primary);">${product.name}</div>
            ${product.badge ? `<span class="badge badge-gold" style="margin-top: 0.25rem;">${product.badge}</span>` : ''}
          </td>
          <td>${category ? category.name : product.category}</td>
          <td>${product.minOrder} pcs</td>
          <td>
            <span class="badge ${product.status === 'active' ? 'badge-success' : 'badge-warning'}">
              ${product.status === 'active' ? 'Active' : 'Draft'}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button class="action-btn edit" onclick="AdminApp.editProduct('${product.id}')" title="Edit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="action-btn delete" onclick="AdminApp.deleteProduct('${product.id}')" title="Delete">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  populateCategoryFilter(categories) {
    const optionsContainer = document.getElementById('categoryFilterOptions');
    const hiddenInput = document.getElementById('productCategoryFilter');
    if (!optionsContainer || !hiddenInput) return;

    // Populate options
    optionsContainer.innerHTML = `
      <div class="searchable-select-option selected" data-value="">All Categories</div>
      ${categories.map(c => `<div class="searchable-select-option" data-value="${c.id}">${c.name}</div>`).join('')}
    `;

    // Initialize searchable dropdown
    this.initSearchableCategoryFilter();
  },

  initSearchableCategoryFilter() {
    const wrapper = document.getElementById('categoryFilterWrapper');
    const trigger = document.getElementById('categoryFilterTrigger');
    const dropdown = document.getElementById('categoryFilterDropdown');
    const searchInput = document.getElementById('categoryFilterSearch');
    const optionsContainer = document.getElementById('categoryFilterOptions');
    const hiddenInput = document.getElementById('productCategoryFilter');
    const valueDisplay = trigger?.querySelector('.searchable-select-value');

    if (!wrapper || !trigger || !dropdown || !searchInput || !optionsContainer) return;

    // Toggle dropdown
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      wrapper.classList.toggle('active');
      if (wrapper.classList.contains('active')) {
        searchInput.focus();
        searchInput.value = '';
        this.filterCategoryOptions('');
      }
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
      this.filterCategoryOptions(e.target.value);
    });

    searchInput.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Option selection
    optionsContainer.addEventListener('click', (e) => {
      const option = e.target.closest('.searchable-select-option');
      if (option && !option.classList.contains('hidden')) {
        const value = option.dataset.value;
        const text = option.textContent;

        // Update hidden input
        hiddenInput.value = value;

        // Update display
        if (valueDisplay) valueDisplay.textContent = text;

        // Update selected state
        optionsContainer.querySelectorAll('.searchable-select-option').forEach(opt => {
          opt.classList.toggle('selected', opt.dataset.value === value);
        });

        // Close dropdown
        wrapper.classList.remove('active');

        // Trigger filter
        this.filterProducts();
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('active');
      }
    });

    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
      const visibleOptions = optionsContainer.querySelectorAll('.searchable-select-option:not(.hidden)');
      const currentIndex = Array.from(visibleOptions).findIndex(opt => opt.classList.contains('focused'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentIndex < visibleOptions.length - 1 ? currentIndex + 1 : 0;
        visibleOptions.forEach((opt, i) => opt.classList.toggle('focused', i === nextIndex));
        visibleOptions[nextIndex]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : visibleOptions.length - 1;
        visibleOptions.forEach((opt, i) => opt.classList.toggle('focused', i === prevIndex));
        visibleOptions[prevIndex]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const focusedOption = optionsContainer.querySelector('.searchable-select-option.focused');
        if (focusedOption) focusedOption.click();
      } else if (e.key === 'Escape') {
        wrapper.classList.remove('active');
      }
    });
  },

  filterCategoryOptions(query) {
    const optionsContainer = document.getElementById('categoryFilterOptions');
    if (!optionsContainer) return;

    const options = optionsContainer.querySelectorAll('.searchable-select-option');
    const queryLower = query.toLowerCase().trim();
    let hasVisible = false;

    options.forEach(option => {
      const text = option.textContent.toLowerCase();
      const matches = !queryLower || text.includes(queryLower);
      option.classList.toggle('hidden', !matches);
      if (matches) hasVisible = true;
    });

    // Show/hide no results message
    let noResults = optionsContainer.querySelector('.searchable-select-no-results');
    if (!hasVisible) {
      if (!noResults) {
        noResults = document.createElement('div');
        noResults.className = 'searchable-select-no-results';
        noResults.textContent = 'No categories found';
        optionsContainer.appendChild(noResults);
      }
      noResults.style.display = 'block';
    } else if (noResults) {
      noResults.style.display = 'none';
    }
  },

  filterProducts() {
    const search = document.getElementById('productSearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('productCategoryFilter')?.value || '';
    const statusFilter = document.getElementById('productStatusFilter')?.value || '';

    // Use Firebase cache if available, otherwise fall back to AdminData
    let products = this.productsCache.length > 0 ? [...this.productsCache] : AdminData.getProducts();
    const categories = this.categoriesCache.length > 0 ? this.categoriesCache : AdminData.getCategories();

    if (search) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.shortDesc?.toLowerCase().includes(search)
      );
    }

    if (categoryFilter) {
      products = products.filter(p => p.category === categoryFilter);
    }

    if (statusFilter) {
      products = products.filter(p => (p.status || 'active') === statusFilter);
    }

    this.renderProductsTable(products, categories);
  },

  async openProductModal(productId = null) {
    this.editingItem = productId;
    this.uploadedImages = []; // Reset uploaded images (URLs)
    this.uploadedImageFiles = []; // Reset uploaded image files
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const form = document.getElementById('productForm');

    // Populate category select from Firebase or fallback
    const categorySelect = document.getElementById('productCategory');
    let categories = this.categoriesCache;
    if (categories.length === 0 && typeof FirebaseDB !== 'undefined') {
      try {
        categories = await FirebaseDB.getCategories();
        this.categoriesCache = categories;
      } catch (err) {
        categories = AdminData.getCategories();
      }
    } else if (categories.length === 0) {
      categories = AdminData.getCategories();
    }
    categorySelect.innerHTML = categories.map(c =>
      `<option value="${c.id}">${c.name}</option>`
    ).join('');

    if (productId) {
      // Edit mode
      title.textContent = 'Edit Product';
      let product = null;

      if (typeof FirebaseDB !== 'undefined') {
        try {
          product = await FirebaseDB.getProduct(productId);
        } catch (err) {
          product = AdminData.getProduct(productId);
        }
      } else {
        product = AdminData.getProduct(productId);
      }

      if (product) {
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productMinOrder').value = product.minOrder;
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productDiscount').value = product.discount || '';
        document.getElementById('productBadge').value = product.badge || '';
        document.getElementById('productStatus').value = product.status;
        document.getElementById('productShortDesc').value = product.shortDesc || '';
        document.getElementById('productFullDesc').value = product.fullDesc || '';
        document.getElementById('productFeatures').value = (product.features || []).join('\n');

        // Load existing colors
        const colorCheckboxes = document.querySelectorAll('input[name="productColors"]');
        colorCheckboxes.forEach(cb => {
          cb.checked = false; // Reset first
          const productColors = product.colors || [];
          // Check if this color name exists in product colors
          productColors.forEach(pc => {
            if (typeof pc === 'string' && pc === cb.value) {
              cb.checked = true;
            } else if (typeof pc === 'object' && pc.name && pc.name.toLowerCase() === cb.value.toLowerCase()) {
              cb.checked = true;
            }
          });
        });

        // Load custom colors
        this.customColors = (product.colors || []).filter(c => typeof c === 'object' && c.hex);
        this.renderCustomColors();

        // Load existing images
        this.uploadedImages = product.images || [];
        this.renderImagePreviews();
      }
    } else {
      // Add mode
      title.textContent = 'Add New Product';
      form.reset();
      // Clear price and discount fields
      document.getElementById('productPrice').value = '';
      document.getElementById('productDiscount').value = '';
      // Clear color checkboxes
      document.querySelectorAll('input[name="productColors"]').forEach(cb => cb.checked = false);
      // Clear custom colors
      this.customColors = [];
      this.renderCustomColors();
      this.renderImagePreviews();
    }

    modal.classList.add('active');
  },

  closeProductModal() {
    document.getElementById('productModal')?.classList.remove('active');
    this.editingItem = null;
    this.uploadedImages = [];
  },

  async saveProduct(e) {
    e.preventDefault();

    // Show loading overlay
    this.showLoading('Uploading images and saving product...');

    try {
      // Separate existing URLs from new preview objects
      const existingUrls = this.uploadedImages
        .filter(img => typeof img === 'string' && !img.startsWith('blob:'));

      // Upload new images to Azure if there are files to upload
      const newUrls = [];
      if (this.uploadedImageFiles.length > 0 && this.sasToken && typeof AzureStorage !== 'undefined') {
        for (const file of this.uploadedImageFiles) {
          const result = await AzureStorage.uploadImage(file, this.sasToken);
          if (result.success) {
            newUrls.push(result.url);
          } else {
            this.showToast('Failed to upload image: ' + result.error, 'error');
          }
        }
        this.uploadedImageFiles = []; // Clear after upload
      }

      // Combine existing URLs with newly uploaded URLs
      const finalImages = [...existingUrls, ...newUrls];

      // Get selected preset colors with their hex values
      const presetColorMap = {
        'black': '#000000',
        'white': '#FFFFFF',
        'navy': '#1a365d',
        'red': '#e53e3e',
        'green': '#38a169',
        'blue': '#3182ce',
        'yellow': '#ecc94b',
        'orange': '#ed8936',
        'pink': '#ed64a6',
        'purple': '#805ad5',
        'brown': '#8b5a2b',
        'grey': '#718096',
        'beige': '#d4a574',
        'maroon': '#800000'
      };

      const selectedPresetColors = Array.from(document.querySelectorAll('input[name="productColors"]:checked'))
        .map(cb => ({
          name: cb.value.charAt(0).toUpperCase() + cb.value.slice(1),
          hex: presetColorMap[cb.value] || '#000000'
        }));

      // Combine preset colors with custom colors
      const selectedColors = [...selectedPresetColors, ...(this.customColors || [])];

      const shortDesc = document.getElementById('productShortDesc').value;
      const fullDesc = document.getElementById('productFullDesc').value;

      const priceValue = document.getElementById('productPrice').value;
      const discountValue = document.getElementById('productDiscount').value;

      const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        minOrder: parseInt(document.getElementById('productMinOrder').value),
        price: priceValue ? parseFloat(priceValue) : null,
        discount: discountValue ? parseInt(discountValue) : 0,
        badge: document.getElementById('productBadge').value,
        status: document.getElementById('productStatus').value,
        shortDesc: shortDesc,
        fullDesc: fullDesc,
        description: fullDesc || shortDesc, // For compatibility - use full description if available
        features: document.getElementById('productFeatures').value.split('\n').filter(f => f.trim()),
        colors: selectedColors,
        images: finalImages
      };

      if (typeof FirebaseDB !== 'undefined') {
        if (this.editingItem) {
          await FirebaseDB.updateProduct(this.editingItem, productData);
          this.showToast('Product updated successfully', 'success');
        } else {
          await FirebaseDB.addProduct(productData);
          this.showToast('Product added successfully', 'success');
        }
      } else {
        if (this.editingItem) {
          AdminData.updateProduct(this.editingItem, productData);
          this.showToast('Product updated successfully', 'success');
        } else {
          AdminData.addProduct(productData);
          this.showToast('Product added successfully', 'success');
        }
      }

      this.closeProductModal();
      this.loadProducts();
      this.loadDashboard();
    } catch (error) {
      console.error('Error saving product:', error);
      this.showToast('Failed to save product', 'error');
    } finally {
      this.hideLoading();
    }
  },

  // ==================== Image Upload ====================
  setupImageUpload() {
    const uploadArea = document.getElementById('imageUploadArea');
    const fileInput = document.getElementById('productImageInput');

    if (!uploadArea || !fileInput) return;

    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      const files = e.dataTransfer.files;
      this.handleImageFiles(files);
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      this.handleImageFiles(e.target.files);
      fileInput.value = ''; // Reset input
    });
  },

  async handleImageFiles(files) {
    const maxImages = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB

    // Convert FileList to array
    const fileArray = Array.from(files);
    console.log('Processing', fileArray.length, 'files');

    for (const file of fileArray) {
      // Count only actual images (not counting uploadedImageFiles separately as they're already in uploadedImages as previews)
      if (this.uploadedImages.length >= maxImages) {
        this.showToast(`Maximum ${maxImages} images allowed`, 'warning');
        break;
      }

      if (!file.type.startsWith('image/')) {
        this.showToast('Please upload only image files', 'error');
        continue;
      }

      if (file.size > maxSize) {
        this.showToast('Image size should be less than 5MB', 'error');
        continue;
      }

      try {
        // If Azure is available and SAS token exists, store file for later upload
        if (this.sasToken && typeof AzureStorage !== 'undefined') {
          // Compress image before storing
          const compressedFile = await AzureStorage.compressImage(file, 1200, 0.85);
          this.uploadedImageFiles.push(compressedFile);

          // Create preview URL
          const previewUrl = URL.createObjectURL(compressedFile);
          this.uploadedImages.push({ preview: previewUrl, isNew: true });
          console.log('Added image preview:', previewUrl);
        } else {
          // Fallback to base64 (localStorage approach)
          const base64 = await AdminData.compressImage(file, 800, 0.8);
          this.uploadedImages.push(base64);
        }
      } catch (error) {
        this.showToast('Failed to process image: ' + file.name, 'error');
        console.error('Image upload error:', error);
      }
    }

    // Render all previews at once after processing all files
    this.renderImagePreviews();
    if (fileArray.length > 0) {
      this.showToast(`${Math.min(fileArray.length, maxImages)} image(s) added`, 'success');
    }
  },

  renderImagePreviews() {
    const container = document.getElementById('imagePreviewGrid');
    if (!container) return;

    if (this.uploadedImages.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.875rem;">No images uploaded</p>';
      return;
    }

    container.innerHTML = this.uploadedImages.map((img, index) => {
      // Handle both URL strings and preview objects
      const imgSrc = typeof img === 'object' ? img.preview : img;
      const isNew = typeof img === 'object' && img.isNew;
      return `
        <div class="image-preview-item ${isNew ? 'new-image' : ''}">
          <img src="${imgSrc}" alt="Product image ${index + 1}">
          ${isNew ? '<span class="new-badge">New</span>' : ''}
          <button type="button" class="image-preview-remove" onclick="AdminApp.removeImage(${index})" title="Remove">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      `;
    }).join('');
  },

  removeImage(index) {
    const removed = this.uploadedImages[index];
    // If it's a new image (preview object), also remove from uploadedImageFiles
    if (typeof removed === 'object' && removed.isNew) {
      // Find corresponding file index
      const previewCount = this.uploadedImages.slice(0, index).filter(img => typeof img === 'object' && img.isNew).length;
      this.uploadedImageFiles.splice(previewCount, 1);
      // Revoke the object URL to free memory
      URL.revokeObjectURL(removed.preview);
    }
    this.uploadedImages.splice(index, 1);
    this.renderImagePreviews();
    this.showToast('Image removed', 'info');
  },

  // Custom Colors Management
  customColors: [],

  initCustomColorInputs() {
    const colorPicker = document.getElementById('customColorPicker');
    const hexInput = document.getElementById('customColorHex');

    if (colorPicker && hexInput) {
      // Sync color picker to hex input
      colorPicker.addEventListener('input', (e) => {
        hexInput.value = e.target.value.replace('#', '');
      });

      // Sync hex input to color picker
      hexInput.addEventListener('input', (e) => {
        let hex = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
        if (hex.length === 6) {
          colorPicker.value = '#' + hex;
        }
      });

      // Initialize hex input with picker value
      hexInput.value = colorPicker.value.replace('#', '');
    }
  },

  addCustomColor() {
    const colorPicker = document.getElementById('customColorPicker');
    const colorNameInput = document.getElementById('customColorName');
    const hexInput = document.getElementById('customColorHex');

    // Get hex value from hex input or color picker
    let hex = colorPicker.value;
    if (hexInput && hexInput.value.trim()) {
      const hexValue = hexInput.value.trim().replace(/[^0-9A-Fa-f]/g, '');
      if (hexValue.length === 6) {
        hex = '#' + hexValue;
      }
    }

    const name = colorNameInput.value.trim();

    if (!name) {
      this.showToast('Please enter a color name', 'error');
      return;
    }

    // Check if color already exists
    if (this.customColors.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      this.showToast('Color with this name already exists', 'error');
      return;
    }

    this.customColors.push({ name, hex });
    this.renderCustomColors();

    // Reset inputs
    colorNameInput.value = '';
    if (hexInput) hexInput.value = 'c9a227';
    colorPicker.value = '#c9a227';
    this.showToast(`Color "${name}" added`, 'success');
  },

  removeCustomColor(index) {
    this.customColors.splice(index, 1);
    this.renderCustomColors();
  },

  renderCustomColors() {
    const container = document.getElementById('addedCustomColors');
    if (!container) return;

    if (this.customColors.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = this.customColors.map((color, index) => `
      <span class="added-color-tag">
        <span class="color-dot" style="background-color: ${color.hex};"></span>
        ${color.name}
        <button type="button" class="remove-color" onclick="AdminApp.removeCustomColor(${index})">×</button>
      </span>
    `).join('');
  },

  editProduct(id) {
    this.openProductModal(id);
  },

  async deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        if (typeof FirebaseDB !== 'undefined') {
          await FirebaseDB.deleteProduct(id);
        } else {
          AdminData.deleteProduct(id);
        }
        this.showToast('Product deleted', 'success');
        this.loadProducts();
        this.loadDashboard();
      } catch (error) {
        console.error('Error deleting product:', error);
        this.showToast('Failed to delete product', 'error');
      }
    }
  },

  // ==================== Categories ====================
  async loadCategories() {
    let categories = [];
    if (typeof FirebaseDB !== 'undefined') {
      try {
        categories = await FirebaseDB.getCategories();
        this.categoriesCache = categories;
        this.syncCacheToLocalStorage();
      } catch (err) {
        console.log('Firebase fetch failed:', err);
        categories = AdminData.getCategories();
      }
    } else {
      categories = AdminData.getCategories();
    }
    this.renderCategoriesTable(categories);
  },

  renderCategoriesTable(categories) {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;

    tbody.innerHTML = categories.map(category => {
      // Use Firebase products cache for accurate count, fallback to AdminData
      const productsSource = this.productsCache.length > 0 ? this.productsCache : AdminData.getProducts();
      const productCount = productsSource.filter(p => p.category === category.id).length;
      const imagePreview = category.image
        ? `<img src="${category.image}" alt="${category.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;">`
        : `<span style="font-size: 1.5rem;">${category.icon || '📦'}</span>`;
      return `
        <tr>
          <td>${imagePreview}</td>
          <td style="font-weight: 500; color: var(--text-primary);">${category.name}</td>
          <td>${productCount} products</td>
          <td>
            <div class="table-actions">
              <button class="action-btn edit" onclick="AdminApp.editCategory('${category.id}')" title="Edit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="action-btn delete" onclick="AdminApp.deleteCategory('${category.id}')" title="Delete">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  categoryImageFile: null, // Store category image file for upload

  async openCategoryModal(categoryId = null) {
    this.editingItem = categoryId;
    this.categoryImageFile = null;
    const modal = document.getElementById('categoryModal');
    const title = document.getElementById('categoryModalTitle');
    const form = document.getElementById('categoryForm');

    // Reset image preview
    this.resetCategoryImagePreview();

    if (categoryId) {
      title.textContent = 'Edit Category';
      let category = null;
      if (typeof FirebaseDB !== 'undefined') {
        try {
          category = await FirebaseDB.getCategory(categoryId);
        } catch (err) {
          category = AdminData.getCategory(categoryId);
        }
      } else {
        category = AdminData.getCategory(categoryId);
      }
      if (category) {
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryIcon').value = category.icon || '';
        document.getElementById('categoryImageUrl').value = category.image || '';
        document.getElementById('categoryDescription').value = category.description || '';

        // Show existing image preview
        if (category.image) {
          this.showCategoryImagePreview(category.image);
        }
      }
    } else {
      title.textContent = 'Add New Category';
      form.reset();
    }

    modal.classList.add('active');
  },

  closeCategoryModal() {
    document.getElementById('categoryModal')?.classList.remove('active');
    this.editingItem = null;
    this.categoryImageFile = null;
    this.resetCategoryImagePreview();
  },

  // Category image upload handlers
  setupCategoryImageUpload() {
    const uploadArea = document.getElementById('categoryImageUploadArea');
    const fileInput = document.getElementById('categoryImageFile');

    if (!uploadArea || !fileInput) return;

    // Click to upload
    uploadArea.addEventListener('click', (e) => {
      if (e.target.closest('.remove-image-btn')) return;
      fileInput.click();
    });

    // File selected
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleCategoryImageSelect(e.target.files[0]);
      }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.handleCategoryImageSelect(e.dataTransfer.files[0]);
      }
    });
  },

  async handleCategoryImageSelect(file) {
    if (!file.type.startsWith('image/')) {
      this.showToast('Please select an image file', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.showToast('Image must be less than 2MB', 'error');
      return;
    }

    // Compress image if Azure is available
    if (this.sasToken && typeof AzureStorage !== 'undefined') {
      try {
        this.categoryImageFile = await AzureStorage.compressImage(file, 800, 0.85);
      } catch (err) {
        this.categoryImageFile = file;
      }
    } else {
      this.categoryImageFile = file;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.showCategoryImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  },

  showCategoryImagePreview(src) {
    const preview = document.getElementById('categoryImagePreview');
    const placeholder = document.getElementById('categoryUploadPlaceholder');
    const previewImg = document.getElementById('categoryPreviewImg');

    if (preview && placeholder && previewImg) {
      previewImg.src = src;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
    }
  },

  resetCategoryImagePreview() {
    const preview = document.getElementById('categoryImagePreview');
    const placeholder = document.getElementById('categoryUploadPlaceholder');
    const previewImg = document.getElementById('categoryPreviewImg');
    const fileInput = document.getElementById('categoryImageFile');

    if (preview) preview.style.display = 'none';
    if (placeholder) placeholder.style.display = 'block';
    if (previewImg) previewImg.src = '';
    if (fileInput) fileInput.value = '';
    this.categoryImageFile = null;
  },

  removeCategoryImage() {
    this.resetCategoryImagePreview();
    document.getElementById('categoryImageUrl').value = '';
  },

  async saveCategory(e) {
    e.preventDefault();

    let imageUrl = document.getElementById('categoryImageUrl').value;

    // Upload image to Azure if file is selected
    if (this.categoryImageFile && this.sasToken && typeof AzureStorage !== 'undefined') {
      this.showLoading('Uploading image...');
      try {
        const result = await AzureStorage.uploadImage(this.categoryImageFile, this.sasToken);
        if (result.success) {
          imageUrl = result.url;
        } else {
          this.hideLoading();
          this.showToast('Failed to upload image: ' + result.error, 'error');
          return;
        }
      } catch (err) {
        this.hideLoading();
        this.showToast('Failed to upload image', 'error');
        return;
      }
      this.hideLoading();
    }

    const categoryData = {
      name: document.getElementById('categoryName').value,
      icon: document.getElementById('categoryIcon').value,
      image: imageUrl,
      description: document.getElementById('categoryDescription').value
    };

    try {
      if (typeof FirebaseDB !== 'undefined') {
        if (this.editingItem) {
          await FirebaseDB.updateCategory(this.editingItem, categoryData);
          this.showToast('Category updated successfully', 'success');
        } else {
          await FirebaseDB.addCategory(categoryData);
          this.showToast('Category added successfully', 'success');
        }
      } else {
        if (this.editingItem) {
          AdminData.updateCategory(this.editingItem, categoryData);
          this.showToast('Category updated successfully', 'success');
        } else {
          AdminData.addCategory(categoryData);
          this.showToast('Category added successfully', 'success');
        }
      }

      this.closeCategoryModal();
      this.loadCategories();
      this.loadDashboard();
    } catch (error) {
      console.error('Error saving category:', error);
      this.showToast('Failed to save category', 'error');
    }
  },

  editCategory(id) {
    this.openCategoryModal(id);
  },

  async deleteCategory(id) {
    // Check product count
    let productCount = 0;
    if (typeof FirebaseDB !== 'undefined') {
      const products = this.productsCache.length > 0 ? this.productsCache : await FirebaseDB.getProducts();
      productCount = products.filter(p => p.category === id).length;
    } else {
      productCount = AdminData.getCategoryProductCount(id);
    }

    if (productCount > 0) {
      alert(`Cannot delete this category. It has ${productCount} products. Please reassign or delete those products first.`);
      return;
    }

    if (confirm('Are you sure you want to delete this category?')) {
      try {
        if (typeof FirebaseDB !== 'undefined') {
          await FirebaseDB.deleteCategory(id);
        } else {
          AdminData.deleteCategory(id);
        }
        this.showToast('Category deleted', 'success');
        this.loadCategories();
        this.loadDashboard();
      } catch (error) {
        console.error('Error deleting category:', error);
        this.showToast('Failed to delete category', 'error');
      }
    }
  },

  // ==================== Testimonials ====================
  async loadTestimonials() {
    let testimonials = [];
    if (typeof FirebaseDB !== 'undefined') {
      try {
        testimonials = await FirebaseDB.getTestimonials();
        this.testimonialsCache = testimonials;
        this.syncCacheToLocalStorage();
      } catch (err) {
        console.log('Firebase fetch failed:', err);
        testimonials = AdminData.getTestimonials();
      }
    } else {
      testimonials = AdminData.getTestimonials();
    }
    this.renderTestimonialsList(testimonials);
  },

  renderTestimonialsList(testimonials) {
    const container = document.getElementById('testimonialsList');
    if (!container) return;

    if (testimonials.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No testimonials yet. Add your first testimonial!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = testimonials.map(testimonial => `
      <div class="admin-card" style="margin-bottom: 1rem;">
        <div class="card-body">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div>
              <p style="font-style: italic; color: var(--text-secondary); margin-bottom: 0.5rem;">"${testimonial.quote}"</p>
              <div style="color: var(--secondary);">${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</div>
            </div>
            <span class="badge ${testimonial.status === 'published' ? 'badge-success' : 'badge-warning'}">
              ${testimonial.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-weight: 500; color: var(--text-primary);">${testimonial.name}</span>
              <span style="color: var(--text-muted);"> - ${testimonial.company}</span>
            </div>
            <div class="table-actions">
              <button class="action-btn edit" onclick="AdminApp.editTestimonial('${testimonial.id}')" title="Edit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="action-btn delete" onclick="AdminApp.deleteTestimonial('${testimonial.id}')" title="Delete">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  },

  async openTestimonialModal(testimonialId = null) {
    this.editingItem = testimonialId;
    const modal = document.getElementById('testimonialModal');
    const title = document.getElementById('testimonialModalTitle');
    const form = document.getElementById('testimonialForm');

    if (testimonialId) {
      title.textContent = 'Edit Testimonial';
      let testimonial = null;
      if (typeof FirebaseDB !== 'undefined') {
        try {
          testimonial = await FirebaseDB.getTestimonial(testimonialId);
        } catch (err) {
          testimonial = AdminData.getTestimonial(testimonialId);
        }
      } else {
        testimonial = AdminData.getTestimonial(testimonialId);
      }
      if (testimonial) {
        document.getElementById('testimonialQuote').value = testimonial.quote;
        document.getElementById('testimonialName').value = testimonial.name;
        document.getElementById('testimonialCompany').value = testimonial.company;
        document.getElementById('testimonialRating').value = testimonial.rating;
        document.getElementById('testimonialStatus').value = testimonial.status;
      }
    } else {
      title.textContent = 'Add New Testimonial';
      form.reset();
      document.getElementById('testimonialRating').value = '5';
      document.getElementById('testimonialStatus').value = 'published';
    }

    modal.classList.add('active');
  },

  closeTestimonialModal() {
    document.getElementById('testimonialModal')?.classList.remove('active');
    this.editingItem = null;
  },

  async saveTestimonial(e) {
    e.preventDefault();

    const testimonialData = {
      quote: document.getElementById('testimonialQuote').value,
      name: document.getElementById('testimonialName').value,
      company: document.getElementById('testimonialCompany').value,
      rating: parseInt(document.getElementById('testimonialRating').value),
      status: document.getElementById('testimonialStatus').value
    };

    try {
      if (typeof FirebaseDB !== 'undefined') {
        if (this.editingItem) {
          await FirebaseDB.updateTestimonial(this.editingItem, testimonialData);
          this.showToast('Testimonial updated successfully', 'success');
        } else {
          await FirebaseDB.addTestimonial(testimonialData);
          this.showToast('Testimonial added successfully', 'success');
        }
      } else {
        if (this.editingItem) {
          AdminData.updateTestimonial(this.editingItem, testimonialData);
          this.showToast('Testimonial updated successfully', 'success');
        } else {
          AdminData.addTestimonial(testimonialData);
          this.showToast('Testimonial added successfully', 'success');
        }
      }

      this.closeTestimonialModal();
      this.loadTestimonials();
      this.loadDashboard();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      this.showToast('Failed to save testimonial', 'error');
    }
  },

  editTestimonial(id) {
    this.openTestimonialModal(id);
  },

  async deleteTestimonial(id) {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      try {
        if (typeof FirebaseDB !== 'undefined') {
          await FirebaseDB.deleteTestimonial(id);
        } else {
          AdminData.deleteTestimonial(id);
        }
        this.showToast('Testimonial deleted', 'success');
        this.loadTestimonials();
        this.loadDashboard();
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        this.showToast('Failed to delete testimonial', 'error');
      }
    }
  },

  // ==================== Homepage Settings ====================
  loadHomepageSettings() {
    const homepage = AdminData.getHomepage();

    // Hero section
    document.getElementById('heroBadge').value = homepage.hero?.badge || '';
    document.getElementById('heroTitle').value = homepage.hero?.title || '';
    document.getElementById('heroSubtitle').value = homepage.hero?.subtitle || '';
    document.getElementById('heroCTAText').value = homepage.hero?.ctaText || '';
    document.getElementById('heroCTALink').value = homepage.hero?.ctaLink || '';

    // Stats
    if (homepage.stats && homepage.stats.length >= 3) {
      document.getElementById('stat1Value').value = homepage.stats[0].value;
      document.getElementById('stat1Label').value = homepage.stats[0].label;
      document.getElementById('stat2Value').value = homepage.stats[1].value;
      document.getElementById('stat2Label').value = homepage.stats[1].label;
      document.getElementById('stat3Value').value = homepage.stats[2].value;
      document.getElementById('stat3Label').value = homepage.stats[2].label;
    }

    // CTA
    document.getElementById('ctaTitle').value = homepage.cta?.title || '';
    document.getElementById('ctaSubtitle').value = homepage.cta?.subtitle || '';
    document.getElementById('ctaButton1Text').value = homepage.cta?.button1Text || '';
    document.getElementById('ctaButton1Link').value = homepage.cta?.button1Link || '';
    document.getElementById('ctaButton2Text').value = homepage.cta?.button2Text || '';
    document.getElementById('ctaButton2Link').value = homepage.cta?.button2Link || '';
  },

  saveHomepageSettings(e) {
    e.preventDefault();

    const homepageData = {
      hero: {
        badge: document.getElementById('heroBadge').value,
        title: document.getElementById('heroTitle').value,
        subtitle: document.getElementById('heroSubtitle').value,
        ctaText: document.getElementById('heroCTAText').value,
        ctaLink: document.getElementById('heroCTALink').value
      },
      stats: [
        { value: document.getElementById('stat1Value').value, label: document.getElementById('stat1Label').value },
        { value: document.getElementById('stat2Value').value, label: document.getElementById('stat2Label').value },
        { value: document.getElementById('stat3Value').value, label: document.getElementById('stat3Label').value }
      ],
      cta: {
        title: document.getElementById('ctaTitle').value,
        subtitle: document.getElementById('ctaSubtitle').value,
        button1Text: document.getElementById('ctaButton1Text').value,
        button1Link: document.getElementById('ctaButton1Link').value,
        button2Text: document.getElementById('ctaButton2Text').value,
        button2Link: document.getElementById('ctaButton2Link').value
      }
    };

    AdminData.updateHomepage(homepageData);
    this.showToast('Homepage settings saved successfully', 'success');
  },

  // ==================== Inquiries ====================
  async loadInquiries() {
    // Try Firebase first
    if (typeof FirebaseDB !== 'undefined') {
      try {
        const inquiries = await FirebaseDB.getInquiries();
        // Update cache to keep badge in sync
        this.inquiriesCache = inquiries;
        this.renderInquiriesList(inquiries);
        // Update badge to ensure consistency
        this.updateInquiryBadge();
        return;
      } catch (err) {
        console.log('Firebase inquiry fetch failed, using localStorage:', err);
      }
    }
    // Fallback to localStorage
    const inquiries = AdminData.getInquiries();
    this.renderInquiriesList(inquiries);
  },

  renderInquiriesList(inquiries) {
    const container = document.getElementById('inquiriesList');
    if (!container) return;

    if (inquiries.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <h3>No Inquiries Yet</h3>
          <p>When customers submit quote requests, they will appear here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = inquiries.map(inquiry => `
      <div class="inquiry-card ${inquiry.status === 'unread' ? 'unread' : ''}">
        <div class="inquiry-header">
          <div class="inquiry-status">
            ${inquiry.status === 'unread'
        ? '<span class="badge badge-gold">New</span>'
        : '<span class="badge badge-success">Read</span>'}
          </div>
          <span class="inquiry-date">${AdminData.formatDateTime(inquiry.createdAt)}</span>
        </div>

        <div class="inquiry-customer">
          <h4>${inquiry.name}</h4>
          <p>${inquiry.email} | ${inquiry.phone}</p>
          <p style="color: var(--secondary);">${inquiry.company}</p>
        </div>

        <div class="inquiry-products">
          <h5>Products Requested</h5>
          <ul>
            ${inquiry.products && inquiry.products.length > 0
              ? inquiry.products.map(p => `<li>${p.name || p.category || 'Product'} (${p.qty || p.quantity || 'N/A'} pcs)</li>`).join('')
              : '<li>No specific products requested</li>'}
          </ul>
        </div>

        ${inquiry.requiredDate || inquiry.deadline ? `
        <div class="inquiry-deadline">
          <h5>Required By Date</h5>
          <p style="color: var(--secondary);">${AdminData.formatDate(inquiry.requiredDate || inquiry.deadline)}</p>
        </div>
        ` : ''}

        ${inquiry.message ? `<p class="inquiry-message">"${inquiry.message}"</p>` : ''}

        <div class="inquiry-actions">
          ${inquiry.status === 'unread'
        ? `<button class="btn btn-secondary btn-sm" onclick="AdminApp.markInquiryRead('${inquiry.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <path d="M22 4L12 14.01l-3-3"/>
                </svg>
                Mark as Read
              </button>`
        : `<button class="btn btn-secondary btn-sm" onclick="AdminApp.markInquiryUnread('${inquiry.id}')">
                Mark as Unread
              </button>`
      }
          <a href="https://wa.me/${inquiry.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hi ' + (inquiry.name || 'there') + ', thank you for your inquiry about our bags.')}"
             class="btn btn-primary btn-sm" target="_blank">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Reply on WhatsApp
          </a>
          <button class="btn btn-danger btn-sm" onclick="AdminApp.deleteInquiry('${inquiry.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
    `).join('');
  },

  async filterInquiries() {
    const statusFilter = document.getElementById('inquiryStatusFilter')?.value || '';
    let inquiries = [];

    if (typeof FirebaseDB !== 'undefined') {
      try {
        inquiries = await FirebaseDB.getInquiries();
      } catch (err) {
        inquiries = AdminData.getInquiries();
      }
    } else {
      inquiries = AdminData.getInquiries();
    }

    if (statusFilter) {
      inquiries = inquiries.filter(i => i.status === statusFilter);
    }

    this.renderInquiriesList(inquiries);
  },

  async markInquiryRead(id) {
    if (typeof FirebaseDB !== 'undefined') {
      await FirebaseDB.updateInquiryStatus(id, 'read');
    } else {
      AdminData.markInquiryRead(id);
    }
    // Clear cache to force fresh fetch
    this.inquiriesCache = [];
    await this.loadInquiries();
    await this.updateInquiryBadge();
    this.showToast('Marked as read', 'success');
  },

  async markInquiryUnread(id) {
    if (typeof FirebaseDB !== 'undefined') {
      await FirebaseDB.updateInquiryStatus(id, 'unread');
    } else {
      AdminData.markInquiryUnread(id);
    }
    // Clear cache to force fresh fetch
    this.inquiriesCache = [];
    await this.loadInquiries();
    await this.updateInquiryBadge();
    this.showToast('Marked as unread', 'success');
  },

  async deleteInquiry(id) {
    if (confirm('Are you sure you want to delete this inquiry?')) {
      if (typeof FirebaseDB !== 'undefined') {
        await FirebaseDB.deleteInquiry(id);
      } else {
        AdminData.deleteInquiry(id);
      }
      // Clear cache to force fresh fetch
      this.inquiriesCache = [];
      await this.loadInquiries();
      await this.updateInquiryBadge();
      await this.loadDashboard();
      this.showToast('Inquiry deleted', 'success');
    }
  },

  // ==================== Active Carts ====================
  async loadActiveCarts() {
    // Try Firebase first
    if (typeof FirebaseDB !== 'undefined') {
      try {
        const carts = await FirebaseDB.getActiveCarts();
        this.renderActiveCartsList(carts.filter(c => c.itemCount > 0));
        return;
      } catch (err) {
        console.log('Firebase carts fetch failed, using localStorage:', err);
      }
    }
    // Fallback to localStorage
    const carts = AdminData.getActiveCarts().filter(c => c.itemCount > 0);
    this.renderActiveCartsList(carts);
  },

  renderActiveCartsList(carts) {
    const container = document.getElementById('activeCartsList');
    if (!container) return;

    if (carts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <h3>No Active Carts</h3>
          <p>When visitors add items to their cart, you'll see them here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = carts.map(cart => {
      const timeAgo = this.getTimeAgo(cart.lastUpdated);
      const statusBadge = {
        active: '<span class="badge badge-info">Active</span>',
        contacted: '<span class="badge badge-warning">Contacted</span>',
        converted: '<span class="badge badge-success">Converted</span>'
      };

      return `
        <div class="inquiry-card ${cart.status === 'active' ? 'unread' : ''}">
          <div class="inquiry-header">
            <div class="inquiry-status">
              ${statusBadge[cart.status] || statusBadge.active}
              <span class="badge badge-gold">${cart.itemCount} items</span>
            </div>
            <span class="inquiry-date">${timeAgo}</span>
          </div>

          <div class="inquiry-customer">
            <h4>Visitor Cart</h4>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">Session: ${cart.sessionId.substring(0, 20)}...</p>
          </div>

          <div class="cart-items-grid">
            <h5 style="font-size: 0.8125rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.75rem;">Items in Cart</h5>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 0.75rem;">
              ${cart.items.map(item => `
                <div style="background: var(--bg-elevated); border-radius: 8px; overflow: hidden; border: 1px solid var(--border-subtle);">
                  <div style="aspect-ratio: 1; background: var(--bg-dark); display: flex; align-items: center; justify-content: center;">
                    ${item.image
          ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">`
          : `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>`
        }
                  </div>
                  <div style="padding: 0.5rem;">
                    <p style="font-size: 0.75rem; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.name}">${item.name}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1rem;">
            Last active: ${AdminData.formatDateTime(cart.lastUpdated)}
          </div>

          <div class="inquiry-actions">
            ${cart.status === 'active' ? `
              <button class="btn btn-secondary btn-sm" onclick="AdminApp.markCartContacted('${cart.sessionId}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <path d="M22 4L12 14.01l-3-3"/>
                </svg>
                Mark Contacted
              </button>
            ` : ''}
            ${cart.status === 'contacted' ? `
              <button class="btn btn-primary btn-sm" onclick="AdminApp.markCartConverted('${cart.sessionId}')">
                Convert to Inquiry
              </button>
            ` : ''}
            <button class="btn btn-danger btn-sm" onclick="AdminApp.deleteCart('${cart.sessionId}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Delete
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  async filterCarts() {
    const statusFilter = document.getElementById('cartStatusFilter')?.value || '';
    let carts = [];

    if (typeof FirebaseDB !== 'undefined') {
      try {
        carts = (await FirebaseDB.getActiveCarts()).filter(c => c.itemCount > 0);
      } catch (err) {
        carts = AdminData.getActiveCarts().filter(c => c.itemCount > 0);
      }
    } else {
      carts = AdminData.getActiveCarts().filter(c => c.itemCount > 0);
    }

    if (statusFilter) {
      carts = carts.filter(c => c.status === statusFilter);
    }

    this.renderActiveCartsList(carts);
  },

  async markCartContacted(sessionId) {
    if (typeof FirebaseDB !== 'undefined') {
      await FirebaseDB.updateCartStatus(sessionId, 'contacted');
    } else {
      AdminData.updateCartStatus(sessionId, 'contacted');
    }
    this.loadActiveCarts();
    this.updateCartBadge();
    this.showToast('Cart marked as contacted', 'success');
  },

  async markCartConverted(sessionId) {
    // Get cart from Firebase or localStorage
    let cart;
    if (typeof FirebaseDB !== 'undefined') {
      const carts = await FirebaseDB.getActiveCarts();
      cart = carts.find(c => c.sessionId === sessionId || c.id === sessionId);
    } else {
      cart = AdminData.getActiveCart(sessionId);
    }

    if (cart) {
      // Create an inquiry from the cart
      const inquiryData = {
        name: 'Visitor (from cart)',
        email: '',
        phone: '',
        company: '',
        products: cart.items.map(item => ({ id: item.id, name: item.name, qty: 1 })),
        message: 'Converted from active cart'
      };

      if (typeof FirebaseDB !== 'undefined') {
        await FirebaseDB.addInquiry(inquiryData);
        await FirebaseDB.updateCartStatus(sessionId, 'converted');
      } else {
        AdminData.addInquiry(inquiryData);
        AdminData.updateCartStatus(sessionId, 'converted');
      }

      this.loadActiveCarts();
      this.updateCartBadge();
      this.updateInquiryBadge();
      this.showToast('Cart converted to inquiry', 'success');
    }
  },

  async deleteCart(sessionId) {
    if (confirm('Are you sure you want to delete this cart?')) {
      if (typeof FirebaseDB !== 'undefined') {
        await FirebaseDB.deleteCart(sessionId);
      } else {
        AdminData.deleteActiveCart(sessionId);
      }
      this.loadActiveCarts();
      this.updateCartBadge();
      this.loadDashboard();
      this.showToast('Cart deleted', 'success');
    }
  },

  // ==================== Settings ====================
  async loadSettings() {
    const settings = AdminData.getAdminSettings();
    if (settings.lastLogin) {
      document.getElementById('lastLoginTime').textContent = AdminData.formatDateTime(settings.lastLogin);
    }

    // Load SAS token
    if (typeof FirebaseDB !== 'undefined') {
      try {
        const sasToken = await FirebaseDB.getSetting('azure_sas_token');
        if (sasToken) {
          document.getElementById('azureSasToken').value = sasToken;
          document.getElementById('sasTokenStatus').textContent = 'Token configured';
          document.getElementById('sasTokenStatus').style.color = 'var(--success)';
        }
      } catch (err) {
        console.log('Could not load SAS token:', err);
      }
    }
  },

  async saveSasToken(e) {
    e.preventDefault();
    const sasToken = document.getElementById('azureSasToken').value.trim();
    const statusEl = document.getElementById('sasTokenStatus');

    if (!sasToken) {
      this.showToast('Please enter a SAS token', 'error');
      return;
    }

    try {
      if (typeof FirebaseDB !== 'undefined') {
        await FirebaseDB.setSetting('azure_sas_token', sasToken);
        this.sasToken = sasToken;
        statusEl.textContent = 'Token saved successfully';
        statusEl.style.color = 'var(--success)';
        this.showToast('SAS token saved', 'success');
      } else {
        this.showToast('Firebase not available', 'error');
      }
    } catch (error) {
      console.error('Error saving SAS token:', error);
      statusEl.textContent = 'Failed to save';
      statusEl.style.color = 'var(--error)';
      this.showToast('Failed to save SAS token', 'error');
    }
  },

  changePassword(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const settings = AdminData.getAdminSettings();

    if (currentPassword !== settings.password) {
      this.showToast('Current password is incorrect', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      this.showToast('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      this.showToast('Password must be at least 6 characters', 'error');
      return;
    }

    AdminData.updateAdminSettings({ password: newPassword });
    this.showToast('Password changed successfully', 'success');
    document.getElementById('passwordForm').reset();
  },

  resetAllData() {
    if (confirm('This will reset ALL data to defaults. Are you sure?')) {
      if (confirm('This action cannot be undone. Continue?')) {
        AdminData.resetAllData();
        this.showToast('All data has been reset', 'success');
        this.loadDashboard();
      }
    }
  },

  // Seed default categories to Firebase
  async seedCategories() {
    if (typeof FirebaseDB === 'undefined') {
      this.showToast('Firebase not available', 'error');
      return;
    }

    const btn = document.getElementById('seedCategoriesBtn');
    const statusEl = document.getElementById('seedStatus');

    btn.disabled = true;
    btn.innerHTML = 'Seeding...';
    statusEl.textContent = '';

    // Default categories to seed
    const defaultCategories = [
      { name: 'Corporate Bags', icon: '💼', description: 'Professional laptop bags and backpacks for corporate gifting' },
      { name: 'Laptop & School Bags', icon: '🎒', description: 'Customizable bags for students and professionals' },
      { name: 'Non-Woven Bags', icon: '🛍️', description: 'Eco-friendly non-woven promotional bags' },
      { name: 'Travel & Duffel Bags', icon: '🧳', description: 'Stylish travel and duffel bags for all occasions' },
      { name: 'Jute & Cotton Bags', icon: '🌿', description: 'Sustainable jute and cotton bags for eco-conscious brands' },
      { name: 'Thamboolam & Canvas Bags', icon: '🎁', description: 'Traditional thamboolam bags and durable canvas options' },
      { name: 'Thaily Bags', icon: '👜', description: 'Various types of thaily bags for retail and gifting' },
      { name: 'Hand Purse & Pouch', icon: '👛', description: 'Elegant purses and pouches for premium gifting' },
      { name: 'Complementary Items', icon: '🎀', description: 'Additional accessories and complementary products' },
      { name: 'Customised Bags', icon: '✨', description: 'Fully customizable bags with your branding' }
    ];

    try {
      let seeded = 0;
      for (const category of defaultCategories) {
        await FirebaseDB.addCategory(category);
        seeded++;
        statusEl.textContent = `Seeded ${seeded}/${defaultCategories.length}...`;
      }

      statusEl.textContent = `Done! ${seeded} categories added.`;
      statusEl.style.color = 'var(--success)';
      this.showToast('Categories seeded successfully!', 'success');
      this.loadCategories();
      this.loadDashboard();
    } catch (error) {
      console.error('Seed error:', error);
      statusEl.textContent = 'Failed: ' + error.message;
      statusEl.style.color = 'var(--error)';
      this.showToast('Failed to seed categories', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        Seed Categories to Firebase
      `;
    }
  },

  // ==================== Logout ====================
  async logout() {
    // Firebase logout
    if (typeof FirebaseAuth !== 'undefined') {
      await FirebaseAuth.logout();
    }
    // Also clear session storage
    sessionStorage.removeItem('sagarbags_session');
    window.location.href = 'admin.html';
  },

  // ==================== Loading Overlay ====================
  showLoading(text = 'Saving...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    if (overlay) {
      overlay.style.display = 'flex';
      if (loadingText) loadingText.textContent = text;
    }
  },

  hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  },

  // ==================== Toast Notifications ====================
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
      success: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>',
      error: '<circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>',
      warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
      info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <svg class="toast-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${icons[type]}
      </svg>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // ==================== Event Listeners ====================
  setupEventListeners() {
    // Product form
    document.getElementById('productForm')?.addEventListener('submit', (e) => this.saveProduct(e));

    // Category form
    document.getElementById('categoryForm')?.addEventListener('submit', (e) => this.saveCategory(e));

    // Testimonial form
    document.getElementById('testimonialForm')?.addEventListener('submit', (e) => this.saveTestimonial(e));

    // Homepage form
    document.getElementById('homepageForm')?.addEventListener('submit', (e) => this.saveHomepageSettings(e));

    // Password form
    document.getElementById('passwordForm')?.addEventListener('submit', (e) => this.changePassword(e));

    // Azure SAS token form
    document.getElementById('azureSettingsForm')?.addEventListener('submit', (e) => this.saveSasToken(e));

    // Search and filters
    document.getElementById('productSearch')?.addEventListener('input', () => this.filterProducts());
    // Category filter is now handled by initSearchableCategoryFilter()
    document.getElementById('productStatusFilter')?.addEventListener('change', () => this.filterProducts());
    document.getElementById('inquiryStatusFilter')?.addEventListener('change', () => this.filterInquiries());

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.modal-overlay')?.classList.remove('active');
        this.editingItem = null;
      });
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          this.editingItem = null;
        }
      });
    });

    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => AdminApp.init());
