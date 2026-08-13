import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Releases | DebugTools',
  description: 'Dated release notes for DebugTools, from the latest tool quality sweep back through workspace direction, OSS polish, and the SQLite database query tool.',
  path: '/releases/',
  keywords: ['debugtools releases', 'release notes', 'developer tools updates', 'open source release history'],
})

export default function ReleasesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
