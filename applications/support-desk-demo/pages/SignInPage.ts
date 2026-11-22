import { expect, type Page } from '@playwright/test';
import { BasePage, fillSecretInput } from '@enterprise-playwright/core';
import { selectorPacks } from '../adapter/index.js';

export class SignInPage extends BasePage {
  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
  }

  private sel(key: string): string {
    return selectorPacks.pick(key);
  }

  async open(): Promise<void> {
    await this.navigate('/signin/');
  }

  async fillCredentials(username: string, password: string): Promise<void> {
    await this.page.locator(this.sel('username')).fill(username);
    await fillSecretInput(this.page.locator(this.sel('password')), password);
  }

  async submit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Log in' }).click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillCredentials(username, password);
    await this.submit();
  }

  async loginAndExpectSuccess(username: string, password: string): Promise<void> {
    await this.login(username, password);
    await this.expectSuccessfulLogin();
  }

  async expectSuccessfulLogin(): Promise<void> {
    await this.page.waitForURL(/\/tickets(\/|\?|$)/);
    await expect(this.page.locator(this.sel('deskShell'))).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'Tickets' })).toBeVisible();
  }

  async expectLoginError(message?: string | RegExp): Promise<void> {
    const alert = this.page.getByRole('alert');
    await expect(alert).toBeVisible();
    if (message !== undefined) {
      await expect(alert).toHaveText(message);
    } else {
      await expect(alert).toContainText(/invalid username or password/i);
    }
  }

  async expectSignInFormVisible(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Support Desk' })).toBeVisible();
    await expect(this.page.locator(this.sel('username'))).toBeVisible();
    await expect(this.page.locator(this.sel('password'))).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Log in' })).toBeVisible();
  }
}
