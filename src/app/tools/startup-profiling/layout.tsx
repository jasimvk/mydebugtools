import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('startup-profiling')

export default function StartupProfilingToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="startup-profiling">
      {children}
    </ToolProductShell>
  )
}
