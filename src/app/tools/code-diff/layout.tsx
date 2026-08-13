import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('code-diff')

export default function CodeDiffToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="code-diff">
      {children}
    </ToolProductShell>
  )
}
