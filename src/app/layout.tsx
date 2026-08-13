import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import GoogleAnalytics from "./components/GoogleAnalytics";
import AuthProvider from "./components/AuthProvider";
import Providers from "./providers";
import SiteDevTools from "./components/SiteDevTools";

const SITE_URL = 'https://debugtools.org';
const SITE_NAME = 'DebugTools';
const SITE_DESCRIPTION = 'Open-source debugging toolkit for logs, traces, APIs, auth, CI, mobile, Kubernetes, OpenTelemetry, and production issues.';
const CORE_TOOLS = [
  {
    name: 'API Workbench',
    url: '/tools/api/',
    description: 'Send HTTP requests from the browser, set headers and auth, import collections, and inspect status, timing, and responses.',
  },
  {
    name: 'Stack Trace Explainer',
    url: '/tools/stack-trace/',
    description: 'Paste stack traces and get the likely failing frame, root-cause clues, fixes, and follow-up checks.',
  },
  {
    name: 'Log Trace Rebuilder',
    url: '/tools/log-trace/',
    description: 'Turn messy logs into a timeline with highlighted errors, warnings, services, and next debugging steps.',
  },
  {
    name: 'HAR Analyzer / HTTP Profiler',
    url: '/tools/http-profiler/',
    description: 'Inspect HAR files and HTTP traffic for slow requests, failures, duplicate calls, payload size, and cache hints.',
  },
  {
    name: 'CI / GitHub Actions Debugger',
    url: '/tools/ci-debugger/',
    description: 'Analyze CI logs and workflow YAML to find failed steps, classify errors, and suggest debug flags or fixes.',
  },
  {
    name: 'Security Headers + CORS Inspector',
    url: '/tools/security-headers/',
    description: 'Review pasted response headers for security gaps, CORS risks, caching issues, and hardening recommendations.',
  },
  {
    name: 'Kubernetes Debug Helper',
    url: '/tools/k8s-debug/',
    description: 'Parse kubectl output, pod states, events, and common cluster failure clues into a practical debug report.',
  },
  {
    name: 'OpenTelemetry Trace Viewer',
    url: '/tools/otel-trace-viewer/',
    description: 'Inspect local OpenTelemetry traces for slow spans, errors, service paths, and incident-analysis hints.',
  },
  {
    name: 'JWT Decoder',
    url: '/tools/jwt/',
    description: 'Decode JWT headers and payload claims locally as an SEO entry utility for auth debugging.',
  },
] as const;

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: 'DebugTools - Open-source debugging toolkit for modern developers',
    template: '%s',
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  keywords: "DebugTools, debugtools, open-source debugging toolkit, stack trace explainer, log analyzer, HAR analyzer, GitHub Actions debugger, OpenTelemetry trace viewer, Kubernetes debug helper, Android logcat analyzer, SAML OIDC debugger, certificate viewer, API debugging, auth debugging, local-first developer tools",
  applicationName: SITE_NAME,
  authors: [{ name: 'Jasim VK', url: 'https://x.com/jasimvk' }],
  creator: 'Jasim VK',
  publisher: SITE_NAME,
  category: 'DeveloperApplication',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'DebugTools - Open-source debugging toolkit for modern developers',
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Open-source debugging toolkit for modern developers`,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@jasimvk',
    creator: '@jasimvk',
    title: 'DebugTools - Open-source debugging toolkit for modern developers',
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/tools/all/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#app`,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        applicationCategory: 'DeveloperApplication',
        softwareHelp: `${SITE_URL}/answers/`,
        operatingSystem: 'Any',
        url: SITE_URL,
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
        '@type': 'ItemList',
        '@id': `${SITE_URL}/#core-tools`,
        name: 'Core DebugTools debugging workflows',
        description: 'A concise index of local-first debugging workflows for logs, stack traces, HAR files, CI failures, security headers, Kubernetes output, OpenTelemetry traces, APIs, and auth issues.',
        itemListElement: CORE_TOOLS.map((tool, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: tool.name,
          url: `${SITE_URL}${tool.url}`,
          description: tool.description,
        })),
      },
    ],
  };

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased bg-background text-foreground min-h-screen flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <AuthProvider>
          <Providers>
            {children}
          </Providers>
        </AuthProvider>
        <SiteDevTools />
      </body>
    </html>
  );
}
