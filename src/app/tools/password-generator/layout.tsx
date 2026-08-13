import { toolMetadata } from '@/lib/tool-seo'
import ToolProductShell from '../components/ToolProductShell'

export const metadata = toolMetadata('password-generator')

export default function PasswordGeneratorToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolProductShell slug="password-generator">
      {children}
    </ToolProductShell>
  )
}
