const admin = require('firebase-admin');
const path = require('path');

// Path to service account key
const serviceAccount = require('./service-account.json');

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      console.log('✅ Firebase Admin already initialized');
      return admin.apps[0];
    }

    // Initialize the app
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      storageBucket: `${serviceAccount.project_id}.appspot.com`
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log('📁 Project ID:', serviceAccount.project_id);
    
    return app;
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    throw error;
  }
};

// Get Firestore instance
const getFirestore = () => {
  try {
    const app = initializeFirebaseAdmin();
    const db = admin.firestore(app);
    console.log('✅ Firestore instance created');
    return db;
  } catch (error) {
    console.error('❌ Failed to get Firestore instance:', error);
    throw error;
  }
};

// Get Auth instance
const getAuth = () => {
  try {
    const app = initializeFirebaseAdmin();
    const auth = admin.auth(app);
    console.log('✅ Firebase Auth instance created');
    return auth;
  } catch (error) {
    console.error('❌ Failed to get Auth instance:', error);
    throw error;
  }
};

// Test connection
const testConnection = async () => {
  try {
    const db = getFirestore();
    const auth = getAuth();
    
    console.log('✅ Firebase Admin connection test successful');
    return { db, auth };
  } catch (error) {
    console.error('❌ Firebase Admin connection test failed:', error);
    throw error;
  }
};

module.exports = {
  initializeFirebaseAdmin,
  getFirestore,
  getAuth,
  testConnection,
  admin
};
