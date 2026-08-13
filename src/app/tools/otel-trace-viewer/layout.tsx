import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('otel-trace-viewer')

export default function OtelTraceViewerToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="otel-trace-viewer">
      {children}
    </ToolProductShell>
  )
}
