import '../styles.css';
import { requireSession } from '../auth.js';
import { readLastTicketId } from '../draft.js';
import { mountShell } from '../shell.js';

const session = requireSession();
mountShell(session);

const ticketId = readLastTicketId();
const idEl = document.querySelector<HTMLElement>('#ticket-id');
const banner = document.querySelector<HTMLElement>('#page-banner');
const missing = document.querySelector<HTMLElement>('#missing-ticket');

if (!ticketId) {
  if (banner) banner.hidden = true;
  if (missing) missing.hidden = false;
  if (idEl) idEl.textContent = '—';
} else {
  if (missing) missing.hidden = true;
  if (banner) {
    banner.hidden = false;
    banner.dataset.tone = 'ok';
    banner.textContent = 'Ticket submitted successfully.';
  }
  if (idEl) idEl.textContent = ticketId;
}
