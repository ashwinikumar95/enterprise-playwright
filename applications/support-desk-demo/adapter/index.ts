import type { Page } from '@playwright/test';
import type {
  AppAdapter,
  AuthCredentials,
  UserProjectDefinition,
} from '@enterprise-playwright/shared-types';
import { SelectorPackRegistry } from '@enterprise-playwright/core';
import { appConfig } from '../app.config.js';
import { supportDeskSelectors } from './selectors.js';

export { supportDeskSelectors } from './selectors.js';
export type { SupportDeskSelectorKey } from './selectors.js';
export {
  SupportDeskAuthProvider,
  createSupportDeskAuthManager,
} from './authProvider.js';

function firstEnv(keys: string[] | undefined, fallback: string): string {
  for (const key of keys ?? []) {
    const value = process.env[key];
    if (value) return value;
  }
  return fallback;
}

/** Demo defaults aligned with web/src/auth.ts DEMO_USERS and app.config agent keys. */
const SUPPORT_DESK_DEFAULTS: Record<string, { email: string; password: string }> = {
  agent: { email: 'agent@example.com', password: 'Password123!' },
};

export const selectorPacks = new SelectorPackRegistry();
selectorPacks.register({
  name: 'default',
  selectors: { ...supportDeskSelectors },
});
selectorPacks.setDefault(appConfig.ui.defaultLayout);

export const supportDeskAdapter: AppAdapter = {
  isAuthUrl(url: string): boolean {
    return /\/signin(\/|\?|$)/.test(url);
  },

  async waitForAppShell(page: Page, timeoutMs = 15_000): Promise<void> {
    await page.locator(supportDeskSelectors.deskShell).waitFor({
      state: 'visible',
      timeout: timeoutMs,
    });
  },

  resolveCredentials(user: UserProjectDefinition): AuthCredentials {
    const defaults = SUPPORT_DESK_DEFAULTS[user.id] ?? {
      email: '',
      password: '',
    };
    const email = firstEnv(user.emailEnvKeys, defaults.email);
    const password = firstEnv(user.passwordEnvKeys, defaults.password);
    if (!email || !password) {
      throw new Error(
        `Missing credentials for user ${user.id}. Set env vars or Support Desk defaults.`,
      );
    }
    return {
      email,
      password,
      userId: user.id,
      baseUrl: appConfig.baseURL,
    };
  },
};

export function requireAuthenticatedUser(userId: string): UserProjectDefinition {
  const user = appConfig.users.find((u) => u.id === userId);
  if (!user || user.loginOnly) {
    throw new Error(`Authenticated user ${userId} not found in app config`);
  }
  const credentials = supportDeskAdapter.resolveCredentials(user);
  if (!credentials.email || !credentials.password) {
    throw new Error(`Credentials missing for ${userId}`);
  }
  return user;
}
