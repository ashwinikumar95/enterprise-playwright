import { expect, type Page } from '@playwright/test';
import { BasePage } from '@enterprise-playwright/core';
import { selectorPacks } from '../adapter/index.js';

export class ItemsPage extends BasePage {
  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
  }

  private sel(key: string): string {
    return selectorPacks.pick(key);
  }

  async openViaSidebar(): Promise<void> {
    await this.page.locator(this.sel('sidebarItems')).click();
    await this.waitForPageStable();
  }

  async expectItemsScreen(): Promise<void> {
    await expect(this.page).toHaveURL(/\/items/);
    await this.expectPageHeading('Items');
  }

  async clickCreateItem(): Promise<void> {
    await this.page.locator(this.sel('createItem')).click();
  }

  async fillItemForm(name: string, description: string): Promise<void> {
    await this.page.locator(this.sel('itemName')).fill(name);
    await this.page.locator(this.sel('itemDescription')).fill(description);
  }

  async saveItem(): Promise<void> {
    await this.page.locator(this.sel('saveItem')).click();
  }

  async expectSuccessToast(text: string | RegExp): Promise<void> {
    await this.expectToast(text);
  }

  rowByName(name: string) {
    return this.page.locator(`${this.sel('itemsTable')} tbody tr`).filter({
      has: this.page.locator('td', { hasText: name }),
    });
  }

  async expectRow(name: string, status: string): Promise<void> {
    const row = this.rowByName(name);
    await expect(row).toBeVisible();
    await expect(row.locator('td').nth(2)).toHaveText(status);
  }

  async openEditForRow(name: string): Promise<void> {
    const row = this.rowByName(name);
    await row.locator(this.sel('rowActions')).click();
    await this.page.locator(this.sel('actionEdit')).click();
  }

  async updateDescription(description: string): Promise<void> {
    await this.page.locator(this.sel('itemDescription')).fill(description);
    await this.saveItem();
  }

  async expectDescription(name: string, description: string): Promise<void> {
    const row = this.rowByName(name);
    await expect(row.locator('td').nth(1)).toHaveText(description);
  }
}
