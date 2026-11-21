export interface DemoUser {
  email: string;
  password: string;
  displayName: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    email: 'demo.user1@example.com',
    password: 'Password123!',
    displayName: 'Demo User 1',
  },
  {
    email: 'demo.user2@example.com',
    password: 'Password123!',
    displayName: 'Demo User 2',
  },
];

const SESSION_KEY = 'demo-app-session';

export interface DemoSession {
  email: string;
  displayName: string;
  /** ISO timestamp; used for expired-session tests. */
  expiresAt: string;
}

export function login(email: string, password: string): DemoSession {
  const user = DEMO_USERS.find((u) => u.email === email && u.password === password);
  if (!user) {
    throw new Error('Invalid email or password');
  }
  const session: DemoSession = {
    email: user.email,
    displayName: user.displayName,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): DemoSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as DemoSession;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

/** Test helper: expire the current session immediately. */
export function expireSession(): void {
  const session = getSession();
  if (!session) return;
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      ...session,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    }),
  );
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}
