export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.tests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@ionic/react$': '<rootDir>/src/tests/mocks/ionic-react-mock.tsx',
    '^swiper/react$': '<rootDir>/src/tests/mocks/swiper-mock.tsx',
    '^@ionic/react-router$': '<rootDir>/src/tests/mocks/ionic-react-router-mock.tsx',
    '^swiper\/css($|/.*)': 'identity-obj-proxy',
    '^swiper\/modules$': '<rootDir>/src/tests/mocks/swiper-modules-mock.ts',
    '.*\/config\/api$': '<rootDir>/src/tests/mocks/api-mock.ts',
    '.*hooks\/Context\/AuthContext\/AuthContext$': '<rootDir>/src/tests/mocks/auth-context-mock.js',
    '.*pages\/ReportsPanel\/ReportsPanel$': '<rootDir>/src/tests/mocks/ionic-react-mock.tsx'
  },
  modulePathIgnorePatterns: ['<rootDir>/src/tests/mocks/ignored_for_jest'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  }
  ,
  testPathIgnorePatterns: ["/node_modules/","/cypress/"]
};


