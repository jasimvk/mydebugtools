import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('crash-beautifier')

export default function CrashBeautifierToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="crash-beautifier">
      {children}
    </ToolProductShell>
  )
}
