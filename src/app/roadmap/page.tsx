'use client';

import Link from 'next/link';
import Navigation from '../components/Navigation';
import { liveTools, proposedTools } from '../tools/lib/tool-registry';

const shippedItems = [
  {
    title: 'Logs & Errors pillar',
    description: 'Stack Trace Explainer and Log Trace Rebuilder are implemented as local-first debugging workflows with parsing, highlighted evidence, root-cause hints, and fix checklists.',
    scope: 'stack-trace, log-trace',
  },
  {
    title: 'API / Network pillar',
    description: 'API Workbench and HAR Analyzer / HTTP Profiler are live, while smaller URL and HTTP status utilities stay available as SEO entry tools.',
    scope: 'api, http-profiler, url, http-status',
  },
  {
    title: 'Auth / Security pillar',
    description: 'Security Headers and JWT Decoder are live local tools for hardening response headers and inspecting token claims.',
    scope: 'security-headers, jwt',
  },
  {
    title: 'DevOps / Observability pillar',
    description: 'CI / GitHub Actions Debugger, Kubernetes Debug Helper, and OpenTelemetry Trace Viewer are implemented as lightweight paste/upload analyzers.',
    scope: 'ci-debugger, k8s-debug, otel-trace-viewer',
  },
  {
    title: 'SEO entry utilities',
    description: 'JSON, Base64, Hash, UUID, Timestamp, Regex, Code Diff, Build Diff, HTML, CSS, Markdown, Color, Icons, and Database tools remain available but no longer define the product edge.',
    scope: 'utility routes',
  },
  {
    title: 'Tool catalog route',
    description: '`/tools/all` lists the live registry and links to implemented tool routes. It is a catalog, not a standalone tool.',
    scope: 'tools/all',
  },
];

const betaItems = [
  {
    title: 'Security Headers + CORS polish',
    description: 'Security Headers is live, but the route should add deeper CORS-specific diagnosis for preflight failures, credentialed requests, wildcard origins, and cache behavior.',
    scope: 'tools/security-headers',
  },
  {
    title: 'API Workbench',
    description: 'REST requests, tabs, headers, auth helpers, environments, history, local collections, imports, API documentation generation, AI context export, safer cURL reproduction, private-mode cleanup, and optional authenticated collection sync are live. Cloud rename/update polish is still needed.',
    scope: 'tools/api',
  },
  {
    title: 'Bundle Analyzer',
    description: 'Parses pasted module-size lines and produces a summary, top modules, copy, and download output. It does not yet ingest native webpack stats JSON or analyzer HTML directly.',
    scope: 'tools/bundle-analyzer',
  },
  {
    title: 'React Native startup profiling',
    description: 'Parses `[Performance] Name: 123ms` style logs into phase totals and a simple timeline. Broader log formats and imported trace support are not implemented yet.',
    scope: 'tools/startup-profiling',
  },
];

const nextItems = [
  {
    title: 'Workspace and team foundation',
    description: 'Define the organization, workspace, member, role, project, collection, and debug-report model before adding team controls to the API Workbench.',
    scope: 'workspace / teams',
  },
  {
    title: 'Deepen implemented analyzers',
    description: 'The P0/P1/P2 routes now exist. Next work is improving parsers with richer imports, examples, exports, and route-specific test fixtures.',
    scope: 'debug routes',
  },
  {
    title: 'Shared logic extraction',
    description: 'Continue moving reusable parsing and transform logic out of client pages so browser tools, tests, exports, and a future CLI can share implementations.',
    scope: 'tools/lib + src/lib/tools',
  },
  {
    title: 'Route-level smoke coverage',
    description: 'Add focused tests for the catalog and high-risk tools so registry claims, route counts, samples, exports, and mobile layouts stay aligned with routed code.',
    scope: 'tool tests',
  },
  {
    title: 'CLI foundation',
    description: 'Start with pipe-friendly commands for tools that already have shared or easily extractable logic: JSON, JWT, Base64, hash, regex, URL, diff, and HTTP status.',
    scope: 'CLI_ROADMAP.md',
  },
];

