'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Terminal } from 'lucide-react';
import SiteHeader from '@/app/components/SiteHeader';
import ToolHistoryRecorder from '@/app/components/ToolHistoryRecorder';
import ToolScopedHistoryPanel from '@/app/components/ToolScopedHistoryPanel';
import { isApiWorkbenchPath, shouldShowGlobalToolHeader } from '@/app/tools/lib/tool-layout-chrome';

const repoLinks = [
  { label: 'Repository', href: 'https://github.com/jasimvkarim/mydebugtools' },
  { label: 'Issues', href: 'https://github.com/jasimvkarim/mydebugtools/issues' },
  { label: 'Roadmap', href: '/roadmap' },
  { label: 'CLI', href: '/cli' },
  { label: 'Releases', href: '/releases' },
  { label: 'License', href: 'https://github.com/jasimvkarim/mydebugtools/blob/main/LICENSE' },
];

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  const isApiWorkbench = isApiWorkbenchPath(pathname);
  const showGlobalHeader = shouldShowGlobalToolHeader(pathname);

  return (
    <div className={`flex min-h-screen flex-col text-foreground ${
      isApiWorkbench ? 'bg-surface' : 'bg-background'
    }`}>
      <ToolHistoryRecorder />
      {showGlobalHeader && (
        <SiteHeader maxWidth="max-w-[1600px]" mobileLabel="tools" showToolRail />
      )}

      <main className="flex-1">
        <div className={isApiWorkbench ? 'w-full' : 'oss-tools-surface w-full px-4 py-5 sm:px-6'}>
          {children}
        </div>

        {!isApiWorkbench && <ToolScopedHistoryPanel />}

        {!isApiWorkbench && (
          <footer className="mt-10 border-t border-border bg-background">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-6 text-sm text-muted sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <span>DebugTools for API work and focused developer utilities.</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {repoLinks.map((link) => (
                link.href.startsWith('/') ? (
                  <Link key={link.label} href={link.href} className="font-medium text-muted transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="font-medium text-muted transition-colors hover:text-foreground">
                    {link.label}
                  </a>
                )
              ))}
            </div>
          </div>
          </footer>
        )}
      </main>
    </div>
  );
}
