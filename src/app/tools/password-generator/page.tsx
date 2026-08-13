'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowPathIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import {
  generatePassword,
  hasUsablePools,
  scorePassword,
  type PasswordOptions,
} from '../lib/password-generator';

const defaultOptions: PasswordOptions = {
  length: 20,
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
  ambiguous: false,
};

export default function PasswordGeneratorPage() {
  const [options, setOptions] = useState(defaultOptions);
  // Generated after mount, not in the state initializer: the initializer also runs
  // during SSR, so the server sent five passwords that the client then replaced
  // with five different ones — a hydration mismatch on every load.
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState('');
  const primaryScore = useMemo(() => scorePassword(passwords[0] || ''), [passwords]);
  const poolsAvailable = hasUsablePools(options);

  const regenerate = useCallback(() => {
    if (!hasUsablePools(options)) {
      setPasswords([]);
      return;
    }
    setPasswords(Array.from({ length: 5 }, () => generatePassword(options)));
  }, [options]);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  const copyPassword = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(password);
      setCopyError('');
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopyError('Could not copy to the clipboard. Select the password and copy it manually.');
    }
  };

  const setLength = (raw: string) => {
    const parsed = Number(raw);
    // An empty field yields Number('') === 0, which used to drive the slider to
    // its minimum while the generator quietly fell back to 16 characters.
    if (!Number.isFinite(parsed)) return;
    updateOption('length', Math.max(8, Math.min(128, Math.round(parsed))));
  };

  const updateOption = <K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) => {
    setOptions((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="mx-auto max-w-7xl">
      <section className="rounded-md border border-[#e4e4e7] bg-white">
        <div className="border-b border-[#e4e4e7] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#71717a]">tools / password-generator</p>
              <h1 className="mt-2 text-2xl font-semibold text-[#09090b]">Password Generator</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#71717a]">
                Generate strong local passwords with length, character class, ambiguity, copy, and strength controls. Nothing leaves the browser.
              </p>
            </div>
            <button type="button" onClick={regenerate} className="inline-flex items-center gap-2 rounded-md bg-[#09090b] px-3 py-2 text-sm font-semibold text-white hover:bg-[#32383f]">
              <ArrowPathIcon className="h-4 w-4" />
              Generate
            </button>
          </div>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-4 rounded-md border border-[#e4e4e7] bg-[#fafafa] p-4">
            <label className="block">
              <span className="text-sm font-semibold text-[#09090b]">Length</span>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={8}
                  max={128}
                  value={options.length}
                  onChange={(event) => setLength(event.target.value)}
                  className="w-full"
                />
                <input
                  type="number"
                  min={8}
                  max={128}
                  value={options.length}
                  onChange={(event) => setLength(event.target.value)}
                  className="w-20 rounded-md border border-[#e4e4e7] bg-white px-2 py-1.5 font-mono text-sm"
                />
              </div>
            </label>
            <div className="grid gap-2">
              <Option label="Lowercase" checked={options.lowercase} onChange={(checked) => updateOption('lowercase', checked)} />
              <Option label="Uppercase" checked={options.uppercase} onChange={(checked) => updateOption('uppercase', checked)} />
              <Option label="Numbers" checked={options.numbers} onChange={(checked) => updateOption('numbers', checked)} />
              <Option label="Symbols" checked={options.symbols} onChange={(checked) => updateOption('symbols', checked)} />
              <Option label="Allow ambiguous characters" checked={options.ambiguous} onChange={(checked) => updateOption('ambiguous', checked)} />
            </div>
            <div className="rounded-md border border-[#e4e4e7] bg-white p-4">
              <div className="font-mono text-3xl font-semibold text-[#09090b]">{primaryScore.score}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#71717a]">{primaryScore.label}</div>
            </div>
          </aside>

          <section className="space-y-3">
            {copyError && <p role="alert" className="text-sm text-red-600">{copyError}</p>}
            {!poolsAvailable ? (
              <p role="alert" className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Select at least one character class to generate a password.
              </p>
            ) : passwords.length === 0 ? (
              <p className="rounded-md border border-[#e4e4e7] bg-white p-4 text-sm text-[#71717a]">
                Generating passwords…
              </p>
            ) : (
              passwords.map((password) => (
                <article key={password} className="rounded-md border border-[#e4e4e7] bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <code className="break-all font-mono text-base font-semibold text-[#09090b]">{password}</code>
                    <button type="button" onClick={() => copyPassword(password)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm font-semibold text-[#09090b] hover:bg-[#fafafa]">
                      <ClipboardDocumentIcon className="h-4 w-4" />
                      {copied === password ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      </section>
    </div>
  );
}

function Option({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm font-medium text-[#09090b]">
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4" />
    </label>
  );
}
