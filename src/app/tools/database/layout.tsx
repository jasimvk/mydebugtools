import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('database')

export default function DatabaseToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="database">
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </ToolProductShell>
  )
}
