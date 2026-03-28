/**
 * sanitize.js — Sanitasi input untuk mencegah XSS.
 * Menggunakan DOMPurify untuk membersihkan string dari HTML/script berbahaya.
 *
 * Import: import { sanitize, sanitizeObject } from '../utils/sanitize';
 */
import DOMPurify from "dompurify";

/**
 * Sanitasi satu string nilai input.
 * Menghapus semua tag HTML dan atribut berbahaya.
 */
export const sanitize = (value) => {
  if (typeof value !== "string") return value;
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
};

/**
 * Sanitasi seluruh objek form data secara rekursif.
 * Cocok untuk dipakai sebelum mengirim payload ke API.
 *
 * @param {Object} obj — form data
 * @returns {Object} — objek yang sudah disanitasi
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, sanitize(value)])
  );
};

export default sanitize;
