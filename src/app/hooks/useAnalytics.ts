'use client';

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
    dataLayer: any[];
  }
}

export const pageview = (url: string, id: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', id, {
      page_path: url,
    })
  }
}

export const event = ({ action, params }: { action: string; params: any }) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, params)
  }
}

export default function useAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      pageview(url, process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
    }
  }, [pathname, searchParams])

  return {
    event,
  }
} 