import { createBaseTest } from '@enterprise-playwright/core';
import { appConfig } from '../app.config.js';
import { supportDeskAdapter } from '../adapter/index.js';
import { SignInPage } from '../pages/SignInPage.js';
import { TicketsPage } from '../pages/TicketsPage.js';
import { NewTicketPage } from '../pages/NewTicketPage.js';
import { ReviewTicketPage } from '../pages/ReviewTicketPage.js';
import { TicketConfirmationPage } from '../pages/TicketConfirmationPage.js';

type SupportDeskFixtures = {
  signInPage: SignInPage;
  ticketsPage: TicketsPage;
  newTicketPage: NewTicketPage;
  reviewTicketPage: ReviewTicketPage;
  ticketConfirmationPage: TicketConfirmationPage;
};

const base = createBaseTest(appConfig, supportDeskAdapter);

export const test = base.extend<SupportDeskFixtures>({
  signInPage: async ({ page }, use) => {
    await use(new SignInPage(page, appConfig.baseURL));
  },
  ticketsPage: async ({ page }, use) => {
    await use(new TicketsPage(page, appConfig.baseURL));
  },
  newTicketPage: async ({ page }, use) => {
    await use(new NewTicketPage(page, appConfig.baseURL));
  },
  reviewTicketPage: async ({ page }, use) => {
    await use(new ReviewTicketPage(page, appConfig.baseURL));
  },
  ticketConfirmationPage: async ({ page }, use) => {
    await use(new TicketConfirmationPage(page, appConfig.baseURL));
  },
});

export { expect } from '@playwright/test';
