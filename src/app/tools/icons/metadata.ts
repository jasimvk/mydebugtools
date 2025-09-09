import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Icon Finder – Search and Copy Icons | MyDebugTools',
  description: 'Find and copy icons quickly for your projects. Browse popular icon sets with easy search.',
  path: '/tools/icons',
  keywords: ['icon finder','search icons','copy icons','icon search','svg icons'],
})


