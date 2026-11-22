/**
 * Application-specific selectors for Support Desk.
 * Prefer accessible roles/labels; use stable IDs only where the DOM defines them.
 */
export const supportDeskSelectors = {
  username: '#username',
  password: '#password',
  /** Prefer `page.getByRole('button', { name: 'Log in' })` in code. */
  loginSubmit: 'role=button[name="Log in"]',
  loginError: 'role=alert',

  deskShell: '[data-testid="desk-shell"]',
  signedInUser: '[data-testid="signed-in-user"]',

  subject: '#subject',
  category: '#category',
  description: '#description',
  continueTicket: 'role=button[name="Continue"]',

  reviewSubject: '#review-subject',
  reviewCategory: '#review-category',
  reviewDescription: '#review-description',
  submitTicket: 'role=button[name="Submit ticket"]',

  ticketId: '#ticket-id',

  ticketSearch: '#ticket-search',
  statusFilter: '#status-filter',
  ticketRows: '#ticket-rows',
  ticketsTable: '[data-testid="tickets-table"]',
} as const;

export type SupportDeskSelectorKey = keyof typeof supportDeskSelectors;
