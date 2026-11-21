import type { Locator, Page } from '@playwright/test';
import type { AuthCredentials, AuthProvider } from '@enterprise-playwright/shared-types';

export interface NormalLoginSelectors {
  email: string;
  password: string;
  submit: string;
}

const DEFAULT_SELECTORS: NormalLoginSelectors = {
  email: '#email',
  password: '#password',
  submit: 'button[type="submit"]',
};

/**
 * Fills a password field without recording the secret in Playwright action titles
 * (which Allure/traces would otherwise surface as `Fill "<secret>"`).
 */
export async function fillSecretInput(locator: Locator, value: string): Promise<void> {
  await locator.waitFor({ state: 'visible' });
  await locator.evaluate((el, secret) => {
    const input = el as HTMLInputElement;
    const descriptor = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    );
    descriptor?.set?.call(input, secret);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

/**
 * Real UI username/password login. Selectors are injectable so each app can adapt.
 */
export class NormalAuthProvider implements AuthProvider {
  readonly name = 'normal';

  constructor(private readonly selectors: NormalLoginSelectors = DEFAULT_SELECTORS) {}

  /**
   * Performs form login only. Post-login readiness is the app adapter's job
   * via `AppAdapter.waitForAppShell` (called by AuthManager.authenticate).
   */
  async login(page: Page, credentials: AuthCredentials): Promise<void> {
    await page.goto(`${credentials.baseUrl.replace(/\/$/, '')}/login`);
    await page.locator(this.selectors.email).fill(credentials.email);
    await fillSecretInput(page.locator(this.selectors.password), credentials.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
  }
}
