module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/frontend/scripts'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@components/(.*)$': '<rootDir>/frontend/scripts/components/$1',
    '^@services/(.*)$': '<rootDir>/frontend/scripts/services/$1',
    '^@utils/(.*)$': '<rootDir>/frontend/scripts/utils/$1',
    '^@hooks/(.*)$': '<rootDir>/frontend/scripts/hooks/$1',
    '^@store/(.*)$': '<rootDir>/frontend/scripts/store/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'frontend/scripts/**/*.{ts,tsx}',
    '!frontend/scripts/**/*.d.ts',
    '!frontend/scripts/**/*.test.{ts,tsx}',
    '!frontend/scripts/**/*.spec.{ts,tsx}',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
