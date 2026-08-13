import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('http-status')

export default function HttpStatusToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="http-status">
      {children}
    </ToolProductShell>
  )
}
