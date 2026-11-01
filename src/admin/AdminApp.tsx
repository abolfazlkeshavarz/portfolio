import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Content } from '../types';
import { ApiError, api } from './api';
import { TextField } from './fields';
import {
  EducationSection,
  ExperienceSection,
  ProfileSection,
  ProjectsSection,
  ResearchSection,
  SkillsSection,
} from './sections';

const TABS = [
  ['profile', 'Profile', ProfileSection],
  ['education', 'Education', EducationSection],
  ['research', 'Research', ResearchSection],
  ['projects', 'Projects', ProjectsSection],
  ['experience', 'Experience', ExperienceSection],
  ['skills', 'Skills & more', SkillsSection],
] as const;

type TabId = (typeof TABS)[number][0];

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-paper text-ink">{children}</div>;
}

function Login({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.login(username, password);
      onDone();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not sign in');
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell>
      <main className="mx-auto grid min-h-screen max-w-[400px] content-center px-5 py-10">
        <p className="m-0 text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-accent">Control panel</p>
        <h1 className="mb-6 mt-2 text-[1.9rem] font-semibold">Sign in</h1>
        <form onSubmit={submit} className="card space-y-4 p-6">
          <TextField label="Username" value={username} onChange={setUsername} />
          <label className="block">
            <span className="mb-1.5 block text-[0.8rem] font-semibold text-ink-2">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border border-rule bg-card px-3 py-2 text-[0.95rem] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? (
            <p role="alert" className="m-0 rounded-md bg-[#fef3f2] px-3 py-2 text-[0.86rem] text-[#b42318]">
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn btn-primary w-full justify-center" disabled={busy || !username || !password}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </main>
    </Shell>
  );
}

function Editor({ onSignedOut }: { onSignedOut: () => void }) {
  const [saved, setSaved] = useState<Content | null>(null);
  const [draft, setDraft] = useState<Content | null>(null);
  const [tab, setTab] = useState<TabId>('profile');
  const [status, setStatus] = useState<{ tone: 'ok' | 'error' | 'busy'; text: string } | null>(null);

  useEffect(() => {
    document.title = 'Control panel';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.append(meta);
    api
      .load()
      .then((content) => {
        setSaved(content);
        setDraft(content);
      })
      .catch((problem: Error) => setStatus({ tone: 'error', text: problem.message }));
    return () => meta.remove();
  }, []);

  const dirty = useMemo(() => saved !== null && draft !== null && JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const guard = useCallback(
    (problem: unknown) => {
      if (problem instanceof ApiError && problem.status === 401) {
        onSignedOut();
        return;
      }
      setStatus({ tone: 'error', text: problem instanceof Error ? problem.message : 'Something went wrong' });
    },
    [onSignedOut],
  );

  const save = async () => {
    if (!draft) return;
    setStatus({ tone: 'busy', text: 'Saving…' });
    try {
      await api.save(draft);
      setSaved(draft);
      setStatus({ tone: 'ok', text: 'Saved — the site is updated.' });
    } catch (problem) {
      guard(problem);
    }
  };

  const reset = async () => {
    if (!window.confirm('Replace everything with the original content that shipped with the site? Your current content is kept as a backup on the server.')) return;
    try {
      const { content } = await api.reset();
      setSaved(content);
      setDraft(content);
      setStatus({ tone: 'ok', text: 'Restored the original content.' });
    } catch (problem) {
      guard(problem);
    }
  };

  const signOut = async () => {
    if (dirty && !window.confirm('You have unsaved changes. Sign out anyway?')) return;
    await api.logout().catch(() => {});
    onSignedOut();
  };

  if (!draft) {
    return (
      <Shell>
        <p className="p-8 text-ink-3" role="status">
          {status?.tone === 'error' ? status.text : 'Loading…'}
        </p>
      </Shell>
    );
  }

  const Active = TABS.find(([id]) => id === tab)![2];

  return (
    <Shell>
      <header className="sticky top-0 z-30 border-b border-rule bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1040px] flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 sm:px-6">
          <h1 className="m-0 mr-auto font-serif text-[1.05rem] font-semibold">Control panel</h1>
          <span
            role="status"
            className={`order-last w-full text-[0.82rem] sm:order-none sm:w-auto ${
              status?.tone === 'error' ? 'text-[#b42318]' : dirty ? 'text-[#b54708]' : 'text-ink-3'
            }`}
          >
            {status && !dirty ? status.text : dirty ? (status?.tone === 'error' ? status.text : 'Unsaved changes') : ''}
          </span>
          <a className="btn" href="/" target="_blank" rel="noopener noreferrer">
            View site ↗
          </a>
          <button type="button" className="btn" onClick={() => setDraft(saved)} disabled={!dirty}>
            Discard
          </button>
          <button type="button" className="btn btn-primary" onClick={() => void save()} disabled={!dirty || status?.tone === 'busy'}>
            Save
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1040px] grid-cols-[minmax(0,1fr)] gap-6 px-5 py-6 sm:px-6 md:grid-cols-[190px_minmax(0,1fr)] md:gap-10">
        <nav aria-label="Sections" className="min-w-0 md:sticky md:top-24 md:self-start">
          <ul className="m-0 flex list-none gap-1 overflow-x-auto p-0 md:flex-col [&::-webkit-scrollbar]:hidden">
            {TABS.map(([id, label]) => (
              <li key={id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setTab(id);
                    window.scrollTo({ top: 0 });
                  }}
                  aria-current={tab === id ? 'page' : undefined}
                  className={`w-full rounded-md px-3.5 py-2 text-left text-[0.92rem] font-medium transition-colors ${
                    tab === id ? 'bg-accent text-white' : 'text-ink-2 hover:bg-paper-2'
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 hidden space-y-2 border-t border-rule pt-5 md:block">
            <button type="button" className="btn w-full justify-center" onClick={() => void signOut()}>
              Sign out
            </button>
            <button
              type="button"
              className="w-full bg-transparent py-1 text-[0.8rem] text-ink-3 underline underline-offset-2 hover:text-[#b42318]"
              onClick={() => void reset()}
            >
              Restore original content
            </button>
          </div>
        </nav>

        <main className="min-w-0 space-y-6 pb-24">
          <Active content={draft} set={setDraft} />
          <div className="space-y-2 border-t border-rule pt-5 md:hidden">
            <button type="button" className="btn w-full justify-center" onClick={() => void signOut()}>
              Sign out
            </button>
            <button
              type="button"
              className="w-full bg-transparent py-2 text-[0.82rem] text-ink-3 underline underline-offset-2"
              onClick={() => void reset()}
            >
              Restore original content
            </button>
          </div>
        </main>
      </div>
    </Shell>
  );
}

export default function AdminApp() {
  const [state, setState] = useState<'checking' | 'out' | 'in'>('checking');

  useEffect(() => {
    document.title = 'Control panel';
    api.session().then((ok) => setState(ok ? 'in' : 'out'));
  }, []);

  if (state === 'checking') return <Shell>{null}</Shell>;
  if (state === 'out') return <Login onDone={() => setState('in')} />;
  return <Editor onSignedOut={() => setState('out')} />;
}
