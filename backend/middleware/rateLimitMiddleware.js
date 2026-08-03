class MemoryStore {
  constructor() {
    this.hits = new Map();
  }

  incr(key, windowMs) {
    const now = Date.now();
    const record = this.hits.get(key);

    if (!record || now > record.resetTime) {
      const resetTime = now + windowMs;
      this.hits.set(key, { count: 1, resetTime });
      return { count: 1, resetTime };
    }

    record.count += 1;
    this.hits.set(key, record);
    return record;
  }
}

const store = new MemoryStore();

const createRateLimiter = ({ windowMs, max, message }) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress || "127.0.0.1";
    const key = `${req.baseUrl || ""}${req.path}_${ip}`;
    const record = store.incr(key, windowMs);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - record.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        msg: message || "Too many requests. Please try again later."
      });
    }

    next();
  };
};

const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Too many requests from this IP. Please try again in 15 minutes."
});

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts. Please try again in 15 minutes."
});

const commentLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Comment frequency limit reached. Please wait before posting more comments."
});

const interactionLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Like/Follow frequency limit reached. Please slow down."
});

module.exports = {
  apiLimiter,
  authLimiter,
  commentLimiter,
  interactionLimiter
};
