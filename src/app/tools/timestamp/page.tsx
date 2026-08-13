'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClockIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { formatTimestamp } from '@/app/tools/lib/simple-tools';

export default function TimestampConverterPage() {
  const [input, setInput] = useState('1704067200');
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState('');
  const [copyError, setCopyError] = useState('');
  const result = useMemo(() => formatTimestamp(input), [input]);
  const trimmed = input.trim();

  // `local` comes from toLocaleString(), which resolves against the server's
  // timezone during SSR and the browser's on hydration — a guaranteed mismatch
  // for any user not in the server's zone. Render it only after mount.
  const rows: Array<[string, string]> = result
    ? [
        ['ISO 8601', result.iso],
        ...(mounted ? ([['Local', result.local]] as Array<[string, string]>) : []),
        ['UTC', result.utc],
        ['Unix seconds', String(result.unixSeconds)],
        ['Unix milliseconds', String(result.unixMilliseconds)],
      ]
    : [];

  const copyValue = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setCopyError('');
      window.setTimeout(() => setCopied(''), 1500);
    } catch {
      setCopyError('Could not copy to the clipboard. Select the value and copy it manually.');
    }
  };

  useEffect(() => {
    setMounted(true);
    setInput(Math.floor(Date.now() / 1000).toString());
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="rounded-md border border-[#e4e4e7] bg-white">
        <div className="border-b border-[#e4e4e7] px-5 py-4">
          <div className="flex items-center gap-3">
            <ClockIcon className="h-6 w-6 text-[#2563eb]" />
            <div>
              <h1 className="text-2xl font-semibold text-[#09090b]">Timestamp Converter</h1>
              <p className="mt-1 text-sm text-[#71717a]">Convert Unix seconds, milliseconds, and date strings.</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <label htmlFor="timestamp-input" className="text-sm font-semibold text-[#09090b]">Timestamp or date</label>
            <input
              id="timestamp-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="mt-2 w-full rounded-md border border-[#e4e4e7] bg-[#fafafa] px-3 py-2 font-mono text-sm text-[#09090b] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
              placeholder="1704067200, 1704067200000, or 2024-01-01T00:00:00Z"
            />
          </div>

          {copyError && <p role="alert" className="text-sm text-red-600">{copyError}</p>}

          {result ? (
            <div className="overflow-hidden rounded-md border border-[#e4e4e7]">
              {rows.map(([label, value]) => (
                <div key={label} className="grid gap-2 border-b border-[#e4e4e7] p-3 last:border-b-0 sm:grid-cols-[180px_1fr_auto]">
                  <div className="text-sm font-semibold text-[#71717a]">{label}</div>
                  <div className="break-all font-mono text-sm text-[#09090b]">{value}</div>
                  <button
                    type="button"
                    onClick={() => copyValue(label, value)}
                    className="inline-flex items-center gap-1 rounded-md border border-[#e4e4e7] px-2 py-1 text-xs font-semibold text-[#71717a] hover:bg-[#fafafa]"
                  >
                    <ClipboardIcon className="h-4 w-4" />
                    {copied === label ? 'Copied' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          ) : trimmed === '' ? (
            // An empty field is someone about to type, not an error.
            <div className="rounded-md border border-[#e4e4e7] bg-[#fafafa] p-4 text-sm text-[#71717a]">
              Enter a Unix timestamp or date string to convert.
            </div>
          ) : (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Enter a valid Unix timestamp or parseable date string.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
