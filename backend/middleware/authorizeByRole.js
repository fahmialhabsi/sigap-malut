export default function authorizeByRole(...roleNames) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!roleNames.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Role diperlukan: ${roleNames.join(", ")}`,
      });
    }
    next();
  };
}
