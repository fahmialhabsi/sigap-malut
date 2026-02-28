import bcrypt from "bcrypt";
import { signAccess, signRefresh, verifyRefresh } from "../utils/jwt.js";

function getModels(req) {
  return (req.app && req.app.get && req.app.get("models")) || {};
}

export async function login(req, res, next) {
  try {
    const { username, password, email } = req.body;
    const { User } = getModels(req);
    if (!User) return res.status(500).json({ error: "models not initialized" });

    const where = username ? { username } : { email };
    // Prefer ORM lookup; assume DB schema now matches models
    const user = await User.findOne({ where }).catch(() => null);
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const stored = user.password || user.password_hash || "";
    const ok = await bcrypt.compare(password, stored);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const normalizedRole = user.role || user.role_id || null;
    const normalizedUnit = user.unit_kerja || user.unit_id || null;

    const claims = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: normalizedRole,
      unit_kerja: normalizedUnit,
      nama_lengkap: user.nama_lengkap,
    };

    const access = signAccess(claims);
    const refresh = signRefresh({ id: user.id });

    return res.json({
      access,
      refresh,
      redirect: "/dashboard",
      user: {
        id: user.id,
        username: user.username,
        role: normalizedRole,
        unit_kerja: normalizedUnit,
        nama_lengkap: user.nama_lengkap,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res) {
  try {
    const { token } = req.body;
    const payload = verifyRefresh(token);
    const { User } = getModels(req);
    const userId = payload.sub || payload.id;
    const user = await User.findByPk(userId).catch(() => null);
    if (!user) return res.status(401).json({ error: "invalid refresh token" });
    const normalizedRole = user.role || user.role_id || null;
    const normalizedUnit = user.unit_kerja || user.unit_id || null;
    const access = signAccess({
      id: user.id,
      username: user.username,
      email: user.email,
      role: normalizedRole,
      unit_kerja: normalizedUnit,
      nama_lengkap: user.nama_lengkap,
    });
    return res.json({ access });
  } catch (err) {
    return res.status(401).json({ error: "invalid token" });
  }
}

export async function register(req, res, next) {
  try {
    const { User } = getModels(req);
    if (!User) return res.status(500).json({ error: "models not initialized" });
    const { username, email, password, role } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: "missing fields" });
    const exists = await User.findOne({ where: { username } }).catch(
      () => null,
    );
    if (exists) return res.status(400).json({ error: "user exists" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashed,
      role: role || "pelaksana",
    });
    const normalizedRole = user.role || user.role_id || null;
    const normalizedUnit = user.unit_kerja || user.unit_id || null;
    const claims = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: normalizedRole,
      unit_kerja: normalizedUnit,
      nama_lengkap: user.nama_lengkap,
    };
    const access = signAccess(claims);
    const refresh = signRefresh({ id: user.id });
    return res.status(201).json({
      success: true,
      access,
      refresh,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: normalizedRole,
      },
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: normalizedRole,
        },
        token: access,
        refreshToken: refresh,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res) {
  if (!req.user)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  res.json({ success: true, data: req.user });
}

export async function logout(req, res) {
  res.json({ success: true, message: "Logged out" });
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const { User } = getModels(req);
    if (!req.user || !User) return res.status(401).json({ success: false });
    const user = await User.findByPk(req.user.id).catch(() => null);
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
    next(err);
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const { User } = getModels(req);
    if (!User) return res.status(500).json({ success: false });
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const { User } = getModels(req);
    if (!User) return res.status(500).json({ success: false });
    const payload = req.body;
    if (payload.password)
      payload.password = await bcrypt.hash(payload.password, 10);
    const user = await User.create(payload);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { User } = getModels(req);
    const user = await User.findByPk(req.params.id).catch(() => null);
    if (!user) return res.status(404).json({ success: false });
    Object.assign(user, req.body);
    if (req.body.password)
      user.password = await bcrypt.hash(req.body.password, 10);
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { User } = getModels(req);
    const user = await User.findByPk(req.params.id).catch(() => null);
    if (!user) return res.status(404).json({ success: false });
    await user.destroy();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export default null;
