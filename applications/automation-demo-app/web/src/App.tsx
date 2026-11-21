import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import {
  FormEvent,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  expireSession as expireStoredSession,
  getSession,
  login as performLogin,
  logout as performLogout,
  type DemoSession,
} from './auth';
import { createItem, listItems, updateItem, type Item } from './itemsStore';

const AuthContext = createContext<{
  session: DemoSession | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  expireSession: () => void;
  refresh: () => void;
} | null>(null);

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthContext missing');
  return ctx;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DemoSession | null>(() => getSession());

  const value = useMemo(
    () => ({
      session,
      login(email: string, password: string) {
        const next = performLogin(email, password);
        setSession(next);
      },
      logout() {
        performLogout();
        setSession(null);
      },
      expireSession() {
        expireStoredSession();
        setSession(getSession());
      },
      refresh() {
        setSession(getSession());
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function LoginPage() {
  const navigate = useNavigate();
  const { session, login } = useAuth();
  const [email, setEmail] = useState('demo.user1@example.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) navigate('/items', { replace: true });
  }, [session, navigate]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      login(email, password);
      navigate('/items');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={onSubmit} data-testid="login-form">
        <h1>Sign in</h1>
        <p>Automation demo application</p>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button type="submit">Sign in</button>
        {error ? <p className="error" data-testid="login-error">{error}</p> : null}
      </form>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { session, logout, expireSession } = useAuth();
  if (!session) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell" data-testid="app-shell">
      <aside className="sidebar">
        <strong>{session.displayName}</strong>
        <nav style={{ marginTop: '1.25rem' }}>
          <NavLink to="/items" data-testid="nav-items">
            Items
          </NavLink>
        </nav>
        <button
          className="secondary"
          type="button"
          data-testid="logout"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Log out
        </button>
        <button
          className="secondary"
          type="button"
          data-testid="expire-session"
          onClick={() => {
            expireSession();
            navigate('/login');
          }}
        >
          Expire session
        </button>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}

function ItemsPage() {
  const { session } = useAuth();
  if (!session) return null;
  const activeSession = session;

  const [items, setItems] = useState<Item[]>(() => listItems(activeSession.email));
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [toast, setToast] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const editingItem = useMemo(
    () => items.find((i) => i.id === editingId) ?? null,
    [items, editingId],
  );

  function refresh() {
    setItems(listItems(activeSession.email));
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  }

  function startCreate() {
    setMode('create');
    setEditingId(null);
    setName('');
    setDescription('');
  }

  function startEdit(item: Item) {
    setMode('edit');
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description);
    setOpenMenuId(null);
  }

  function onSave(event: FormEvent) {
    event.preventDefault();
    if (mode === 'create') {
      createItem(activeSession.email, { name, description, status: 'Active' });
      showToast('Item created');
    } else if (editingItem) {
      updateItem(activeSession.email, editingItem.id, { description });
      showToast('Item updated');
    }
    refresh();
    setMode('list');
  }

  if (mode !== 'list') {
    return (
      <div className="panel">
        <h1>{mode === 'create' ? 'Create Item' : 'Edit Item'}</h1>
        <form onSubmit={onSave}>
          <label htmlFor="item-name">Name</label>
          <input
            id="item-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={mode === 'edit'}
          />
          <label htmlFor="item-description">Description</label>
          <textarea
            id="item-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
          />
          <div className="toolbar">
            <button type="submit" data-testid="save-item">
              Save
            </button>
            <button type="button" className="secondary" onClick={() => setMode('list')}>
              Cancel
            </button>
          </div>
        </form>
        {toast ? (
          <div className="toast" data-testid="toast">
            {toast}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="toolbar">
        <h1 style={{ margin: 0, flex: 1 }}>Items</h1>
        <button type="button" data-testid="create-item" onClick={startCreate}>
          Create Item
        </button>
      </div>
      <table data-testid="items-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} data-testid={`item-row-${item.name}`}>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>{item.status}</td>
              <td className="row-menu">
                <button
                  type="button"
                  data-testid="row-actions"
                  className="secondary"
                  onClick={() =>
                    setOpenMenuId((id) => (id === item.id ? null : item.id))
                  }
                >
                  Actions
                </button>
                {openMenuId === item.id ? (
                  <div className="row-menu-panel">
                    <button
                      type="button"
                      data-testid="action-edit"
                      onClick={() => startEdit(item)}
                    >
                      Edit
                    </button>
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {toast ? (
        <div className="toast" data-testid="toast">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/items"
          element={
            <RequireAuth>
              <Shell>
                <ItemsPage />
              </Shell>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/items" replace />} />
      </Routes>
    </AuthProvider>
  );
}
