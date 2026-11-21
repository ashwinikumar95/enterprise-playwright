import { expect, type Page } from '@playwright/test';
import { BasePage, fillSecretInput } from '@enterprise-playwright/core';

export class LoginPage extends BasePage {
  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
  }

  async open(): Promise<void> {
    await this.navigate('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.locator('#email').fill(email);
    await fillSecretInput(this.page.locator('#password'), password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  async loginAndExpectApp(email: string, password: string): Promise<void> {
    await this.login(email, password);
    await this.page.waitForURL(/\/items/, { timeout: 15_000 });
    await expect(this.page.getByTestId('app-shell')).toBeVisible();
  }

  async expectLoginFormVisible(): Promise<void> {
    await expect(this.page.getByTestId('login-form')).toBeVisible();
  }

  async expectLoginError(): Promise<void> {
    await expect(this.page.getByTestId('login-error')).toBeVisible();
  }
}
