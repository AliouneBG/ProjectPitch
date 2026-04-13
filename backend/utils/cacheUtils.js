const crypto = require('crypto');

const memoryCache = new Map();

function normalizeInput(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => normalizeInput(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sortedKeys = Object.keys(obj).sort();
    const result = {};
    for (const key of sortedKeys) {
      let val = obj[key];
      if (typeof val === 'string') {
        val = val.trim().replace(/\s+/g, ' ');
        if (['targetRole', 'targetCompanyType', 'issueType', 'sectionType'].includes(key)) {
          val = val.toLowerCase();
        }
      } else {
        val = normalizeInput(val);
      }
      result[key] = val;
    }
    return result;
  }
  
  if (typeof obj === 'string') {
    return obj.trim().replace(/\s+/g, ' ');
  }
  
  return obj;
}

function generateCacheKey(endpointType, promptVersion, payload) {
  const normalized = normalizeInput(payload);
  const jsonString = JSON.stringify(normalized);
  const hash = crypto.createHash('sha256').update(jsonString).digest('hex');
  return `${endpointType}:${promptVersion}:${hash}`;
}

function getCache(key) {
  if (memoryCache.has(key)) {
    console.log(`[CACHE HIT] Key: ${key}`);
    return memoryCache.get(key);
  }
  console.log(`[CACHE MISS] Key: ${key}`);
  return null;
}

function setCache(key, value) {
  if (value) {
    memoryCache.set(key, value);
    console.log(`[CACHE SET] Key: ${key}`);
  }
}

module.exports = {
  generateCacheKey,
  getCache,
  setCache,
  normalizeInput
};
