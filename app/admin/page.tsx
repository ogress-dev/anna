'use client';

import { useState } from 'react';
import {
  Lock,
  Heart,
  Calendar,
  Sparkles,
  History,
  Eye,
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Blobs } from '@/components/Blobs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const ADMIN_USER = 'me';
const ADMIN_PASS = '07283990690743863509';

function prettyDate(value: string) {
  return new Date(value + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function timeAgo(savedAt: number) {
  const seconds = Math.max(0, Math.floor((Date.now() - savedAt) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // `undefined` while loading, an array once loaded (possibly empty).
  const entries = useQuery(api.visitDays.list);
  const opens = useQuery(api.unlocks.list);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      username.trim().toLowerCase() === ADMIN_USER &&
      password === ADMIN_PASS
    ) {
      setError('');
      setAuthed(true);
    } else {
      setError("that doesn't feel right. try again?");
      setPassword('');
    }
  };

  if (!authed) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
        <Blobs />

        <div className="animate-fade-up glass-card relative z-10 w-full max-w-md rounded-[2rem] p-8 sm:p-10">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blush-300 to-blush-500 shadow-lg shadow-blush-300/40">
              <Lock className="h-7 w-7 text-white" strokeWidth={2.2} />
            </div>
            <h1 className="font-display text-3xl font-semibold gradient-text sm:text-4xl">
              Her answers
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--soft-text)' }}>
              what she picked, and when
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: 'var(--rose-text)' }}
              >
                username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                className="w-full rounded-2xl border border-blush-200 bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-blush-400 focus:ring-2 focus:ring-blush-300/50"
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: 'var(--rose-text)' }}
              >
                password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
                className="w-full rounded-2xl border border-blush-200 bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-blush-400 focus:ring-2 focus:ring-blush-300/50"
              />
            </div>

            {error && (
              <p
                className="animate-fade-up text-center text-sm font-medium"
                style={{ color: 'var(--blush-600)' }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blush-400 to-blush-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blush-300/40 transition-all hover:shadow-xl hover:shadow-blush-400/50 hover:brightness-105 active:scale-[0.98]"
            >
              <Heart className="h-4 w-4 transition-transform group-hover:scale-110" />
              View answers
            </button>
          </form>
        </div>
      </main>
    );
  }

  const current = entries?.[0];
  const hasHistory = entries && entries.length > 0;
  const lastOpen = opens?.[0];

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-12 sm:py-16">
      <Blobs />

      <div className="relative z-10 mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="animate-fade-up text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blush-300 to-blush-500 shadow-lg shadow-blush-300/40">
              <Heart className="h-5 w-5 text-white" />
            </div>
          </div>
          <h1 className="font-display text-4xl font-semibold gradient-text sm:text-5xl">
            Her answers
          </h1>
          <div className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-blush-300 to-transparent" />
        </div>

        {/* Did she open it */}
        <div
          className="animate-fade-up glass-card rounded-[2rem] p-8 text-center sm:p-10"
          style={{ animationDelay: '0.05s' }}
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <Eye className="h-5 w-5 text-blush-400" />
            <span
              className="font-display text-sm font-medium italic"
              style={{ color: 'var(--rose-text)' }}
            >
              did she read it
            </span>
          </div>

          {opens === undefined ? (
            <p className="text-sm" style={{ color: 'var(--soft-text)' }}>
              checking...
            </p>
          ) : lastOpen ? (
            <>
              <p
                className="font-display text-3xl font-semibold sm:text-4xl"
                style={{ color: 'var(--rose-text)' }}
              >
                yes
              </p>
              <p className="mt-2 text-xs" style={{ color: 'var(--soft-text)' }}>
                opened {timeAgo(lastOpen.openedAt)}
                {opens.length > 1 ? ` · ${opens.length} times` : ''}
              </p>
              {opens.length > 0 && (
                <ul
                  className="mt-4 flex flex-wrap justify-center gap-1.5"
                  aria-label="recent unlocks"
                >
                  {opens.slice(0, 8).map((open, index) => (
                    <li
                      key={open._id}
                      className="rounded-full bg-blush-100/70 px-2.5 py-1 text-[11px]"
                      style={{ color: 'var(--rose-text)' }}
                    >
                      {index === 0 ? 'latest' : timeAgo(open.openedAt)}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="text-sm" style={{ color: 'var(--soft-text)' }}>
              not yet. she hasn&apos;t unlocked it.
            </p>
          )}
        </div>

        {/* Current pick */}
        <div
          className="animate-fade-up glass-card rounded-[2rem] p-8 text-center sm:p-10"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <Calendar className="h-5 w-5 text-blush-400" />
            <span
              className="font-display text-sm font-medium italic"
              style={{ color: 'var(--rose-text)' }}
            >
              the day she chose
            </span>
          </div>

          {entries === undefined ? (
            <p className="text-sm" style={{ color: 'var(--soft-text)' }}>
              checking...
            </p>
          ) : current ? (
            <>
              <p className="font-display text-3xl font-semibold sm:text-4xl" style={{ color: 'var(--rose-text)' }}>
                {prettyDate(current.date)}
              </p>
              <p className="mt-2 text-xs" style={{ color: 'var(--soft-text)' }}>
                saved {timeAgo(current.savedAt)}
                {entries && entries.length > 1
                  ? ` · changed ${entries.length} times`
                  : ''}
              </p>
            </>
          ) : (
            <p className="text-sm" style={{ color: 'var(--soft-text)' }}>
              she hasn&apos;t picked a day yet
            </p>
          )}
        </div>

        {/* History */}
        <div
          className="animate-fade-up glass-card rounded-[2rem] p-8 sm:p-10"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blush-100">
              <History className="h-5 w-5 text-blush-500" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold" style={{ color: 'var(--rose-text)' }}>
                every save
              </h2>
              <p className="text-xs" style={{ color: 'var(--soft-text)' }}>
                newest first
              </p>
            </div>
          </div>

          {entries === undefined ? (
            <p className="text-sm" style={{ color: 'var(--soft-text)' }}>
              loading...
            </p>
          ) : hasHistory ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Saved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, index) => (
                  <TableRow key={entry._id}>
                    <TableCell
                      className="font-display font-medium"
                      style={{ color: index === 0 ? 'var(--blush-600)' : 'var(--rose-text)' }}
                    >
                      {index === 0 ? (
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" />
                          current
                        </span>
                      ) : (
                        `pick ${entries.length - index}`
                      )}
                    </TableCell>
                    <TableCell style={{ color: 'var(--soft-text)' }}>
                      {prettyDate(entry.date)}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      style={{ color: 'var(--soft-text)' }}
                    >
                      {timeAgo(entry.savedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm" style={{ color: 'var(--soft-text)' }}>
              no saves yet
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="animate-fade-up pb-4 text-center" style={{ animationDelay: '0.3s' }}>
          <p className="font-display text-sm italic" style={{ color: 'var(--rose-text)' }}>
            now you know
          </p>
        </div>
      </div>
    </main>
  );
}