import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('json')

export default function JsonToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="json">
      {children}
    </ToolProductShell>
  )
}
