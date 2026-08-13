import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { liveTools } from '@/app/tools/lib/tool-registry'
import { getToolProductJsonLd } from '@/lib/tool-products'

export const toolSeo = {
  all: {
    title: 'All Developer Tools | DebugTools',
    description: 'Browse the full debugtools registry of open-source developer tools for API testing, JSON formatting, JWT decoding, code diffing, Base64 conversion, and more.',
    path: '/tools/all/',
    keywords: ['developer tools', 'open source developer tools', 'debugging tools', 'api tester', 'json formatter'],
  },
  api: {
    title: 'API Workbench - Send HTTP Requests | DebugTools',
    description: 'Debug APIs with a browser-based REST client. Send requests, manage auth, import collections, and inspect headers, timing, and responses.',
    path: '/tools/api/',
    keywords: ['api workbench', 'api tester', 'http client', 'rest client', 'test api', 'http request tool'],
  },
  'fetch-logger': {
    title: 'Fetch Logger – In-page fetch() debugger and network inspector | DebugTools',
    description: 'Debug fetch requests, responses, timing, payloads, and console logs inside your browser with a lightweight local-first floating panel. Works with React, Vue, Svelte, and plain JavaScript.',
    path: '/tools/fetch-logger/',
    keywords: ['fetch logger', 'browser fetch debugger', 'in-page network inspector', 'react fetch logger', 'debug fetch requests', 'frontend API debugging tool', 'DevTools alternative for fetch'],
  },
  base64: {
    title: 'Base64 Encoder and Decoder | DebugTools',
    description: 'Encode and decode Base64 strings and files locally in your browser with a fast open-source developer utility.',
    path: '/tools/base64/',
    keywords: ['base64 encoder', 'base64 decoder', 'decode base64', 'encode base64', 'base64 tool'],
  },
  'build-diff': {
    title: 'Build Diff Tool | DebugTools',
    description: 'Compare build outputs and artifacts to spot regressions, changed files, and release differences during debugging.',
    path: '/tools/build-diff/',
    keywords: ['build diff', 'compare build output', 'artifact diff', 'release diff', 'debug build changes'],
  },
  'bundle-analyzer': {
    title: 'Bundle Analyzer | DebugTools',
    description: 'Inspect JavaScript bundle size and composition to understand what changed and where optimization work should start.',
    path: '/tools/bundle-analyzer/',
    keywords: ['bundle analyzer', 'javascript bundle size', 'bundle inspection', 'web performance tools'],
  },
  'code-diff': {
    title: 'Code Diff Tool - Compare Two Snippets | DebugTools',
    description: 'Compare two code snippets side by side in a focused browser-based diff tool for reviews and debugging.',
    path: '/tools/code-diff/',
    keywords: ['code diff', 'compare code', 'text diff', 'diff checker', 'code comparison'],
  },
  color: {
    title: 'Color Picker and Converter | DebugTools',
    description: 'Pick, convert, and inspect HEX, RGB, HSL, CMYK, and transparent color values for web interfaces.',
    path: '/tools/color/',
    keywords: ['color picker', 'hex to rgb', 'rgb to hex', 'color converter', 'web color tool'],
  },
  'crash-beautifier': {
    title: 'Crash Log Beautifier | DebugTools',
    description: 'Clean up crash logs and stack traces so errors, frames, and runtime context are easier to inspect.',
    path: '/tools/crash-beautifier/',
    keywords: ['crash log beautifier', 'stack trace formatter', 'error log parser', 'debug crash logs'],
  },
  css: {
    title: 'CSS Formatter, Minifier, and Validator | DebugTools',
    description: 'Format, minify, beautify, and validate CSS in a privacy-focused browser tool for frontend debugging.',
    path: '/tools/css/',
    keywords: ['css formatter', 'css minifier', 'css beautifier', 'css validator', 'frontend tools'],
  },
  database: {
    title: 'SQLite Database Query Tool | DebugTools',
    description: 'Run SQLite queries in a local browser workspace for quick database inspection and debugging.',
    path: '/tools/database/',
    keywords: ['sqlite query tool', 'database query tool', 'sql runner', 'sqlite browser', 'developer database tool'],
  },
  html: {
    title: 'HTML Formatter, Validator, and Preview | DebugTools',
    description: 'Format, inspect, preview, and export HTML snippets in a focused open-source developer tool.',
    path: '/tools/html/',
    keywords: ['html formatter', 'html validator', 'html preview', 'html beautifier', 'web developer tools'],
  },
  hash: {
    title: 'Hash Generator | DebugTools',
    description: 'Generate SHA hashes locally in your browser for text, payloads, and debugging checksums.',
    path: '/tools/hash/',
    keywords: ['hash generator', 'sha256 generator', 'sha hash tool', 'checksum tool', 'developer security tools'],
  },
  'http-status': {
    title: 'HTTP Status Codes Reference | DebugTools',
    description: 'Look up HTTP status codes with concise meanings, categories, and debugging context for API and web development.',
    path: '/tools/http-status/',
    keywords: ['http status codes', 'http codes', 'status code reference', 'api status codes', 'rest api debugging'],
  },
  icons: {
    title: 'Icon Finder | DebugTools',
    description: 'Search popular icon libraries for UI assets, SVGs, and React icons from one open-source browser tool.',
    path: '/tools/icons/',
    keywords: ['icon finder', 'icon search', 'svg icons', 'react icons', 'lucide icons'],
  },
  json: {
    title: 'JSON Formatter, Validator, and Beautifier | DebugTools',
    description: 'Format, validate, repair, and inspect JSON with a fast browser-based tool for developers.',
    path: '/tools/json/',
    keywords: ['json formatter', 'json beautifier', 'json validator', 'format json', 'pretty json'],
  },
  jwt: {
    title: 'JWT Decoder - Decode JSON Web Tokens | DebugTools',
    description: 'Decode JWT headers and payload claims locally in your browser without sending tokens to a server.',
    path: '/tools/jwt/',
    keywords: ['jwt decoder', 'decode jwt', 'json web token decoder', 'jwt claims', 'jwt tool'],
  },
  markdown: {
    title: 'Markdown Previewer | DebugTools',
    description: 'Write and preview Markdown content in a fast open-source editor for documentation, READMEs, and notes.',
    path: '/tools/markdown/',
    keywords: ['markdown preview', 'markdown editor', 'readme preview', 'markdown tool', 'developer docs'],
  },
  regex: {
    title: 'Regex Tester - Test Regular Expressions | DebugTools',
    description: 'Test regular expressions with live matches, sample text, and quick debugging feedback.',
    path: '/tools/regex/',
    keywords: ['regex tester', 'regular expression tester', 'test regex', 'regex checker', 'pattern matching'],
  },
  'startup-profiling': {
    title: 'Startup Profiling Tool | DebugTools',
    description: 'Visualize React Native startup timelines and inspect performance events during app launch.',
    path: '/tools/startup-profiling/',
    keywords: ['startup profiling', 'react native startup', 'performance timeline', 'app launch profiling'],
  },
  uuid: {
    title: 'UUID Generator | DebugTools',
    description: 'Generate UUID v4 values in bulk with copy-friendly output for fixtures, tests, and local development.',
    path: '/tools/uuid/',
    keywords: ['uuid generator', 'guid generator', 'random uuid', 'bulk uuid generator', 'developer utilities'],
  },
  url: {
    title: 'URL Encoder and Decoder | DebugTools',
    description: 'Encode, decode, and inspect URLs, query strings, and URI components in a browser-based utility.',
    path: '/tools/url/',
    keywords: ['url encoder', 'url decoder', 'uri component encoder', 'query string parser', 'developer utilities'],
  },
  timestamp: {
    title: 'Timestamp Converter | DebugTools',
    description: 'Convert Unix timestamps, milliseconds, ISO strings, UTC, and local date-time values for debugging.',
    path: '/tools/timestamp/',
    keywords: ['timestamp converter', 'unix timestamp', 'epoch converter', 'iso date converter', 'utc converter'],
  },
} as const

