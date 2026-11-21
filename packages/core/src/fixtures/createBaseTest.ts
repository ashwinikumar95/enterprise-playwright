import { test as base } from '@playwright/test';
import type { AppAdapter, AppConfig } from '@enterprise-playwright/shared-types';

export type FrameworkFixtures = {
  appConfig: AppConfig;
  appAdapter: AppAdapter;
};

/**
 * Minimal fixture factory. Apps extend or re-export as needed.
 */
export function createBaseTest(config: AppConfig, adapter: AppAdapter) {
  return base.extend<FrameworkFixtures>({
    appConfig: async ({}, use) => {
      await use(config);
    },
    appAdapter: async ({}, use) => {
      await use(adapter);
    },
  });
}
