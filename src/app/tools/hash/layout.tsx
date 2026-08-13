import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('hash')

export default function HashToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="hash">
      {children}
    </ToolProductShell>
  )
}
