'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Github, Search, X } from 'lucide-react';
import SiteHeader from './components/SiteHeader';
import {
  publicTools,
  type ToolModule,
} from './tools/lib/tool-registry';

const repoUrl = 'https://github.com/jasimvkarim/mydebugtools';
const requestFeatureUrl =
  'https://github.com/jasimvkarim/mydebugtools/issues/new?title=Feature%20request%3A%20&labels=enhancement';

const footerLinks = [
  { label: 'GitHub', href: repoUrl },
  { label: 'Changelog', href: '/changelog' },
  { label: 'Roadmap', href: '/roadmap' },
  { label: 'Contribute', href: '/contributing' },
];

const routeHints = [
  { terms: ['api', 'request', 'rest', 'endpoint', 'curl', 'postman', 'http client'], path: '/tools/api' },
  { terms: ['json', 'payload', 'object', 'format'], path: '/tools/json' },
  { terms: ['jwt', 'token', 'bearer', 'claims'], path: '/tools/jwt' },
  { terms: ['base64', 'decode base64', 'encode base64'], path: '/tools/base64' },
  { terms: ['hash', 'sha', 'sha256', 'checksum'], path: '/tools/hash' },
  { terms: ['url', 'encode url', 'decode url', 'query string'], path: '/tools/url' },
  { terms: ['regex', 'regexp', 'pattern'], path: '/tools/regex' },
  { terms: ['html', 'preview', 'page'], path: '/tools/html' },
  { terms: ['sqlite', 'sql', 'database', 'query'], path: '/tools/database' },
  { terms: ['uuid', 'guid'], path: '/tools/uuid' },
  { terms: ['time', 'timestamp', 'unix', 'date'], path: '/tools/timestamp' },
  { terms: ['http', 'status', '404', '401', '500'], path: '/tools/http-status' },
];

function scoreTool(tool: ToolModule, query: string) {
  const haystack = [tool.name, tool.description, tool.category, tool.pillar, tool.path].join(' ').toLowerCase();
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);

  return words.reduce((score, word) => {
    if (tool.name.toLowerCase().includes(word)) return score + 5;
    if (tool.path.toLowerCase().includes(word)) return score + 4;
    if (tool.category.toLowerCase().includes(word)) return score + 3;
    if (haystack.includes(word)) return score + 1;
    return score;
  }, 0);
}

function pickRoute(query: string) {
  const value = query.trim().toLowerCase();
  if (!value) return '/tools/api';

  const directHint = routeHints.find((hint) => hint.terms.some((term) => value.includes(term)));
  if (directHint) return directHint.path;

  const ranked = publicTools
    .map((tool) => ({ tool, score: scoreTool(tool, value) }))
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.score > 0 ? ranked[0].tool.path : '/tools/all';
}

function ToolCard({ tool }: { tool: ToolModule }) {
  const Icon = tool.icon;

  return (
    <Link
      href={tool.path}
      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card-bg p-5 transition-all duration-200 hover:border-zinc-300 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]"
    >
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted transition-colors group-hover:border-zinc-300 group-hover:text-foreground">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <ArrowRight className="h-4 w-4 -translate-x-1 text-zinc-300 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:text-foreground group-hover:opacity-100" />
      </div>
      <div>
        <span className="block text-sm font-medium tracking-tight text-foreground">{tool.name}</span>
        <span className="mt-1 line-clamp-2 block text-[13px] leading-5 text-muted">{tool.description}</span>
      </div>
    </Link>
  );
}

const pillarOptions = ['All', ...Array.from(new Set(publicTools.map((t) => t.pillar)))];

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [pillar, setPillar] = useState('All');
  const normalizedQuery = query.trim().toLowerCase();

  const visibleTools = useMemo(() => {
    return publicTools
      .filter((tool) => (pillar === 'All' ? true : tool.pillar === pillar))
      .filter((tool) => !normalizedQuery || scoreTool(tool, normalizedQuery) > 0)
      // Unqueried, keep registry order (flagships first, then pillar/priority):
      // `priority` is only meaningful within a pillar, so sorting on it alone
      // interleaved them once the full catalog became visible here.
      .sort((a, b) =>
        normalizedQuery ? scoreTool(b, normalizedQuery) - scoreTool(a, normalizedQuery) : 0
      );
  }, [normalizedQuery, pillar]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(pickRoute(query));
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pt-20 pb-12 text-center sm:px-6 sm:pt-28">
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-zinc-300 hover:text-foreground"
        >
          <Github className="h-3.5 w-3.5" />
          Open source · MIT licensed
        </a>

        <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
          Every debugging tool,
          <br className="hidden sm:block" /> one search away.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-balance text-base leading-7 text-muted sm:text-lg">
          Most tool sites solve one small task. DebugTools covers the whole
          workflow — stack traces, logs, traces, HAR files, CI runs and the
          everyday JSON/JWT/Base64 utilities. Runs in your browser, no account.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto mt-8 w-full max-w-xl">
          <label className="relative block">
            <span className="sr-only">Search DebugTools</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tools — JSON, JWT, Base64, cURL…"
              className="h-14 w-full rounded-xl border border-border bg-card-bg pl-11 pr-24 text-[15px] text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-zinc-400 focus:border-accent focus:ring-4 focus:ring-accent/10"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-[52px] top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-zinc-400 hover:bg-surface hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg bg-primary text-white transition-colors hover:bg-primary-hover"
              aria-label="Open best matching tool"
            >
              <ArrowRight className="h-[18px] w-[18px]" />
            </button>
          </label>
        </form>
      </section>

      {/* Tools */}
      <section id="tools" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="mb-4 flex items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {normalizedQuery ? `${visibleTools.length} matching tools` : 'All tools'}
            </h2>
            {/* "local-first" is not true of every tool — API Workbench and the
                AI assistant make network calls — so the count is stated plainly. */}
            <p className="mt-0.5 text-sm text-muted">
              {visibleTools.length} developer {visibleTools.length === 1 ? 'tool' : 'tools'}
            </p>
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

        {/* Pillar filters */}
        <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1">
          {pillarOptions.map((p) => {
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

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTools.map((tool) => (
            <ToolCard key={tool.path} tool={tool} />
          ))}
        </div>

        {visibleTools.length === 0 && (
          <div className="rounded-xl border border-border bg-surface p-10 text-center">
            <p className="text-sm font-medium text-foreground">No tools found</p>
            <p className="mt-1 text-sm text-muted">Try API, JSON, JWT, Base64, Hash, URL, Regex, SQLite, or time.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {(query || pillar !== 'All') && (
                <button
                  onClick={() => {
                    setQuery('');
                    setPillar('All');
                  }}
                  className="inline-flex rounded-lg border border-border bg-card-bg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-zinc-300"
                >
                  Clear filters
                </button>
              )}
              <a
                href={requestFeatureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover hover:text-white"
              >
                Request this tool
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>MIT licensed · Built for fast debugging.</span>
          <div className="flex flex-wrap gap-5">
            {footerLinks.map((link) =>
              link.href.startsWith('/') ? (
                <Link key={link.label} href={link.href} className="font-medium text-muted transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium text-muted transition-colors hover:text-foreground">
                  <Github className="h-3.5 w-3.5" />
                  {link.label}
                </a>
              ),
            )}
          </div>
        </div>
      </footer>
    </main>
  );
}
