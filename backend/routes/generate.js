const express = require('express');
const { z } = require('zod');
const { buildPrompt } = require('../services/promptBuilder');
const { generatePitch } = require('../services/llmService');
const { generateCacheKey, getCache, setCache } = require('../utils/cacheUtils');

const router = express.Router();

const pitchFormSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  projectSummary: z.string().min(1, 'Project summary is required'),
  projectDescription: z.string().min(10, 'Full project description is required (min 10 chars)'),
  techStack: z.string().min(1, 'Tech stack is required'),
  keyFeatures: z.string().min(1, 'Key features are required'),
  technicalChallenge: z.string().min(1, 'Technical challenge is required'),
  targetRole: z.string().optional(),
  targetCompanyType: z.string().optional(),
});

router.post('/', async (req, res) => {
  try {
    // 1. Validation
    const parsed = pitchFormSchema.safeParse(req.body);
    if (!parsed.success) {
      console.error('Validation Error for /api/generate');
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.format() });
    }

    // 2. Check Cache
    const cacheKey = generateCacheKey('generate', 'v8', parsed.data);
    const cachedResult = getCache(cacheKey);
    if (cachedResult) {
      console.log(`[LOG] Serving generated pitch from cache for: ${parsed.data.projectName}`);
      return res.json(cachedResult);
    }

    console.log(`[LOG] Received generate request for project: ${parsed.data.projectName}`);

    // 3. Build Prompt
    const prompt = buildPrompt(parsed.data);

    // 4. Call LLM Service
    const result = await generatePitch(prompt);

    // 5. Cache and Return
    setCache(cacheKey, result);
    console.log(`[LOG] Successfully generated pitch for: ${parsed.data.projectName}`);
    return res.json(result);
  } catch (error) {
    console.error('[ERROR] in /api/generate:', error.message);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

module.exports = router;
