const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const { upload } = require('../config/cloudinary');

// GET /api/users/me — Get current user's profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('connections', 'name headline profilePicture');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/users/me — Update own profile
router.put('/me', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    const updates = {};
    const { name, headline, bio, skills, experience, education } = req.body;

    if (name) updates.name = name;
    if (headline !== undefined) updates.headline = headline;
    if (bio !== undefined) updates.bio = bio;
    if (skills) {
      updates.skills = typeof skills === 'string' ? JSON.parse(skills) : skills;
    }
    if (experience) {
      updates.experience = typeof experience === 'string' ? JSON.parse(experience) : experience;
    }
    if (education) {
      updates.education = typeof education === 'string' ? JSON.parse(education) : education;
    }
    if (req.file) {
      updates.profilePicture = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/users/:id — View another user's profile
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-firebaseUid')
      .populate('connections', 'name headline profilePicture');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /api/users — List/search users
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { skills: { $regex: search, $options: 'i' } },
          { headline: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const users = await User.find(query)
      .select('name headline profilePicture skills')
      .limit(20);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search users' });
  }
});

module.exports = router;
