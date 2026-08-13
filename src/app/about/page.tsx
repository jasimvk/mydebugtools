'use client';

import Link from 'next/link';
import Navigation from '../components/Navigation';
import { Github, Terminal } from 'lucide-react';

const values = [
  'Keep debugging tools fast and predictable.',
  'Prefer local processing for sensitive developer data.',
  'Make every feature easy to inspect, report, and improve.',
  'Use plain interfaces that feel familiar to engineers.',
];

export default function About() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-[#09090b]">
      <Navigation />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-md border border-[#e4e4e7] bg-white">
          <div className="border-b border-[#e4e4e7] px-5 py-4">
            <p className="font-mono text-xs text-[#71717a]">README.md</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#09090b]">About debugtools</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#71717a]">
              debugtools is an open-source collection of browser-based utilities for API testing, data formatting, token inspection, code comparison, and day-to-day debugging.
            </p>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
            <div className="p-5">
              <h2 className="text-lg font-semibold text-[#09090b]">Project goals</h2>
              <ul className="mt-4 space-y-3">
                {values.map((value) => (
                  <li key={value} className="flex gap-3 text-sm leading-6 text-[#71717a]">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#1f883d]" />
                    {value}
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-md border border-[#e4e4e7] bg-[#fafafa] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#09090b]">
                  <Terminal className="h-4 w-4" />
                  Built for contributors
                </div>
                <p className="mt-2 text-sm leading-6 text-[#71717a]">
                  The public site now presents the project like a maintained OSS repo: clear module entry points, issue links, roadmap visibility, and repository actions close to the workflows.
                </p>
              </div>
            </div>

            <aside className="border-t border-[#e4e4e7] bg-[#fafafa] p-5 lg:border-l lg:border-t-0">
              <h2 className="text-sm font-semibold text-[#09090b]">Repository</h2>
              <div className="mt-4 grid gap-2">
                <a
                  href="https://github.com/jasimvkarim/mydebugtools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-[#09090b] px-3 py-2 text-sm font-semibold text-white hover:bg-[#32383f] hover:text-white"
                >
                  <Github className="h-4 w-4" />
                  View on GitHub
                </a>
                <a href="https://github.com/jasimvkarim/mydebugtools/issues" target="_blank" rel="noopener noreferrer" className="rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm font-semibold text-[#09090b] hover:bg-[#fafafa] hover:text-[#09090b]">
                  Issues
                </a>
                <a href="https://github.com/jasimvkarim/mydebugtools/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm font-semibold text-[#09090b] hover:bg-[#fafafa] hover:text-[#09090b]">
                  MIT License
                </a>
                <Link href="/roadmap" className="rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm font-semibold text-[#09090b] hover:bg-[#fafafa] hover:text-[#09090b]">
                  Roadmap
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
