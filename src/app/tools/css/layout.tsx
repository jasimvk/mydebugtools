import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('css')

export default function CssToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="css">
      {children}
    </ToolProductShell>
  )
}
