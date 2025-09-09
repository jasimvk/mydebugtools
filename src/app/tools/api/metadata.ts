import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'API Tester – Send HTTP Requests | MyDebugTools',
  description: 'Test APIs with an easy HTTP client. Send GET, POST, PUT, DELETE requests and inspect headers and responses.',
  path: '/tools/api',
  keywords: ['api tester','http client','rest client','test api','http request tool'],
})


