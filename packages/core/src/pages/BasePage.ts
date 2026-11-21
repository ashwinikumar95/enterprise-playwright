import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Minimal browser-focused page base. Application workflows belong in app page objects.
 */
export abstract class BasePage {
  constructor(
    protected readonly page: Page,
    protected readonly baseUrl: string = '',
  ) {}

  async navigate(path = '/'): Promise<void> {
    const url = path.startsWith('http')
      ? path
      : `${this.baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
    await this.page.goto(url);
    await this.waitForPageStable();
  }

  async waitForPageStable(timeout = 15_000): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout });
  }

  async expectPageHeading(expected: string | RegExp): Promise<void> {
    const heading = this.page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    if (typeof expected === 'string') {
      await expect(heading).toHaveText(expected);
    } else {
      await expect(heading).toHaveText(expected);
    }
  }

  async expectToast(text: string | RegExp): Promise<void> {
    const toast = this.page.locator('[data-testid="toast"], .toast').filter({
      hasText: text,
    });
    await expect(toast.first()).toBeVisible({ timeout: 10_000 });
  }

  locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  getCurrentUrl(): string {
    return this.page.url();
  }
}
