import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('api')

export default function ApiToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="api">
      {children}
    </ToolProductShell>
  )
}
