/* ========================================
   SAGAR BAGS - Favorites/Wishlist System
   ======================================== */

const Favorites = {
  STORAGE_KEY: 'sagarbags_favorites',

  // Initialize favorites
  init() {
    this.updateFavoritesCount();
    this.updateFavoriteButtons();
    this.bindEvents();
  },

  // Get favorites from localStorage
  getFavorites() {
    const favorites = localStorage.getItem(this.STORAGE_KEY);
    return favorites ? JSON.parse(favorites) : [];
  },

  // Save favorites to localStorage
  saveFavorites(favorites) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
    this.updateFavoritesCount();
  },

  // Add to favorites
  addToFavorites(productId) {
    const favorites = this.getFavorites();
    const product = getProductById(productId);

    if (!product) {
      console.error('Product not found:', productId);
      return false;
    }

    if (!favorites.includes(productId)) {
      favorites.push(productId);
      this.saveFavorites(favorites);
      this.updateFavoriteButtons();
      showToast(`${product.name} added to favorites`, 'success');
      return true;
    }
    return false;
  },

  // Remove from favorites
  removeFromFavorites(productId) {
    let favorites = this.getFavorites();
    const product = getProductById(productId);
    favorites = favorites.filter(id => id !== productId);
    this.saveFavorites(favorites);
    this.updateFavoriteButtons();
    if (product) {
      showToast(`${product.name} removed from favorites`, 'success');
    }
  },

  // Toggle favorite
  toggleFavorite(productId) {
    if (this.isFavorite(productId)) {
      this.removeFromFavorites(productId);
    } else {
      this.addToFavorites(productId);
    }
  },

  // Check if product is in favorites
  isFavorite(productId) {
    const favorites = this.getFavorites();
    return favorites.includes(productId);
  },

  // Get favorites count
  getFavoritesCount() {
    return this.getFavorites().length;
  },

  // Update favorites count badge
  updateFavoritesCount() {
    const count = this.getFavoritesCount();
    const badges = document.querySelectorAll('.favorites-count');
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  // Update all favorite buttons state
  updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
      const productId = btn.dataset.productId;
      if (this.isFavorite(productId)) {
        btn.classList.add('active');
        btn.setAttribute('aria-label', 'Remove from favorites');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-label', 'Add to favorites');
      }
    });
  },

  // Get favorite products
  getFavoriteProducts() {
    const favorites = this.getFavorites();
    return favorites.map(id => getProductById(id)).filter(p => p);
  },

  // Clear all favorites
  clearFavorites() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.updateFavoritesCount();
    this.updateFavoriteButtons();
    showToast('Favorites cleared', 'success');
  },

  // Bind events
  bindEvents() {
    // Favorite button click (delegated)
    document.addEventListener('click', (e) => {
      if (e.target.closest('.favorite-btn')) {
        e.preventDefault();
        const btn = e.target.closest('.favorite-btn');
        const productId = btn.dataset.productId;
        this.toggleFavorite(productId);
      }
    });
  },

  // Render favorites modal/section
  renderFavorites(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const favorites = this.getFavoriteProducts();

    if (favorites.length === 0) {
      container.innerHTML = `
        <div class="favorites-empty">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p>No favorites yet</p>
          <a href="products.html" class="btn btn-primary btn-sm">Browse Products</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="favorites-grid">
        ${favorites.map(product => `
          <div class="favorite-item">
            <div class="favorite-item-image">
              <img src="${product.images[0]}" alt="${product.name}">
              <button class="favorite-btn active" data-product-id="${product.id}" aria-label="Remove from favorites">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              </button>
            </div>
            <div class="favorite-item-info">
              <h4>${product.name}</h4>
              <p>${getCategoryById(product.category)?.name || product.category}</p>
              <div class="favorite-item-actions">
                <button class="btn btn-primary btn-sm add-to-cart" data-product-id="${product.id}">
                  Add to Quote
                </button>
                <a href="product-detail.html?id=${product.id}" class="btn btn-outline btn-sm">View</a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
};

// Initialize favorites when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  Favorites.init();
});
