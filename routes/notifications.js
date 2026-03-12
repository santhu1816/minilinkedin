const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

// GET /api/notifications/skill-matches — Find users with matching skills
router.get('/skill-matches', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;

    // Gather skills from the user's profile
    const userSkills = (currentUser.skills || []).map(s => s.toLowerCase());

    // Also gather skills from the user's posts
    const userPosts = await Post.find({ author: currentUser._id });
    const postSkills = userPosts.flatMap(p => p.detectedSkills || []).map(s => s.toLowerCase());

    // Combine and deduplicate
    const allMySkills = [...new Set([...userSkills, ...postSkills])];

    if (allMySkills.length === 0) {
      return res.json({ matches: [] });
    }

    // Find other users who have matching skills in their profile
    const usersWithMatchingSkills = await User.find({
      _id: { $ne: currentUser._id },
      skills: { $in: allMySkills.map(s => new RegExp(`^${s}$`, 'i')) },
    }).select('name headline profilePicture skills');

    // Find posts by other users that mention matching skills
    const postsWithMatchingSkills = await Post.find({
      author: { $ne: currentUser._id },
      detectedSkills: { $in: allMySkills },
    }).populate('author', 'name headline profilePicture');

    // Build notification matches
    const matchMap = new Map();

    usersWithMatchingSkills.forEach(user => {
      const sharedSkills = user.skills.filter(s =>
        allMySkills.includes(s.toLowerCase())
      );
      if (sharedSkills.length > 0) {
        const key = user._id.toString();
        if (!matchMap.has(key)) {
          matchMap.set(key, {
            user: {
              _id: user._id,
              name: user.name,
              headline: user.headline,
              profilePicture: user.profilePicture,
            },
            sharedSkills: new Set(sharedSkills.map(s => s.toLowerCase())),
          });
        }
      }
    });

    postsWithMatchingSkills.forEach(post => {
      const authorId = post.author._id.toString();
      const sharedSkills = post.detectedSkills.filter(s =>
        allMySkills.includes(s.toLowerCase())
      );

      if (sharedSkills.length > 0) {
        if (matchMap.has(authorId)) {
          sharedSkills.forEach(s => matchMap.get(authorId).sharedSkills.add(s.toLowerCase()));
        } else {
          matchMap.set(authorId, {
            user: {
              _id: post.author._id,
              name: post.author.name,
              headline: post.author.headline,
              profilePicture: post.author.profilePicture,
            },
            sharedSkills: new Set(sharedSkills.map(s => s.toLowerCase())),
          });
        }
      }
    });

    // Convert to array
    const matches = Array.from(matchMap.values()).map(m => ({
      user: m.user,
      sharedSkills: Array.from(m.sharedSkills),
    }));

    res.json({ matches });
  } catch (error) {
    console.error('Skill match error:', error);
    res.status(500).json({ error: 'Failed to find skill matches' });
  }
});

module.exports = router;
