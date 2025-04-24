import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Developer Tools | MyDebugTools',
  description: 'A collection of essential developer tools including JSON formatter, JWT decoder, API tester, regex tester, and more.',
  keywords: 'developer tools, online tools, json formatter, jwt decoder, api tester, regex tester, sqlite, code diff, icon finder, base64, markdown, color picker, css tools',
  alternates: {
    canonical: 'https://mydebugtools.com/',
  },
  openGraph: {
    title: 'Developer Tools | MyDebugTools',
    description: 'A collection of essential developer tools including JSON formatter, JWT decoder, API tester, regex tester, and more.',
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
    title: 'Developer Tools | MyDebugTools',
    description: 'A collection of essential developer tools including JSON formatter, JWT decoder, API tester, regex tester, and more.',
    site: '@jasimvk',
    creator: '@jasimvk',
    images: ['https://mydebugtools.com/og-image.png'],
  },
};

export default function Page() {
  redirect('/tools/json');
}
