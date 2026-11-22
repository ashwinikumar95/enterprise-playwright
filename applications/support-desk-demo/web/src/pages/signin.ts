import '../styles.css';
import { authenticate, readSession, writeSession } from '../auth.js';

const form = document.querySelector<HTMLFormElement>('#signin-form');
const errorEl = document.querySelector<HTMLElement>('#signin-error');
const usernameInput = document.querySelector<HTMLInputElement>('#username');
const passwordInput = document.querySelector<HTMLInputElement>('#password');

if (readSession()) {
  window.location.replace('/tickets/');
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!usernameInput || !passwordInput || !errorEl) return;

  const username = usernameInput.value;
  const password = passwordInput.value;

  if (!authenticate(username, password)) {
    errorEl.hidden = false;
    errorEl.textContent = 'Invalid username or password.';
    passwordInput.value = '';
    passwordInput.focus();
    return;
  }

  errorEl.hidden = true;
  writeSession(username.trim());

  const params = new URLSearchParams(window.location.search);
  const next = params.get('next');
  const safeNext =
    next && next.startsWith('/') && !next.startsWith('//') ? next : '/tickets/';
  window.location.assign(safeNext);
});
