/* ========================================
   SAGAR BAGS - Search Functionality
   ======================================== */

const Search = {
  isOpen: false,
  searchTimeout: null,
  recentSearches: [],
  RECENT_SEARCHES_KEY: 'sagarbags_recent_searches',

  init() {
    this.createSearchModal();
    this.bindEvents();
    this.loadRecentSearches();
  },

  createSearchModal() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.id = 'searchOverlay';

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.id = 'searchModal';
    modal.innerHTML = `
      <div class="search-header">
        <div class="search-input-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" class="search-input" id="searchInput" placeholder="Search products, categories..." autocomplete="off">
        </div>
        <button class="search-close" id="searchClose" aria-label="Close search">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="search-body" id="searchBody">
        <div class="search-hint" id="searchHint">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>Start typing to search products...</p>
          <div class="search-categories" id="searchCategories"></div>
        </div>
        <div class="search-results-container" id="searchResultsContainer" style="display: none;">
          <div class="search-results-count" id="searchResultsCount"></div>
          <div class="search-results" id="searchResults"></div>
        </div>
        <div class="search-no-results" id="searchNoResults" style="display: none;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4>No products found</h4>
          <p>Try different keywords or browse categories</p>
        </div>
        <div class="search-loading" id="searchLoading" style="display: none;">
          <div class="search-spinner"></div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Populate categories
    this.populateCategories();
  },

  populateCategories() {
    const container = document.getElementById('searchCategories');
    if (!container) return;

    const renderCategories = () => {
      let categories = [];
      if (typeof getAllCategories === 'function') {
        categories = getAllCategories();
      }

      if (categories.length === 0) return false;

      container.innerHTML = `
        <h4>Browse Categories</h4>
        <div class="search-category-chips">
          ${categories.map(cat => `
            <button class="search-category-chip" data-category="${cat.id}">${cat.name}</button>
          `).join('')}
        </div>
      `;

      // Bind category click events
      container.querySelectorAll('.search-category-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const categoryId = chip.dataset.category;
          this.close();
          window.location.href = `products.html?category=${categoryId}`;
        });
      });
      return true;
    };

    // Try immediately, then retry when data loads
    if (!renderCategories()) {
      window.addEventListener('productsDataLoaded', () => renderCategories(), { once: true });
      // Also retry after a delay as a final fallback
      setTimeout(() => renderCategories(), 2000);
    }
  },

  bindEvents() {
    // Search icon click
    document.addEventListener('click', (e) => {
      if (e.target.closest('.search-icon') || e.target.closest('#openSearch')) {
        this.open();
      }
    });

    // Close button
    document.getElementById('searchClose')?.addEventListener('click', () => this.close());

    // Overlay click
    document.getElementById('searchOverlay')?.addEventListener('click', () => this.close());

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
      // Ctrl/Cmd + K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
    });

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const query = e.target.value.trim();
          if (query) {
            this.saveRecentSearch(query);
            this.close();
            window.location.href = `products.html?search=${encodeURIComponent(query)}`;
          }
        }
      });
    }
  },

  open() {
    this.isOpen = true;
    document.getElementById('searchOverlay')?.classList.add('active');
    document.getElementById('searchModal')?.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus input
    setTimeout(() => {
      document.getElementById('searchInput')?.focus();
    }, 100);

    // Reset state
    this.showHint();
  },

  close() {
    this.isOpen = false;
    document.getElementById('searchOverlay')?.classList.remove('active');
    document.getElementById('searchModal')?.classList.remove('active');
    document.body.style.overflow = '';

    // Clear input
    const input = document.getElementById('searchInput');
    if (input) input.value = '';
  },

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  },

  handleSearch(query) {
    clearTimeout(this.searchTimeout);

    query = query.trim();

    if (query.length === 0) {
      this.showHint();
      return;
    }

    if (query.length < 2) {
      return;
    }

    // Show loading
    this.showLoading();

    // Debounce search
    this.searchTimeout = setTimeout(() => {
      this.performSearch(query);
    }, 300);
  },

  async performSearch(query) {
    try {
      let products = [];
      let categories = [];

      // Get products from the shared data store (already loaded from Firebase or fallback)
      if (typeof getAllProducts === 'function') {
        products = getAllProducts();
        categories = typeof getAllCategories === 'function' ? getAllCategories() : [];
      } else if (typeof FirebaseDB !== 'undefined') {
        products = await FirebaseDB.getProducts();
        categories = await FirebaseDB.getCategories();
      }

      // Search products
      const searchLower = query.toLowerCase();
      const results = products.filter(product => {
        const nameMatch = product.name?.toLowerCase().includes(searchLower);
        const descMatch = product.description?.toLowerCase().includes(searchLower);
        const categoryMatch = product.category?.toLowerCase().includes(searchLower);
        const tagsMatch = product.tags?.some(tag => tag.toLowerCase().includes(searchLower));

        return nameMatch || descMatch || categoryMatch || tagsMatch;
      });

      // Sort by relevance (name match first)
      results.sort((a, b) => {
        const aNameMatch = a.name?.toLowerCase().startsWith(searchLower) ? 0 : 1;
        const bNameMatch = b.name?.toLowerCase().startsWith(searchLower) ? 0 : 1;
        return aNameMatch - bNameMatch;
      });

      this.displayResults(results, query, categories);
    } catch (error) {
      console.error('Search error:', error);
      this.showNoResults();
    }
  },

  displayResults(results, query, categories) {
    const container = document.getElementById('searchResultsContainer');
    const resultsEl = document.getElementById('searchResults');
    const countEl = document.getElementById('searchResultsCount');

    if (results.length === 0) {
      this.showNoResults();
      return;
    }

    // Hide other elements
    document.getElementById('searchHint').style.display = 'none';
    document.getElementById('searchNoResults').style.display = 'none';
    document.getElementById('searchLoading').style.display = 'none';
    container.style.display = 'block';

    // Update count
    countEl.textContent = `Found ${results.length} product${results.length !== 1 ? 's' : ''}`;

    // Highlight function
    const highlight = (text, query) => {
      if (!text) return '';
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    };

    // Render results (limit to 12)
    resultsEl.innerHTML = results.slice(0, 12).map(product => {
      const category = categories.find(c => c.id === product.category);
      const image = Array.isArray(product.images) ? product.images[0] : product.image;

      return `
        <a href="product-detail.html?id=${product.id}" class="search-result-item">
          <div class="search-result-image">
            <img src="${image || 'assets/images/placeholder.jpg'}" alt="${product.name}" loading="lazy">
          </div>
          <div class="search-result-info">
            <div class="search-result-category">${category?.name || product.category || 'Product'}</div>
            <div class="search-result-name">${highlight(product.name, query)}</div>
            <div class="search-result-meta">Min Order: ${product.minOrder || 50} pcs</div>
          </div>
        </a>
      `;
    }).join('');

    // Add "View all results" if more than 12
    if (results.length > 12) {
      resultsEl.innerHTML += `
        <a href="products.html?search=${encodeURIComponent(query)}" class="search-result-item" style="justify-content: center; background: var(--secondary); border-color: var(--secondary);">
          <span style="color: var(--primary-dark); font-weight: 600;">View all ${results.length} results →</span>
        </a>
      `;
    }
  },

  showHint() {
    document.getElementById('searchHint').style.display = 'block';
    document.getElementById('searchResultsContainer').style.display = 'none';
    document.getElementById('searchNoResults').style.display = 'none';
    document.getElementById('searchLoading').style.display = 'none';
  },

  showLoading() {
    document.getElementById('searchHint').style.display = 'none';
    document.getElementById('searchResultsContainer').style.display = 'none';
    document.getElementById('searchNoResults').style.display = 'none';
    document.getElementById('searchLoading').style.display = 'flex';
  },

  showNoResults() {
    document.getElementById('searchHint').style.display = 'none';
    document.getElementById('searchResultsContainer').style.display = 'none';
    document.getElementById('searchNoResults').style.display = 'block';
    document.getElementById('searchLoading').style.display = 'none';
  },

  loadRecentSearches() {
    const saved = localStorage.getItem(this.RECENT_SEARCHES_KEY);
    this.recentSearches = saved ? JSON.parse(saved) : [];
  },

  saveRecentSearch(query) {
    // Remove if exists
    this.recentSearches = this.recentSearches.filter(s => s !== query);
    // Add to front
    this.recentSearches.unshift(query);
    // Keep only last 5
    this.recentSearches = this.recentSearches.slice(0, 5);
    // Save
    localStorage.setItem(this.RECENT_SEARCHES_KEY, JSON.stringify(this.recentSearches));
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  Search.init();
});

// Export for global access
window.Search = Search;
