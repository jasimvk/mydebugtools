'use client';

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useCallback } from 'react'
import { pageview, trackEvent, trackToolUsage, trackConversion, trackEngagement } from '../utils/analytics'

declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
    dataLayer: any[];
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

  // Event tracking functions
  const trackCustomEvent = useCallback((action: string, category: string, label: string, value?: number) => {
    trackEvent(action, category, label, value)
  }, [])

  const trackTool = useCallback((toolName: string, action: string = 'use') => {
    trackToolUsage(toolName, action)
  }, [])

  const trackConversionEvent = useCallback((conversionType: string, value?: number) => {
    trackConversion(conversionType, value)
  }, [])

  const trackUserEngagement = useCallback((action: string, details?: Record<string, any>) => {
    trackEngagement(action, details)
  }, [])

  return {
    trackEvent: trackCustomEvent,
    trackTool,
    trackConversion: trackConversionEvent,
    trackEngagement: trackUserEngagement,
  }
} 