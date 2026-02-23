/* ========================================
   SAGAR BAGS - Firebase Configuration
   ======================================== */

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAW2A_Y4VoKX3y5AzTjGVhqX9ZnXXTWcUY",
  authDomain: "sagar-bags.firebaseapp.com",
  projectId: "sagar-bags",
  storageBucket: "sagar-bags.firebasestorage.app",
  messagingSenderId: "655112218935",
  appId: "1:655112218935:web:9167abdd24b228c08792b2",
  measurementId: "G-BR25Y9BCSM"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const db = firebase.firestore();
db.settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});
// Enable offline persistence with multi-tab sync
db.enablePersistence({ synchronizeTabs: true }).catch(function (err) {
  if (err.code === 'failed-precondition') {
    console.log('Persistence failed: Multiple tabs open. Data will still sync from server.');
  } else if (err.code === 'unimplemented') {
    console.log('Persistence not available in this browser.');
  } else {
    console.log('Persistence error:', err);
  }
});

const auth = firebase.auth();

// Helper: Get or create session ID for cart tracking
function getOrCreateSessionId() {
  let sessionId = localStorage.getItem('sagarbags_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sagarbags_session_id', sessionId);
  }
  return sessionId;
}

// Firebase helper functions
const FirebaseDB = {
  // -------------------- INQUIRIES --------------------
  async addInquiry(data) {
    try {
      const docRef = await db.collection('inquiries').add({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        company: data.company || '',
        message: data.message || '',
        products: data.products || [],
        requiredDate: data.requiredDate || data.deadline || '',
        status: 'unread',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('Inquiry added with ID:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding inquiry:', error);
      return { success: false, error: error.message };
    }
  },

  async getInquiries() {
    try {
      const snapshot = await db.collection('inquiries')
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
    } catch (error) {
      console.error('Error getting inquiries:', error);
      return [];
    }
  },

  async updateInquiryStatus(id, status) {
    try {
      await db.collection('inquiries').doc(id).update({ status });
      return { success: true };
    } catch (error) {
      console.error('Error updating inquiry:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteInquiry(id) {
    try {
      await db.collection('inquiries').doc(id).delete();
      return { success: true };
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      return { success: false, error: error.message };
    }
  },

  // -------------------- ACTIVE CARTS --------------------
  async syncCart(cart) {
    try {
      const sessionId = getOrCreateSessionId();
      await db.collection('active_carts').doc(sessionId).set({
        items: cart,
        itemCount: cart.length,
        status: 'active',
        userAgent: navigator.userAgent,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Error syncing cart:', error);
      return { success: false, error: error.message };
    }
  },

  async getActiveCarts() {
    try {
      const snapshot = await db.collection('active_carts')
        .where('itemCount', '>', 0)
        .orderBy('itemCount', 'desc')
        .orderBy('updatedAt', 'desc')
        .get();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const updatedAt = data.updatedAt?.toDate?.() || new Date();
        return {
          id: doc.id,
          sessionId: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: updatedAt,
          lastUpdated: updatedAt.toISOString() // For compatibility with admin.js
        };
      });
    } catch (error) {
      console.error('Error getting carts:', error);
      return [];
    }
  },

  async updateCartStatus(sessionId, status) {
    try {
      await db.collection('active_carts').doc(sessionId).update({
        status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating cart:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteCart(sessionId) {
    try {
      await db.collection('active_carts').doc(sessionId).delete();
      return { success: true };
    } catch (error) {
      console.error('Error deleting cart:', error);
      return { success: false, error: error.message };
    }
  },

  // -------------------- REAL-TIME LISTENERS --------------------
  listenToInquiries(callback) {
    return db.collection('inquiries')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const inquiries = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
        callback(inquiries);
      });
  },

  listenToUnreadCount(callback) {
    return db.collection('inquiries')
      .where('status', '==', 'unread')
      .onSnapshot(snapshot => {
        callback(snapshot.docs.length);
      });
  },

  listenToActiveCarts(callback) {
    return db.collection('active_carts')
      .where('itemCount', '>', 0)
      .onSnapshot(snapshot => {
        const carts = snapshot.docs.map(doc => {
          const data = doc.data();
          const updatedAt = data.updatedAt?.toDate?.() || new Date();
          return {
            id: doc.id,
            sessionId: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: updatedAt,
            lastUpdated: updatedAt.toISOString()
          };
        });
        callback(carts);
      });
  },

  // -------------------- PRODUCTS --------------------
  async addProduct(data) {
    try {
      const docRef = await db.collection('products').add({
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding product:', error);
      return { success: false, error: error.message };
    }
  },

  async getProducts() {
    try {
      const snapshot = await db.collection('products')
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  },

  async getProduct(id) {
    try {
      const doc = await db.collection('products').doc(id).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting product:', error);
      return null;
    }
  },

  async updateProduct(id, data) {
    try {
      await db.collection('products').doc(id).update({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteProduct(id) {
    try {
      await db.collection('products').doc(id).delete();
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }
  },

  // -------------------- CATEGORIES --------------------
  async addCategory(data) {
    try {
      // Auto-generate slug if not provided
      if (!data.slug && data.name) {
        data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      const docRef = await db.collection('categories').add({
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding category:', error);
      return { success: false, error: error.message };
    }
  },

  async getCategories() {
    try {
      const snapshot = await db.collection('categories')
        .orderBy('name')
        .get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  },

  async getCategory(id) {
    try {
      const doc = await db.collection('categories').doc(id).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting category:', error);
      return null;
    }
  },

  async updateCategory(id, data) {
    try {
      await db.collection('categories').doc(id).update(data);
      return { success: true };
    } catch (error) {
      console.error('Error updating category:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteCategory(id) {
    try {
      await db.collection('categories').doc(id).delete();
      return { success: true };
    } catch (error) {
      console.error('Error deleting category:', error);
      return { success: false, error: error.message };
    }
  },

  // -------------------- TESTIMONIALS --------------------
  async addTestimonial(data) {
    try {
      const docRef = await db.collection('testimonials').add({
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding testimonial:', error);
      return { success: false, error: error.message };
    }
  },

  async getTestimonials() {
    try {
      const snapshot = await db.collection('testimonials')
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting testimonials:', error);
      return [];
    }
  },

  async getTestimonial(id) {
    try {
      const doc = await db.collection('testimonials').doc(id).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting testimonial:', error);
      return null;
    }
  },

  async updateTestimonial(id, data) {
    try {
      await db.collection('testimonials').doc(id).update(data);
      return { success: true };
    } catch (error) {
      console.error('Error updating testimonial:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteTestimonial(id) {
    try {
      await db.collection('testimonials').doc(id).delete();
      return { success: true };
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      return { success: false, error: error.message };
    }
  },

  // -------------------- SETTINGS (for SAS token) --------------------
  async getSetting(key) {
    try {
      const doc = await db.collection('settings').doc(key).get();
      if (doc.exists) {
        return doc.data().value;
      }
      return null;
    } catch (error) {
      console.error('Error getting setting:', error);
      return null;
    }
  },

  async setSetting(key, value) {
    try {
      await db.collection('settings').doc(key).set({ value });
      return { success: true };
    } catch (error) {
      console.error('Error setting value:', error);
      return { success: false, error: error.message };
    }
  }
};

// Firebase Auth helper functions (for Admin)
const FirebaseAuth = {
  async login(email, password) {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  },

  async logout() {
    try {
      await auth.signOut();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  getCurrentUser() {
    return auth.currentUser;
  },

  onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
  },

  isLoggedIn() {
    return !!auth.currentUser;
  },

  // Check if current user is an admin (checks 'users' collection for role: 'admin')
  async isAdmin() {
    const user = auth.currentUser;
    if (!user) return false;

    try {
      const doc = await db.collection('users').doc(user.uid).get();
      return doc.exists && doc.data().role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  // Admin login - verifies admin role after authentication
  async adminLogin(email, password) {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Check if user has admin role in 'users' collection
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (!userDoc.exists || userDoc.data().role !== 'admin') {
        // Not an admin, sign out
        await auth.signOut();
        return { success: false, error: 'Access denied. Admin privileges required.' };
      }

      return { success: true, user: user };
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: error.message };
    }
  }
};

// Customer Auth helper functions
const CustomerAuth = {
  // Register new customer
  async register(email, password, name = '') {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await db.collection('users').doc(user.uid).set({
        email: email,
        name: name,
        phone: '',
        company: '',
        role: 'customer',  // Default role for new registrations
        cart: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, user: user };
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      return { success: false, error: errorMessage };
    }
  },

  // Login customer
  async login(email, password) {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = error.message;
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      return { success: false, error: errorMessage };
    }
  },

  // Logout customer
  async logout() {
    try {
      await auth.signOut();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      await auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMessage = error.message;
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      return { success: false, error: errorMessage };
    }
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Check if user is logged in
  isLoggedIn() {
    return !!auth.currentUser;
  },

  // Listen for auth state changes
  onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
  },

  // Get user profile from Firestore
  async getUserProfile() {
    const user = auth.currentUser;
    if (!user) return null;

    console.log('Fetching profile for UID:', user.uid); // Debug

    try {
      // Force fetch from server, not cache
      const doc = await db.collection('users').doc(user.uid).get({ source: 'server' });
      console.log('Document exists:', doc.exists); // Debug
      if (doc.exists) {
        const data = doc.data();
        console.log('Raw Firestore data:', JSON.stringify(data)); // Debug log
        console.log('Role field:', data.role); // Debug role specifically
        return { uid: user.uid, email: user.email, ...data };
      }
      console.log('Document does not exist for UID:', user.uid);
      return { uid: user.uid, email: user.email };
    } catch (error) {
      console.error('Error getting user profile:', error);
      // If server fetch fails, try cache
      try {
        const cachedDoc = await db.collection('users').doc(user.uid).get();
        if (cachedDoc.exists) {
          return { uid: user.uid, email: user.email, ...cachedDoc.data() };
        }
      } catch (e) { }
      return { uid: user.uid, email: user.email };
    }
  },

  // Update user profile
  async updateProfile(data) {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'Not logged in' };

    try {
      // Use set with merge to handle case where document doesn't exist
      await db.collection('users').doc(user.uid).set({
        ...data,
        email: user.email, // Always include email
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user's cart from Firebase
  async getCart() {
    const user = auth.currentUser;
    if (!user) return [];

    try {
      const doc = await db.collection('users').doc(user.uid).get();
      if (doc.exists && doc.data().cart) {
        return doc.data().cart;
      }
      return [];
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  },

  // Save user's cart to Firebase
  async saveCart(cart) {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'Not logged in' };

    try {
      // Use set with merge to create document if it doesn't exist
      await db.collection('users').doc(user.uid).set({
        cart: cart,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Error saving cart:', error);
      return { success: false, error: error.message };
    }
  },

  // Merge localStorage cart with Firebase cart on login
  async mergeCartsOnLogin(localCart) {
    const user = auth.currentUser;
    if (!user) return localCart;

    try {
      const firebaseCart = await this.getCart();

      // Merge carts: combine and remove duplicates
      const mergedCart = [...firebaseCart];
      localCart.forEach(item => {
        if (!mergedCart.find(i => i.id === item.id)) {
          mergedCart.push(item);
        }
      });

      // Save merged cart to Firebase
      if (mergedCart.length > 0) {
        await this.saveCart(mergedCart);
      }

      return mergedCart;
    } catch (error) {
      console.error('Error merging carts:', error);
      return localCart;
    }
  }
};

console.log('Firebase initialized successfully');
