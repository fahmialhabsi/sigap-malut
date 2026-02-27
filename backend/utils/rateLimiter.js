function rateLimiter({ windowMs = 60_000, max = 100 } = {}) {
  const store = new Map();
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const entry = store.get(key) || { count: 0, start: now };
    if (now - entry.start > windowMs) {
      entry.count = 0;
      entry.start = now;
    }
    entry.count += 1;
    store.set(key, entry);
    if (entry.count > max)
      return res.status(429).json({ message: "Too many requests" });
    next();
  };
}

module.exports = rateLimiter;
