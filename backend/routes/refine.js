const express = require('express');
const { z } = require('zod');
const { refineText } = require('../services/llmService');
const { generateCacheKey, getCache, setCache } = require('../utils/cacheUtils');

const router = express.Router();

const refineSchema = z.object({
  sectionText: z.string().min(1, 'Section text is required'),
  instruction: z.string().min(1, 'Instruction is required'),
  sectionType: z.string().min(1, 'Section type is required'),
  context: z.object({
    targetRole: z.string().optional(),
    targetCompanyType: z.string().optional(),
    projectSummary: z.string().optional()
  }).optional()
});

router.post('/', async (req, res) => {
  try {
    const parsed = refineSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.format() });
    }

    const cacheKey = generateCacheKey('refine', 'v6', parsed.data);
    const cachedResult = getCache(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const { sectionText, instruction, sectionType, context } = parsed.data;
    const refinedText = await refineText(sectionText, instruction, sectionType, context || {});
    
    const result = { refinedText };
    setCache(cacheKey, result);
    return res.json(result);
  } catch (error) {
    console.error('[ERROR] in /api/refine:', error.message);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

module.exports = router;
