import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HTTP Status Codes | MyDebugTools',
  description: 'Comprehensive reference of HTTP status codes with descriptions, categories, and RFC references. Search and filter status codes by category.',
  keywords: 'http status codes, http codes, status codes, http response codes, rfc7231, web development, api development, http reference',
  alternates: {
    canonical: 'https://mydebugtools.com/tools/http-status/',
  },
  openGraph: {
    title: 'HTTP Status Codes | MyDebugTools',
    description: 'Comprehensive reference of HTTP status codes with descriptions, categories, and RFC references. Search and filter status codes by category.',
    url: 'https://mydebugtools.com/tools/http-status/',
  },
  twitter: {
    title: 'HTTP Status Codes | MyDebugTools',
    description: 'Comprehensive reference of HTTP status codes with descriptions, categories, and RFC references. Search and filter status codes by category.',
  },
};

export default function HTTPStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 