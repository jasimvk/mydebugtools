'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClipboardIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { bytesToHex } from '@/app/tools/lib/simple-tools';

const algorithms = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;

export default function HashGeneratorPage() {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState<(typeof algorithms)[number]>('SHA-256');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const byteCount = useMemo(() => new Blob([input]).size, [input]);

  // Hash reactively. This used to be a manual "Generate" button that left the
  // previous digest on screen after the input or algorithm changed, so the user
  // could copy a hash that did not match the text in the box.
  useEffect(() => {
    let cancelled = false;

    if (!input) {
      setOutput('');
      setError('');
      return;
    }

    crypto.subtle
      .digest(algorithm, new TextEncoder().encode(input))
      .then((digest) => {
        if (cancelled) return;
        setOutput(bytesToHex(new Uint8Array(digest)));
        setError('');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Unable to generate hash');
        setOutput('');
      });

    return () => {
      cancelled = true;
    };
  }, [input, algorithm]);

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError('Could not copy to the clipboard. Copy the digest manually.');
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="rounded-md border border-[#e4e4e7] bg-white">
        <div className="border-b border-[#e4e4e7] px-5 py-4">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="h-6 w-6 text-[#2563eb]" />
            <div>
              <h1 className="text-2xl font-semibold text-[#09090b]">Hash Generator</h1>
              <p className="mt-1 text-sm text-[#71717a]">Generate SHA hashes locally in your browser.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#09090b]" htmlFor="hash-input">Input</label>
            <textarea
              id="hash-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="h-72 w-full resize-none rounded-md border border-[#e4e4e7] bg-[#fafafa] p-3 font-mono text-sm text-[#09090b] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
              placeholder="Paste text to hash..."
            />
            <p className="text-xs text-[#71717a]">{byteCount} bytes</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-[#09090b]" htmlFor="hash-algorithm">Algorithm</label>
              <select
                id="hash-algorithm"
                value={algorithm}
                onChange={(event) => setAlgorithm(event.target.value as (typeof algorithms)[number])}
                className="mt-2 w-full rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm text-[#09090b] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
              >
                {algorithms.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#09090b]">Digest</span>
                <button
                  type="button"
                  onClick={copyOutput}
                  disabled={!output}
                  className="inline-flex items-center gap-1 rounded-md border border-[#e4e4e7] px-2 py-1 text-xs font-semibold text-[#71717a] disabled:opacity-50"
                >
                  <ClipboardIcon className="h-4 w-4" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="min-h-28 whitespace-pre-wrap break-all rounded-md border border-[#e4e4e7] bg-[#fafafa] p-3 font-mono text-sm text-[#09090b]">
                {output || 'Digest will appear here.'}
              </pre>
              {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
