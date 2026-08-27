const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 min cache

// Cache middleware
const cacheMiddleware = (key) => (req, res, next) => {
  const cacheKey = key + JSON.stringify(req.query);
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`⚡ Cache HIT: ${cacheKey}`);
    return res.json(cached);
  }
  // Save original json
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    cache.set(cacheKey, data);
    console.log(`💾 Cache SAVE: ${cacheKey}`);
    return originalJson(data);
  };
  next();
};

// Clear cache on write
const clearCache = (pattern) => {
  const keys = cache.keys();
  keys.forEach(k => {
    if (k.includes(pattern)) cache.del(k);
  });
  console.log(`🗑️ Cache cleared: ${pattern}`);
};

module.exports = { cache, cacheMiddleware, clearCache };