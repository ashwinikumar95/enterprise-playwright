import '../styles.css';
import { requireSession } from '../auth.js';
import { clearDraft, readDraft, writeLastTicketId } from '../draft.js';
import { mountShell } from '../shell.js';
import { createTicketFromDraft } from '../tickets.js';

const session = requireSession();
mountShell(session);

const draft = readDraft();
const missing = document.querySelector<HTMLElement>('#missing-draft');
const review = document.querySelector<HTMLElement>('#review-panel');
const subjectEl = document.querySelector<HTMLElement>('#review-subject');
const categoryEl = document.querySelector<HTMLElement>('#review-category');
const descriptionEl = document.querySelector<HTMLElement>('#review-description');
const submitBtn = document.querySelector<HTMLButtonElement>('#submit-ticket');

if (!draft) {
  if (missing) missing.hidden = false;
  if (review) review.hidden = true;
} else {
  if (missing) missing.hidden = true;
  if (review) review.hidden = false;
  if (subjectEl) subjectEl.textContent = draft.subject;
  if (categoryEl) categoryEl.textContent = draft.category;
  if (descriptionEl) descriptionEl.textContent = draft.description;
}

submitBtn?.addEventListener('click', () => {
  const current = readDraft();
  if (!current) {
    window.location.assign('/new/');
    return;
  }
  const ticket = createTicketFromDraft(current);
  clearDraft();
  writeLastTicketId(ticket.id);
  window.location.assign('/done/');
});
