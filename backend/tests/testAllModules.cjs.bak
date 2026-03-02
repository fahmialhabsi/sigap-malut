const Mocha = require("mocha");
const path = require("path");
const fs = require("fs");

const testDir = __dirname;
const mocha = new Mocha({
  timeout: 60000,
  reporter: "spec",
});

// Cari semua file .test.js di folder tests
fs.readdirSync(testDir)
  .filter((file) => file.endsWith(".test.js"))
  .forEach((file) => {
    mocha.addFile(path.join(testDir, file));
  });

mocha.run((failures) => {
  process.exitCode = failures ? 1 : 0;
});
