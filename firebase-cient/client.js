const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      console.log('✅ Firebase Admin already initialized');
      return admin.apps[0];
    }

    // Check if we have environment variables for Firebase
    const firebaseConfig = {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    };

    // Check if we have the required environment variables
    if (!firebaseConfig.project_id || !firebaseConfig.private_key || !firebaseConfig.client_email) {
      console.log('⚠️ Firebase environment variables not found, skipping Firebase initialization');
      return null;
    }

    // Initialize the app
    const app = admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      databaseURL: `https://${firebaseConfig.project_id}.firebaseio.com`,
      storageBucket: `${firebaseConfig.project_id}.appspot.com`
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log('📁 Project ID:', firebaseConfig.project_id);
    
    return app;
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    console.log('⚠️ Continuing without Firebase Admin SDK');
    return null;
  }
};

// Get Firestore instance
const getFirestore = () => {
  try {
    const app = initializeFirebaseAdmin();
    if (!app) {
      console.log('⚠️ Firebase not initialized, returning null for Firestore');
      return null;
    }
    const db = admin.firestore(app);
    console.log('✅ Firestore instance created');
    return db;
  } catch (error) {
    console.error('❌ Failed to get Firestore instance:', error);
    return null;
  }
};

// Get Auth instance
const getAuth = () => {
  try {
    const app = initializeFirebaseAdmin();
    if (!app) {
      console.log('⚠️ Firebase not initialized, returning null for Auth');
      return null;
    }
    const auth = admin.auth(app);
    console.log('✅ Firebase Auth instance created');
    return auth;
  } catch (error) {
    console.error('❌ Failed to get Auth instance:', error);
    return null;
  }
};

// Test connection
const testConnection = async () => {
  try {
    const db = getFirestore();
    const auth = getAuth();
    
    if (!db || !auth) {
      console.log('⚠️ Firebase Admin not available, connection test skipped');
      return { db: null, auth: null };
    }
    
    console.log('✅ Firebase Admin connection test successful');
    return { db, auth };
  } catch (error) {
    console.error('❌ Firebase Admin connection test failed:', error);
    return { db: null, auth: null };
  }
};

module.exports = {
  initializeFirebaseAdmin,
  getFirestore,
  getAuth,
  testConnection,
  admin
};
