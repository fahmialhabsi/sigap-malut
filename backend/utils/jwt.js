import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "change_this_secret_in_production";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "change_refresh_secret";

export function signAccess(payload, opts = {}) {
  return jwt.sign(payload, SECRET, Object.assign({ expiresIn: "15m" }, opts));
}

export function signRefresh(payload, opts = {}) {
  return jwt.sign(
    payload,
    REFRESH_SECRET,
    Object.assign({ expiresIn: "7d" }, opts),
  );
}

export function verifyAccess(token) {
  return jwt.verify(token, SECRET);
}

export function verifyRefresh(token) {
  return jwt.verify(token, REFRESH_SECRET);
}
