'use client';

import { useState, useEffect, useMemo } from 'react';
import { Lock, Heart, Calendar, Sparkles, Check } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Blobs } from '@/components/Blobs';

const AUTH_USER = 'anna';
const AUTH_PASS = '07283990690743863509';
const STORAGE_KEY = 'anna_visit_date';

function prettyDate(value: string) {
  return new Date(value + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [selectedDate, setSelectedDate] = useState('');
  const [savedDate, setSavedDate] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  // `undefined` = still loading. `null` = loaded, nothing saved yet. An object
  // = loaded, here's her latest pick.
  //
  // Convex is the source of truth; localStorage is the fallback that keeps the
  // date on screen while the query is in flight (or if it never resolves).
  const latest = useQuery(api.visitDays.latest);
  const saveDate = useMutation(api.visitDays.save);
  const recordUnlock = useMutation(api.unlocks.record);

  // Once a row exists, adopt it over anything stale in localStorage.
  useEffect(() => {
    if (!authed || !latest) return;
    const fromDb = latest.date;
    if (!fromDb) return;
    try {
      localStorage.setItem(STORAGE_KEY, fromDb);
    } catch {
      /* localStorage unavailable, non-fatal */
    }
    setSavedDate(fromDb);
    setSelectedDate(fromDb);
    setIsSaved(true);
    setSavedMsg(`perfect. ${prettyDate(fromDb)}. I'll plan around you.`);
  }, [authed, latest]);

  // --- Week boundary calculation (current week, Mon–Sun) ---
  const { minDate, maxDate } = useMemo(() => {
    const today = new Date();
    const day = today.getDay(); // 0 = Sun
    const monday = new Date(today);
    const diffToMon = day === 0 ? -6 : 1 - day;
    monday.setDate(today.getDate() + diffToMon);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const fmt = (d: Date) => d.toISOString().split('T')[0];
    return { minDate: fmt(monday), maxDate: fmt(sunday) };
  }, []);

  // Fallback only: read localStorage while the Convex query is still loading or
  // if it comes back empty/undefined. The effect above overwrites this once a
  // database row shows up.
  useEffect(() => {
    if (!authed || latest) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedDate(stored);
        setSelectedDate(stored);
        setIsSaved(true);
        setSavedMsg(`perfect. ${prettyDate(stored)}. I'll plan around you.`);
      }
    } catch {
      /* localStorage unavailable, non-fatal */
    }
  }, [authed, latest]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      username.trim().toLowerCase() === AUTH_USER &&
      password === AUTH_PASS
    ) {
      setError('');
      // Log that she opened it. Awaited so the row definitely lands before the
      // admin page reads, but a failure here is swallowed so it can never
      // stop her from reading the letter.
      void recordUnlock({ openedAt: Date.now() }).catch(() => {
        /* non-fatal */
      });
      setAuthed(true);
    } else {
      setError("that doesn't feel right. try again?");
      setPassword('');
    }
  };

  const handleSaveDate = async () => {
    if (!selectedDate) return;

    setSaveError('');

    // Write locally first so the confirmation appears immediately and survives
    // a failed network call. The Convex row is what you read on /admin.
    try {
      localStorage.setItem(STORAGE_KEY, selectedDate);
    } catch {
      /* ignore write failure */
    }

    setSavedDate(selectedDate);
    setIsSaved(true);
    setSavedMsg(`perfect. ${prettyDate(selectedDate)}. I'll plan around you.`);

    try {
      await saveDate({ date: selectedDate, savedAt: Date.now() });
    } catch {
      setSaveError("saved on this device, but I couldn't reach the server.");
    }
  };

  // ---------- Auth card ----------
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
              For Anna
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--soft-text)' }}>
              a private note, just for you
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
                placeholder="anna"
                autoComplete="off"
                className="w-full rounded-2xl border border-blush-200 bg-white/60 px-4 py-3 text-sm outline-none transition-all placeholder:text-blush-300 focus:border-blush-400 focus:ring-2 focus:ring-blush-300/50"
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
                placeholder="••••••••"
                autoComplete="off"
                className="w-full rounded-2xl border border-blush-200 bg-white/60 px-4 py-3 text-sm outline-none transition-all placeholder:text-blush-300 focus:border-blush-400 focus:ring-2 focus:ring-blush-300/50"
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
              Unlock
            </button>
          </form>

          <div className="mt-6 flex justify-center">
            <div
              className="animate-soft-pulse rounded-full bg-blush-100/80 px-4 py-2 text-xs text-center"
              style={{ color: 'var(--soft-text)' }}
            >
              hint: the password is your both numbers combined, e.g.{' '}
              <span className="font-mono font-medium" style={{ color: 'var(--blush-600)' }}>
                0788888880799999999
              </span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ---------- Main content (after auth) ----------
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-12 sm:py-16">
      <Blobs />

      <div className="relative z-10 mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="animate-fade-up text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blush-300 to-blush-500 shadow-lg shadow-blush-300/40">
              <Heart className="h-5 w-5 text-white" />
            </div>
          </div>
          <h1 className="font-display text-4xl font-semibold gradient-text sm:text-5xl">
            For Anna
          </h1>
          <div className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-blush-300 to-transparent" />
        </div>

        {/* Letter block */}
        <div className="animate-fade-up glass-card rounded-[2rem] p-8 sm:p-10" style={{ animationDelay: '0.1s' }}>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blush-400" />
            <span className="font-display text-sm font-medium italic" style={{ color: 'var(--rose-text)' }}>
              a note from me to you
            </span>
          </div>

          <div className="space-y-4 text-[15px] leading-[1.8]" style={{ color: 'var(--soft-text)' }}>
            <p className="first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-5xl first-letter:font-semibold first-letter:text-blush-400">
              Hey Anna, I know we haven&apos;t talked in a while, and I&apos;m not
              reaching out to point fingers or start a fight. I&apos;m reaching
              out because I genuinely care about you and it&apos;s been eating at
              me that we left things the way we did.
            </p>
            <p>
              I won&apos;t pretend I handled my reaction well, but I also can&apos;t
              stay quiet while I watch you drift toward things that don&apos;t add
              real value to your life. You&apos;re brilliant at IT, and it honestly
              hurts to see you pour your energy into paths that won&apos;t build
              you up when I know how far you could go. I&apos;m not saying this
              to judge you, I&apos;m saying it because I&apos;d be willing to coach
              you, push you, and help you advance substantially in your career
              instead of staying stuck where you are.
            </p>
            <p>
              And I&apos;d be honest about what I mean. I look at{' '}
              <a
                href="https://www.linkedin.com/in/janet-w-a7b42b62"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline decoration-blush-300 decoration-2 underline-offset-4 transition-colors hover:decoration-blush-500"
                style={{ color: 'var(--blush-600)' }}
              >
                Janet W
              </a>{' '}
              and that&apos;s the bar. That&apos;s the level I want you at, because
              she got there and there&apos;s nothing about you that says you
              can&apos;t. I don&apos;t want you copying her, I want you beating
              her. Once you see how far the ceiling actually is, going back to
              feeling stuck stops making any sense.
            </p>
            <p>
              The same goes for your photo. Look at how she carries herself in
              that picture. Clean, sharp, professional, like someone who already
              belongs where she is. Get a proper headshot taken, use it
              everywhere, and put that one in its place. I want your image to look
              like that, because that&apos;s how the rest of the world is going to
              meet you from now on, and the woman behind the profile should look
              like the level she&apos;s actually working at.
            </p>
            <p>
              I also know Charlie Black is coming this Saturday, but if you have
              any time before then, I&apos;d pay for your transport myself just so
              we can sit down and fix this properly. After that, we can head
              to the JW Marriott (your favourite hotel) for a proper date, and
              just kick it from there.
            </p>
            <p>
              And this stays between us. Nobody has to know what we&apos;ve built
              or what we&apos;re planning to build. Not the people around us, not
              anyone. What we&apos;re figuring out is ours, and I want to keep it
              that way. I&apos;ve been thinking about what we could do together
              that wouldn&apos;t even be possible out in the open, and I like that
              it&apos;s ours alone.
            </p>
            <p>
              I also know you don&apos;t want to lose me. You&apos;ve never been
              good at admitting it, but I see it, and I&apos;m not going to pretend
              I don&apos;t. And I don&apos;t want to lose you either. That&apos;s
              the honest part. I still think about us in a way I haven&apos;t
              thought about anyone in a long time, and I&apos;m not interested in
              being the one who let it go quiet.
            </p>
            <p className="font-display text-base font-medium" style={{ color: 'var(--rose-text)' }}>
              No pressure, no games. Just a real chance to talk, and to start
              something better.
            </p>
          </div>
        </div>

        {/* Date picker section */}
        <div
          className="animate-fade-up glass-card rounded-[2rem] p-8 sm:p-10"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blush-100">
              <Calendar className="h-5 w-5 text-blush-500" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold" style={{ color: 'var(--rose-text)' }}>
                when can you come?
              </h2>
              <p className="text-xs" style={{ color: 'var(--soft-text)' }}>
                pick any day this week
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: 'var(--rose-text)' }}
              >
                your day
              </label>
              <input
                type="date"
                value={selectedDate}
                min={minDate}
                max={maxDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setIsSaved(false);
                  setSavedMsg('');
                  setSaveError('');
                }}
                className="w-full rounded-2xl border border-blush-200 bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-blush-400 focus:ring-2 focus:ring-blush-300/50"
              />
            </div>

            <button
              onClick={() => void handleSaveDate()}
              disabled={!selectedDate}
              className="group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blush-400 to-blush-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blush-300/40 transition-all hover:shadow-xl hover:shadow-blush-400/50 hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:whitespace-nowrap"
            >
              <Check className="h-4 w-4 transition-transform group-hover:scale-110" />
              Save this day
            </button>
          </div>

          {isSaved && savedDate && (
            <div className="mt-5">
              <div
                className="animate-fade-up flex items-center gap-2 rounded-2xl bg-blush-100/70 px-5 py-4"
              >
                <Sparkles className="h-5 w-5 shrink-0 text-blush-500" />
                <p className="text-sm font-medium" style={{ color: 'var(--rose-text)' }}>
                  {savedMsg}
                </p>
              </div>
              <p
                className="mt-3 text-center text-xs"
                style={{ color: 'var(--soft-text)' }}
              >
                saved as your visit day. I&apos;ll remember it even if you refresh the page
              </p>
            </div>
          )}

          {saveError && (
            <p
              className="animate-fade-up mt-5 text-center text-sm"
              style={{ color: 'var(--blush-600)' }}
            >
              {saveError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="animate-fade-up pb-4 text-center" style={{ animationDelay: '0.3s' }}>
          <p className="font-display text-sm italic" style={{ color: 'var(--rose-text)' }}>
            made with care, just for you
          </p>
        </div>
      </div>
    </main>
  );
}
