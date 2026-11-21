import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AppConfig } from '@enterprise-playwright/shared-types';

const appRoot = path.dirname(fileURLToPath(import.meta.url));

export const appConfig: AppConfig = {
  productName: 'automation-demo-app',
  baseURL: process.env.BASE_URL || 'http://127.0.0.1:3000',
  defaultEnvironment: 'local',
  environments: [
    {
      id: 'local',
      dataDir: 'tests/data/local',
      hostMarkers: ['localhost', '127.0.0.1'],
      tagUserColumn: 'local_user',
      tagSuiteColumn: 'local',
    },
    {
      id: 'dev',
      dataDir: 'tests/data/dev',
      hostMarkers: ['dev.example'],
      tagUserColumn: 'dev_user',
      tagSuiteColumn: 'dev',
    },
    {
      id: 'qa',
      dataDir: 'tests/data/qa',
      hostMarkers: ['qa.example'],
      tagUserColumn: 'qa_user',
      tagSuiteColumn: 'qa',
    },
  ],
  users: [
    {
      id: 'user1',
      projectName: 'user1',
      tag: '@user1',
      workers: 1,
      storageStatePath: 'playwright/.auth/demo-user-a.json',
      loginOnly: false,
      setupFile: '**/auth.setup.user1.ts',
      emailEnvKeys: ['USER_1_EMAIL', 'TEST_USER_EMAIL'],
      passwordEnvKeys: ['USER_1_PASSWORD', 'TEST_USER_PASSWORD'],
    },
    {
      id: 'user2',
      projectName: 'user2',
      tag: '@user2',
      workers: 1,
      storageStatePath: 'playwright/.auth/demo-user-b.json',
      loginOnly: false,
      setupFile: '**/auth.setup.user2.ts',
      emailEnvKeys: ['USER_2_EMAIL', 'TEST_USER2_EMAIL'],
      passwordEnvKeys: ['USER_2_PASSWORD', 'TEST_USER2_PASSWORD'],
    },
    {
      id: 'login',
      projectName: 'login',
      tag: '@userLogin',
      workers: 1,
      storageStatePath: null,
      loginOnly: true,
    },
  ],
  auth: { defaultProvider: 'normal' },
  tags: {
    csvPath: 'tests/data/tags.csv',
    jsonPath: 'tests/data/tags.json',
    envColumnMap: { local: 'local', dev: 'dev', qa: 'qa' },
    regressionColumn: 'regression',
    userColumns: {
      local: 'local_user',
      dev: 'dev_user',
      qa: 'qa_user',
    },
    fallbackUserColumn: 'users',
  },
  ui: { packs: ['default'], defaultLayout: 'default' },
  execution: {
    local: { workers: 2, retries: 0 },
    ci: { workersFrom: 'CI_WORKERS', workersDefault: 2, retries: 2 },
  },
  artifacts: {
    trace: 'retain-on-first-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  reporting: {
    allure: {
      resultsDir: 'allure-results',
      reportDir: 'allure-report',
    },
  },
  appRoot,
  testDir: path.join(appRoot, 'tests'),
};
