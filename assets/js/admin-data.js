/* ========================================
   SAGAR BAGS - Admin Data Management
   localStorage helpers & demo data
   ======================================== */

const AdminData = {
  // Storage Keys
  KEYS: {
    ADMIN: 'sagarbags_admin',
    PRODUCTS: 'sagarbags_products',
    CATEGORIES: 'sagarbags_categories',
    TESTIMONIALS: 'sagarbags_testimonials',
    HOMEPAGE: 'sagarbags_homepage',
    INQUIRIES: 'sagarbags_inquiries',
    ACTIVE_CARTS: 'sagarbags_active_carts'
  },

  // ==================== Initialization ====================
  init() {
    // Initialize with demo data if not exists
    if (!localStorage.getItem(this.KEYS.ADMIN)) {
      this.initializeAdminSettings();
    }
    if (!localStorage.getItem(this.KEYS.PRODUCTS)) {
      this.initializeProducts();
    }
    if (!localStorage.getItem(this.KEYS.CATEGORIES)) {
      this.initializeCategories();
    }
    if (!localStorage.getItem(this.KEYS.TESTIMONIALS)) {
      this.initializeTestimonials();
    }
    if (!localStorage.getItem(this.KEYS.HOMEPAGE)) {
      this.initializeHomepage();
    }
    if (!localStorage.getItem(this.KEYS.INQUIRIES)) {
      this.initializeInquiries();
    }
  },

  // ==================== Admin Settings ====================
  initializeAdminSettings() {
    const settings = {
      password: 'sagarbags2024',
      lastLogin: null
    };
    localStorage.setItem(this.KEYS.ADMIN, JSON.stringify(settings));
  },

  getAdminSettings() {
    const data = localStorage.getItem(this.KEYS.ADMIN);
    return data ? JSON.parse(data) : { password: 'sagarbags2024' };
  },

  updateAdminSettings(updates) {
    const settings = this.getAdminSettings();
    const updated = { ...settings, ...updates };
    localStorage.setItem(this.KEYS.ADMIN, JSON.stringify(updated));
    return updated;
  },

  // ==================== Products ====================
  initializeProducts() {
    const products = [
      {
        id: 'prod_001',
        name: 'Premium Laptop Bag',
        category: 'corporate',
        minOrder: 100,
        badge: 'bestseller',
        shortDesc: 'Professional laptop bag with padded compartment for 15.6" laptops',
        fullDesc: 'Our Premium Laptop Bag is designed for the modern professional. Features a padded laptop compartment that fits up to 15.6" laptops, multiple organizer pockets, and premium water-resistant material. Perfect for corporate gifting and promotional events.',
        images: ['assets/images/products/laptop-bag-1.jpg'],
        features: ['Padded laptop compartment', 'Water-resistant material', 'Multiple organizer pockets', 'Adjustable shoulder strap', 'Custom branding available'],
        status: 'active',
        createdAt: '2024-01-15',
        updatedAt: '2024-12-30'
      },
      {
        id: 'prod_002',
        name: 'Eco Jute Tote',
        category: 'jute',
        minOrder: 200,
        badge: 'new',
        shortDesc: 'Sustainable jute tote bag with cotton handles',
        fullDesc: 'Go green with our Eco Jute Tote. Made from 100% natural jute with reinforced cotton handles. Ideal for retail promotions, corporate events, and eco-conscious branding campaigns.',
        images: ['assets/images/products/jute-tote-1.jpg'],
        features: ['100% natural jute', 'Reinforced cotton handles', 'Eco-friendly', 'Large print area', 'Reusable & biodegradable'],
        status: 'active',
        createdAt: '2024-06-10',
        updatedAt: '2024-12-30'
      },
      {
        id: 'prod_003',
        name: 'Conference Document Bag',
        category: 'corporate',
        minOrder: 150,
        badge: '',
        shortDesc: 'Professional document bag ideal for conferences and events',
        fullDesc: 'Perfect for conferences and corporate events. Features a zippered main compartment, front pocket for quick access items, and adjustable shoulder strap. Available in multiple colors with custom logo printing.',
        images: ['assets/images/products/conference-bag-1.jpg'],
        features: ['Zippered main compartment', 'Front quick-access pocket', 'Adjustable strap', 'Professional appearance', 'Multiple color options'],
        status: 'active',
        createdAt: '2024-03-20',
        updatedAt: '2024-12-30'
      },
      {
        id: 'prod_004',
        name: 'Travel Duffle Bag',
        category: 'travel',
        minOrder: 50,
        badge: 'bestseller',
        shortDesc: 'Spacious duffle bag for weekend getaways',
        fullDesc: 'The perfect travel companion for short trips and weekend getaways. Features a large main compartment, multiple side pockets, and comfortable carry handles. Durable construction with premium zippers.',
        images: ['assets/images/products/duffle-bag-1.jpg'],
        features: ['Spacious main compartment', 'Multiple side pockets', 'Durable construction', 'Comfortable handles', 'Premium zippers'],
        status: 'active',
        createdAt: '2024-02-05',
        updatedAt: '2024-12-30'
      },
      {
        id: 'prod_005',
        name: 'Canvas Shopping Tote',
        category: 'tote',
        minOrder: 300,
        badge: '',
        shortDesc: 'Sturdy canvas tote for everyday shopping',
        fullDesc: 'A versatile canvas shopping tote that combines durability with style. Heavy-duty canvas construction with reinforced stitching. Large capacity and comfortable shoulder straps.',
        images: ['assets/images/products/canvas-tote-1.jpg'],
        features: ['Heavy-duty canvas', 'Reinforced stitching', 'Large capacity', 'Comfortable straps', 'Washable'],
        status: 'active',
        createdAt: '2024-04-12',
        updatedAt: '2024-12-30'
      },
      {
        id: 'prod_006',
        name: 'Executive Backpack',
        category: 'corporate',
        minOrder: 75,
        badge: 'new',
        shortDesc: 'Premium backpack for business professionals',
        fullDesc: 'Sleek and professional backpack designed for executives. Features dedicated laptop and tablet compartments, USB charging port, and anti-theft design. Premium materials with a sophisticated look.',
        images: ['assets/images/products/executive-backpack-1.jpg'],
        features: ['Laptop & tablet compartments', 'USB charging port', 'Anti-theft design', 'Premium materials', 'Ergonomic straps'],
        status: 'active',
        createdAt: '2024-11-01',
        updatedAt: '2024-12-30'
      }
    ];
    localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
  },

  getProducts() {
    const data = localStorage.getItem(this.KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },

  getProduct(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  },

  addProduct(product) {
    const products = this.getProducts();
    const newProduct = {
      ...product,
      id: 'prod_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    products.unshift(newProduct);
    localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
    return newProduct;
  },

  updateProduct(id, updates) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = {
        ...products[index],
        ...updates,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
      return products[index];
    }
    return null;
  },

  deleteProduct(id) {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(filtered));
    return true;
  },

  // ==================== Categories ====================
  initializeCategories() {
    const categories = [
      {
        id: 'corporate',
        name: 'Corporate Bags',
        icon: '💼',
        description: 'Professional bags for business and corporate gifting',
        image: 'assets/images/categories/corporate.jpg'
      },
      {
        id: 'jute',
        name: 'Jute Bags',
        icon: '🌿',
        description: 'Eco-friendly jute bags for sustainable branding',
        image: 'assets/images/categories/jute.jpg'
      },
      {
        id: 'travel',
        name: 'Travel Bags',
        icon: '✈️',
        description: 'Durable travel bags for every journey',
        image: 'assets/images/categories/travel.jpg'
      },
      {
        id: 'tote',
        name: 'Tote Bags',
        icon: '👜',
        description: 'Stylish tote bags for everyday use',
        image: 'assets/images/categories/tote.jpg'
      },
      {
        id: 'backpack',
        name: 'Backpacks',
        icon: '🎒',
        description: 'Comfortable backpacks for all occasions',
        image: 'assets/images/categories/backpack.jpg'
      },
      {
        id: 'promotional',
        name: 'Promotional Bags',
        icon: '🎁',
        description: 'Custom promotional bags for events and campaigns',
        image: 'assets/images/categories/promotional.jpg'
      }
    ];
    localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getCategories() {
    const data = localStorage.getItem(this.KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  },

  getCategory(id) {
    const categories = this.getCategories();
    return categories.find(c => c.id === id);
  },

  addCategory(category) {
    const categories = this.getCategories();
    const newCategory = {
      ...category,
      id: category.name.toLowerCase().replace(/\s+/g, '-')
    };
    categories.push(newCategory);
    localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(categories));
    return newCategory;
  },

  updateCategory(id, updates) {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates };
      localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(categories));
      return categories[index];
    }
    return null;
  },

  deleteCategory(id) {
    const categories = this.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(filtered));
    return true;
  },

  getCategoryProductCount(categoryId) {
    const products = this.getProducts();
    return products.filter(p => p.category === categoryId).length;
  },

  // ==================== Testimonials ====================
  initializeTestimonials() {
    const testimonials = [
      {
        id: 'test_001',
        quote: 'Excellent quality bags and outstanding service. Our branded laptop bags were a hit at the conference. Highly recommend Sagar Bags for any corporate gifting needs.',
        name: 'Rajesh Kumar',
        company: 'TechCorp Solutions',
        rating: 5,
        photo: '',
        status: 'published',
        createdAt: '2024-10-15'
      },
      {
        id: 'test_002',
        quote: 'We ordered 500 jute bags for our retail promotion and the quality exceeded our expectations. Great eco-friendly option with beautiful printing.',
        name: 'Priya Sharma',
        company: 'Green Earth Retail',
        rating: 5,
        photo: '',
        status: 'published',
        createdAt: '2024-09-22'
      },
      {
        id: 'test_003',
        quote: 'Fast delivery, great quality, and competitive pricing. Sagar Bags has been our go-to supplier for promotional bags for the past 3 years.',
        name: 'Amit Patel',
        company: 'EventPro Organizers',
        rating: 5,
        photo: '',
        status: 'published',
        createdAt: '2024-08-10'
      },
      {
        id: 'test_004',
        quote: 'The customization options are fantastic. They perfectly captured our brand identity on the bags. Professional team and excellent communication.',
        name: 'Sneha Reddy',
        company: 'BrandFirst Marketing',
        rating: 4,
        photo: '',
        status: 'published',
        createdAt: '2024-07-05'
      }
    ];
    localStorage.setItem(this.KEYS.TESTIMONIALS, JSON.stringify(testimonials));
  },

  getTestimonials() {
    const data = localStorage.getItem(this.KEYS.TESTIMONIALS);
    return data ? JSON.parse(data) : [];
  },

  getTestimonial(id) {
    const testimonials = this.getTestimonials();
    return testimonials.find(t => t.id === id);
  },

  addTestimonial(testimonial) {
    const testimonials = this.getTestimonials();
    const newTestimonial = {
      ...testimonial,
      id: 'test_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    testimonials.unshift(newTestimonial);
    localStorage.setItem(this.KEYS.TESTIMONIALS, JSON.stringify(testimonials));
    return newTestimonial;
  },

  updateTestimonial(id, updates) {
    const testimonials = this.getTestimonials();
    const index = testimonials.findIndex(t => t.id === id);
    if (index !== -1) {
      testimonials[index] = { ...testimonials[index], ...updates };
      localStorage.setItem(this.KEYS.TESTIMONIALS, JSON.stringify(testimonials));
      return testimonials[index];
    }
    return null;
  },

  deleteTestimonial(id) {
    const testimonials = this.getTestimonials();
    const filtered = testimonials.filter(t => t.id !== id);
    localStorage.setItem(this.KEYS.TESTIMONIALS, JSON.stringify(filtered));
    return true;
  },

  // ==================== Homepage Content ====================
  initializeHomepage() {
    const homepage = {
      hero: {
        badge: 'Premium Quality Since 2000',
        title: 'Premium Bags for Your Brand',
        subtitle: 'Manufacturing excellence meets innovative design. Custom promotional bags that elevate your brand identity.',
        ctaText: 'Explore Products',
        ctaLink: 'products.html'
      },
      stats: [
        { value: '20+', label: 'Years Experience' },
        { value: '10K+', label: 'Happy Clients' },
        { value: '50+', label: 'Product Varieties' }
      ],
      usp: [
        { icon: 'quality', title: 'Premium Quality', description: 'High-grade materials and craftsmanship' },
        { icon: 'branding', title: 'Custom Branding', description: 'Your logo, your colors, your style' },
        { icon: 'delivery', title: 'Fast Delivery', description: 'On-time delivery across India' },
        { icon: 'bulk', title: 'Bulk Orders', description: 'Competitive pricing for large orders' }
      ],
      cta: {
        title: 'Ready to Elevate Your Brand?',
        subtitle: 'Get custom bags designed specifically for your business. Quality guaranteed.',
        button1Text: 'Get Quote',
        button1Link: 'contact.html',
        button2Text: 'WhatsApp Us',
        button2Link: 'https://wa.me/919876543210'
      }
    };
    localStorage.setItem(this.KEYS.HOMEPAGE, JSON.stringify(homepage));
  },

  getHomepage() {
    const data = localStorage.getItem(this.KEYS.HOMEPAGE);
    return data ? JSON.parse(data) : this.initializeHomepage();
  },

  updateHomepage(updates) {
    const homepage = this.getHomepage();
    const updated = { ...homepage, ...updates };
    localStorage.setItem(this.KEYS.HOMEPAGE, JSON.stringify(updated));
    return updated;
  },

  // ==================== Inquiries ====================
  initializeInquiries() {
    const inquiries = [
      {
        id: 'inq_001',
        name: 'Vikram Singh',
        email: 'vikram@abccorp.com',
        phone: '+91 98765 43210',
        company: 'ABC Corporation',
        products: [
          { id: 'prod_001', name: 'Premium Laptop Bag', qty: 200 },
          { id: 'prod_003', name: 'Conference Document Bag', qty: 100 }
        ],
        message: 'Looking for branded bags for our upcoming annual conference. Need high-quality printing with our company logo.',
        status: 'unread',
        createdAt: '2024-12-30T10:30:00Z'
      },
      {
        id: 'inq_002',
        name: 'Meera Joshi',
        email: 'meera@retailplus.in',
        phone: '+91 87654 32109',
        company: 'Retail Plus India',
        products: [
          { id: 'prod_002', name: 'Eco Jute Tote', qty: 500 }
        ],
        message: 'Need eco-friendly bags for our new sustainable shopping initiative. Please share pricing for 500 units with custom printing.',
        status: 'read',
        createdAt: '2024-12-29T14:15:00Z'
      },
      {
        id: 'inq_003',
        name: 'Arjun Mehta',
        email: 'arjun@techstart.io',
        phone: '+91 76543 21098',
        company: 'TechStart.io',
        products: [
          { id: 'prod_006', name: 'Executive Backpack', qty: 50 }
        ],
        message: 'We want premium backpacks for our senior team. Looking for executive quality with subtle branding.',
        status: 'unread',
        createdAt: '2024-12-28T09:00:00Z'
      }
    ];
    localStorage.setItem(this.KEYS.INQUIRIES, JSON.stringify(inquiries));
  },

  getInquiries() {
    const data = localStorage.getItem(this.KEYS.INQUIRIES);
    return data ? JSON.parse(data) : [];
  },

  getInquiry(id) {
    const inquiries = this.getInquiries();
    return inquiries.find(i => i.id === id);
  },

  addInquiry(inquiry) {
    const inquiries = this.getInquiries();
    const newInquiry = {
      ...inquiry,
      id: 'inq_' + Date.now(),
      status: 'unread',
      createdAt: new Date().toISOString()
    };
    inquiries.unshift(newInquiry);
    localStorage.setItem(this.KEYS.INQUIRIES, JSON.stringify(inquiries));
    return newInquiry;
  },

  updateInquiry(id, updates) {
    const inquiries = this.getInquiries();
    const index = inquiries.findIndex(i => i.id === id);
    if (index !== -1) {
      inquiries[index] = { ...inquiries[index], ...updates };
      localStorage.setItem(this.KEYS.INQUIRIES, JSON.stringify(inquiries));
      return inquiries[index];
    }
    return null;
  },

  markInquiryRead(id) {
    return this.updateInquiry(id, { status: 'read' });
  },

  markInquiryUnread(id) {
    return this.updateInquiry(id, { status: 'unread' });
  },

  deleteInquiry(id) {
    const inquiries = this.getInquiries();
    const filtered = inquiries.filter(i => i.id !== id);
    localStorage.setItem(this.KEYS.INQUIRIES, JSON.stringify(filtered));
    return true;
  },

  getUnreadInquiryCount() {
    const inquiries = this.getInquiries();
    return inquiries.filter(i => i.status === 'unread').length;
  },

  // ==================== Active Carts (User Cart Tracking) ====================
  getActiveCarts() {
    const data = localStorage.getItem(this.KEYS.ACTIVE_CARTS);
    return data ? JSON.parse(data) : [];
  },

  saveActiveCart(cartData) {
    const carts = this.getActiveCarts();

    // Generate or use existing session ID
    let sessionId = sessionStorage.getItem('sagarbags_user_session');
    if (!sessionId) {
      sessionId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('sagarbags_user_session', sessionId);
    }

    // Check if cart for this session exists
    const existingIndex = carts.findIndex(c => c.sessionId === sessionId);

    const cartEntry = {
      sessionId: sessionId,
      items: cartData.items || [],
      itemCount: cartData.items ? cartData.items.length : 0,
      lastUpdated: new Date().toISOString(),
      createdAt: existingIndex !== -1 ? carts[existingIndex].createdAt : new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 100),
      status: 'active' // active, contacted, converted
    };

    if (existingIndex !== -1) {
      carts[existingIndex] = cartEntry;
    } else {
      carts.unshift(cartEntry);
    }

    // Keep only last 100 carts to prevent storage overflow
    const trimmedCarts = carts.slice(0, 100);
    localStorage.setItem(this.KEYS.ACTIVE_CARTS, JSON.stringify(trimmedCarts));
    return cartEntry;
  },

  getActiveCart(sessionId) {
    const carts = this.getActiveCarts();
    return carts.find(c => c.sessionId === sessionId);
  },

  updateCartStatus(sessionId, status) {
    const carts = this.getActiveCarts();
    const index = carts.findIndex(c => c.sessionId === sessionId);
    if (index !== -1) {
      carts[index].status = status;
      localStorage.setItem(this.KEYS.ACTIVE_CARTS, JSON.stringify(carts));
      return carts[index];
    }
    return null;
  },

  deleteActiveCart(sessionId) {
    const carts = this.getActiveCarts();
    const filtered = carts.filter(c => c.sessionId !== sessionId);
    localStorage.setItem(this.KEYS.ACTIVE_CARTS, JSON.stringify(filtered));
    return true;
  },

  getActiveCartCount() {
    const carts = this.getActiveCarts();
    // Only count carts with items that are less than 24 hours old
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    return carts.filter(c => c.itemCount > 0 && c.lastUpdated > oneDayAgo && c.status === 'active').length;
  },

  // ==================== Image Helpers ====================
  compressImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Scale down if needed
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // ==================== Utility Functions ====================
  generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  },

  formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Reset all data to defaults
  resetAllData() {
    localStorage.removeItem(this.KEYS.ADMIN);
    localStorage.removeItem(this.KEYS.PRODUCTS);
    localStorage.removeItem(this.KEYS.CATEGORIES);
    localStorage.removeItem(this.KEYS.TESTIMONIALS);
    localStorage.removeItem(this.KEYS.HOMEPAGE);
    localStorage.removeItem(this.KEYS.INQUIRIES);
    localStorage.removeItem(this.KEYS.ACTIVE_CARTS);
    this.init();
  }
};

// Initialize on load
AdminData.init();
