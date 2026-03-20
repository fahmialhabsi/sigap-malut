import("../models/komoditas.js")
  .then((m) => {
    console.log("module keys:", Object.keys(m));
    console.log("default type:", typeof m.default);
    console.log("default has create:", m.default && typeof m.default.create);
  })
  .catch((e) => {
    console.error("import error:", e);
    process.exit(1);
  });
