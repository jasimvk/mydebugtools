'use client';

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import SuspenseBoundary from '@/components/SuspenseBoundary'

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
  
  useEffect(() => {
    if (pathname && typeof window.gtag !== 'undefined') {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      window.gtag('config', measurementId, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, measurementId]);
  
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