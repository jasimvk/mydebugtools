import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('html')

export default function HtmlToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="html">
      {children}
    </ToolProductShell>
  )
}
