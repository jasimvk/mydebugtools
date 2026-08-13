'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import {
  publicTools,
  type ToolModule,
} from '../lib/tool-registry';

const requestFeatureUrl =
  'https://github.com/jasimvkarim/mydebugtools/issues/new?title=Feature%20request%3A%20&labels=enhancement';

function matches(tool: ToolModule, q: string) {
  if (!q) return true;
  const haystack = [tool.name, tool.description, tool.category, tool.pillar].join(' ').toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

function ToolCard({ tool }: { tool: ToolModule }) {
  const Icon = tool.icon;

  return (
    <Link
      href={tool.path}
      className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card-bg p-4 transition-all duration-200 hover:border-zinc-300 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-surface text-muted transition-colors group-hover:border-zinc-300 group-hover:text-foreground">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium tracking-tight text-foreground">{tool.name}</span>
          <span className="mt-1 line-clamp-2 block text-[13px] leading-5 text-muted">{tool.description}</span>
        </span>
      </div>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {[tool.maturity, tool.privacy].map((label) => (
          <span key={label} className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
            {label}
          </span>
        ))}
      </div>
    </Link>
  );
}

export default function AllToolsPage() {
  const [query, setQuery] = useState('');
  const [pillar, setPillar] = useState<string>('All');

  const pillars = useMemo(() => {
    const set = new Set(publicTools.map((t) => t.pillar));
    return ['All', ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    // Registry order already puts the flagships first, then groups by pillar and
    // priority. Re-sorting on `priority` alone interleaved the pillars, because
    // priorities only make sense within one.
    return publicTools
      .filter((t) => (pillar === 'All' ? true : t.pillar === pillar))
      .filter((t) => matches(t, query));
  }, [query, pillar]);

  return (
    <div className="mx-auto max-w-[1600px]">
      <section id="utilities" className="flex flex-col gap-5">
        {/* Heading */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-muted">Utilities</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">All developer tools</h1>
            <p className="mt-1 text-sm text-muted">Every shipped tool, across logs, API, auth, performance, and everyday utilities.</p>
          </div>
          <a
            href={requestFeatureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-sm font-medium text-accent hover:text-accent-hover"
          >
            Request a tool →
          </a>
        </div>

        {/* Controls: search + pillar filters */}
        <div className="flex flex-col gap-3">
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">Search tools</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools…"
              className="h-11 w-full rounded-lg border border-border bg-card-bg pl-10 pr-10 text-sm text-foreground outline-none transition placeholder:text-zinc-400 focus:border-accent focus:ring-4 focus:ring-accent/10"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-zinc-400 hover:bg-surface hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </label>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {pillars.map((p) => {
              const active = pillar === p;
              return (
                <button
                  key={p}
                  onClick={() => setPillar(p)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'border-foreground bg-foreground text-white'
                      : 'border-border bg-card-bg text-muted hover:border-zinc-300 hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Count */}
        <p className="text-sm text-muted" aria-live="polite">
          <span className="font-medium text-foreground">{filtered.length}</span> {filtered.length === 1 ? 'tool' : 'tools'}
          {query && <> matching “{query}”</>}
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((tool) => (
              <ToolCard key={tool.path} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface p-10 text-center">
            <p className="text-sm font-medium text-foreground">No tools found</p>
            <p className="mt-1 text-sm text-muted">Try a different search or filter.</p>
            <button
              onClick={() => {
                setQuery('');
                setPillar('All');
              }}
              className="mt-4 inline-flex rounded-lg border border-border bg-card-bg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-zinc-300 hover:bg-card-bg"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
