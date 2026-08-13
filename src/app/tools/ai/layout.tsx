import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('ai')

export default function AiToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="ai">
      {children}
    </ToolProductShell>
  )
}
