import { expect, type Page } from '@playwright/test';
import { BasePage } from '@enterprise-playwright/core';
import { selectorPacks } from '../adapter/index.js';

export class TicketConfirmationPage extends BasePage {
  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
  }

  private sel(key: string): string {
    return selectorPacks.pick(key);
  }

  async open(): Promise<void> {
    await this.navigate('/done/');
    await this.expectConfirmationScreen();
  }

  async expectConfirmationScreen(): Promise<void> {
    await expect(this.page).toHaveURL(/\/done(\/|\?|$)/);
    await expect(this.page.locator(this.sel('deskShell'))).toBeVisible();
    await this.expectPageHeading('Confirmation');
  }

  async expectConfirmation(expectedTicketId?: string): Promise<void> {
    await this.expectConfirmationScreen();
    await expect(
      this.page.getByRole('status').filter({ hasText: 'Ticket submitted successfully.' }),
    ).toBeVisible();
    const ticketId = await this.getTicketId();
    expect(ticketId).toMatch(/^TKT-\d+$/);
    if (expectedTicketId !== undefined) {
      expect(ticketId).toBe(expectedTicketId);
    }
  }

  async getTicketId(): Promise<string> {
    const ticketId = ((await this.page.locator(this.sel('ticketId')).innerText()) ?? '').trim();
    if (!ticketId || ticketId === '—') {
      throw new Error('No ticket ID present on the confirmation page');
    }
    return ticketId;
  }
}
