import type { Metadata } from 'next'

export function buildMetadata({
  title,
  description,
  path,
  keywords,
}: {
  title: string
  description: string
  path: string
  keywords?: string[]
}): Metadata {
  const url = `https://mydebugtools.com${path}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'MyDebugTools',
      images: [
        {
          url: 'https://mydebugtools.com/og-image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://mydebugtools.com/og-image.png'],
    },
    keywords: keywords?.join(', '),
  }
}


