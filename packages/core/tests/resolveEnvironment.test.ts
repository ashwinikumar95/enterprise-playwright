import { describe, expect, it } from 'vitest';
import type { AppConfig } from '@enterprise-playwright/shared-types';
import { resolveEnvironment } from '../src/config/resolveEnvironment.js';
import { ConfigValidationError } from '../src/config/validateAppConfig.js';

const config: AppConfig = {
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
    {
      id: 'dev',
      dataDir: 'data/dev',
      hostMarkers: ['dev.example'],
      tagUserColumn: 'dev_user',
      tagSuiteColumn: 'dev',
    },
    {
      id: 'qa',
      dataDir: 'data/qa',
      hostMarkers: ['qa.example'],
      tagUserColumn: 'qa_user',
      tagSuiteColumn: 'qa',
    },
  ],
  users: [],
  auth: { defaultProvider: 'normal' },
  tags: {
    csvPath: 'tests/data/tags.csv',
    jsonPath: 'tests/data/tags.json',
    envColumnMap: { local: 'local', dev: 'dev', qa: 'qa' },
    regressionColumn: 'regression',
    userColumns: { local: 'local_user', dev: 'dev_user', qa: 'qa_user' },
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
  appRoot: '.',
  testDir: 'tests',
};

describe('resolveEnvironment', () => {
  it('uses explicit env and fails loud on unknown', () => {
    expect(resolveEnvironment(config, { explicitEnv: 'qa' }).id).toBe('qa');
    expect(() => resolveEnvironment(config, { explicitEnv: 'prod' })).toThrow(
      ConfigValidationError,
    );
  });

  it('derives from host markers', () => {
    expect(
      resolveEnvironment(config, {
        explicitEnv: '',
        baseURL: 'https://dev.example.com',
      }).id,
    ).toBe('dev');
  });

  it('falls back to default', () => {
    expect(
      resolveEnvironment(config, {
        explicitEnv: '',
        baseURL: 'https://unknown.example.com',
        dataPath: '',
      }).id,
    ).toBe('local');
  });
});
