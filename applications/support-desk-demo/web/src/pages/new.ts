import '../styles.css';
import { requireSession } from '../auth.js';
import { readDraft, writeDraft } from '../draft.js';
import { mountShell } from '../shell.js';

const session = requireSession();
mountShell(session);

const form = document.querySelector<HTMLFormElement>('#ticket-form');
const subjectInput = document.querySelector<HTMLInputElement>('#subject');
const descriptionInput = document.querySelector<HTMLTextAreaElement>('#description');
const categoryInput = document.querySelector<HTMLSelectElement>('#category');
const banner = document.querySelector<HTMLElement>('#page-banner');

const draft = readDraft();
if (draft && subjectInput && descriptionInput && categoryInput) {
  subjectInput.value = draft.subject;
  descriptionInput.value = draft.description;
  categoryInput.value = draft.category;
  if (banner) {
    banner.hidden = false;
    banner.dataset.tone = 'warn';
    banner.textContent = 'Draft restored from your previous step.';
  }
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!subjectInput || !descriptionInput || !categoryInput) return;

  const subject = subjectInput.value.trim();
  const description = descriptionInput.value.trim();
  const category = categoryInput.value;

  if (!subject || !description || !category) {
    if (banner) {
      banner.hidden = false;
      banner.dataset.tone = 'warn';
      banner.textContent = 'Subject, description, and category are required.';
    }
    return;
  }

  writeDraft({ subject, description, category });
  window.location.assign('/review/');
});
