export default function pinConfirmationMiddleware(options = {}) {
  const {
    required = false,
    envKey = "CRITICAL_ACTION_PIN",
    bodyKey = "pin",
  } = options;

  return function pinCheck(req, res, next) {
    const expected = process.env?.[envKey] || "123456"; // MVP default
    const provided = String(req.body?.[bodyKey] || "");

    if (!required) return next();

    if (!provided) {
      return res.status(400).json({
        success: false,
        message: "PIN wajib untuk aksi ini",
      });
    }

    if (provided !== String(expected)) {
      return res.status(403).json({
        success: false,
        message: "PIN salah",
      });
    }

    return next();
  };
}