const futureDebugTools = [
  {
    priority: 'P0',
    title: 'SAML / OIDC Debugger',
    route: '/tools/saml-oidc-debugger',
    description: 'Decode auth redirects, SAML responses, OIDC discovery, claims, scopes, callback URLs, nonce/state issues, and common identity-provider failures.',
  },
  {
    priority: 'P0',
    title: 'Certificate Chain Viewer',
    route: '/tools/certificate-viewer',
    description: 'Inspect pasted PEM certificates, chains, issuers, subjects, SANs, expiry, fingerprints, and validation warnings.',
  },
  {
    priority: 'P0',
    title: 'Android Logcat Analyzer',
    route: '/tools/android-logcat',
    description: 'Analyze Logcat, fatal exceptions, ANRs, process IDs, package names, device info, and root-cause candidates.',
  },
  {
    priority: 'P1',
    title: 'React Native Debug Pack',
    route: '/tools/react-native-debug',
    description: 'Combine Metro logs, Hermes errors, React Native stack traces, network notes, startup markers, and Flipper-alternative guidance.',
  },
  {
    priority: 'P1',
    title: 'Mobile Network Debug Checklist',
    route: '/tools/mobile-network-debug',
    description: 'Generate setup steps for Charles, Proxyman, HTTP Toolkit, Requestly, Android Network Inspector, Chucker, OkHttp logging, and device proxy debugging.',
  },
  {
    priority: 'P1',
    title: 'API Auth Config Tester',
    route: '/tools/api-auth-config',
    description: 'Generate and test API auth headers, tokens, sample credentials, request signing inputs, and endpoint-specific auth fixtures.',
  },
  {
    priority: 'P1',
    title: 'OAuth Token Inspector',
    route: '/tools/oauth-token-inspector',
    description: 'Inspect access tokens, refresh-token notes, scopes, audiences, expiry, issuer mismatch, and common OAuth flow failures.',
  },
  {
    priority: 'P1',
    title: 'WebSocket Debugger',
    route: '/tools/websocket-debug',
    description: 'Inspect WebSocket connection notes, close codes, handshake headers, message samples, auth failures, and reconnect loops.',
  },
  {
    priority: 'P1',
    title: 'Redirect Inspector',
    route: '/tools/redirect-inspector',
    description: 'Analyze redirect chains, status codes, canonical loops, HTTPS upgrades, auth callbacks, and cache-control mistakes.',
  },
  {
    priority: 'P1',
    title: 'Cookie Security Inspector',
    route: '/tools/cookie-security',
    description: 'Inspect Set-Cookie headers for SameSite, Secure, HttpOnly, domain/path scope, expiry, partitioning, and auth-session risks.',
  },
  {
    priority: 'P1',
    title: 'CSP Parser',
    route: '/tools/csp-parser',
    description: 'Parse Content Security Policy headers, flag unsafe directives, explain blocked-resource reports, and suggest tighter policies.',
  },
  {
    priority: 'P1',
    title: 'Secret Scanner',
    route: '/tools/secret-scanner',
    description: 'Scan pasted logs, env snippets, and config files for likely tokens, keys, credentials, and redaction gaps.',
  },
  {
    priority: 'P1',
    title: 'Schema Validator',
    route: '/tools/schema-validator',
    description: 'Validate JSON payloads against schemas, explain mismatches, and produce API-contract debugging reports.',
  },
  {
    priority: 'P1',
    title: 'SQL Explain',
    route: '/tools/sql-explain',
    description: 'Explain pasted query plans, indexes, joins, scans, and likely performance bottlenecks.',
  },
  {
    priority: 'P1',
    title: 'SQL Flow',
    route: '/tools/sql-flow',
    description: 'Turn SQL statements and logs into execution flow, dependency, lock, and migration-risk notes.',
  },
  {
    priority: 'P2',
    title: 'Flamegraph Viewer',
    route: '/tools/flamegraph-viewer',
    description: 'View folded stacks or sampled profiles, identify hot paths, and produce performance-debugging notes.',
  },
  {
    priority: 'P2',
    title: 'Perfetto Summary',
    route: '/tools/perfetto-summary',
    description: 'Summarize Perfetto trace exports into timeline highlights, slow sections, thread activity, and next checks.',
  },
  {
    priority: 'P2',
    title: 'Heap / Memory Event Visualizer',
    route: '/tools/heap-visualizer',
    description: 'Visualize allocation/free event logs, heap growth, suspicious leaks, and memory lifecycle patterns.',
  },
  {
    priority: 'P2',
    title: 'Node Performance Analyzer',
    route: '/tools/node-performance',
    description: 'Analyze Node.js timing, event-loop, memory, CPU, and async bottleneck evidence from pasted profiler output.',
  },
  {
    priority: 'P2',
    title: 'Python Profiler',
    route: '/tools/python-profiler',
    description: 'Summarize sampling profiler output, hot frames, blocking calls, and CPython stack snapshots.',
  },
  {
    priority: 'P2',
    title: 'Java Thread Dump',
    route: '/tools/java-thread-dump',
    description: 'Parse Java thread dumps for blocked threads, deadlock clues, hot stacks, thread states, and next JVM checks.',
  },
  {
    priority: 'P2',
    title: 'JVM GC Log',
    route: '/tools/jvm-gc-log',
    description: 'Analyze GC logs for pause spikes, allocation pressure, heap tuning clues, and memory-regression evidence.',
  },
  {
    priority: 'P2',
    title: 'Native Debug Session',
    route: '/tools/native-debug-session',
    description: 'Parse GDB or LLDB transcripts into breakpoints, signals, frames, variables, commands, and next actions.',
  },
  {
    priority: 'P2',
    title: 'Binary Inspector',
    route: '/tools/binary-inspector',
    description: 'Inspect pasted hex or Base64 bytes, detect magic numbers, convert endian values, and surface file signatures.',
  },
];

