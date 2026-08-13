import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('ci-debugger')

export default function CiDebuggerToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="ci-debugger">
      {children}
    </ToolProductShell>
  )
}
