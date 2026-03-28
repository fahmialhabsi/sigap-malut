/**
 * notify.js — Wrapper notifikasi berbasis react-hot-toast.
 * Menggantikan window.alert() dan window.confirm() di seluruh aplikasi.
 *
 * Import: import { notifySuccess, notifyError, notifyInfo, notifyWarning } from '../utils/notify';
 */
import toast from "react-hot-toast";

export const notifySuccess = (message) =>
  toast.success(message, {
    duration: 3500,
    style: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
  });

export const notifyError = (message) =>
  toast.error(message || "Terjadi kesalahan", {
    duration: 5000,
    style: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" },
  });

export const notifyInfo = (message) =>
  toast(message, {
    duration: 3000,
    icon: "ℹ️",
    style: { background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" },
  });

export const notifyWarning = (message) =>
  toast(message, {
    duration: 4000,
    icon: "⚠️",
    style: { background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" },
  });

export default toast;
