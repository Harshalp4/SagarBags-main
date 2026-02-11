/**
 * Sagar Bags - Application Configuration
 *
 * SECURITY NOTE:
 * Firebase web config is designed to be public. Security is enforced through:
 * 1. Firebase Security Rules (in Firebase Console)
 * 2. Firebase Authentication
 * 3. Domain restrictions (set in Firebase Console > Settings)
 *
 * Ensure you have configured:
 * - Firestore Security Rules to restrict read/write access
 * - Authentication domain whitelist
 * - API key restrictions in Google Cloud Console
 */

const APP_CONFIG = {
  // Company Information
  company: {
    name: 'Sagar Bags',
    tagline: 'Premium Bag Manufacturer',
    phone: ['+91 98695 09070', '+91 86930 00756', '+91 98707 92636'],
    email: 'info@sagarbags.com',
    whatsapp: '+919869509070',
    address: {
      line1: 'Sagar Compound, M. Phule Road',
      line2: 'Mulund West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400080',
      country: 'India'
    }
  },

  // Social Media Links
  social: {
    facebook: 'https://facebook.com/sagarbags',
    instagram: 'https://instagram.com/sagarbags',
    linkedin: 'https://linkedin.com/company/sagarbags'
  },

  // Firebase Configuration
  // Security is enforced via Firebase Console Security Rules
  firebase: {
    apiKey: "AIzaSyAW2A_Y4VoKX3y5AzTjGVhqX9ZnXXTWcUY",
    authDomain: "sagar-bags.firebaseapp.com",
    projectId: "sagar-bags",
    storageBucket: "sagar-bags.firebasestorage.app",
    messagingSenderId: "655112218935",
    appId: "1:655112218935:web:9167abdd24b228c08792b2",
    measurementId: "G-BR25Y9BCSM"
  },

  // Feature Flags
  features: {
    enableWhatsAppPopup: true,
    whatsAppPopupDelay: 5000, // 5 seconds
    enableAnalytics: true,
    enableOfflineMode: false
  },

  // API Endpoints (if any)
  api: {
    baseUrl: window.location.origin
  }
};

// Freeze config to prevent modifications
Object.freeze(APP_CONFIG);
Object.freeze(APP_CONFIG.company);
Object.freeze(APP_CONFIG.social);
Object.freeze(APP_CONFIG.firebase);
Object.freeze(APP_CONFIG.features);
Object.freeze(APP_CONFIG.api);

// Export for use
window.APP_CONFIG = APP_CONFIG;
