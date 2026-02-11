/* ========================================
   SAGAR BAGS - Recently Viewed Products
   ======================================== */

const RecentlyViewed = {
  STORAGE_KEY: 'sagar_recently_viewed',
  MAX_ITEMS: 8,

  // Get recently viewed products from localStorage
  getItems() {
    try {
      const items = localStorage.getItem(this.STORAGE_KEY);
      return items ? JSON.parse(items) : [];
    } catch (e) {
      console.error('Error reading recently viewed:', e);
      return [];
    }
  },

  // Save items to localStorage
  saveItems(items) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving recently viewed:', e);
    }
  },

  // Add a product to recently viewed
  addProduct(product) {
    if (!product || !product.id) return;

    const items = this.getItems();

    // Remove if already exists (to move to front)
    const filtered = items.filter(item => item.id !== product.id);

    // Create minimal product data
    const productData = {
      id: product.id,
      name: product.name,
      category: product.category,
      minOrder: product.minOrder,
      image: this.getProductImage(product),
      viewedAt: Date.now()
    };

    // Add to front
    filtered.unshift(productData);

    // Keep only MAX_ITEMS
    const trimmed = filtered.slice(0, this.MAX_ITEMS);

    this.saveItems(trimmed);
  },

  // Get product image
  getProductImage(product) {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      return typeof firstImage === 'string' ? firstImage : (firstImage.url || firstImage.preview || '');
    }
    return 'https://via.placeholder.com/300x300?text=No+Image';
  },

  // Render recently viewed section
  render(containerSelector, excludeProductId = null) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    let items = this.getItems();

    // Exclude current product if on detail page
    if (excludeProductId) {
      items = items.filter(item => item.id !== excludeProductId);
    }

    // Don't show section if less than 2 items
    if (items.length < 2) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    container.innerHTML = `
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Recently Viewed</h2>
          <p class="section-subtitle">Products you've looked at recently</p>
        </div>
        <div class="recently-viewed-grid">
          ${items.map(item => this.renderCard(item)).join('')}
        </div>
      </div>
    `;

    // Add click handlers for cards
    container.querySelectorAll('.recently-viewed-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const productId = card.dataset.productId;
        window.location.href = `product-detail.html?id=${productId}`;
      });
    });
  },

  // Render a single recently viewed card
  renderCard(item) {
    return `
      <div class="recently-viewed-card" data-product-id="${item.id}">
        <div class="recently-viewed-image">
          <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/150x150?text=No+Image'">
        </div>
        <div class="recently-viewed-info">
          <h4 class="recently-viewed-name">${item.name}</h4>
          <span class="recently-viewed-meta">Min: ${item.minOrder} pcs</span>
        </div>
      </div>
    `;
  },

  // Clear all recently viewed
  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
};

// Export for use in other scripts
window.RecentlyViewed = RecentlyViewed;
