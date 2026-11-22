import { test, expect } from '../../base-test.js';
import tags from '../../helpers/tags.js';
import { applyAllureMeta } from '../../helpers/allure-meta.js';

test.describe('[@tickets] Ticket search and filtering', () => {
  test(
    '[@SEARCH01] Search and status filtering',
    { tag: tags.tickets['SEARCH01'].tags },
    async ({ ticketsPage }) => {
      await applyAllureMeta({
        testId: 'SEARCH01',
        module: 'tickets',
        feature: 'Search and filter',
        user: 'agent',
        tags: tags.tickets['SEARCH01'].tags,
      });

      await ticketsPage.open();

      // Sample ticket TKT-1001 is seeded on first tickets visit.
      await ticketsPage.search('Cannot reset password');
      await ticketsPage.expectTicketVisible('TKT-1001', 'Cannot reset password');
      await ticketsPage.expectVisibleTicketCount(1);

      await ticketsPage.clearSearch();
      await ticketsPage.filterByStatus('Open');
      const openTickets = await ticketsPage.readVisibleTickets();
      expect(openTickets.length).toBeGreaterThan(0);
      expect(openTickets.every((ticket) => ticket.status === 'Open')).toBe(true);
      await ticketsPage.expectTicketVisible('TKT-1001');

      await ticketsPage.filterByStatus('all');
      await ticketsPage.search('ZZZ-NO-MATCH-QUERY-999');
      await ticketsPage.expectEmptyResults();
    },
  );
});
