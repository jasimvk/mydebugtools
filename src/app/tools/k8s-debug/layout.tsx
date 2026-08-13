import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('k8s-debug')

export default function K8sDebugToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="k8s-debug">
      {children}
    </ToolProductShell>
  )
}
