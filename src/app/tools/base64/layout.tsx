import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('base64')

export default function Base64ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="base64">
      {children}
    </ToolProductShell>
  )
}
