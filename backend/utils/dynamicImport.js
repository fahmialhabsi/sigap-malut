import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllerCache = new Map();

export async function getController(code, models) {
  const safe = String(code).replace(/[^a-zA-Z0-9_-]/g, '');
  if (controllerCache.has(safe)) return controllerCache.get(safe);
  const modulePath = path.join(__dirname, '..', 'controllers', `${safe}Controller.js`);
  // use import() with file URL
  const mod = await import(modulePath);
  let ctrl = mod.default ?? mod;
  if (typeof ctrl === 'function') ctrl = ctrl(models);
  controllerCache.set(safe, ctrl);
  return ctrl;
}
