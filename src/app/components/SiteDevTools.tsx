'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// Dogfooding: DebugTools uses its own published fetch logger as a dev panel.
// Client-only (patches window.fetch) and gated to development, so it never
// shows for visitors on debugtools.org.
const FetchLogger = dynamic(() => import('@jasimvk/fetchlogger/react'), {
  ssr: false,
});

export default function SiteDevTools() {
  const pathname = usePathname();

  if (process.env.NODE_ENV === 'production') return null;
  // The Fetch Logger tool page mounts its own demo panel — avoid a duplicate.
  if (pathname?.startsWith('/tools/fetch-logger')) return null;

  return <FetchLogger position="bottom-right" openOnActivity />;
}
