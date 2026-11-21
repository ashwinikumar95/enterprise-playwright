import path from 'node:path';
import fs from 'node:fs';
import type { PlaywrightTestConfig, Project } from '@playwright/test';
import { devices } from '@playwright/test';
import type { AppAdapter, AppConfig } from '@enterprise-playwright/shared-types';
import { validateAppConfig } from './validateAppConfig.js';
import { resolveEnvironment } from './resolveEnvironment.js';

function isCi(): boolean {
  return !!process.env.CI;
}

function resolveWorkers(config: AppConfig): number {
  if (isCi()) {
    const fromEnv = process.env[config.execution.ci.workersFrom];
    if (fromEnv && Number.parseInt(fromEnv, 10) > 0) {
      return Number.parseInt(fromEnv, 10);
    }
    return config.execution.ci.workersDefault;
  }
  return config.execution.local.workers;
}

function resolveRetries(config: AppConfig): number {
  return isCi() ? config.execution.ci.retries : config.execution.local.retries;
}

function ensureAuthDirs(config: AppConfig): void {
  for (const user of config.users) {
    if (user.storageStatePath) {
      const full = path.isAbsolute(user.storageStatePath)
        ? user.storageStatePath
        : path.join(config.appRoot, user.storageStatePath);
      fs.mkdirSync(path.dirname(full), { recursive: true });
    }
  }
}

function tagGrep(tag: string): RegExp {
  const body = tag.startsWith('@') ? tag.slice(1) : tag;
  return new RegExp(`@${body}(?!\\d)`);
}

export function buildPlaywrightConfig(
  config: AppConfig,
  _adapter: AppAdapter,
): PlaywrightTestConfig {
  validateAppConfig(config);
  const env = resolveEnvironment(config);
  ensureAuthDirs(config);

  const resultsDir = path.isAbsolute(config.reporting.allure.resultsDir)
    ? config.reporting.allure.resultsDir
    : path.join(config.appRoot, config.reporting.allure.resultsDir);
  fs.mkdirSync(resultsDir, { recursive: true });

  const projects: Project[] = [];

  for (const user of config.users) {
    if (user.loginOnly) {
      projects.push({
        name: user.projectName,
        testDir: config.testDir,
        testMatch: '**/*.spec.ts',
        testIgnore: ['**/auth.setup.*.ts'],
        grep: tagGrep(user.tag),
        workers: user.workers,
        use: {
          ...devices['Desktop Chrome'],
          storageState: undefined,
          baseURL: config.baseURL,
        },
      });
      continue;
    }

    const setupName = `setup-${user.projectName}`;
    const storageFull = path.isAbsolute(user.storageStatePath!)
      ? user.storageStatePath!
      : path.join(config.appRoot, user.storageStatePath!);

    projects.push({
      name: setupName,
      testDir: config.testDir,
      testMatch: user.setupFile!,
      use: {
        ...devices['Desktop Chrome'],
        storageState: undefined,
        baseURL: config.baseURL,
      },
    });

    projects.push({
      name: user.projectName,
      testDir: config.testDir,
      testMatch: '**/*.spec.ts',
      testIgnore: ['**/auth.setup.*.ts'],
      grep: tagGrep(user.tag),
      workers: user.workers,
      dependencies: [setupName],
      use: {
        ...devices['Desktop Chrome'],
        storageState: storageFull,
        baseURL: config.baseURL,
      },
    });
  }

  return {
    testDir: config.testDir,
    fullyParallel: true,
    forbidOnly: isCi(),
    retries: resolveRetries(config),
    workers: resolveWorkers(config),
    timeout: 120_000,
    expect: { timeout: 15_000 },
    reporter: [
      [
        'allure-playwright',
        {
          resultsDir,
          // Avoid mirroring Playwright action titles that may include typed secrets.
          detail: false,
          suiteTitle: true,
          environmentInfo: {
            application: config.productName,
            environment: env.id,
            baseURL: config.baseURL,
          },
        },
      ],
    ],
    use: {
      baseURL: config.baseURL,
      trace: config.artifacts.trace,
      screenshot: config.artifacts.screenshot,
      video: config.artifacts.video,
      actionTimeout: 30_000,
      navigationTimeout: 30_000,
      ignoreHTTPSErrors: true,
    },
    projects,
    outputDir: path.join(config.appRoot, 'test-results'),
  };
}
