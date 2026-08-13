const fs = require('fs');
const path = require('path');

const siteUrl = 'https://debugtools.org';
const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const currentDate = new Date().toISOString().split('T')[0];

const corePages = [
  { url: '/', title: 'DebugTools', description: 'Open-source debugging toolkit for modern developers.', changefreq: 'weekly', priority: 1.0 },
  // `/tools/` is a redirect to `/tools/all/` — listing it wasted a high-priority
  // sitemap slot on a URL that never renders.
  { url: '/tools/all/', title: 'All developer tools', description: 'Complete DebugTools registry.', changefreq: 'weekly', priority: 0.92 },
  { url: '/answers/', title: 'Developer answers', description: 'Short answers for common debugging workflows.', changefreq: 'weekly', priority: 0.78 },
  { url: '/about/', title: 'About', description: 'Project background and positioning.', changefreq: 'monthly', priority: 0.7 },
  { url: '/faq/', title: 'FAQ', description: 'Product, privacy, and contribution answers.', changefreq: 'monthly', priority: 0.7 },
  { url: '/architecture/', title: 'Architecture', description: 'How DebugTools is structured.', changefreq: 'monthly', priority: 0.7 },
  { url: '/security/', title: 'Security', description: 'Security and local-first privacy notes.', changefreq: 'monthly', priority: 0.7 },
  { url: '/contributing/', title: 'Contributing', description: 'Open-source contribution guide.', changefreq: 'monthly', priority: 0.68 },
  { url: '/changelog/', title: 'Changelog', description: 'Project changelog.', changefreq: 'weekly', priority: 0.68 },
  { url: '/releases/', title: 'Releases', description: 'Release notes.', changefreq: 'weekly', priority: 0.68 },
  { url: '/roadmap/', title: 'Roadmap', description: 'Shipped and planned debugging tools.', changefreq: 'weekly', priority: 0.72 },
  { url: '/cli/', title: 'CLI roadmap', description: 'Command-line plans for DebugTools.', changefreq: 'weekly', priority: 0.66 },
  { url: '/contact/', title: 'Contact', description: 'Contact and issue reporting paths.', changefreq: 'monthly', priority: 0.6 },
  { url: '/privacy-policy/', title: 'Privacy policy', description: 'Privacy policy.', changefreq: 'monthly', priority: 0.52 },
  { url: '/terms-of-service/', title: 'Terms of service', description: 'Terms of service.', changefreq: 'monthly', priority: 0.5 },
  { url: '/cookie-policy/', title: 'Cookie policy', description: 'Cookie policy.', changefreq: 'monthly', priority: 0.5 },
];

function readFile(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

function normalizeUrlPath(value) {
  const url = value.startsWith('/') ? value : `/${value}`;
  return url.endsWith('/') ? url : `${url}/`;
}

function titleFromSlug(slug) {
  return slug
    .replace(/^\[|\]$/g, '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function xmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function markdownEscape(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

function upsertByUrl(records) {
  const byUrl = new Map();
  records.forEach((record) => {
    const url = normalizeUrlPath(record.url);
    const existing = byUrl.get(url);
    byUrl.set(url, {
      ...existing,
      ...record,
      url,
      priority: Math.max(existing?.priority ?? 0, record.priority ?? 0.5),
    });
  });
  return Array.from(byUrl.values()).sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.url.localeCompare(b.url);
  });
}

function extractRegistryTools() {
  const source = readFile('src/app/tools/lib/tool-registry.ts');
  const tools = [];
  const toolPattern = /\{\s*name:\s*'([^']+)'\s*,\s*description:\s*'([^']+)'\s*,\s*path:\s*'([^']+)'/g;
  let match;

  while ((match = toolPattern.exec(source)) !== null) {
    tools.push({
      title: match[1],
      description: match[2],
      url: normalizeUrlPath(match[3]),
      changefreq: 'monthly',
      priority: match[3] === '/tools/api' ? 0.95 : 0.8,
    });
  }

  return tools;
}

