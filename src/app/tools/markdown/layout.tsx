import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('markdown')

export default function MarkdownToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="markdown">
      {children}
    </ToolProductShell>
  )
}
