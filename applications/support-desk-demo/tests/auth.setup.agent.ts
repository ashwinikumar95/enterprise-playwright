import fs from 'node:fs';
import path from 'node:path';
import { test as setup, expect } from '@playwright/test';
import { appConfig } from '../app.config.js';
import {
  createSupportDeskAuthManager,
  requireAuthenticatedUser,
  supportDeskAdapter,
  supportDeskSelectors,
} from '../adapter/index.js';

/** Must match `SESSION_KEY` in web/src/auth.ts — verified in saved storage state. */
const SUPPORT_DESK_SESSION_KEY = 'support-desk-session';

setup('authenticate agent', async ({ page }) => {
  const user = requireAuthenticatedUser('agent');
  const credentials = supportDeskAdapter.resolveCredentials(user);
  const storageStatePath = path.isAbsolute(user.storageStatePath!)
    ? user.storageStatePath!
    : path.join(appConfig.appRoot, user.storageStatePath!);

  const manager = createSupportDeskAuthManager();
  const result = await manager.authenticate(
    page,
    {
      provider: 'normal',
      credentials,
      storageStatePath,
    },
    supportDeskAdapter,
  );

  if (!result.success) {
    throw new Error(`Support Desk authentication failed: ${result.error}`);
  }

  await expect(page.locator(supportDeskSelectors.deskShell)).toBeVisible();
  await expect(page).toHaveURL(/\/tickets(\/|\?|$)/);

  if (!fs.existsSync(storageStatePath)) {
    throw new Error(`Storage state was not written to ${storageStatePath}`);
  }

  const raw = fs.readFileSync(storageStatePath, 'utf8');
  const state = JSON.parse(raw) as {
    origins?: Array<{ localStorage?: Array<{ name: string; value: string }> }>;
  };
  const hasSession = (state.origins ?? []).some((origin) =>
    (origin.localStorage ?? []).some((entry) => entry.name === SUPPORT_DESK_SESSION_KEY),
  );
  if (!hasSession) {
    throw new Error(
      `Saved storage state at ${storageStatePath} is missing localStorage key "${SUPPORT_DESK_SESSION_KEY}"`,
    );
  }
});
