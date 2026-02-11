/* ========================================
   SAGAR BAGS - Products Data
   All images are bag-specific
   ======================================== */

const CATEGORIES = [
  {
    id: 'corporate',
    name: 'Corporate Bags',
    slug: 'corporate-bags',
    description: 'Professional laptop bags and backpacks for corporate gifting',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'
  },
  {
    id: 'laptop-school',
    name: 'Laptop & School Bags',
    slug: 'laptop-school-bags',
    description: 'Customizable bags for students and professionals',
    image: 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=400&h=400&fit=crop'
  },
  {
    id: 'non-woven',
    name: 'Non-Woven Bags',
    slug: 'non-woven-bags',
    description: 'Eco-friendly non-woven promotional bags',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop'
  },
  {
    id: 'travel-duffel',
    name: 'Travel & Duffel Bags',
    slug: 'travel-duffel-bags',
    description: 'Stylish travel and duffel bags for all occasions',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'
  },
  {
    id: 'jute-cotton',
    name: 'Jute, Cotton & D-Cut Bags',
    slug: 'jute-cotton-bags',
    description: 'Sustainable jute and cotton bags for eco-conscious brands',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop'
  },
  {
    id: 'thamboolam-canvas',
    name: 'Thamboolam & Canvas Bags',
    slug: 'thamboolam-canvas-bags',
    description: 'Traditional thamboolam bags and durable canvas options',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop'
  },
  {
    id: 'thaily',
    name: 'Thaily Bags',
    slug: 'thaily-bags',
    description: 'Various types of thaily bags for retail and gifting',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop'
  },
  {
    id: 'purse-pouch',
    name: 'Hand Purse & Pouch',
    slug: 'hand-purse-pouch',
    description: 'Elegant purses and pouches for premium gifting',
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=400&fit=crop'
  },
  {
    id: 'complementary',
    name: 'Complementary Items',
    slug: 'complementary-items',
    description: 'Additional accessories and complementary products',
    image: 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=400&h=400&fit=crop'
  },
  {
    id: 'customised',
    name: 'Customised Bags',
    slug: 'customised-bags',
    description: 'Fully customizable bags with your branding',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'
  }
];

