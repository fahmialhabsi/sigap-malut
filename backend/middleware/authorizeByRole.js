import { requireRole } from "./rbacMiddleware.js";

export default function authorizeByRole(...roleNames) {
  return requireRole(...roleNames);
}
