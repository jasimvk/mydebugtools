import type { Metadata } from 'next'

export function buildMetadata({
  title,
  description,
  path,
  keywords,
  noindex = false,
}: {
  title: string
  description: string
  path: string
  keywords?: readonly string[]
  noindex?: boolean
}): Metadata {
  const url = `https://debugtools.org${path}`
  const image = 'https://debugtools.org/og-image.png'
  return {
    title,
    description,
    metadataBase: new URL('https://debugtools.org'),
    alternates: { canonical: url },
    robots: noindex
      ? {
          index: false,
          follow: false,
          googleBot: { index: false, follow: false },
        }
      : {
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
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'DebugTools',
      locale: 'en_US',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@jasimvk',
      creator: '@jasimvk',
      title,
      description,
      images: [image],
    },
    applicationName: 'DebugTools',
    authors: [{ name: 'Jasim VK', url: 'https://x.com/jasimvk' }],
    creator: 'Jasim VK',
    publisher: 'DebugTools',
    category: 'DeveloperApplication',
    keywords: keywords?.join(', '),
  }
}
