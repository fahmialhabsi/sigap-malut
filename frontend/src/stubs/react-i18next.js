// Stub react-i18next — dipakai saat package belum terinstall
// Setelah `npm install react-i18next` dijalankan, hapus alias di vite.config.js

import i18n from "./i18next.js";

export const useTranslation = (_ns) => ({
  t: (key, options) => {
    const translated = i18n.t(key);
    // Interpolasi sederhana: {{ name }} → options.name
    if (options && typeof translated === "string") {
      return translated.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) =>
        options[k] !== undefined ? options[k] : `{{${k}}}`
      );
    }
    return translated;
  },
  i18n,
  ready: true,
});

export const initReactI18next = {
  type: "3rdParty",
  init: () => {},
};

export const Trans = ({ children }) => children;

export default { useTranslation, initReactI18next, Trans };
