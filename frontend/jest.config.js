export default {
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json"],
  roots: ["<rootDir>"],
  setupFiles: ["<rootDir>/src/jest.setup.js"],
  setupFilesAfterEnv: ["<rootDir>/setupTests.js", "@testing-library/jest-dom"],
};
