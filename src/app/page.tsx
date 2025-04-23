import Home from './page.client';

export const metadata = {
  title: 'MyDebugTools | All-in-one Online Developer Tools & Debugging Suite',
  description: 'MyDebugTools offers a powerful collection of free online developer tools: JSON Formatter, JWT Decoder, API Tester, Regex Tester, SQLite Query Tool, Icon Finder, and more. Fast, privacy-focused, and open source.',
  keywords: 'developer tools, online tools, json formatter, jwt decoder, api tester, regex tester, sqlite, code diff, icon finder, base64, markdown, color picker, css tools',
  alternates: {
    canonical: 'https://mydebugtools.com/',
  },
  openGraph: {
    title: 'MyDebugTools | All-in-one Online Developer Tools & Debugging Suite',
    description: 'A powerful, privacy-focused suite of free online tools for developers: JSON, JWT, API, Regex, SQLite, and more.',
    url: 'https://mydebugtools.com/',
    siteName: 'MyDebugTools',
    images: [
      {
        url: 'https://mydebugtools.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MyDebugTools - All-in-one Developer Toolkit',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyDebugTools | All-in-one Online Developer Tools & Debugging Suite',
    description: 'A powerful, privacy-focused suite of free online tools for developers: JSON, JWT, API, Regex, SQLite, and more.',
    site: '@jasimvk',
    creator: '@jasimvk',
    images: ['https://mydebugtools.com/og-image.png'],
  },
};

export default function Page() {
  return <Home />;
}
