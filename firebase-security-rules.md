# Firebase Security Rules - Sagar Bags

## IMPORTANT: Apply These Rules in Firebase Console

These security rules should be applied in your Firebase Console to protect your database.

Go to: Firebase Console > Firestore Database > Rules

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
    }

    // Products collection - Public read, Admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Categories collection - Public read, Admin write
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Inquiries collection - Anyone can create, only Admin can read
    match /inquiries/{inquiryId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    // Quote requests - Anyone can create, only Admin can read
    match /quote_requests/{requestId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    // Newsletter subscriptions - Anyone can create
    match /newsletter/{subscriptionId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    // Testimonials - Public read, Admin write
    match /testimonials/{testimonialId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Gallery/Projects - Public read, Admin write
    match /gallery/{itemId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Admin users - Only admin can access
    match /admins/{adminId} {
      allow read, write: if isAdmin();
    }

    // User sessions - Anonymous access for cart
    match /sessions/{sessionId} {
      allow read, write: if true; // Consider adding rate limiting
    }

    // Active carts - Anyone can create/update their cart
    match /active_carts/{cartId} {
      allow read, write: if true;
    }

    // Site settings - Public read, Admin write
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Authentication Settings

### Enable These Auth Methods in Firebase Console:
1. Email/Password (for Admin access)
2. Optionally: Google Sign-in (for customers)

### Domain Restrictions:
Add authorized domains in Firebase Console > Authentication > Settings > Authorized domains:
- `sagarbags.com`
- `www.sagarbags.com`
- `localhost` (for development only - remove in production)

---

## API Key Restrictions

In Google Cloud Console > APIs & Services > Credentials:

1. Select your Firebase API Key
2. Add Application restrictions:
   - HTTP referrers (websites)
   - Add: `*.sagarbags.com/*`
3. Add API restrictions:
   - Restrict to these APIs only:
     - Cloud Firestore API
     - Firebase Authentication API
     - Firebase Installations API

---

## Rate Limiting

Consider implementing Cloud Functions for rate limiting on:
- Contact form submissions
- Quote requests
- Newsletter signups

Example Cloud Function:
```javascript
exports.rateLimit = functions.firestore
  .document('inquiries/{docId}')
  .onCreate(async (snap, context) => {
    const ip = snap.data().ip;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentSubmissions = await admin.firestore()
      .collection('inquiries')
      .where('ip', '==', ip)
      .where('createdAt', '>', oneHourAgo)
      .get();

    if (recentSubmissions.size > 5) {
      // Delete the document or flag for review
      await snap.ref.delete();
      throw new Error('Rate limit exceeded');
    }
  });
```

---

## Monitoring

Enable these in Firebase Console:
1. App Check (to prevent abuse)
2. Cloud Logging (to monitor access)
3. Usage alerts (to detect unusual activity)

---

## Checklist

- [ ] Apply Firestore security rules
- [ ] Enable required authentication methods
- [ ] Set up authorized domains
- [ ] Configure API key restrictions
- [ ] Enable App Check
- [ ] Set up monitoring and alerts
- [ ] Remove localhost from authorized domains before production
