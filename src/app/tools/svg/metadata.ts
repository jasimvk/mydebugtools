import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'SVG Optimizer & Minifier | MyDebugTools',
  description: 'Optimize and minify SVG files online. Remove unnecessary code, reduce file size, and improve performance. Fast, secure, and free.',
  path: '/tools/svg',
  keywords: ['svg optimizer', 'svg minifier', 'optimize svg', 'minify svg', 'svg compression', 'reduce svg size', 'svg cleaner', 'svg tool'],
})
