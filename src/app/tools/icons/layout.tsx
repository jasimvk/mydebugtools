import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('icons')

export default function IconsToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="icons">
      {children}
    </ToolProductShell>
  )
}
