import type { Page } from '@playwright/test';
import type {
  AppAdapter,
  AuthCredentials,
  UserProjectDefinition,
} from '@enterprise-playwright/shared-types';
import { SelectorPackRegistry } from '@enterprise-playwright/core';
import { appConfig } from '../app.config.js';

function firstEnv(keys: string[] | undefined, fallback: string): string {
  for (const key of keys ?? []) {
    const value = process.env[key];
    if (value) return value;
  }
  return fallback;
}

export const selectorPacks = new SelectorPackRegistry();
selectorPacks.register({
  name: 'default',
  selectors: {
    sidebarItems: '[data-testid="nav-items"]',
    pageHeading: 'h1',
    toast: '[data-testid="toast"]',
    createItem: '[data-testid="create-item"]',
    itemName: '#item-name',
    itemDescription: '#item-description',
    saveItem: '[data-testid="save-item"]',
    itemsTable: '[data-testid="items-table"]',
    rowActions: '[data-testid="row-actions"]',
    actionEdit: '[data-testid="action-edit"]',
  },
});
selectorPacks.setDefault(appConfig.ui.defaultLayout);

const DEMO_DEFAULTS: Record<string, { email: string; password: string }> = {
  user1: { email: 'demo.user1@example.com', password: 'Password123!' },
  user2: { email: 'demo.user2@example.com', password: 'Password123!' },
};

export const demoAdapter: AppAdapter = {
  isAuthUrl(url: string): boolean {
    return /\/login(\?|$)/.test(url);
  },

  async waitForAppShell(page: Page, timeoutMs = 15_000): Promise<void> {
    await page.locator('[data-testid="app-shell"]').waitFor({
      state: 'visible',
      timeout: timeoutMs,
    });
  },

  resolveCredentials(user: UserProjectDefinition): AuthCredentials {
    const defaults = DEMO_DEFAULTS[user.id] ?? {
      email: '',
      password: '',
    };
    const email = firstEnv(user.emailEnvKeys, defaults.email);
    const password = firstEnv(user.passwordEnvKeys, defaults.password);
    if (!email || !password) {
      throw new Error(
        `Missing credentials for user ${user.id}. Set env vars or demo defaults.`,
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
  const credentials = demoAdapter.resolveCredentials(user);
  if (!credentials.email || !credentials.password) {
    throw new Error(`Credentials missing for ${userId}`);
  }
  return user;
}
