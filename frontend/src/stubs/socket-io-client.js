// Stub socket.io-client — dipakai saat package belum terinstall
// App tidak akan crash, tapi koneksi WebSocket tidak aktif
// Setelah `npm install socket.io-client` dijalankan, hapus alias di vite.config.js

const noop = () => {};

export const io = (_url, _options) => ({
  on: noop,
  off: noop,
  emit: noop,
  disconnect: noop,
  connect: noop,
  close: noop,
  connected: false,
  disconnected: true,
  id: null,
});

export default { io };
