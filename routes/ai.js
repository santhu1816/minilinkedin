const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const authMiddleware = require('../middleware/auth');

let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

// POST /api/ai/enhance-bio — Enhance a user's bio
router.post('/enhance-bio', authMiddleware, async (req, res) => {
  try {
    const { bio } = req.body;
    console.log('🤖 AI Bio Enhance request for:', bio);
    if (!bio || !bio.trim()) {
      return res.status(400).json({ error: 'Bio text is required' });
    }

    if (!groq) {
      // Mock response if API key is not configured
      return res.json({ enhancedBio: `(AI Enhanced Mock) ${bio} - Add GROQ_API_KEY to .env for real AI!` });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional LinkedIn profile writer. Enhance the given bio to make it more professional, engaging, and compelling. Keep it concise (2-3 sentences max). Maintain the original meaning and key information. Return ONLY the enhanced bio text, nothing else.',
        },
        {
          role: 'user',
          content: `Please enhance this LinkedIn bio:\n\n"${bio}"`,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 256,
    });

    const enhancedBio = chatCompletion.choices[0]?.message?.content?.trim() || bio;
    res.json({ enhancedBio });
  } catch (error) {
    console.error('AI bio enhance error:', error);
    res.status(500).json({ error: 'Failed to enhance bio' });
  }
});

// POST /api/ai/enhance-caption — Enhance a post caption
router.post('/enhance-caption', authMiddleware, async (req, res) => {
  try {
    const { caption } = req.body;
    if (!caption || !caption.trim()) {
      return res.status(400).json({ error: 'Caption text is required' });
    }

    if (!groq) {
      // Mock response if API key is not configured
      return res.json({ enhancedCaption: `(AI Enhanced Mock) ${caption} #LinkedIn #Mock - Add GROQ_API_KEY to .env for real AI!` });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a social media expert specializing in LinkedIn posts. Enhance the given post caption to make it more engaging, professional, and impactful. Add relevant hashtags at the end. Keep the tone professional but approachable. Return ONLY the enhanced caption text, nothing else.',
        },
        {
          role: 'user',
          content: `Please enhance this LinkedIn post caption:\n\n"${caption}"`,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 512,
    });

    const enhancedCaption = chatCompletion.choices[0]?.message?.content?.trim() || caption;
    res.json({ enhancedCaption });
  } catch (error) {
    console.error('AI caption enhance error:', error);
    res.status(500).json({ error: 'Failed to enhance caption' });
  }
});

module.exports = router;
