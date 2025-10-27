import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "./components/GoogleAnalytics";
import AnalyticsProvider from "./components/AnalyticsProvider";
import Providers from "./providers";
import StructuredData from "@/components/StructuredData";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: '#FF6C37',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "MyDebugTools - All-in-one Developer Debugging Toolkit",
  description: "A powerful collection of development tools including JSON Formatter, JWT Decoder, Base64 Tools, API Tester, and Icon Finder - all in one place.",
  metadataBase: new URL('https://mydebugtools.com'),
  keywords: "developer tools, json formatter, jwt decoder, base64 encoder, api tester, icon finder, color picker, regex tester, online tools, web developer tools",
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
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-white text-gray-900 min-h-screen flex flex-col`}>
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <Script
            id="adsbygoogle-init"
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <StructuredData /> 
        <AnalyticsProvider>
          <Providers>
            {children}
          </Providers>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
