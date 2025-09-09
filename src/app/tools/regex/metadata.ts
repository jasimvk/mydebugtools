import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Regex Tester – Test Regular Expressions | MyDebugTools',
  description: 'Test, validate, and debug regular expressions with instant feedback and matches.',
  path: '/tools/regex',
  keywords: ['regex tester','regular expression tester','test regex','regex tool','regex match'],
})



