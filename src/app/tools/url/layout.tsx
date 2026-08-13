import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('url')

export default function UrlToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="url">
      {children}
    </ToolProductShell>
  )
}
