import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Roadmap | DebugTools',
  description: 'What is shipped, in beta, and planned across the DebugTools logs, API, auth, and DevOps pillars, plus the workspace and team foundation coming next.',
  path: '/roadmap/',
  keywords: ['debugtools roadmap', 'developer tools roadmap', 'planned features', 'open source project roadmap'],
})

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
