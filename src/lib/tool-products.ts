import { liveTools } from '@/app/tools/lib/tool-registry';

type ToolProductFaq = {
  question: string;
  answer: string;
};

export type ToolProduct = {
  slug: string;
  name: string;
  path: string;
  description: string;
  category: string;
  pillar: string;
  maturity: string;
  privacy: string;
  productSummary: string;
  useCases: string[];
  howItWorks: string[];
  features: string[];
  privacyNote: string;
  faqs: ToolProductFaq[];
  relatedTools: Array<{
    name: string;
    path: string;
  }>;
};

function normalizePath(path: string) {
  return path.endsWith('/') ? path : `${path}/`;
}

function slugFromPath(path: string) {
  return normalizePath(path).replace(/^\/tools\//, '').replace(/\/$/, '');
}

function sentence(value: string) {
  return value.endsWith('.') ? value : `${value}.`;
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

const useCaseByPillar: Record<string, string[]> = {
  'Logs & Errors': [
    'Turn pasted failures into a cleaner root-cause checklist.',
    'Separate the first error from retries, noise, and downstream symptoms.',
    'Prepare a concise report for an issue, pull request, or incident note.',
  ],
  'API / Network': [
    'Debug request, response, header, status, redirect, and payload problems.',
    'Create a small reproduction before changing client or backend code.',
    'Compare working and failing network evidence without leaving the browser.',
  ],
  'Auth / Security': [
    'Inspect auth, token, header, certificate, cookie, and policy clues safely.',
    'Find configuration mismatches before sharing logs or screenshots.',
    'Turn security evidence into a practical fix checklist.',
  ],
  'Mobile Debugging': [
    'Review mobile logs, crashes, startup, network, and device-specific clues.',
    'Separate JavaScript, native, runtime, and platform evidence.',
    'Capture a focused debugging report for mobile issue triage.',
  ],
  'DevOps / Observability': [
    'Inspect CI, Kubernetes, trace, SQL, JVM, and production incident signals.',
    'Move from noisy output to the next command or measurement to run.',
    'Create an investigation note that is easy for teammates to follow.',
  ],
  Performance: [
    'Identify slow paths, hot operations, large bundles, and runtime bottlenecks.',
    'Compare before/after evidence while tuning performance.',
    'Summarize profiler output into follow-up actions.',
  ],
  'Dev Utilities': [
    'Handle everyday formatting, conversion, generation, and inspection tasks.',
    'Keep sensitive snippets in the browser for quick local work.',
    'Prepare clean output for tests, docs, API calls, and debugging sessions.',
  ],
};

const useCaseOverrides: Record<string, string[]> = {
  api: [
    'Send REST requests with headers, auth, body, and environment values.',
    'Inspect status, timing, response headers, and JSON or text bodies.',
    'Import collections and keep API debugging work organized.',
  ],
  json: [
    'Format, validate, repair, and inspect JSON payloads.',
    'Debug malformed API responses and deeply nested objects.',
    'Prepare readable JSON for logs, docs, tests, and support reports.',
  ],
  jwt: [
    'Decode JWT headers and claims while debugging auth flows.',
    'Inspect issuer, audience, subject, expiry, and scope values.',
    'Review tokens locally before sharing auth evidence.',
  ],
  base64: [
    'Encode and decode Base64 text, files, data URLs, and payload fragments.',
    'Inspect encoded API fields, JWT sections, and binary transport values.',
    'Avoid confusing reversible encoding with encryption.',
  ],
  'stack-trace': [
    'Find the exception type and first app-owned frame.',
    'Separate framework frames from the code path you should inspect.',
    'Generate a small checklist from pasted stack traces.',
  ],
  'log-trace': [
    'Group logs by trace ID, request ID, service, timestamp, and severity.',
    'Rebuild the event order around one failed request.',
    'Distinguish the initiating error from downstream symptoms.',
  ],
  'http-profiler': [
    'Inspect HAR exports for slow, failed, duplicate, or redirected requests.',
    'Compare headers, status codes, timings, and payload size.',
    'Find the first meaningful browser-network failure.',
  ],
  'saml-oidc-debugger': [
    'Debug redirect URI, state, nonce, issuer, audience, and token-exchange issues.',
    'Read SAML/OIDC clues without turning auth logs into guesswork.',
    'Prepare a checklist for identity-provider configuration fixes.',
  ],
  'security-headers': [
    'Review CORS, CSP, cookie, caching, and browser-protection headers.',
    'Spot missing Secure, HttpOnly, SameSite, HSTS, and CSP controls.',
    'Prepare practical hardening notes from pasted response headers.',
  ],
  'secret-scanner': [
    'Scan logs and config snippets before sharing them publicly.',
    'Find likely API keys, tokens, cookies, private keys, and database URLs.',
    'Create safe placeholders while preserving enough shape for debugging.',
  ],
  'password-generator': [
    'Generate strong local passwords with length and character controls.',
    'Avoid ambiguous characters when a password must be typed manually.',
    'Copy generated passwords into a password manager.',
  ],
  'fetch-logger': [
    'Watch fetch requests and responses live while building a React, Vue, Svelte, or plain-JS app.',
    'Debug API calls inside mobile webviews and embedded browsers where opening DevTools is hard.',
    'Capture method, URL, status, timing, and payloads to paste into a bug report or QA ticket.',
  ],
};

// Per-tool "How it works" steps (otherwise a generic paste/run/copy flow is used).
const howItWorksOverrides: Record<string, string[]> = {
  'fetch-logger': [
    'Install the package or start the live demo panel on this page.',
    'Fetch Logger patches window.fetch in the browser — no DevTools required.',
    'Every request is captured locally with method, URL, status, timing, and a payload preview.',
    'Open the floating panel to inspect network requests and console logs side by side.',
    'Copy request/response details when you need to share a bug report.',
  ],
};

function privacyCopy(toolPrivacy: string, name: string) {
  if (toolPrivacy === 'Local') {
    return `${name} is local-first. The core workflow runs in your browser and does not require sending pasted content to DebugTools servers.`;
  }

  if (toolPrivacy === 'Cloud optional') {
    return `${name} can be used locally, with cloud sync only when you explicitly sign in and choose workspace features.`;
  }

  return `${name} may make network requests as part of the workflow. Review tokens, cookies, and private data before sending external requests or using AI providers.`;
}

function productSummary(name: string, description: string) {
  return `${name} is a focused DebugTools mini-product for developers. ${sentence(description)}`;
}

function howItWorks(name: string, privacy: string) {
  const inputStep = privacy === 'Network'
    ? `Enter the request, log, token, trace, or configuration details needed by ${name}.`
    : `Paste or load the snippet you want to inspect in ${name}.`;

  return [
    inputStep,
    'Run the tool in the browser and review the highlighted output.',
    'Copy, export, or turn the result into the next debugging step.',
  ];
}

function featuresForTool(name: string, privacy: string, maturity: string) {
  return unique([
    privacy === 'Local' ? 'Local-first browser workflow' : 'Explicit network workflow',
    'No forced account for core usage',
    'Copy and export friendly output',
    `${maturity} DebugTools module`,
    `${name} product page with structured data`,
  ]);
}

function faqsForTool(name: string, description: string, privacy: string, privacyNote: string): ToolProductFaq[] {
  return [
    {
      question: `What is ${name}?`,
      answer: sentence(description),
    },
    {
      question: `Is ${name} free to use?`,
      answer: `${name} is part of the open-source DebugTools toolkit and the core browser workflow is free to use.`,
    },
    {
      question: `Does ${name} send my data to a server?`,
      answer: privacy === 'Local'
        ? privacyNote
        : `${privacyNote} Use local tools for sensitive data and remove secrets before network or AI workflows.`,
    },
  ];
}

export function getToolProduct(slug: string): ToolProduct | null {
  const normalizedSlug = slug.replace(/^\/tools\//, '').replace(/\/$/, '');
  const tool = liveTools.find((item) => slugFromPath(item.path) === normalizedSlug);

  if (!tool) {
    return null;
  }

  const privacyNote = privacyCopy(tool.privacy, tool.name);
  const pillarUseCases = useCaseByPillar[tool.pillar] ?? useCaseByPillar['Dev Utilities'];
  const useCases = useCaseOverrides[normalizedSlug] ?? pillarUseCases;
  const relatedTools = liveTools
    .filter((item) => item.path !== tool.path)
    .filter((item) => item.pillar === tool.pillar || item.category === tool.category)
    .slice(0, 4)
    .map((item) => ({ name: item.name, path: normalizePath(item.path) }));

  return {
    slug: normalizedSlug,
    name: tool.name,
    path: normalizePath(tool.path),
    description: tool.description,
    category: tool.category,
    pillar: tool.pillar,
    maturity: tool.maturity,
    privacy: tool.privacy,
    productSummary: productSummary(tool.name, tool.description),
    useCases,
    howItWorks: howItWorksOverrides[normalizedSlug] ?? howItWorks(tool.name, tool.privacy),
    features: featuresForTool(tool.name, tool.privacy, tool.maturity),
    privacyNote,
    faqs: faqsForTool(tool.name, tool.description, tool.privacy, privacyNote),
    relatedTools,
  };
}

export function getToolProductJsonLd(slug: string) {
  const product = getToolProduct(slug);

  if (!product) {
    return null;
  }

  const url = `https://debugtools.org${product.path}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        name: `${product.name} | DebugTools`,
        description: product.description,
        url,
        isPartOf: { '@id': 'https://debugtools.org/#website' },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${url}#software`,
        name: product.name,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        url,
        description: product.description,
        isAccessibleForFree: true,
        featureList: product.features,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        author: {
          '@type': 'Person',
          name: 'Jasim VK',
          url: 'https://x.com/jasimvk',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: product.faqs.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
      {
        '@type': 'HowTo',
        '@id': `${url}#howto`,
        name: `How to use ${product.name}`,
        description: product.productSummary,
        step: product.howItWorks.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          text: step,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Tools', item: 'https://debugtools.org/tools/all/' },
          { '@type': 'ListItem', position: 2, name: product.name, item: url },
        ],
      },
    ],
  };
}
