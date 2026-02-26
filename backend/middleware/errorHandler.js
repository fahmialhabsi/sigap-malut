function errorHandler(err, req, res, next) {
  if (!err) return next();
  console.error(err);
  if (err.message === "not_found")
    return res.status(404).json({ error: "not_found" });
  if (err.message === "invalid_transition")
    return res.status(400).json({ error: "invalid_transition" });
  if (err.name === "SequelizeValidationError")
    return res.status(400).json({ error: err.errors.map((e) => e.message) });
  return res.status(500).json({ error: "internal_server_error" });
}

module.exports = errorHandler;
