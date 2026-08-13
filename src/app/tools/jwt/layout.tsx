import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('jwt')

export default function JwtToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="jwt">
      {children}
    </ToolProductShell>
  )
}
