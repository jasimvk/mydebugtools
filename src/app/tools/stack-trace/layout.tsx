import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('stack-trace')

export default function StackTraceToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="stack-trace">
      {children}
    </ToolProductShell>
  )
}
