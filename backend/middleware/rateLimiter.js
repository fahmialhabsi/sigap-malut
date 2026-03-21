const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "too_many_requests" },
});

module.exports = limiter;
