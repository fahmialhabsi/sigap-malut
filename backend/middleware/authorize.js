export default function authorize(requiredPermission) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    // super_admin bypass
    if (user.roles && user.roles.includes('super_admin')) return next();

    if (!requiredPermission) return next();

    const perms = user.permissions || [];
    if (perms.includes(requiredPermission)) return next();

    return res.status(403).json({ success: false, message: 'Forbidden' });
  };
}
