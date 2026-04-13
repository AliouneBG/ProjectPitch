const express = require('express');
const { z } = require('zod');
const { generateCoaching } = require('../services/llmService');
const { generateCacheKey, getCache, setCache } = require('../utils/cacheUtils');

const router = express.Router();

const coachSchema = z.object({
  weakness: z.object({
    area: z.string(),
    issueType: z.string(),
    message: z.string()
  }),
  context: z.object({
    targetRole: z.string().optional(),
    projectSummary: z.string().optional()
  }),
  mode: z.enum(['guide', 'example']).optional().default('guide')
});

router.post('/', async (req, res) => {
  try {
    const parsed = coachSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.format() });
    }

    const cacheKey = generateCacheKey('coach', 'v11', parsed.data);
    const cachedResult = getCache(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const { weakness, context, mode } = parsed.data;
    const suggestion = await generateCoaching(weakness, context, mode);
    
    const result = { suggestion };
    setCache(cacheKey, result);
    return res.json(result);
  } catch (error) {
    console.error('[ERROR] in /api/coach:', error.message);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

module.exports = router;
