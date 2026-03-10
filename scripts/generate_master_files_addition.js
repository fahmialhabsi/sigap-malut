// after fs.writeFileSync(modulesSekretariatOut, JSON.stringify(sekretariatModules, null, 2), "utf8");
// also write a copy to repo root master-data so backend can serve it directly
fs.writeFileSync(
  path.join(repoRoot, "master-data", "modules-sekretariat.json"),
  JSON.stringify(sekretariatModules, null, 2),
  "utf8",
);