type ToolSeoEntry = {
  title: string
  description: string
  path: string
  keywords: readonly string[]
}

export type ToolSlug = keyof typeof toolSeo

const SITE_URL = 'https://debugtools.org'

function normalizePath(path: string) {
  return path.endsWith('/') ? path : `${path}/`
}

function slugFromPath(path: string) {
  return normalizePath(path).replace(/^\/tools\//, '').replace(/\/$/, '')
}

function titleCaseSlug(slug: string) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function generatedKeywords(tool: { name: string; category: string; pillar: string; path: string }) {
  const slug = slugFromPath(tool.path)
  return Array.from(new Set([
    tool.name,
    `${tool.name} online`,
    `${tool.name} tool`,
    `${titleCaseSlug(slug)} tool`,
    tool.category,
    tool.pillar,
    'debugtools',
    'developer tools',
    'debugging tools',
  ]))
}

function generatedToolSeoEntries(): Record<string, ToolSeoEntry> {
  return liveTools.reduce<Record<string, ToolSeoEntry>>((entries, tool) => {
    const slug = slugFromPath(tool.path)
    entries[slug] = {
      title: `${tool.name} | DebugTools`,
      description: tool.description,
      path: normalizePath(tool.path),
      keywords: generatedKeywords(tool),
    }
    return entries
  }, {})
}

export function getAllToolSeoEntries() {
  return {
    ...generatedToolSeoEntries(),
    ...toolSeo,
  } as Record<string, ToolSeoEntry>
}

export function getToolSeoEntry(slug: string) {
  return getAllToolSeoEntries()[slug]
}

export function toolMetadata(slug: ToolSlug | string): Metadata {
  const entry = getToolSeoEntry(slug)
  return buildMetadata(entry ?? {
    title: `${titleCaseSlug(slug)} | DebugTools`,
    description: `Use the ${titleCaseSlug(slug)} tool in DebugTools for focused local-first developer debugging workflows.`,
    path: `/tools/${slug}/`,
    keywords: [`${titleCaseSlug(slug)} tool`, 'debugtools', 'developer tools', 'debugging tools'],
  })
}

export function toolItemListJsonLd() {
  const entries = Object.values(getAllToolSeoEntries())
    .filter((tool) => tool.path.startsWith('/tools/') && tool.path !== '/tools/all/')
    .sort((a, b) => a.path.localeCompare(b.path))

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${SITE_URL}/tools/all/#tool-registry`,
    name: 'DebugTools tool registry',
    itemListElement: entries
      .map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.title.replace(' | DebugTools', ''),
        url: `${SITE_URL}${tool.path}`,
        description: tool.description,
      })),
  }
}

export function toolSoftwareJsonLd(slug: string) {
  const productJsonLd = getToolProductJsonLd(slug)

  if (productJsonLd) {
    return productJsonLd
  }

  const entry = getToolSeoEntry(slug)

  if (!entry) {
    return null
  }

  const name = entry.title.replace(' | DebugTools', '')

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}${entry.path}#webpage`,
        name: entry.title,
        description: entry.description,
        url: `${SITE_URL}${entry.path}`,
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}${entry.path}#software`,
        name,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        url: `${SITE_URL}${entry.path}`,
        description: entry.description,
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
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}${entry.path}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Tools', item: `${SITE_URL}/tools/all/` },
          { '@type': 'ListItem', position: 2, name, item: `${SITE_URL}${entry.path}` },
        ],
      },
    ],
  }
}
