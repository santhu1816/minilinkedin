const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const { upload } = require('../config/cloudinary');

// Common tech skills list for detection
const SKILL_KEYWORDS = [
  'javascript', 'python', 'java', 'react', 'node.js', 'nodejs', 'angular', 'vue',
  'typescript', 'html', 'css', 'mongodb', 'sql', 'postgresql', 'mysql', 'redis',
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'github', 'linux',
  'c++', 'c#', 'rust', 'go', 'golang', 'swift', 'kotlin', 'flutter', 'dart',
  'machine learning', 'deep learning', 'ai', 'artificial intelligence', 'data science',
  'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn',
  'express', 'django', 'flask', 'spring', 'laravel', 'php', 'ruby', 'rails',
  'next.js', 'nextjs', 'nuxt', 'svelte', 'tailwind', 'bootstrap', 'sass',
  'graphql', 'rest', 'api', 'microservices', 'devops', 'ci/cd',
  'firebase', 'supabase', 'figma', 'photoshop', 'illustrator', 'ui/ux',
  'blockchain', 'solidity', 'web3', 'ethereum', 'cybersecurity', 'cloud computing',
  'agile', 'scrum', 'jira', 'project management',
];

// Detect skills from text
function detectSkills(text) {
  const lower = text.toLowerCase();
  return SKILL_KEYWORDS.filter(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(lower);
  });
}

// POST /api/posts — Create a new post
router.post('/', authMiddleware, (req, res, next) => {
  console.log('📥 POST /api/posts - Starting upload...');
  next();
}, upload.single('image'), async (req, res) => {
  try {
    const { caption } = req.body;
    console.log('📝 Post caption:', caption);
    console.log('🖼️ Post file:', req.file ? req.file.path : 'No image');

    if (!caption || !caption.trim()) {
      return res.status(400).json({ error: 'Caption is required' });
    }

    const detectedSkills = detectSkills(caption);
    console.log('🔍 Detected skills:', detectedSkills);

    const post = new Post({
      author: req.user._id,
      caption: caption.trim(),
      image: req.file ? req.file.path : '',
      detectedSkills,
    });

    await post.save();
    await post.populate('author', 'name headline profilePicture');

    res.status(201).json({ post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// GET /api/posts — Get all posts (public feed)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name headline profilePicture')
      .populate('comments.user', 'name profilePicture');

    const total = await Post.countDocuments();

    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// PUT /api/posts/:id/like — Toggle like
router.put('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userId = req.user._id;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json({ likes: post.likes, liked: likeIndex === -1 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// POST /api/posts/:id/comment — Add a comment
router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.comments.push({
      user: req.user._id,
      text: text.trim(),
    });

    await post.save();
    await post.populate('comments.user', 'name profilePicture');

    res.json({ comments: post.comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

module.exports = router;
