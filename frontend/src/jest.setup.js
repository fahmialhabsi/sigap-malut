// jest.setup.js
// Catch unhandled promise rejections to avoid worker crashes during tests
process.on("unhandledRejection", (reason) => {
  // Log but do not throw to prevent Jest worker exit
  // Tests should still assert expected failures explicitly
  // eslint-disable-next-line no-console
  console.warn("Jest unhandledRejection:", reason);
});
