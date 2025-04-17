export default {
    testEnvironment: "jsdom",
    moduleNameMapper: {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy",
      "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/src/__mocks__/fileMock.js"
    },
    setupFilesAfterEnv: [
      "<rootDir>/jest.setup.js"
    ],
    transform: {
      "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
    },
    testMatch: [
      "**/__tests__/**/*.js?(x)",
      "**/?(*.)+(spec|test).js?(x)"
    ],
    collectCoverageFrom: [
      "src/**/*.{js,jsx}",
      "!src/index.js",
      "!src/reportWebVitals.js"
    ],
    coveragePathIgnorePatterns: [
      "/node_modules/",
      "/__tests__/",
      "/dist/"
    ]
  };