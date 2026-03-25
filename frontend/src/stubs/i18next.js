// Stub i18next — dipakai saat package belum terinstall
// Setelah `npm install i18next` dijalankan, hapus alias di vite.config.js

let _resources = {};

const i18n = {
  use: () => i18n,
  init: (options = {}) => {
    if (options.resources) {
      _resources = options.resources;
    }
    return Promise.resolve(i18n);
  },
  t: (key) => {
    // Coba ambil dari resources id.translation
    const parts = key.split(".");
    let val = _resources?.id?.translation;
    for (const p of parts) {
      if (val && typeof val === "object") val = val[p];
      else return key;
    }
    return typeof val === "string" ? val : key;
  },
  language: "id",
  isInitialized: true,
  changeLanguage: () => Promise.resolve(),
  on: () => {},
  off: () => {},
};

export default i18n;
