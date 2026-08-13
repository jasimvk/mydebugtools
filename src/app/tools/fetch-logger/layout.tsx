import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('fetch-logger')

export default function FetchLoggerToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="fetch-logger">
      {children}
    </ToolProductShell>
  )
}
