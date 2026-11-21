import { describe, expect, it } from 'vitest';
import type { AppConfig } from '@enterprise-playwright/shared-types';
import { ConfigValidationError, validateAppConfig } from '../src/config/validateAppConfig.js';

function baseConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    productName: 'demo',
    baseURL: 'http://localhost:3000',
    defaultEnvironment: 'local',
    environments: [
      {
        id: 'local',
        dataDir: 'data/local',
        hostMarkers: ['localhost'],
        tagUserColumn: 'local_user',
        tagSuiteColumn: 'local',
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
      envColumnMap: { local: 'local' },
      regressionColumn: 'regression',
      userColumns: { local: 'local_user' },
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
      allure: { resultsDir: 'allure-results', reportDir: 'allure-report' },
    },
    appRoot: '/tmp/app',
    testDir: '/tmp/app/tests',
    ...overrides,
  };
}

describe('validateAppConfig', () => {
  it('accepts a valid config', () => {
    expect(() => validateAppConfig(baseConfig())).not.toThrow();
  });

  it('rejects unknown default environment', () => {
    expect(() =>
      validateAppConfig(baseConfig({ defaultEnvironment: 'qa' })),
    ).toThrow(ConfigValidationError);
  });

  it('rejects duplicate storage paths', () => {
    const config = baseConfig({
      users: [
        {
          id: 'user1',
          projectName: 'user1',
          tag: '@user1',
          workers: 1,
          storageStatePath: 'playwright/.auth/same.json',
          loginOnly: false,
          setupFile: '**/auth.setup.user1.ts',
        },
        {
          id: 'user2',
          projectName: 'user2',
          tag: '@user2',
          workers: 1,
          storageStatePath: 'playwright/.auth/same.json',
          loginOnly: false,
          setupFile: '**/auth.setup.user2.ts',
        },
      ],
    });
    expect(() => validateAppConfig(config)).toThrow(/unique/);
  });
});
