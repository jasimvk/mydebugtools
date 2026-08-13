import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('http-profiler')

export default function HttpProfilerToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="http-profiler">
      {children}
    </ToolProductShell>
  )
}
