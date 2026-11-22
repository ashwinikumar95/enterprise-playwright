import { expect, type Page } from '@playwright/test';
import { BasePage } from '@enterprise-playwright/core';
import { selectorPacks } from '../adapter/index.js';

export type TicketCategory =
  | 'Account'
  | 'Billing'
  | 'Network'
  | 'Software'
  | 'Other';

export interface NewTicketFormInput {
  subject: string;
  description: string;
  category: TicketCategory;
}

export class NewTicketPage extends BasePage {
  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
  }

  private sel(key: string): string {
    return selectorPacks.pick(key);
  }

  async open(): Promise<void> {
    await this.navigate('/new/');
    await this.expectNewTicketScreen();
  }

  async expectNewTicketScreen(): Promise<void> {
    await expect(this.page).toHaveURL(/\/new(\/|\?|$)/);
    await expect(this.page.locator(this.sel('deskShell'))).toBeVisible();
    await this.expectPageHeading('New ticket');
  }

  async fillSubject(subject: string): Promise<void> {
    await this.page.getByLabel('Subject').fill(subject);
  }

  async fillDescription(description: string): Promise<void> {
    await this.page.getByLabel('Description').fill(description);
  }

  async selectCategory(category: TicketCategory): Promise<void> {
    await this.page.getByLabel('Category').selectOption(category);
  }

  async fillTicket(input: NewTicketFormInput): Promise<void> {
    await this.fillSubject(input.subject);
    await this.selectCategory(input.category);
    await this.fillDescription(input.description);
  }

  async continueToReview(): Promise<void> {
    await this.page.getByRole('button', { name: 'Continue' }).click();
    await this.page.waitForURL(/\/review(\/|\?|$)/);
  }

  async createDraftAndContinue(input: NewTicketFormInput): Promise<void> {
    await this.fillTicket(input);
    await this.continueToReview();
  }
}
