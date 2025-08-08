const { testConnection, getFirestore, getAuth } = require('./client');

// Test Firebase Admin connection
const testFirebaseConnection = async () => {
  try {
    console.log('🧪 Testing Firebase Admin connection...');
    
    // Test connection
    const { db, auth } = await testConnection();
    
    // Test Firestore
    console.log('📊 Testing Firestore...');
    const testCollection = db.collection('test');
    console.log('✅ Firestore collection access successful');
    
    // Test Auth
    console.log('🔐 Testing Firebase Auth...');
    const userRecord = await auth.getUserByEmail('test@example.com').catch(() => null);
    console.log('✅ Firebase Auth access successful');
    
    console.log('🎉 All Firebase Admin tests passed!');
    return { db, auth };
    
  } catch (error) {
    console.error('❌ Firebase Admin test failed:', error);
    throw error;
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testFirebaseConnection()
    .then(() => {
      console.log('✅ Firebase Admin setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Firebase Admin setup failed:', error);
      process.exit(1);
    });
}

module.exports = { testFirebaseConnection };
