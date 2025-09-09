import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'JWT Decoder – Decode and Verify Tokens | MyDebugTools',
  description: 'Instantly decode and inspect JSON Web Tokens (JWT). View headers, payloads, and signature details securely in your browser.',
  path: '/tools/jwt',
  keywords: ['jwt decoder','jwt viewer','decode jwt','verify jwt','jwt inspector'],
})


