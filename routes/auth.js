const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const User = require('../models/User');

// POST /api/auth/sync — Create or find user in MongoDB after Firebase auth
router.post('/sync', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    const { uid, email } = decodedToken;
    const { name } = req.body;

    // Check if user already exists
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Create new user
      user = new User({
        firebaseUid: uid,
        email: email,
        name: name || email.split('@')[0],
      });
      await user.save();
      console.log(`✅ New user created: ${user.name}`);
    }

    res.json({ user });
  } catch (error) {
    console.error('Auth sync error:', error.message);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

module.exports = router;
