'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  createToolHistoryEntry,
  mergeToolHistory,
  TOOL_HISTORY_LOCAL_KEY,
  type ToolHistoryEntry,
} from '@/lib/tool-history';

function readLocalHistory() {
  try {
    const storedHistory = window.localStorage.getItem(TOOL_HISTORY_LOCAL_KEY);
    if (!storedHistory) return [];
    const parsedHistory = JSON.parse(storedHistory);
    return Array.isArray(parsedHistory) ? parsedHistory as ToolHistoryEntry[] : [];
  } catch {
    return [];
  }
}

function writeLocalHistory(history: ToolHistoryEntry[]) {
  try {
    window.localStorage.setItem(TOOL_HISTORY_LOCAL_KEY, JSON.stringify(history));
  } catch {
    // History is helpful, never required.
  }
}

export default function ToolHistoryRecorder() {
  const pathname = usePathname() || '';
  const { status } = useSession();

  useEffect(() => {
    const historyEntry = createToolHistoryEntry(pathname);
    if (!historyEntry) return;

    const storageKey = `${historyEntry.toolPath}:${historyEntry.eventType}`;
    if (window.sessionStorage.getItem('debugtools_last_tool_history') === storageKey) {
      return;
    }
    window.sessionStorage.setItem('debugtools_last_tool_history', storageKey);

    writeLocalHistory(mergeToolHistory(readLocalHistory(), historyEntry));

    if (status !== 'authenticated') return;

    fetch('/api/tool-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(historyEntry),
      keepalive: true,
    }).catch(() => {
      // Local history still keeps the experience usable if cloud sync is unavailable.
    });
  }, [pathname, status]);

  return null;
}
