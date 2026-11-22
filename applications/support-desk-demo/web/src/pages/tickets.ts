import '../styles.css';
import { requireSession } from '../auth.js';
import { mountShell } from '../shell.js';
import { ensureSampleTickets, filterTickets, type Ticket } from '../tickets.js';

const session = requireSession();
mountShell(session);

const searchInput = document.querySelector<HTMLInputElement>('#ticket-search');
const statusSelect = document.querySelector<HTMLSelectElement>('#status-filter');
const tbody = document.querySelector<HTMLTableSectionElement>('#ticket-rows');
const empty = document.querySelector<HTMLElement>('#empty-results');
const countEl = document.querySelector<HTMLElement>('#result-count');

function render(tickets: Ticket[]): void {
  if (!tbody || !empty || !countEl) return;
  tbody.replaceChildren();

  if (tickets.length === 0) {
    empty.hidden = false;
    countEl.textContent = '0 tickets';
    return;
  }

  empty.hidden = true;
  countEl.textContent = `${tickets.length} ticket${tickets.length === 1 ? '' : 's'}`;

  for (const ticket of tickets) {
    const tr = document.createElement('tr');
    tr.dataset.ticketId = ticket.id;
    tr.innerHTML = `
      <td><span class="ticket-id">${escapeHtml(ticket.id)}</span></td>
      <td>${escapeHtml(ticket.subject)}</td>
      <td>${escapeHtml(ticket.category)}</td>
      <td><span class="status-pill" data-status="${escapeHtml(ticket.status)}">${escapeHtml(ticket.status)}</span></td>
    `;
    tbody.append(tr);
  }
}

function refresh(): void {
  const query = searchInput?.value ?? '';
  const status = statusSelect?.value ?? 'all';
  const allTickets = ensureSampleTickets();
  render(filterTickets(allTickets, query, status));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

searchInput?.addEventListener('input', refresh);
statusSelect?.addEventListener('change', refresh);
refresh();
