import type { Page } from '@playwright/test';
import type { AuthCredentials, AuthProvider } from '@enterprise-playwright/shared-types';
import { AuthManager, fillSecretInput } from '@enterprise-playwright/core';
import { supportDeskSelectors } from './selectors.js';

/**
 * Support Desk UI login. Uses `/signin/` and the `Log in` control — not the React
 * demo's `/login` / `Sign in` flow. Register with AuthManager as provider `"normal"`
 * so it satisfies AuthConfig.provider without changing shared-types.
 */
export class SupportDeskAuthProvider implements AuthProvider {
  readonly name = 'normal';

  /**
   * Performs form login and validates outcome.
   * Post-login shell readiness is still enforced by AppAdapter.waitForAppShell
   * via AuthManager.authenticate.
   */
  async login(page: Page, credentials: AuthCredentials): Promise<void> {
    const baseUrl = credentials.baseUrl.replace(/\/$/, '');
    await page.goto(`${baseUrl}/signin/`);

    await page.locator(supportDeskSelectors.username).fill(credentials.email);
    await fillSecretInput(
      page.locator(supportDeskSelectors.password),
      credentials.password,
    );
    await page.getByRole('button', { name: 'Log in' }).click();

    const deskShell = page.locator(supportDeskSelectors.deskShell);
    const loginError = page.getByRole('alert');

    // Wait for either authenticated shell or a visible login error — no fixed sleep.
    await deskShell.or(loginError).first().waitFor({ state: 'visible' });

    if (await loginError.isVisible()) {
      const message =
        (await loginError.textContent())?.trim() || 'Invalid username or password.';
      throw new Error(`Support Desk authentication failed: ${message}`);
    }

    await deskShell.waitFor({ state: 'visible' });
  }
}

/** AuthManager wired with the Support Desk provider (overrides core NormalAuthProvider). */
export function createSupportDeskAuthManager(): AuthManager {
  return new AuthManager([new SupportDeskAuthProvider()]);
}
