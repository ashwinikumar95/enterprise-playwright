import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateAppConfig } from '@enterprise-playwright/core';
import type { AppConfig } from '@enterprise-playwright/shared-types';

const appRoot = path.dirname(fileURLToPath(import.meta.url));

export const appConfig: AppConfig = {
  productName: 'support-desk-demo',
  baseURL: process.env.BASE_URL || 'http://127.0.0.1:3100',
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
      id: 'agent',
      projectName: 'agent',
      tag: '@agent',
      workers: 1,
      storageStatePath: 'playwright/.auth/support-desk-agent.json',
      loginOnly: false,
      setupFile: '**/auth.setup.agent.ts',
      emailEnvKeys: ['AGENT_EMAIL', 'SUPPORT_DESK_AGENT_EMAIL'],
      passwordEnvKeys: ['AGENT_PASSWORD', 'SUPPORT_DESK_AGENT_PASSWORD'],
    },
    {
      id: 'login',
      projectName: 'login',
      tag: '@login',
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

validateAppConfig(appConfig);
