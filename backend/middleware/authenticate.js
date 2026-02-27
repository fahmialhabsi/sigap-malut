import jwt from "jsonwebtoken";

export default function authenticate(req, res, next) {
  const auth = req.headers && req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res
      .status(401)
      .json({ success: false, message: "Missing Authorization header" });

  const token = auth.slice("Bearer ".length).trim();
  const secret = process.env.JWT_SECRET || "dev-secret";
  try {
    const payload = jwt.verify(token, secret);
    // payload expected to contain: id, roles, permissions
    req.user = {
      id: payload.id,
      roles:
        payload.roles || payload.role
          ? Array.isArray(payload.roles)
            ? payload.roles
            : [payload.role]
          : [],
      permissions: payload.permissions || payload.perms || [],
      raw: payload,
    };
    return next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid token", error: err.message });
  }
}
