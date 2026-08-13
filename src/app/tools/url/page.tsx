'use client';

import { useMemo, useState } from 'react';
import { ClipboardIcon } from '@heroicons/react/24/outline';

// Returns null on failure rather than an error string. Returning the sentence
// as the value meant a lone `%` (common in real query strings) put
// "Invalid percent-encoded input" in the output pane — and on the clipboard.
function safeDecode(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export default function UrlToolPage() {
  const [input, setInput] = useState('https://example.com/search?q=hello world&debug=true');
  const [copied, setCopied] = useState('');
  const [copyError, setCopyError] = useState('');

  const encoded = useMemo(() => encodeURIComponent(input), [input]);
  const decoded = useMemo(() => safeDecode(input), [input]);
  const parsed = useMemo(() => {
    try {
      const url = new URL(input);
      return {
        href: url.href,
        protocol: url.protocol,
        host: url.host,
        port: url.port || '(default)',
        pathname: url.pathname,
        search: url.search || '(none)',
        hash: url.hash || '(none)',
      };
    } catch {
      return null;
    }
  }, [input]);

  const queryParams = useMemo(() => {
    try {
      return Array.from(new URL(input).searchParams.entries());
    } catch {
      return null;
    }
  }, [input]);

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setCopyError('');
      setTimeout(() => setCopied(''), 1500);
    } catch {
      setCopyError('Could not copy to the clipboard. Select the text and copy it manually.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl overflow-hidden rounded-md border border-[#e4e4e7] bg-white">
      <div className="border-b border-[#e4e4e7] px-5 py-4">
        <p className="font-mono text-xs text-[#71717a]">tools / url</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#09090b]">URL Encoder and Decoder</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#71717a]">
          Encode URI components, decode percent-encoded values, and inspect URL parts and query parameters.
        </p>
      </div>

      <div className="grid min-w-0 gap-5 p-5 lg:grid-cols-2">
        <section className="min-w-0">
          <label htmlFor="url-input" className="text-sm font-semibold text-[#09090b]">Input</label>
          <textarea
            id="url-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="mt-2 min-h-[260px] w-full max-w-full rounded-md border border-[#e4e4e7] bg-white p-4 font-mono text-sm"
          />
        </section>

        <section className="min-w-0 space-y-3">
          {copyError && <p role="alert" className="text-sm text-red-600">{copyError}</p>}
          {([
            ['Encoded', encoded],
            ['Decoded', decoded],
          ] as const).map(([label, value]) => (
            <div key={label} className="rounded-md border border-[#e4e4e7] bg-[#fafafa] p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-[#09090b]">{label}</h2>
                <button
                  type="button"
                  onClick={() => copy(label, value ?? '')}
                  disabled={value === null}
                  className="inline-flex items-center gap-1 rounded-md border border-[#e4e4e7] bg-white px-2 py-1 text-xs font-semibold disabled:opacity-50"
                >
                  <ClipboardIcon className="h-3.5 w-3.5" />
                  {copied === label ? 'Copied' : 'Copy'}
                </button>
              </div>
              {value === null ? (
                <p role="alert" className="mt-3 text-xs leading-5 text-red-600">
                  Not valid percent-encoded input — check for a stray “%”.
                </p>
              ) : (
                <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-xs leading-5 text-[#71717a]">{value}</pre>
              )}
            </div>
          ))}

          <div className="rounded-md border border-[#e4e4e7] bg-white p-4">
            <h2 className="text-sm font-semibold text-[#09090b]">Parsed URL</h2>
            {parsed ? (
              <>
                <dl className="mt-3 grid gap-2 text-sm">
                  {Object.entries(parsed).map(([key, value]) => (
                    <div key={key} className="grid gap-1 sm:grid-cols-[110px_1fr]">
                      <dt className="font-semibold text-[#71717a]">{key}</dt>
                      <dd className="min-w-0 break-all font-mono text-xs text-[#09090b]">{value}</dd>
                    </div>
                  ))}
                </dl>
                {/* Query params get their own list — they used to be folded into the
                    loop above and rendered as a JSON.stringify'd entries array. */}
                <h3 className="mt-4 text-sm font-semibold text-[#09090b]">Query parameters</h3>
                {queryParams && queryParams.length > 0 ? (
                  <dl className="mt-2 grid gap-2 text-sm">
                    {queryParams.map(([key, value], index) => (
                      <div key={`${key}-${index}`} className="grid gap-1 sm:grid-cols-[110px_1fr]">
                        <dt className="break-all font-mono text-xs font-semibold text-[#71717a]">{key}</dt>
                        <dd className="min-w-0 break-all font-mono text-xs text-[#09090b]">{value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-2 text-xs text-[#71717a]">No query parameters.</p>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm text-[#71717a]">Enter a full URL to inspect protocol, host, path, and query parameters.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
