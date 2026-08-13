'use client';

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import SuspenseBoundary from '@/components/SuspenseBoundary'
import { hasConsentForCategory } from './cookieUtils'

const GA_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/i;

function normalizeMeasurementId(measurementId: string) {
  const trimmedMeasurementId = measurementId.trim();

  if (!GA_MEASUREMENT_ID_PATTERN.test(trimmedMeasurementId)) {
    return null;
  }

  return trimmedMeasurementId;
}

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
  const safeMeasurementId = normalizeMeasurementId(measurementId);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Check if analytics cookies are allowed
    const allowAnalytics = hasConsentForCategory('analytics');

    if (!safeMeasurementId || !pathname || !allowAnalytics) return;

    // This effect is the only source of pageviews (`send_page_view` is off
    // below). It used to bail when `window.gtag` was undefined — which is
    // exactly the state on first paint, because both tags are
    // `afterInteractive`. Its deps never change again on a single-page visit,
    // so the landing pageview was simply never recorded. Pushing onto
    // dataLayer through a local shim queues the hit until gtag.js arrives.
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments);
      };
    }

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    window.gtag('config', safeMeasurementId, {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams, safeMeasurementId]);

  if (!safeMeasurementId) {
    return null;
  }
  
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${safeMeasurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${safeMeasurementId}', {
              send_page_view: false,
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
