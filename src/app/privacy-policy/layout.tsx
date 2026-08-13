import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy | DebugTools',
  description: 'How DebugTools handles your data: local in-browser processing, the analytics and cookies used, third-party services, data sharing limits, and your choices.',
  path: '/privacy-policy/',
  keywords: ['debugtools privacy policy', 'developer tools privacy', 'local first tools', 'cookies and analytics'],
})

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
