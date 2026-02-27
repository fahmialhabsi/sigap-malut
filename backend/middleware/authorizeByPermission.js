function authorize(permission) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    const permissions = user.permissions || [];
    if (permissions.includes(permission)) return next();
    return res.status(403).json({ message: "Forbidden" });
  };
}

module.exports = { authorize };
