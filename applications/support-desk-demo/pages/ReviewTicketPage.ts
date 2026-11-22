import { expect, type Page } from '@playwright/test';
import { BasePage } from '@enterprise-playwright/core';
import { selectorPacks } from '../adapter/index.js';

export interface ReviewTicketDetails {
  subject: string;
  category: string;
  description: string;
}

export class ReviewTicketPage extends BasePage {
  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
  }

  private sel(key: string): string {
    return selectorPacks.pick(key);
  }

  async open(): Promise<void> {
    await this.navigate('/review/');
    await this.expectReviewScreen();
  }

  async expectReviewScreen(): Promise<void> {
    await expect(this.page).toHaveURL(/\/review(\/|\?|$)/);
    await expect(this.page.locator(this.sel('deskShell'))).toBeVisible();
    await this.expectPageHeading('Review ticket');
  }

  async readTicketDetails(): Promise<ReviewTicketDetails> {
    await expect(this.page.locator('#review-panel')).toBeVisible();
    return {
      subject: ((await this.page.locator(this.sel('reviewSubject')).innerText()) ?? '').trim(),
      category: ((await this.page.locator(this.sel('reviewCategory')).innerText()) ?? '').trim(),
      description: (
        (await this.page.locator(this.sel('reviewDescription')).innerText()) ?? ''
      ).trim(),
    };
  }

  async expectTicketDetails(expected: ReviewTicketDetails): Promise<void> {
    await expect(this.page.locator(this.sel('reviewSubject'))).toHaveText(expected.subject);
    await expect(this.page.locator(this.sel('reviewCategory'))).toHaveText(expected.category);
    await expect(this.page.locator(this.sel('reviewDescription'))).toHaveText(
      expected.description,
    );
  }

  /**
   * Submits the ticket, waits for the confirmation page, and returns the generated ID.
   */
  async submitTicket(): Promise<string> {
    await this.page.getByRole('button', { name: 'Submit ticket' }).click();
    await this.page.waitForURL(/\/done(\/|\?|$)/);
    const ticketId = ((await this.page.locator(this.sel('ticketId')).innerText()) ?? '').trim();
    if (!ticketId || ticketId === '—') {
      throw new Error('Support Desk did not return a ticket ID after submit');
    }
    return ticketId;
  }
}
