import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('regex')

export default function RegexToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="regex">
      {children}
    </ToolProductShell>
  )
}
