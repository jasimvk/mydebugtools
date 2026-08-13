import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('log-trace')

export default function LogTraceToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="log-trace">
      {children}
    </ToolProductShell>
  )
}
