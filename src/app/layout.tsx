import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientRoot from "./components/ClientRoot";
import StructuredData from "@/components/StructuredData";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Developer Tools | MyDebugTools',
  description: 'A collection of essential developer tools including JSON formatter, JWT decoder, API tester, regex tester, and more.',
  keywords: 'developer tools, online tools, json formatter, jwt decoder, api tester, regex tester, sqlite, code diff, icon finder, base64, markdown, color picker, css tools',
  metadataBase: new URL('https://mydebugtools.com'),
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
    canonical: 'https://mydebugtools.com',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mydebugtools.com/',
    siteName: 'MyDebugTools',
    title: 'MyDebugTools - All-in-one Developer Debugging Toolkit',
    description: 'A powerful collection of development tools including JSON Formatter, JWT Decoder, Base64 Tools, API Tester, and Icon Finder - all in one place.',
    images: [
      {
        url: 'https://mydebugtools.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MyDebugTools - All-in-one Developer Toolkit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@jasimvk',
    creator: '@jasimvk',
    title: 'MyDebugTools - All-in-one Developer Debugging Toolkit',
    description: 'A powerful collection of development tools including JSON Formatter, JWT Decoder, Base64 Tools, API Tester, and Icon Finder - all in one place.',
    images: ['https://mydebugtools.com/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-white text-gray-900 min-h-screen flex flex-col`}>
        <StructuredData />
        <Suspense fallback={null}>
          <ClientRoot>
            {children}
          </ClientRoot>
        </Suspense>
      </body>
    </html>
  );
}
