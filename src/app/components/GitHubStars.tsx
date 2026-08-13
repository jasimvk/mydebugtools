'use client';

import { useEffect, useState } from 'react';
import { Github, Star } from 'lucide-react';

const REPO = 'jasimvkarim/mydebugtools';
const CACHE_KEY = 'dt_gh_stars';
const TTL_MS = 60 * 60 * 1000; // 1 hour

function formatStars(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

/**
 * GitHub button with a live star count. The count is cached in localStorage for
 * an hour so we don't hit the (unauthenticated) GitHub API rate limit, and the
 * button still works/links if the request fails.
 */
export default function GitHubStars({ className = '' }: { className?: string }) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as { v: number; t: number };
        if (typeof cached.v === 'number' && Date.now() - cached.t < TTL_MS) {
          setStars(cached.v);
          return;
        }
      }
    } catch {
      /* ignore */
    }

    fetch(`https://api.github.com/repos/${REPO}`, { headers: { Accept: 'application/vnd.github+json' } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || typeof data.stargazers_count !== 'number') return;
        setStars(data.stargazers_count);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ v: data.stargazers_count, t: Date.now() }));
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        /* offline / rate-limited — button still links to the repo */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <a
      href={`https://github.com/${REPO}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label="Star DebugTools on GitHub"
    >
      <Github className="h-4 w-4" />
      <span>GitHub</span>
      {stars !== null && (
        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold tabular-nums">
          <Star className="h-3 w-3 fill-current" />
          {formatStars(stars)}
        </span>
      )}
    </a>
  );
}