const PRODUCTS = [
  // Corporate Bags
  {
    id: 'corp-001',
    name: 'Executive Laptop Backpack',
    category: 'corporate',
    description: 'Premium laptop backpack with multiple compartments, padded laptop sleeve, and ergonomic design. Perfect for corporate gifting.',
    materials: ['Nylon', 'Polyester'],
    customization: ['Logo printing', 'Color options', 'Name embroidery'],
    minOrder: 50,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=600&h=600&fit=crop'
    ],
    featured: true
  },
  {
    id: 'corp-002',
    name: 'Slim Professional Laptop Bag',
    category: 'corporate',
    description: 'Sleek and slim laptop bag for professionals. Fits 15.6" laptops with dedicated tablet pocket.',
    materials: ['Rexin', 'Nylon'],
    customization: ['Logo printing', 'Color options'],
    minOrder: 100,
    images: [
      'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=600&h=600&fit=crop'
    ],
    featured: false
  },
  {
    id: 'corp-003',
    name: 'Conference Messenger Bag',
    category: 'corporate',
    description: 'Ideal for conferences and seminars. Adjustable strap with front document pocket.',
    materials: ['Polyester', 'Canvas'],
    customization: ['Full color printing', 'Embroidery'],
    minOrder: 100,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop'
    ],
    featured: false
  },

  // Laptop & School Bags
  {
    id: 'school-001',
    name: 'Student Backpack Pro',
    category: 'laptop-school',
    description: 'Durable school backpack with laptop compartment. Multiple pockets for books and stationery.',
    materials: ['Polyester', 'Nylon'],
    customization: ['School logo', 'Custom colors', 'Name tags'],
    minOrder: 100,
    images: [
      'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=600&h=600&fit=crop'
    ],
    featured: true
  },
  {
    id: 'school-002',
    name: 'Kids School Bag',
    category: 'laptop-school',
    description: 'Colorful and lightweight school bag designed for young students. Padded straps for comfort.',
    materials: ['Polyester'],
    customization: ['Character prints', 'Name embroidery'],
    minOrder: 200,
    images: [
      'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=600&h=600&fit=crop'
    ],
    featured: false
  },

  // Non-Woven Bags
  {
    id: 'nw-001',
    name: 'Non-Woven Shopping Bag',
    category: 'non-woven',
    description: 'Eco-friendly non-woven bag perfect for retail and promotional events. Reusable and durable.',
    materials: ['Non-woven PP'],
    customization: ['Full color print', 'Logo placement'],
    minOrder: 500,
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop'
    ],
    featured: true
  },
  {
    id: 'nw-002',
    name: 'Non-Woven D-Cut Bag',
    category: 'non-woven',
    description: 'D-cut handle non-woven bag. Great for grocery stores and exhibitions.',
    materials: ['Non-woven PP'],
    customization: ['Screen printing', 'Heat transfer'],
    minOrder: 1000,
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop'
    ],
    featured: false
  },
  {
    id: 'nw-003',
    name: 'Non-Woven Box Bag',
    category: 'non-woven',
    description: 'Box-shaped non-woven bag with reinforced bottom. Ideal for heavy items.',
    materials: ['Non-woven PP'],
    customization: ['Full color printing', 'Lamination'],
    minOrder: 500,
    images: [
      'https://images.unsplash.com/photo-1578237493287-8d4d2b03591a?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop'
    ],
    featured: false
  },

  // Travel & Duffel Bags
  {
    id: 'travel-001',
    name: 'Weekend Duffel Bag',
    category: 'travel-duffel',
    description: 'Spacious duffel bag for weekend trips. Water-resistant material with shoe compartment.',
    materials: ['Nylon', 'Polyester'],
    customization: ['Logo embroidery', 'Color options'],
    minOrder: 50,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop'
    ],
    featured: true
  },
  {
    id: 'travel-002',
    name: 'Gym Duffel Bag',
    category: 'travel-duffel',
    description: 'Compact gym bag with wet pocket and adjustable strap. Perfect for fitness enthusiasts.',
    materials: ['Polyester'],
    customization: ['Brand logo', 'Custom colors'],
    minOrder: 100,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop'
    ],
    featured: false
  },

  // Jute & Cotton Bags
  {
    id: 'jute-001',
    name: 'Premium Jute Tote',
    category: 'jute-cotton',
    description: 'Natural jute tote bag with cotton handles. Eco-friendly and biodegradable.',
    materials: ['Jute', 'Cotton'],
    customization: ['Screen printing', 'Jute patches'],
    minOrder: 200,
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&h=600&fit=crop'
    ],
    featured: true
  },
  {
    id: 'jute-002',
    name: 'Cotton Canvas Tote',
    category: 'jute-cotton',
    description: 'Heavy-duty cotton canvas bag. Washable and long-lasting.',
    materials: ['Cotton Canvas'],
    customization: ['Digital printing', 'Embroidery'],
    minOrder: 100,
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop'
    ],
    featured: false
  },
  {
    id: 'jute-003',
    name: 'Jute Wine Bag',
    category: 'jute-cotton',
    description: 'Single bottle jute wine bag. Perfect for gifting and events.',
    materials: ['Jute'],
    customization: ['Logo printing', 'Ribbon options'],
    minOrder: 300,
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop'
    ],
    featured: false
  },

  // Thamboolam & Canvas Bags
  {
    id: 'thamb-001',
    name: 'Traditional Thamboolam Bag',
    category: 'thamboolam-canvas',
    description: 'Beautiful thamboolam bags for weddings and functions. Available in various designs.',
    materials: ['Cotton', 'Silk blend'],
    customization: ['Name printing', 'Design options'],
    minOrder: 100,
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop'
    ],
    featured: true
  },
  {
    id: 'thamb-002',
    name: 'Heavy Duty Canvas Bag',
    category: 'thamboolam-canvas',
    description: 'Industrial-strength canvas bag for heavy-duty use. Reinforced stitching.',
    materials: ['Canvas'],
    customization: ['Logo printing'],
    minOrder: 100,
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop'
    ],
    featured: false
  },

  // Thaily Bags
  {
    id: 'thaily-001',
    name: 'D-Cut Thaily Bag',
    category: 'thaily',
    description: 'Standard D-cut thaily bag for retail use. Available in multiple sizes.',
    materials: ['LD Plastic'],
    customization: ['Printing', 'Size options'],
    minOrder: 1000,
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop'
    ],
    featured: false
  },
  {
    id: 'thaily-002',
    name: 'Loop Handle Thaily',
    category: 'thaily',
    description: 'Soft loop handle thaily bags. Comfortable to carry.',
    materials: ['LD Plastic'],
    customization: ['Full color printing'],
    minOrder: 2000,
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop'
    ],
    featured: false
  },

  // Hand Purse & Pouch
  {
    id: 'purse-001',
    name: 'Ladies Clutch Purse',
    category: 'purse-pouch',
    description: 'Elegant clutch purse for corporate gifting. Premium finish.',
    materials: ['Rexin', 'PU Leather'],
    customization: ['Logo embossing', 'Color options'],
    minOrder: 50,
    images: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop'
    ],
    featured: true
  },
  {
    id: 'purse-002',
    name: 'Travel Toiletry Pouch',
    category: 'purse-pouch',
    description: 'Multi-pocket toiletry pouch. Water-resistant lining.',
    materials: ['Nylon', 'PVC lining'],
    customization: ['Logo printing'],
    minOrder: 100,
    images: [
      'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&h=600&fit=crop'
    ],
    featured: false
  },

  // Complementary Items
  {
    id: 'comp-001',
    name: 'Drawstring Bag',
    category: 'complementary',
    description: 'Lightweight drawstring bag for events and giveaways.',
    materials: ['Polyester', 'Nylon'],
    customization: ['Full color printing'],
    minOrder: 500,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600&h=600&fit=crop'
    ],
    featured: false
  },
  {
    id: 'comp-002',
    name: 'Laptop Sleeve',
    category: 'complementary',
    description: 'Padded laptop sleeve for extra protection. Fits 13" to 15" laptops.',
    materials: ['Neoprene', 'Polyester'],
    customization: ['Logo printing'],
    minOrder: 100,
    images: [
      'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop'
    ],
    featured: false
  },

  // Customised Bags
  {
    id: 'custom-001',
    name: 'Fully Custom Bag',
    category: 'customised',
    description: 'Design your own bag from scratch. We manufacture to your exact specifications.',
    materials: ['Any material'],
    customization: ['Full customization'],
    minOrder: 500,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600&h=600&fit=crop'
    ],
    featured: true
  },
  {
    id: 'custom-002',
    name: 'Custom Event Bag',
    category: 'customised',
    description: 'Special bags designed for your events. Quick turnaround available.',
    materials: ['Various'],
    customization: ['Complete branding'],
    minOrder: 200,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop'
    ],
    featured: false
  }
];

