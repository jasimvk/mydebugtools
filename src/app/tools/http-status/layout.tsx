import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HTTP Status Codes | MyDebugTools',
  description: 'Comprehensive reference for HTTP status codes with explanations, common use cases, and best practices for web development.',
  keywords: 'http status codes, http codes, status codes, web development, api development, rest api, http response codes',
  alternates: {
    canonical: 'https://mydebugtools.com/tools/http-status/',
  },
  openGraph: {
    title: 'HTTP Status Codes | MyDebugTools',
    description: 'Comprehensive reference for HTTP status codes with explanations, common use cases, and best practices for web development.',
    url: 'https://mydebugtools.com/tools/http-status/',
  },
  twitter: {
    title: 'HTTP Status Codes | MyDebugTools',
    description: 'Comprehensive reference for HTTP status codes with explanations, common use cases, and best practices for web development.',
  },
};

export default function HttpStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 