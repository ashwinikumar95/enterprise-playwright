import path from 'node:path';
import { test as setup, expect } from '@playwright/test';
import { AuthManager } from '@enterprise-playwright/core';
import { appConfig } from '../app.config.js';
import { demoAdapter, requireAuthenticatedUser } from '../adapter/index.js';

setup('authenticate user1', async ({ page }) => {
  const user = requireAuthenticatedUser('user1');
  const credentials = demoAdapter.resolveCredentials(user);
  const storageStatePath = path.isAbsolute(user.storageStatePath!)
    ? user.storageStatePath!
    : path.join(appConfig.appRoot, user.storageStatePath!);

  const manager = new AuthManager();
  const result = await manager.authenticate(
    page,
    {
      provider: 'normal',
      credentials,
      storageStatePath,
    },
    demoAdapter,
  );

  if (!result.success) {
    throw new Error(`Authentication failed: ${result.error}`);
  }
  await expect(page.getByTestId('app-shell')).toBeVisible();
});
