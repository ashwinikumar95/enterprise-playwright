import type { TicketDraft } from './draft.js';

export const TICKETS_KEY = 'support-desk-tickets';
export const TICKET_SEQ_KEY = 'support-desk-ticket-seq';

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved';

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: string;
  status: TicketStatus;
  createdAt: string;
}

const SAMPLE_TICKETS: Ticket[] = [
  {
    id: 'TKT-1001',
    subject: 'Cannot reset password',
    description: 'Reset link expires immediately after request.',
    category: 'Account',
    status: 'Open',
    createdAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'TKT-1002',
    subject: 'Invoice PDF missing line items',
    description: 'Exported invoices show totals only.',
    category: 'Billing',
    status: 'In Progress',
    createdAt: '2026-01-12T14:30:00.000Z',
  },
  {
    id: 'TKT-1003',
    subject: 'VPN disconnects on sleep',
    description: 'Corporate VPN drops after laptop lid close.',
    category: 'Network',
    status: 'Resolved',
    createdAt: '2026-01-08T11:15:00.000Z',
  },
];

function readSeq(): number {
  const raw = localStorage.getItem(TICKET_SEQ_KEY);
  const n = raw ? Number.parseInt(raw, 10) : 1003;
  return Number.isFinite(n) ? n : 1003;
}

function writeSeq(n: number): void {
  localStorage.setItem(TICKET_SEQ_KEY, String(n));
}

export function ensureSampleTickets(): Ticket[] {
  const existing = readTickets();
  if (existing.length > 0) return existing;
  localStorage.setItem(TICKETS_KEY, JSON.stringify(SAMPLE_TICKETS));
  writeSeq(1003);
  return SAMPLE_TICKETS.slice();
}

export function readTickets(): Ticket[] {
  const raw = localStorage.getItem(TICKETS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Ticket[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTickets(tickets: Ticket[]): void {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

/** Deterministic next id: TKT-1004, TKT-1005, ... */
export function nextTicketId(): string {
  const next = readSeq() + 1;
  writeSeq(next);
  return `TKT-${next}`;
}

export function createTicketFromDraft(draft: TicketDraft): Ticket {
  const ticket: Ticket = {
    id: nextTicketId(),
    subject: draft.subject.trim(),
    description: draft.description.trim(),
    category: draft.category,
    status: 'Open',
    createdAt: new Date().toISOString(),
  };
  const tickets = ensureSampleTickets();
  writeTickets([ticket, ...tickets]);
  return ticket;
}

export function filterTickets(
  tickets: Ticket[],
  query: string,
  status: string,
): Ticket[] {
  const q = query.trim().toLowerCase();
  return tickets.filter((ticket) => {
    const statusOk = !status || status === 'all' || ticket.status === status;
    if (!statusOk) return false;
    if (!q) return true;
    const haystack = `${ticket.id} ${ticket.subject} ${ticket.category} ${ticket.status}`.toLowerCase();
    return haystack.includes(q);
  });
}
