import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('bundle-analyzer')

export default function BundleAnalyzerToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="bundle-analyzer">
      {children}
    </ToolProductShell>
  )
}
