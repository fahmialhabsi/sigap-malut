import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "too_many_requests" },
});

export default limiter;
