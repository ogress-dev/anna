'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';

const url = process.env.NEXT_PUBLIC_CONVEX_URL;

// Only construct the client when the URL is actually present. Constructing it
// with undefined throws, and because this module is imported by the root layout
// that throw happens during static prerender and takes the whole build down.
// The NEXT_PUBLIC_ value is inlined at build time, so a missing env var on the
// host is a build-time concern, not just a runtime one.
const client = url ? new ConvexReactClient(url) : null;

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!client) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="glass-card max-w-md rounded-[2rem] p-8">
          <h1 className="font-display text-2xl font-semibold gradient-text">
            Not connected
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--soft-text)' }}>
            NEXT_PUBLIC_CONVEX_URL is missing. Set it for this environment and
            rebuild.
          </p>
        </div>
      </div>
    );
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}