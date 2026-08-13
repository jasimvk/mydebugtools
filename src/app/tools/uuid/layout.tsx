import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('uuid')

export default function UuidToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="uuid">
      {children}
    </ToolProductShell>
  )
}
