import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('security-headers')

export default function SecurityHeadersToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="security-headers">
      {children}
    </ToolProductShell>
  )
}