// Data store - empty by default, populated from Firebase
let productsData = [];
let categoriesData = [];
let dataLoaded = false;
let dataLoadPromise = null;

// Initialize data from Firebase
async function initializeDataFromFirebase() {
  if (typeof FirebaseDB === 'undefined') {
    console.log('Firebase not available');
    return false;
  }

  try {
    const [products, categories] = await Promise.all([
      FirebaseDB.getProducts(),
      FirebaseDB.getCategories()
    ]);

    productsData = products || [];
    categoriesData = categories || [];
    dataLoaded = true;
    console.log('Loaded', productsData.length, 'products and', categoriesData.length, 'categories from Firebase');
    return true;
  } catch (error) {
    console.log('Firebase fetch failed:', error);
    return false;
  }
}

// Wait for data to load
async function waitForData() {
  if (dataLoaded) return true;

  // Wait for Firebase to be available
  let attempts = 0;
  while (typeof FirebaseDB === 'undefined' && attempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }

  if (typeof FirebaseDB === 'undefined') {
    console.log('Firebase not available after waiting');
    return false;
  }

  if (!dataLoadPromise) {
    dataLoadPromise = initializeDataFromFirebase();
  }
  await dataLoadPromise;
  return dataLoaded;
}

// Helper functions
function getProductById(id) {
  return productsData.find(p => p.id === id);
}

function getProductsByCategory(categoryId) {
  return productsData.filter(p => p.category === categoryId);
}

function getCategoryById(id) {
  return categoriesData.find(c => c.id === id);
}

function getCategoryBySlug(slug) {
  return categoriesData.find(c => c.slug === slug);
}

function getFeaturedProducts() {
  return productsData.filter(p => p.featured);
}

function getAllProducts() {
  return productsData;
}

function getAllCategories() {
  return categoriesData;
}

function searchProducts(query) {
  const q = query.toLowerCase();
  return productsData.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.description?.toLowerCase().includes(q) ||
    (p.materials && p.materials.some(m => m.toLowerCase().includes(q)))
  );
}

// Initialize on load - start loading immediately
function tryInitFirebase() {
  if (typeof FirebaseDB !== 'undefined') {
    dataLoadPromise = initializeDataFromFirebase().then(() => {
      // Dispatch event when data is loaded
      window.dispatchEvent(new CustomEvent('productsDataLoaded'));
    });
  } else {
    // Firebase not loaded yet, try again in 100ms
    setTimeout(tryInitFirebase, 100);
  }
}

// Start trying to load Firebase data
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tryInitFirebase);
} else {
  tryInitFirebase();
}
