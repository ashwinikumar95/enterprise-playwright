export const DRAFT_KEY = 'support-desk-draft';
export const LAST_TICKET_KEY = 'support-desk-last-ticket-id';

export interface TicketDraft {
  subject: string;
  description: string;
  category: string;
}

export function readDraft(): TicketDraft | null {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as TicketDraft;
    if (!parsed?.subject || !parsed?.description || !parsed?.category) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeDraft(draft: TicketDraft): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}

export function readLastTicketId(): string | null {
  return localStorage.getItem(LAST_TICKET_KEY);
}

export function writeLastTicketId(id: string): void {
  localStorage.setItem(LAST_TICKET_KEY, id);
}
