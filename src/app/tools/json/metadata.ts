import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'JSON Tools – Format, Validate, Beautify | MyDebugTools',
  description: 'Free JSON tools to format, validate, and beautify JSON with syntax highlighting and tree view.',
  path: '/tools/json',
  keywords: ['json formatter','json beautifier','json validator','format json','pretty json'],
})


