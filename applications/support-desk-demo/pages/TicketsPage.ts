import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '@enterprise-playwright/core';
import { selectorPacks } from '../adapter/index.js';

export type TicketStatusFilter = 'all' | 'Open' | 'In Progress' | 'Resolved';

export interface VisibleTicketRow {
  id: string;
  subject: string;
  category: string;
  status: string;
}

export class TicketsPage extends BasePage {
  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
  }

  private sel(key: string): string {
    return selectorPacks.pick(key);
  }

  private rows(): Locator {
    return this.page.locator(this.sel('ticketRows')).locator('tr');
  }

  async open(): Promise<void> {
    await this.navigate('/tickets/');
    await this.expectTicketsScreen();
  }

  async expectTicketsScreen(): Promise<void> {
    await expect(this.page).toHaveURL(/\/tickets(\/|\?|$)/);
    await expect(this.page.locator(this.sel('deskShell'))).toBeVisible();
    await this.expectPageHeading('Tickets');
  }

  async search(query: string): Promise<void> {
    await this.page.getByLabel('Search').fill(query);
  }

  async filterByStatus(status: TicketStatusFilter): Promise<void> {
    await this.page.getByLabel('Status').selectOption(status === 'all' ? 'all' : status);
  }

  async clearSearch(): Promise<void> {
    await this.search('');
  }

  async readVisibleTickets(): Promise<VisibleTicketRow[]> {
    const rowLocators = this.rows();
    const count = await rowLocators.count();
    const tickets: VisibleTicketRow[] = [];

    for (let i = 0; i < count; i += 1) {
      const row = rowLocators.nth(i);
      const cells = row.locator('td');
      tickets.push({
        id: ((await cells.nth(0).innerText()) ?? '').trim(),
        subject: ((await cells.nth(1).innerText()) ?? '').trim(),
        category: ((await cells.nth(2).innerText()) ?? '').trim(),
        status: ((await cells.nth(3).innerText()) ?? '').trim(),
      });
    }

    return tickets;
  }

  rowById(ticketId: string): Locator {
    return this.page.locator(
      `${this.sel('ticketRows')} tr[data-ticket-id="${ticketId}"]`,
    );
  }

  rowBySubject(subject: string): Locator {
    return this.rows().filter({
      has: this.page.locator('td', { hasText: subject }),
    });
  }

  async expectTicketVisible(ticketId: string, subject?: string): Promise<void> {
    const row = this.page.locator(`${this.sel('ticketRows')} tr[data-ticket-id="${ticketId}"]`);
    await expect(row).toBeVisible();
    if (subject !== undefined) {
      await expect(row.locator('td').nth(1)).toHaveText(subject);
    }
  }

  async expectResultCount(count: number): Promise<void> {
    const label = count === 1 ? '1 ticket' : `${count} tickets`;
    await expect(this.page.locator('#result-count')).toHaveText(label);
  }

  async expectEmptyResults(): Promise<void> {
    await expect(this.page.locator('#empty-results')).toBeVisible();
    await expect(this.page.locator('#empty-results')).toHaveText(
      'No tickets match your filters.',
    );
    await this.expectResultCount(0);
  }

  async expectVisibleTicketCount(count: number): Promise<void> {
    await expect(this.rows()).toHaveCount(count);
    await this.expectResultCount(count);
  }
}
