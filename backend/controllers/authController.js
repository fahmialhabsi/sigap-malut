import bcrypt from "bcrypt";
import { signAccess, signRefresh, verifyRefresh } from "../utils/jwt.js";

// Controller implemented as ESM named exports. These handlers use models from `req.app.get('models')` to avoid coupling.

export async function login(req, res, next) {
  try {
    const { username, password, email } = req.body;
    const { User } = (req.app && req.app.get && req.app.get("models")) || {};
    if (!User) return res.status(500).json({ error: "models not initialized" });

    const where = username ? { username } : { email };
    const user = await User.findOne({ where });
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(
      password,
      user.password || user.password_hash || "",
    );
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const claims = { sub: user.id, role: user.role, bidang: user.bidang };
    const access = signAccess(claims);
    const refresh = signRefresh({ sub: user.id });
    return res.json({
      access,
      refresh,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res) {
  try {
    const { token } = req.body;
    const payload = verifyRefresh(token);
    const { User } = (req.app && req.app.get && req.app.get("models")) || {};
    const user = await User.findByPk(payload.sub);
    if (!user) return res.status(401).json({ error: "invalid refresh token" });
    const access = signAccess({
      sub: user.id,
      role: user.role,
      bidang: user.bidang,
    });
    return res.json({ access });
  } catch (err) {
    return res.status(401).json({ error: "invalid token" });
  }
}

export async function register(req, res) {
  try {
    const { User } = (req.app && req.app.get && req.app.get("models")) || {};
    if (!User) return res.status(500).json({ error: "models not initialized" });
    const { username, email, password, role } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: "missing fields" });
    const exists = await User.findOne({
      where: { [Symbol.for("or")]: [{ username }, { email }] },
    }).catch(() => null);
    // fallback simple check
    if (exists) return res.status(400).json({ error: "user exists" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashed,
      role: role || "pelaksana",
    });
    const access = signAccess({ sub: user.id, role: user.role });
    const refresh = signRefresh({ sub: user.id });
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token: access,
        refreshToken: refresh,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getMe(req, res) {
  if (!req.user)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  res.json({ success: true, data: req.user });
}

export async function logout(req, res) {
  // For stateless JWT, client should delete tokens; server-side blacklist not implemented here
  res.json({ success: true, message: "Logged out" });
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const { User } = (req.app && req.app.get && req.app.get("models")) || {};
    if (!req.user || !User) return res.status(401).json({ success: false });
    const user = await User.findByPk(req.user.id);
    const ok = await bcrypt.compare(
      currentPassword,
      user.password || user.password_hash || "",
    );
    if (!ok)
      return res
        .status(400)
        .json({ success: false, message: "Current password incorrect" });
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    res.json({ success: true, message: "Password changed" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAllUsers(req, res) {
  try {
    const { User } = (req.app && req.app.get && req.app.get("models")) || {};
    if (!User) return res.status(500).json({ success: false });
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createUser(req, res) {
  try {
    const { User } = (req.app && req.app.get && req.app.get("models")) || {};
    if (!User) return res.status(500).json({ success: false });
    const payload = req.body;
    if (payload.password)
      payload.password = await bcrypt.hash(payload.password, 10);
    const user = await User.create(payload);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateUser(req, res) {
  try {
    const { User } = (req.app && req.app.get && req.app.get("models")) || {};
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false });
    Object.assign(user, req.body);
    if (req.body.password)
      user.password = await bcrypt.hash(req.body.password, 10);
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const { User } = (req.app && req.app.get && req.app.get("models")) || {};
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false });
    await user.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
