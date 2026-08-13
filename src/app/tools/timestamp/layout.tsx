import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('timestamp')

export default function TimestampToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="timestamp">
      {children}
    </ToolProductShell>
  )
}
