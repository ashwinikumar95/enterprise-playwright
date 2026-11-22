import { clearSession, type Session } from './auth.js';

const NAV = [
  { href: '/tickets/', label: 'Tickets', match: '/tickets' },
  { href: '/new/', label: 'New ticket', match: '/new' },
] as const;

export function mountShell(session: Session): void {
  const root = document.querySelector<HTMLElement>('[data-testid="desk-shell"]');
  if (!root) return;

  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const nav = NAV.map((item) => {
    const current = path === item.match || path.startsWith(`${item.match}/`);
    return `<a href="${item.href}"${current ? ' aria-current="page"' : ''}>${item.label}</a>`;
  }).join('');

  root.insertAdjacentHTML(
    'afterbegin',
    `<header class="topnav">
      <div class="product">Support Desk</div>
      <nav aria-label="Primary">${nav}</nav>
      <div class="session">
        <span data-testid="signed-in-user">${escapeHtml(session.username)}</span>
        <button type="button" class="secondary" data-testid="sign-out" id="sign-out">Sign out</button>
      </div>
    </header>`,
  );

  document.getElementById('sign-out')?.addEventListener('click', () => {
    clearSession();
    window.location.href = '/signin/';
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
