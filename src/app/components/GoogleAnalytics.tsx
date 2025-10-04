'use client';

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import SuspenseBoundary from '@/components/SuspenseBoundary'
import AdManager from './AdManager'
import { hasConsentForCategory } from './cookieUtils'

// Add gtag to the window object type
declare global {
  interface Window {
    gtag: (
      command: string,
      ...args: any[]
    ) => void;
    dataLayer: any[];
  }
}

function GoogleAnalyticsContent({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const adManager = AdManager.getInstance();
  
  useEffect(() => {
    // Check if analytics cookies are allowed
    const allowAnalytics = hasConsentForCategory('analytics');
    
    if (pathname && typeof window.gtag !== 'undefined' && allowAnalytics) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      window.gtag('config', measurementId, {
        page_path: url,
      });
    }
    
    // Clear ad manager on route change to prevent duplicate ad loading
    adManager.reset();
  }, [pathname, searchParams, measurementId, adManager]);
  
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}

export default function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  return (
    <SuspenseBoundary>
      <GoogleAnalyticsContent measurementId={measurementId} />
    </SuspenseBoundary>
  );
} 