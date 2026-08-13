'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { ClockIcon, TrashIcon } from '@heroicons/react/24/outline';
import {
  createToolHistoryEntry,
  filterToolHistoryForPath,
  getToolHistorySlug,
  TOOL_HISTORY_LOCAL_KEY,
  type ToolHistoryEntry,
} from '@/lib/tool-history';

const HISTORY_LIMIT = 6;

function readLocalHistory() {
  try {
    const rawHistory = window.localStorage.getItem(TOOL_HISTORY_LOCAL_KEY);
    if (!rawHistory) return [];
    const parsedHistory = JSON.parse(rawHistory);
    return Array.isArray(parsedHistory) ? parsedHistory as ToolHistoryEntry[] : [];
  } catch {
    return [];
  }
}

function writeLocalHistory(history: ToolHistoryEntry[]) {
  try {
    window.localStorage.setItem(TOOL_HISTORY_LOCAL_KEY, JSON.stringify(history));
  } catch {
    // History is a convenience only.
  }
}

function mergeUniqueEntries(primary: ToolHistoryEntry[], secondary: ToolHistoryEntry[]) {
  const seen = new Set<string>();
  return [...primary, ...secondary].filter((entry) => {
    const key = entry.id || `${entry.toolPath}:${entry.eventType}:${entry.createdAt}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, HISTORY_LIMIT);
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function ToolScopedHistoryPanel() {
  const pathname = usePathname() || '';
  const { status } = useSession();
  const [history, setHistory] = useState<ToolHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const currentTool = useMemo(() => createToolHistoryEntry(pathname), [pathname]);
  const toolSlug = useMemo(() => getToolHistorySlug(pathname), [pathname]);
  const isSyncEnabled = status === 'authenticated';

  useEffect(() => {
    if (!currentTool || toolSlug === 'all') return;

    let isMounted = true;
    const localHistory = filterToolHistoryForPath(readLocalHistory(), pathname).slice(0, HISTORY_LIMIT);
    setHistory(localHistory);
    setError('');

    const loadSyncedHistory = async () => {
      if (!isSyncEnabled) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/tool-history?toolPath=${encodeURIComponent(pathname)}&limit=${HISTORY_LIMIT}`, {
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('Unable to load synced tool history.');
        const payload = await response.json();
        const syncedHistory = Array.isArray(payload.history) ? payload.history as ToolHistoryEntry[] : [];
        if (isMounted) {
          setHistory(mergeUniqueEntries(syncedHistory, localHistory));
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load synced tool history.');
          setHistory(localHistory);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadSyncedHistory();

    return () => {
      isMounted = false;
    };
  }, [currentTool, isSyncEnabled, pathname, toolSlug]);

  if (!currentTool || toolSlug === 'all') return null;

  const clearThisToolHistory = async () => {
    const nextLocalHistory = readLocalHistory().filter((entry) => entry.toolSlug !== toolSlug);
    writeLocalHistory(nextLocalHistory);
    setHistory([]);

    if (isSyncEnabled) {
      await fetch(`/api/tool-history?toolPath=${encodeURIComponent(pathname)}`, {
        method: 'DELETE',
      }).catch(() => undefined);
    }
  };

  return (
    <section className="w-full px-4 py-3 sm:px-6">
      <div className="mx-auto max-w-[1600px] rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              This tool history
            </p>
            <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-950">
              Recent {currentTool.toolName} sessions
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Only visits for this tool are shown. Pasted content, tokens, request bodies, and logs are not stored here.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isSyncEnabled && (
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: pathname })}
                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
              >
                Sync this tool
              </button>
            )}
            {history.length > 0 && (
              <button
                type="button"
                onClick={clearThisToolHistory}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Clear this tool
              </button>
            )}
          </div>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              Loading this tool history...
            </div>
          ) : history.length === 0 ? (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              <ClockIcon className="h-4 w-4" />
              No previous sessions for this tool yet.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {history.map((entry) => (
                <div
                  key={`${entry.id || entry.createdAt}-${entry.toolPath}`}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-slate-900">{entry.toolName}</span>
                    <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                      {entry.eventType}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-slate-500">{formatTime(entry.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
          {error && (
            <p className="mt-3 text-xs text-amber-700">
              Showing local history. {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
