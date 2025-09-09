import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Base64 Encoder & Decoder | MyDebugTools',
  description: 'Encode and decode Base64 strings and files directly in your browser. Fast, private, and accurate.',
  path: '/tools/base64',
  keywords: ['base64 encoder','base64 decoder','encode base64','decode base64','file to base64'],
})


