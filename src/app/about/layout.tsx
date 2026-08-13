import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'About the Project | DebugTools',
  description: 'What DebugTools is, the project goals behind its browser-based debugging utilities, and how the MIT-licensed open-source repository is run.',
  path: '/about/',
  keywords: ['about debugtools', 'open source developer tools', 'browser based debugging tools', 'debugtools project'],
})

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
