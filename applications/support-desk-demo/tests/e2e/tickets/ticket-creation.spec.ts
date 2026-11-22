import { test, expect } from '../../base-test.js';
import { appConfig } from '../../../app.config.js';
import tags from '../../helpers/tags.js';
import { applyAllureMeta } from '../../helpers/allure-meta.js';
import { loadTicketCsvRows, uniqueTicketSubject } from '../../helpers/ticketData.js';

test.describe('[@tickets] Ticket creation', () => {
  test(
    '[@TC01] CSV-driven ticket creation and confirmation',
    { tag: tags.tickets['TC01'].tags },
    async ({
      newTicketPage,
      reviewTicketPage,
      ticketConfirmationPage,
      ticketsPage,
    }) => {
      await applyAllureMeta({
        testId: 'TC01',
        module: 'tickets',
        feature: 'Ticket creation',
        user: 'agent',
        tags: tags.tickets['TC01'].tags,
      });

      const rows = loadTicketCsvRows(appConfig, 'TC01.csv', 'TC01');
      expect(rows.length).toBeGreaterThanOrEqual(3);

      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i]!;
        const subject = uniqueTicketSubject(row.subject, i);

        await newTicketPage.open();
        await newTicketPage.createDraftAndContinue({
          subject,
          category: row.category,
          description: row.description,
        });

        await reviewTicketPage.expectReviewScreen();
        await reviewTicketPage.expectTicketDetails({
          subject,
          category: row.category,
          description: row.description,
        });

        const ticketId = await reviewTicketPage.submitTicket();
        expect(ticketId).toMatch(/^TKT-\d+$/);

        await ticketConfirmationPage.expectConfirmation(ticketId);

        await ticketsPage.open();
        await ticketsPage.expectTicketVisible(ticketId, subject);
      }
    },
  );
});
