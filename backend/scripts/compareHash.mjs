import bcrypt from "bcrypt";
const hash = "$2b$10$vXkOtPhiKXtIdPMr76EthuRmKTzdkZuHaVz0MGK.gZmIUNE94k4fu";
(async () => {
  const ok = await bcrypt.compare("Admin123", hash);
  console.log("compare result:", ok);
})();
