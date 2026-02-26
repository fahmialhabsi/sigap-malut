// Mock export untuk test error handling & security
export function validateInput({ username, password }) {
  if (!username || !password) throw new Error("Invalid input");
  return true;
}

export function generateJWT({ id, role }) {
  // Simulasi token
  return `mock-token-${id}-${role}`;
}

export function checkRBAC(token, role) {
  // Simulasi RBAC
  return token.includes(role);
}
import jwt from "jsonwebtoken";

// @desc    Protect routes - require authentication
// @usage   Add as middleware: router.use(protect)
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (format: "Bearer TOKEN")
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request (untuk digunakan di controller)
      req.user = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        unit_kerja: decoded.unit_kerja,
        nama_lengkap: decoded.nama_lengkap,
      };

      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token kadaluarsa, silakan login kembali",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Token tidak valid",
      });
    }
  }

  // No token provided
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak, tidak ada token autentikasi",
    });
  }
};

// @desc    Optional authentication (for public routes that can show different data for authenticated users)
export const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        unit_kerja: decoded.unit_kerja,
        nama_lengkap: decoded.nama_lengkap,
      };
    } catch (error) {
      // Token invalid tapi tidak block request
      console.log("Optional auth failed, continuing as guest");
    }
  }

  next();
};

// @desc    Generate JWT token
// @usage   const token = generateToken(user)
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      unit_kerja: user.unit_kerja,
      nama_lengkap: user.nama_lengkap,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};

// @desc    Verify refresh token
export const verifyRefreshToken = (refreshToken) => {
  try {
    return jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    );
  } catch (error) {
    return null;
  }
};

// @desc    Generate refresh token
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    },
  );
};