function extractDebugWorkflowTools() {
  const source = readFile('src/app/tools/lib/debug-workflow-configs.ts');
  const tools = [];
  const workflowPattern = /\{\s*slug:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?route:\s*'([^']+)'[\s\S]*?description:\s*'([^']+)'/g;
  let match;

  while ((match = workflowPattern.exec(source)) !== null) {
    tools.push({
      title: match[2],
      description: match[4],
      url: normalizeUrlPath(match[3]),
      changefreq: 'monthly',
      priority: 0.82,
    });
  }

  return tools;
}

function extractStaticToolPages() {
  const toolsDir = path.join(rootDir, 'src/app/tools');
  return fs.readdirSync(toolsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !entry.name.startsWith('['))
    .filter((entry) => entry.name !== 'all')
    .filter((entry) => fs.existsSync(path.join(toolsDir, entry.name, 'page.tsx')))
    .map((entry) => ({
      title: titleFromSlug(entry.name),
      description: `${titleFromSlug(entry.name)} tool on DebugTools.`,
      url: `/tools/${entry.name}/`,
      changefreq: 'monthly',
      priority: entry.name === 'api' ? 0.95 : 0.78,
    }));
}

function extractAnswerPages() {
  const source = readFile('src/app/answers/data.ts');
  const pages = [];
  const answerPattern = /\{\s*slug:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?description:\s*'([^']+)'[\s\S]*?shortAnswer:\s*'([^']+)'/g;
  let match;

  while ((match = answerPattern.exec(source)) !== null) {
    pages.push({
      slug: match[1],
      title: match[2],
      description: match[3],
      shortAnswer: match[4],
      url: `/answers/${match[1]}/`,
      changefreq: 'monthly',
      priority: 0.64,
    });
  }

  return pages;
}

const tools = upsertByUrl([
  ...extractStaticToolPages(),
  ...extractRegistryTools(),
  ...extractDebugWorkflowTools(),
]);

const answers = extractAnswerPages();
const pages = upsertByUrl([
  ...corePages,
  ...tools,
  ...answers,
]);

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url>
    <loc>${xmlEscape(`${siteUrl}${page.url}`)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(2)}</priority>
  </url>`).join('\n')}
</urlset>
`;

const primaryTools = tools
  .filter((tool) => ['/tools/api/', '/tools/stack-trace/', '/tools/log-trace/', '/tools/http-profiler/', '/tools/ci-debugger/', '/tools/security-headers/', '/tools/k8s-debug/', '/tools/otel-trace-viewer/'].includes(tool.url));

const llmsTxt = `# DebugTools

> Open-source debugging toolkit for logs, traces, APIs, auth, CI, mobile, Kubernetes, OpenTelemetry, and production issues.

DebugTools is local-first by default. Pasted logs, tokens, stack traces, crash reports, HAR files, and build failures stay in the browser unless the user explicitly chooses a network or AI workflow.

## Start Here

- [Homepage](${siteUrl}/): Project overview and primary tools.
- [API Workbench](${siteUrl}/tools/api/): Browser REST client with collections, auth, environments, imports, and response inspection.
- [All tools](${siteUrl}/tools/all/): Complete tool registry.
- [Developer answers](${siteUrl}/answers/): Concise answer pages for common debugging workflows.
- [Roadmap](${siteUrl}/roadmap/): Shipped and planned debugging tools.
- [GitHub repository](https://github.com/jasimvkarim/mydebugtools): Source code, issues, license, and contribution workflow.

## Primary Debugging Tools

${primaryTools.map((tool) => `- [${tool.title}](${siteUrl}${tool.url}): ${markdownEscape(tool.description)}`).join('\n')}

## Answer Pages

${answers.map((page) => `- [${page.title}](${siteUrl}${page.url}): ${markdownEscape(page.shortAnswer)}`).join('\n')}

## Machine-Readable Indexes

- [Full LLM index](${siteUrl}/llms-full.txt)
- [AI context file](${siteUrl}/ai.txt)
- [Sitemap](${siteUrl}/sitemap.xml)
`;

const llmsFullTxt = `# DebugTools Full LLM Index

Generated: ${currentDate}
Canonical domain: ${siteUrl}
Repository: https://github.com/jasimvkarim/mydebugtools

## Positioning

DebugTools is an open-source debugging toolkit for modern developers. It combines practical developer utilities with local-first debugging workflows for stack traces, logs, crash reports, HAR files, API failures, auth issues, CI failures, Kubernetes output, OpenTelemetry traces, and production incidents.

## Tools

${tools.map((tool) => `- [${tool.title}](${siteUrl}${tool.url}): ${markdownEscape(tool.description)}`).join('\n')}

## Answer Pages

${answers.map((page) => `- [${page.title}](${siteUrl}${page.url}): ${markdownEscape(page.shortAnswer)}`).join('\n')}

## Trust And Project Pages

${corePages.map((page) => `- [${page.title}](${siteUrl}${normalizeUrlPath(page.url)}): ${markdownEscape(page.description)}`).join('\n')}
`;

const aiTxt = `Name: DebugTools
Canonical: ${siteUrl}
Repository: https://github.com/jasimvkarim/mydebugtools
Summary: Open-source debugging toolkit for logs, traces, APIs, auth, CI, mobile, Kubernetes, OpenTelemetry, and production issues.
Local-first: Basic tools run in the browser. User data is not sent to DebugTools servers for local utilities. Network and AI workflows are explicit.
Primary workflow: Paste the failure, inspect signals, get a checklist, and move to the smallest reproducible request, log, trace, or command.
Best pages: ${siteUrl}/tools/api/, ${siteUrl}/tools/stack-trace/, ${siteUrl}/tools/log-trace/, ${siteUrl}/tools/http-profiler/, ${siteUrl}/answers/
Full index: ${siteUrl}/llms-full.txt
Sitemap: ${siteUrl}/sitemap.xml
`;

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent);
fs.writeFileSync(path.join(publicDir, 'llms.txt'), llmsTxt);
fs.writeFileSync(path.join(publicDir, 'llms-full.txt'), llmsFullTxt);
fs.writeFileSync(path.join(publicDir, 'ai.txt'), aiTxt);

console.log(`Sitemap generated successfully with ${pages.length} URLs.`);
console.log(`LLM discovery files generated with ${tools.length} tools and ${answers.length} answer pages.`);