const researchSources = [
  {
    title: 'GitHub debugging-tools topic',
    url: 'https://github.com/topics/debugging-tools',
    description: 'Open-source debugging utilities such as HTTP troubleshooters, GDB frontends, profilers, dump formatters, debug containers, and trace tools.',
  },
  {
    title: 'GitHub observability topic',
    url: 'https://github.com/topics/observability',
    description: 'Monitoring, logs, metrics, traces, OpenTelemetry, Prometheus, Grafana, APM, and production diagnosis signals.',
  },
  {
    title: 'debugtools.dev',
    url: 'https://debugtools.dev/',
    description: 'Adjacent tool hub with API debugging, certificate inspection, Base64, sample-data utilities, and hidden/upcoming validators.',
  },
  {
    title: 'DebugTools IntelliJ plugin',
    url: 'https://debug-tools.cc/en/',
    description: 'Java-focused debugging ideas including hot reload, hot deploy, quick Java method calls, Groovy scripts, SQL timing, and URL-to-method lookup.',
  },
];

const proposedBacklogItems = proposedTools.map((tool) => ({
  title: tool.name,
  description: tool.description,
  scope: `${tool.pillar} / ${tool.category}`,
}));

function statusClass(status: string) {
  if (status === 'shipped') return 'border-[#1a7f37] bg-[#dafbe1] text-[#1a7f37]';
  if (status === 'beta') return 'border-[#bf8700] bg-[#fff8c5] text-[#7d4e00]';
  if (status === 'next') return 'border-[#2563eb] bg-[#ddf4ff] text-[#2563eb]';
  return 'border-[#e4e4e7] bg-[#fafafa] text-[#71717a]';
}

