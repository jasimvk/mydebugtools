import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('color')

export default function ColorToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="color">
      {children}
    </ToolProductShell>
  )
}
