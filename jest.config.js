export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  transform: {},
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  transformIgnorePatterns: ["/node_modules/", "<rootDir>/backend/tests/"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node", "mjs"],
  moduleNameMapper: {},
  testMatch: ["**/*.spec.mjs", "**/*.test.mjs", "**/*.spec.ts", "**/*.test.ts"],
};
