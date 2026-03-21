export default {
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  testEnvironment: "node",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "mjs", "cjs"],
  roots: ["<rootDir>"],
  transformIgnorePatterns: ["/node_modules/"],
};
