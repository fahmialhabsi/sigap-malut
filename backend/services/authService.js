const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../../config/config.json");

function signAccessToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.accessTokenExpiry || "15m",
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, config.refreshTokenSecret || config.jwtSecret, {
    expiresIn: config.refreshTokenExpiry || "7d",
  });
}

function verifyToken(token, isRefresh) {
  const secret = isRefresh
    ? config.refreshTokenSecret || config.jwtSecret
    : config.jwtSecret;
  return jwt.verify(token, secret);
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  hashPassword,
  comparePassword,
};
