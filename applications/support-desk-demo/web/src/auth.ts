export const SESSION_KEY = 'support-desk-session';

/** Demo credentials aligned with app.config agent env keys (AGENT_EMAIL / AGENT_PASSWORD). */
export const DEMO_USERS = [
  {
    username: 'agent@example.com',
    password: 'Password123!',
  },
] as const;

export interface Session {
  username: string;
  signedInAt: string;
}

export function readSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.username) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(username: string): Session {
  const session: Session = {
    username,
    signedInAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function authenticate(username: string, password: string): boolean {
  return DEMO_USERS.some(
    (user) => user.username === username.trim() && user.password === password,
  );
}

export function requireSession(): Session {
  const session = readSession();
  if (!session) {
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.replace(`/signin/?next=${encodeURIComponent(next)}`);
    throw new Error('Not authenticated');
  }
  return session;
}
