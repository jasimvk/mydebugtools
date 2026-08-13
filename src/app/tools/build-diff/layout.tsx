import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('build-diff')

export default function BuildDiffToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="build-diff">
      {children}
    </ToolProductShell>
  )
}
