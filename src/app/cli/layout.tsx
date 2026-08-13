import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'CLI Roadmap | DebugTools',
  description: 'The plan for a scriptable debugtools CLI: JSON, JWT, Base64, diff, and HTTP status commands for terminals and CI, plus planned API and database commands.',
  path: '/cli/',
  keywords: ['debugtools cli', 'developer cli tools', 'json cli', 'jwt decode cli', 'ci debugging commands'],
})

export default function CliLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
