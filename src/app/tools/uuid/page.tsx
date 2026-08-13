'use client';

import { useEffect, useState } from 'react';
import { ClipboardIcon, PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { generateUuidBatch } from '@/app/tools/lib/simple-tools';

export default function UuidGeneratorPage() {
  const [count, setCount] = useState('5');
  const [uuids, setUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const parsedCount = Number.parseInt(count, 10);
  const safeCount = Number.isFinite(parsedCount) ? Math.max(1, Math.min(parsedCount, 100)) : 5;
  const generate = () => {
    setCount(String(safeCount));
    setUuids(generateUuidBatch(safeCount));
  };

  useEffect(() => {
    setUuids(generateUuidBatch(5));
  }, []);

  const copyAll = async () => {
    await navigator.clipboard.writeText(uuids.join('\n'));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="rounded-md border border-[#e4e4e7] bg-white">
        <div className="border-b border-[#e4e4e7] px-5 py-4">
          <div className="flex items-center gap-3">
            <SparklesIcon className="h-6 w-6 text-[#2563eb]" />
            <div>
              <h1 className="text-2xl font-semibold text-[#09090b]">UUID Generator</h1>
              <p className="mt-1 text-sm text-[#71717a]">Generate RFC 4122 version 4 UUIDs for fixtures, tests, and records.</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div>
              <label htmlFor="uuid-count" className="text-sm font-semibold text-[#09090b]">Count</label>
              <input
                id="uuid-count"
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(event) => setCount(event.target.value)}
                onBlur={() => setCount(String(safeCount))}
                className="mt-2 w-32 rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm text-[#09090b] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
              />
            </div>
            <button
              type="button"
              onClick={generate}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0757b8]"
            >
              <PlusIcon className="h-4 w-4" />
              Generate
            </button>
            <button
              type="button"
              onClick={copyAll}
              disabled={uuids.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#e4e4e7] px-4 py-2 text-sm font-semibold text-[#09090b] hover:bg-[#fafafa]"
            >
              <ClipboardIcon className="h-4 w-4" />
              {copied ? 'Copied' : 'Copy all'}
            </button>
          </div>

          <div className="rounded-md border border-[#e4e4e7] bg-[#fafafa]">
            {uuids.map((uuid) => (
              <div key={uuid} className="border-b border-[#e4e4e7] px-4 py-2 font-mono text-sm text-[#09090b] last:border-b-0">
                {uuid}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
