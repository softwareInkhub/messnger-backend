const { getAuth, getFirestore } = require('../firebase-cient/client');
const admin = require('firebase-admin');

// Prepare user registration (without creating user yet)
exports.registerUser = async (req, res) => {
  const { phoneNumber, username, password } = req.body;
  const auth = getAuth();

  try {
    if (!phoneNumber || !username || !password) {
      return res.status(400).json({ error: 'Phone number, username, and password are required' });
    }

    // Check if Firebase is available
    if (!auth) {
      return res.status(503).json({ error: 'Authentication service temporarily unavailable' });
    }

    // Format phone number
    let formattedPhone = phoneNumber;
    if (phoneNumber.length === 10 && !phoneNumber.startsWith('+')) {
      formattedPhone = `+91${phoneNumber}`;
    } else if (!phoneNumber.startsWith('+')) {
      formattedPhone = `+${phoneNumber}`;
    }

    console.log(`📝 Validating registration data: ${username} with phone: ${formattedPhone}`);

    // Check if user already exists
    try {
      const existingUser = await auth.getUserByPhoneNumber(formattedPhone);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this phone number already exists' });
      }
    } catch (error) {
      // User doesn't exist, which is what we want
    }

    // Validate data but DON'T create user yet
    console.log(`✅ Registration data validated successfully`);

    res.status(200).json({
      message: 'Registration data validated. Please verify your phone number with OTP.',
      data: {
        phoneNumber: formattedPhone,
        username: username,
        // Don't send password back for security
      }
    });

  } catch (error) {
    console.error('Register user validation error:', error);
    
    if (error.code === 'auth/phone-number-already-exists') {
      res.status(400).json({ error: 'Phone number already registered' });
    } else if (error.code === 'auth/invalid-phone-number') {
      res.status(400).json({ error: 'Invalid phone number format' });
    } else {
      res.status(500).json({ error: error.message || 'Failed to validate registration data' });
    }
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { phoneNumber, password } = req.body;
  const auth = getAuth();
  const db = getFirestore();

  try {
    if (!phoneNumber || !password) {
      return res.status(400).json({ error: 'Phone number and password are required' });
    }

    // Check if Firebase is available
    if (!auth || !db) {
      return res.status(503).json({ error: 'Authentication service temporarily unavailable' });
    }

    // Format phone number
    let formattedPhone = phoneNumber;
    if (phoneNumber.length === 10 && !phoneNumber.startsWith('+')) {
      formattedPhone = `+91${phoneNumber}`;
    } else if (!phoneNumber.startsWith('+')) {
      formattedPhone = `+${phoneNumber}`;
    }

    console.log(`🔐 Attempting login for: ${formattedPhone}`);

    // Get user by phone number
    const userRecord = await auth.getUserByPhoneNumber(formattedPhone);
    
    if (!userRecord) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User data not found' });
    }

    const userData = userDoc.data();

    // Check if phone is verified
    if (!userData.isPhoneVerified) {
      return res.status(400).json({ 
        error: 'Phone number not verified. Please verify your phone number first.' 
      });
    }

    console.log(`✅ Login successful for: ${userData.username}`);

    res.status(200).json({
      message: 'Login successful',
      user: {
        uid: userRecord.uid,
        username: userData.username,
        phoneNumber: userData.phoneNumber,
        isPhoneVerified: userData.isPhoneVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error.code === 'auth/user-not-found') {
      res.status(404).json({ error: 'User not found' });
    } else if (error.code === 'auth/invalid-phone-number') {
      res.status(400).json({ error: 'Invalid phone number format' });
    } else {
      res.status(500).json({ error: error.message || 'Login failed' });
    }
  }
};

// Verify OTP and CREATE user only after successful verification
exports.verifyOTP = async (req, res) => {
  const { phoneNumber, username, password } = req.body;
  const auth = getAuth();
  const db = getFirestore();

  try {
    // Check if Firebase is available
    if (!auth || !db) {
      return res.status(503).json({ error: 'Authentication service temporarily unavailable' });
    }

    // Get the ID token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid ID token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the ID token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    console.log(`🔐 Verifying ID token for user: ${decodedToken.uid}`);

    // Format phone number
    let formattedPhone = phoneNumber;
    if (phoneNumber.length === 10 && !phoneNumber.startsWith('+')) {
      formattedPhone = `+91${phoneNumber}`;
    } else if (!phoneNumber.startsWith('+')) {
      formattedPhone = `+${phoneNumber}`;
    }

    // Check if user already exists (double-check)
    try {
      const existingUser = await auth.getUserByPhoneNumber(formattedPhone);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this phone number already exists' });
      }
    } catch (error) {
      // User doesn't exist, which is what we want
    }

    // Verify that the ID token phone number matches
    if (decodedToken.phone_number !== formattedPhone) {
      return res.status(403).json({ error: 'ID token phone number does not match' });
    }

    console.log(`✅ OTP verified successfully. Creating user: ${username}`);

    // CREATE USER ONLY AFTER SUCCESSFUL OTP VERIFICATION
    const userRecord = await auth.createUser({
      phoneNumber: formattedPhone,
      displayName: username,
      password: password,
      phoneNumberVerified: true // Already verified by OTP
    });

    // Store user data in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      username: username,
      phoneNumber: formattedPhone,
      email: null,
      isPhoneVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ User created successfully after OTP verification: ${userRecord.uid}`);

    res.status(201).json({
      message: 'Phone number verified and user created successfully',
      user: {
        uid: userRecord.uid,
        username: username,
        phoneNumber: formattedPhone,
        isPhoneVerified: true
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      res.status(401).json({ error: 'ID token has expired' });
    } else if (error.code === 'auth/id-token-revoked') {
      res.status(401).json({ error: 'ID token has been revoked' });
    } else if (error.code === 'auth/invalid-id-token') {
      res.status(401).json({ error: 'Invalid ID token' });
    } else if (error.code === 'auth/phone-number-already-exists') {
      res.status(400).json({ error: 'Phone number already registered' });
    } else {
      res.status(500).json({ error: error.message || 'Failed to verify OTP and create user' });
    }
  }
};