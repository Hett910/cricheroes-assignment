export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.mjs$": "babel-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!supertest)"],
};