function RoadmapSection({
  title,
  status,
  items,
}: {
  title: string;
  status: 'shipped' | 'beta' | 'next' | 'backlog';
  items: Array<{ title: string; description: string; scope: string }>;
}) {
  return (
    <section className="border-t border-[#e4e4e7]">
      <div className="border-b border-[#e4e4e7] bg-[#fafafa] px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[#09090b]">{title}</h2>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(status)}`}>
            {status}
          </span>
        </div>
      </div>
      <div className="divide-y divide-[#e4e4e7]">
        {items.map((item) => (
          <article key={`${status}-${item.title}`} className="grid gap-3 p-5 md:grid-cols-[180px_1fr] md:items-start">
            <div className="font-mono text-xs text-[#71717a]">{item.scope}</div>
            <div>
              <h3 className="text-base font-semibold text-[#2563eb]">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-[#71717a]">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CurrentToolsSection() {
  return (
    <section className="border-t border-[#e4e4e7]">
      <div className="border-b border-[#e4e4e7] bg-[#fafafa] px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[#09090b]">Current tool routes</h2>
          <span className="rounded-full border border-[#1a7f37] bg-[#dafbe1] px-2.5 py-1 text-xs font-semibold text-[#1a7f37]">
            live
          </span>
        </div>
      </div>
      <div className="grid gap-2 p-4 md:grid-cols-2 xl:grid-cols-3">
        {liveTools.map((tool) => (
          // Shipped tools are linked, not printed as text. This list was the only
          // place all 56 appeared, and none of them were reachable from it.
          <article key={tool.path} className="rounded-md border border-[#e4e4e7] bg-white p-3 transition-colors hover:border-[#2563eb]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[#2563eb]">
                  <Link href={tool.path} className="hover:underline">
                    {tool.name}
                  </Link>
                </h3>
                <p className="mt-1 font-mono text-xs text-[#71717a]">{tool.path}</p>
              </div>
              <span className="rounded-full border border-[#e4e4e7] bg-[#fafafa] px-2 py-0.5 text-[11px] font-semibold text-[#71717a]">
                {tool.maturity}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#71717a]">{tool.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FutureToolsSection() {
  const groupedTools = ['P0', 'P1', 'P2'].map((priority) => ({
    priority,
    tools: futureDebugTools.filter((tool) => tool.priority === priority),
  })).filter((group) => group.tools.length > 0);

  return (
    <section className="border-t border-[#e4e4e7]">
      <div className="border-b border-[#e4e4e7] bg-[#fafafa] px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[#09090b]">Implemented roadmap routes</h2>
          <span className="rounded-full border border-[#2563eb] bg-[#ddf4ff] px-2.5 py-1 text-xs font-semibold text-[#2563eb]">
            {futureDebugTools.length} live
          </span>
        </div>
      </div>
      <div className="divide-y divide-[#e4e4e7]">
        {groupedTools.map((group) => (
          <div key={group.priority} className="grid gap-3 p-5 lg:grid-cols-[88px_1fr]">
            <div>
              <span className="inline-flex rounded-full border border-[#e4e4e7] bg-[#fafafa] px-2.5 py-1 font-mono text-xs font-semibold text-[#71717a]">
                {group.priority}
              </span>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {group.tools.map((tool) => (
                <article key={tool.route} className="rounded-md border border-[#e4e4e7] bg-white p-3">
                  <h3 className="text-sm font-semibold text-[#2563eb]">{tool.title}</h3>
                  <p className="mt-1 font-mono text-xs text-[#71717a]">{tool.route}</p>
                  <p className="mt-2 text-xs leading-5 text-[#71717a]">{tool.description}</p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ResearchSourcesSection() {
  return (
    <section className="border-t border-[#e4e4e7]">
      <div className="border-b border-[#e4e4e7] bg-[#fafafa] px-5 py-3">
        <h2 className="text-sm font-semibold text-[#09090b]">Research sources</h2>
      </div>
      <div className="grid gap-2 p-4 md:grid-cols-2">
        {researchSources.map((source) => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-[#e4e4e7] bg-white p-3 transition-colors hover:border-[#2563eb] hover:bg-[#fafafa]"
          >
            <h3 className="text-sm font-semibold text-[#2563eb]">{source.title}</h3>
            <p className="mt-2 text-xs leading-5 text-[#71717a]">{source.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

export default function RoadmapPage() {
  const stableToolCount = liveTools.filter((tool) => tool.maturity === 'Stable').length;
  const betaToolCount = liveTools.filter((tool) => tool.maturity !== 'Stable').length;

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#09090b]">
      <Navigation />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-md border border-[#e4e4e7] bg-white">
          <div className="border-b border-[#e4e4e7] px-5 py-4">
            <p className="font-mono text-xs text-[#71717a]">ROADMAP.md</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#09090b]">DebugTools roadmap</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#71717a]">
              This roadmap keeps utility tools as SEO entry points while prioritizing debugging workflows for logs, traces, APIs, auth, CI, mobile, Kubernetes, and production incidents. The live registry has {liveTools.length} implemented tool routes: {stableToolCount} stable local tools and {betaToolCount} beta or experimental tools that work but need polish.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="https://github.com/jasimvkarim/mydebugtools/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-[#1f883d] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1a7f37] hover:text-white"
              >
                Open a GitHub issue
              </a>
              <a
                href="https://github.com/jasimvkarim/mydebugtools/blob/main/CLI_ROADMAP.md"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm font-semibold text-[#09090b] hover:bg-[#fafafa] hover:text-[#09090b]"
              >
                CLI roadmap
              </a>
            </div>
          </div>

          <CurrentToolsSection />
          <FutureToolsSection />
          <ResearchSourcesSection />
          <RoadmapSection title="Shipped in the codebase" status="shipped" items={shippedItems} />
          <RoadmapSection title="Beta or needs polish" status="beta" items={betaItems} />
          <RoadmapSection title="Next work" status="next" items={nextItems} />
          <RoadmapSection title="Backlog proposals" status="backlog" items={proposedBacklogItems} />
        </div>
      </section>
    </main>
  );
}
