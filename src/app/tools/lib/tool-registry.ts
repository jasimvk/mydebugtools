import type { ComponentType } from 'react';
import {
  AdjustmentsHorizontalIcon,
  ArrowsRightLeftIcon,
  BeakerIcon,
  BoltIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  ClockIcon,
  CommandLineIcon,
  CubeTransparentIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  KeyIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  SignalIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { CurlyBracesIcon } from 'lucide-react';
import { debugWorkflowConfigs } from './debug-workflow-configs';

export type ToolMaturity = 'Stable' | 'Beta' | 'Experimental';
export type ToolPrivacy = 'Local' | 'Network' | 'Cloud optional';
export type ToolPillarName =
  | 'Logs & Errors'
  | 'API / Network'
  | 'Auth / Security'
  | 'Mobile Debugging'
  | 'DevOps / Observability'
  | 'Performance'
  | 'Dev Utilities';

export type ToolModule = {
  name: string;
  description: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  category: string;
  maturity: ToolMaturity;
  privacy: ToolPrivacy;
  pillar: ToolPillarName;
  priority: number;
  featured?: boolean;
};

export type ProposedTool = {
  name: string;
  category: string;
  description: string;
  pillar: ToolPillarName;
};

export const toolPillars: Array<{
  name: ToolPillarName;
  description: string;
}> = [
  {
    name: 'Logs & Errors',
    description: 'Explain stack traces, logs, crashes, build failures, and repeated error patterns.',
  },
  {
    name: 'API / Network',
    description: 'Inspect APIs, HAR files, WebSockets, redirects, schemas, and network failure evidence.',
  },
  {
    name: 'Auth / Security',
    description: 'Debug tokens, SAML, OIDC, certificates, cookies, CORS, CSP, headers, and secrets.',
  },
  {
    name: 'Mobile Debugging',
    description: 'Analyze Android, React Native, Logcat, device network, startup, and mobile crash clues.',
  },
  {
    name: 'DevOps / Observability',
    description: 'Debug CI, Kubernetes, OpenTelemetry, SQL, JVM, and production incident signals.',
  },
  {
    name: 'Performance',
    description: 'Inspect flamegraphs, traces, heaps, profilers, and runtime performance evidence.',
  },
  {
    name: 'Dev Utilities',
    description: 'Fast generators, converters, formatters, and workbench tools that support daily development.',
  },
];

export const liveTools: ToolModule[] = [
  { name: 'API Workbench', description: 'Flagship REST client with collections, auth, environments, imports, and response inspection.', path: '/tools/api', icon: BeakerIcon, category: 'API', maturity: 'Beta', privacy: 'Network', pillar: 'API / Network', priority: 1, featured: true },
  { name: 'AI Debug Assistant', description: 'Analyze errors, API responses, cURL notes, JSON issues, and stack traces with optional OpenAI BYOK support.', path: '/tools/ai', icon: SparklesIcon, category: 'AI', maturity: 'Beta', privacy: 'Network', pillar: 'Logs & Errors', priority: 1 },
  { name: 'HTTP Status', description: 'Reference HTTP codes and response meanings while debugging requests.', path: '/tools/http-status', icon: GlobeAltIcon, category: 'Network', maturity: 'Stable', privacy: 'Local', pillar: 'API / Network', priority: 2 },
  { name: 'HTTP Traffic Inspector', description: 'Inspect HAR exports for timing, redirects, failures, payload sizes, and slow requests.', path: '/tools/http-profiler', icon: ChartBarIcon, category: 'Network', maturity: 'Beta', privacy: 'Local', pillar: 'API / Network', priority: 3, featured: true },
  { name: 'Fetch Logger', description: 'Live in-page panel that records every fetch request and response — try it live, then drop it into your own app.', path: '/tools/fetch-logger', icon: SignalIcon, category: 'Network', maturity: 'Beta', privacy: 'Local', pillar: 'API / Network', priority: 4, featured: true },
  { name: 'Security Headers Inspector', description: 'Score response headers, missing browser protections, and cookie security flags.', path: '/tools/security-headers', icon: ShieldCheckIcon, category: 'Security', maturity: 'Beta', privacy: 'Local', pillar: 'Auth / Security', priority: 5, featured: true },
  { name: 'JSON Tools', description: 'Format, validate, repair, and inspect JSON payloads without sending data to a server.', path: '/tools/json', icon: CurlyBracesIcon, category: 'Data', maturity: 'Stable', privacy: 'Local', pillar: 'Dev Utilities', priority: 1 },
  { name: 'JWT Decoder', description: 'Decode and inspect JSON Web Token claims during auth debugging.', path: '/tools/jwt', icon: KeyIcon, category: 'Security', maturity: 'Stable', privacy: 'Local', pillar: 'Auth / Security', priority: 2 },
  { name: 'Base64', description: 'Encode and decode Base64 strings and files.', path: '/tools/base64', icon: DocumentCheckIcon, category: 'Data', maturity: 'Stable', privacy: 'Local', pillar: 'Dev Utilities', priority: 2 },
  { name: 'Hash Generator', description: 'Generate SHA hashes locally in the browser.', path: '/tools/hash', icon: ShieldCheckIcon, category: 'Security', maturity: 'Stable', privacy: 'Local', pillar: 'Auth / Security', priority: 3 },
  { name: 'Regex Tester', description: 'Test regular expressions with live matches.', path: '/tools/regex', icon: CommandLineIcon, category: 'Code', maturity: 'Stable', privacy: 'Local', pillar: 'Dev Utilities', priority: 3 },
  { name: 'URL Encoder', description: 'Encode, decode, and inspect URLs and query strings.', path: '/tools/url', icon: GlobeAltIcon, category: 'Utilities', maturity: 'Stable', privacy: 'Local', pillar: 'Dev Utilities', priority: 4 },
  { name: 'Crash Beautifier', description: 'Clean up and inspect stack traces from mobile and web runtimes.', path: '/tools/crash-beautifier', icon: BoltIcon, category: 'Debugging', maturity: 'Stable', privacy: 'Local', pillar: 'Logs & Errors', priority: 2 },
  { name: 'Stack Trace Explainer', description: 'Extract error type, root frame, app frames, dependencies, and likely cause from pasted stack traces.', path: '/tools/stack-trace', icon: BoltIcon, category: 'Debugging', maturity: 'Beta', privacy: 'Local', pillar: 'Logs & Errors', priority: 1, featured: true },
  { name: 'Log Trace Rebuilder', description: 'Group multiline logs by trace ID, request ID, correlation ID, severity, and related details.', path: '/tools/log-trace', icon: DocumentTextIcon, category: 'Debugging', maturity: 'Beta', privacy: 'Local', pillar: 'Logs & Errors', priority: 2, featured: true },
  { name: 'Error Tracker', description: 'Fingerprint repeated errors into deduplicated triage groups with likely causes.', path: '/tools/error-tracker', icon: ShieldCheckIcon, category: 'Debugging', maturity: 'Beta', privacy: 'Local', pillar: 'Logs & Errors', priority: 5 },
  { name: 'OpenTelemetry Trace Viewer', description: 'Summarize OTLP traces, spans, root spans, error spans, and slow operations.', path: '/tools/otel-trace-viewer', icon: ChartBarIcon, category: 'Observability', maturity: 'Beta', privacy: 'Local', pillar: 'DevOps / Observability', priority: 6, featured: true },
  { name: 'Kubernetes Debug Helper', description: 'Detect common pod failure signals and generate focused kubectl debug commands.', path: '/tools/k8s-debug', icon: WrenchScrewdriverIcon, category: 'DevOps', maturity: 'Beta', privacy: 'Local', pillar: 'DevOps / Observability', priority: 2 },
  { name: 'CI Debugger', description: 'Inspect GitHub Actions workflows for jobs, steps, local act commands, and risky patterns.', path: '/tools/ci-debugger', icon: CommandLineIcon, category: 'CI', maturity: 'Beta', privacy: 'Local', pillar: 'DevOps / Observability', priority: 4, featured: true },
  ...debugWorkflowConfigs.map((config, index): ToolModule => ({ name: config.title, description: config.description, path: config.route, icon: config.icon, category: config.pillar, maturity: 'Beta', privacy: 'Local', pillar: config.pillar === 'Performance' ? 'Performance' : config.pillar, priority: 10 + index })),
  { name: 'Code Diff', description: 'Compare snippets during review and debugging sessions.', path: '/tools/code-diff', icon: ArrowsRightLeftIcon, category: 'Code', maturity: 'Stable', privacy: 'Local', pillar: 'Dev Utilities', priority: 5 },
  { name: 'Build Diff', description: 'Compare build outputs and artifact changes.', path: '/tools/build-diff', icon: CubeTransparentIcon, category: 'Builds', maturity: 'Stable', privacy: 'Local', pillar: 'Logs & Errors', priority: 6 },
  { name: 'Bundle Analyzer', description: 'Inspect bundle size and composition.', path: '/tools/bundle-analyzer', icon: BuildingLibraryIcon, category: 'Builds', maturity: 'Experimental', privacy: 'Local', pillar: 'Performance', priority: 1 },
  { name: 'Startup Profiling', description: 'Visualize React Native startup timelines.', path: '/tools/startup-profiling', icon: BoltIcon, category: 'Performance', maturity: 'Experimental', privacy: 'Local', pillar: 'Mobile Debugging', priority: 1 },
  { name: 'HTML Tools', description: 'Edit, format, preview, and export HTML.', path: '/tools/html', icon: DocumentTextIcon, category: 'Code', maturity: 'Stable', privacy: 'Local', pillar: 'Dev Utilities', priority: 6 },
  { name: 'CSS Tools', description: 'Minify, beautify, and validate CSS.', path: '/tools/css', icon: AdjustmentsHorizontalIcon, category: 'Code', maturity: 'Stable', privacy: 'Local', pillar: 'Dev Utilities', priority: 7 },
  { name: 'Markdown Preview', description: 'Write and preview Markdown content.', path: '/tools/markdown', icon: DocumentTextIcon, category: 'Docs', maturity: 'Stable', privacy: 'Local', pillar: 'Dev Utilities', priority: 8 },
  { name: 'Color Picker', description: 'Pick, convert, and inspect color values.', path: '/tools/color', icon: PaintBrushIcon, category: 'Design', maturity: 'Stable', privacy: 'Local', pillar: 'Dev Utilities', priority: 9 },
  { name: 'Icon Finder', description: 'Search icon libraries for UI assets.', path: '/tools/icons', icon: SparklesIcon, category: 'Design', maturity: 'Stable', privacy: 'Local', pillar: 'Dev Utilities', priority: 10 },
  { name: 'Database Query', description: 'Run SQLite queries in a focused local workspace.', path: '/tools/database', icon: BuildingLibraryIcon, category: 'Data', maturity: 'Beta', privacy: 'Local', pillar: 'Dev Utilities', priority: 11 },
  { name: 'UUID Generator', description: 'Generate UUID v4 values in bulk.', path: '/tools/uuid', icon: CommandLineIcon, category: 'Utilities', maturity: 'Stable', privacy: 'Local', pillar: 'Dev Utilities', priority: 12 },
  { name: 'Timestamp Converter', description: 'Convert Unix, ISO, UTC, and local dates.', path: '/tools/timestamp', icon: ClockIcon, category: 'Utilities', maturity: 'Stable', privacy: 'Local', pillar: 'Dev Utilities', priority: 13 },
  { name: 'Password Generator', description: 'Generate strong local passwords with length, symbol, ambiguity, copy, and strength controls.', path: '/tools/password-generator', icon: KeyIcon, category: 'Utilities', maturity: 'Stable', privacy: 'Local', pillar: 'Dev Utilities', priority: 14 },
];

// Leads with the tools we want to land on first, then everything else by pillar
// and priority. This used to be a hardcoded allow-list of 19 names, which left
// 37 shipped routes — including every `featured` debugging tool and all 24
// debug-workflow tools — indexed in the sitemap but unreachable from the
// catalog, the homepage, and the recently-used history.
const leadToolNames = [
  'API Workbench',
  'Stack Trace Explainer',
  'Log Trace Rebuilder',
  'HTTP Traffic Inspector',
  'Security Headers Inspector',
  'JSON Tools',
];

export const publicTools = [...liveTools].sort((a, b) => {
  const aLead = leadToolNames.indexOf(a.name);
  const bLead = leadToolNames.indexOf(b.name);
  if (aLead !== -1 || bLead !== -1) {
    return (aLead === -1 ? Number.MAX_SAFE_INTEGER : aLead) - (bLead === -1 ? Number.MAX_SAFE_INTEGER : bLead);
  }
  if (a.pillar !== b.pillar) return a.pillar.localeCompare(b.pillar);
  if (a.priority !== b.priority) return a.priority - b.priority;
  return a.name.localeCompare(b.name);
});

export const proposedTools: ProposedTool[] = [
  { name: 'OpenAPI Viewer', category: 'API', description: 'Preview Swagger/OpenAPI specs, endpoints, schemas, and examples.', pillar: 'API / Network' },
  { name: 'GraphQL Explorer', category: 'API', description: 'Run GraphQL queries with variables, headers, and schema introspection.', pillar: 'API / Network' },
  { name: 'Webhook Inspector', category: 'Network', description: 'Capture, replay, and debug webhook payloads from external services.', pillar: 'API / Network' },
  { name: 'cURL Converter', category: 'API', description: 'Convert cURL commands into fetch, Python, Go, and Postman-style requests.', pillar: 'API / Network' },
  { name: 'HAR Viewer', category: 'Network', description: 'Inspect browser network exports with request waterfalls and timing data.', pillar: 'API / Network' },
  { name: 'DNS Lookup', category: 'Network', description: 'Resolve A, AAAA, CNAME, MX, TXT, and NS records from a simple workbench.', pillar: 'API / Network' },
  { name: 'YAML/TOML Tools', category: 'Data', description: 'Format, validate, and convert YAML, TOML, and JSON configuration files.', pillar: 'Dev Utilities' },
  { name: 'SQL Formatter', category: 'Data', description: 'Format SQL queries and highlight common syntax mistakes.', pillar: 'Dev Utilities' },
  { name: 'Cron Parser', category: 'Ops', description: 'Explain schedules, preview next run times, and validate cron expressions.', pillar: 'DevOps / Observability' },
  { name: 'Dockerfile Linter', category: 'DevOps', description: 'Review Dockerfiles for ordering, caching, security, and image size issues.', pillar: 'DevOps / Observability' },
  { name: 'Kubernetes YAML Validator', category: 'DevOps', description: 'Validate manifests and surface common deployment configuration problems.', pillar: 'DevOps / Observability' },
  { name: 'Accessibility Checker', category: 'Frontend', description: 'Inspect contrast, labels, landmark structure, and common WCAG issues.', pillar: 'Dev Utilities' },
  { name: 'QR Code Studio', category: 'Utilities', description: 'Generate QR codes for URLs, Wi-Fi, contact cards, and payload testing.', pillar: 'Dev Utilities' },
];

export function getFeaturedTools() {
  return publicTools.slice(0, 6);
}

export function getToolsByPillar(pillar: ToolPillarName) {
  return publicTools
    .filter((tool) => tool.pillar === pillar)
    .sort((a, b) => a.priority - b.priority);
}
