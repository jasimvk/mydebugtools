import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('error-tracker')

export default function ErrorTrackerToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="error-tracker">
      {children}
    </ToolProductShell>
  )
}
