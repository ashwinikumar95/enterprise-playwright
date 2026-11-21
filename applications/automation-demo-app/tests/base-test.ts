import { createBaseTest } from '@enterprise-playwright/core';
import { appConfig } from '../app.config.js';
import { demoAdapter } from '../adapter/index.js';

export const test = createBaseTest(appConfig, demoAdapter);
export { expect } from '@playwright/test';
