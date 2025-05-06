'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

interface StructuredDataProps {
  title?: string;
  description?: string;
  type?: 'WebApplication' | 'WebSite' | 'WebPage';
  toolType?: string;
}

export default function StructuredData({
  title = 'MyDebugTools - All-in-one Developer Debugging Toolkit',
  description = 'A powerful collection of development tools including JSON Formatter, JWT Decoder, Base64 Tools, API Tester, and Icon Finder - all in one place.',
  type = 'WebApplication',
  toolType,
}: StructuredDataProps) {
  const pathname = usePathname();
  const url = `https://mydebugtools.com${pathname}`;
  
  // Basic schema that applies to the whole application
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type,
    name: title,
    description: description,
    url: url,
    applicationCategory: 'DeveloperApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    author: {
      '@type': 'Person',
      name: 'Jasim VK',
      url: 'https://twitter.com/jasimvk'
    },
    keywords: [
      'developer tools',
      'web development',
      'JSON formatter',
      'color picker',
      'icon finder',
      'JWT decoder',
      'Base64 encoder',
      'API tester',
      'regex tester',
    ],
  };
  
  // Tool-specific schema
  let schema = baseSchema;
  
  if (toolType) {
    const toolSchemaAdditions = {
      potentialAction: {
        '@type': 'UseAction',
        target: url
      },
      additionalType: `https://schema.org/SoftwareApplication${toolType ? `, https://schema.org/${toolType}` : ''}`,
    };
    
    schema = { ...baseSchema, ...toolSchemaAdditions };
  }
  
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="afterInteractive"
    />
  );
} 