import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|scss|sass)$": "identity-obj-proxy",
    "\\.(png|jpg|jpeg|gif|svg|webp)$": "<rootDir>/src/__mocks__/fileMock.ts",
  },
  testMatch: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/layout.tsx",
    "!src/middleware.ts",
    "!src/lib/stripe.ts",
    "!src/lib/supabase/**",
  ],
};

export default config;
