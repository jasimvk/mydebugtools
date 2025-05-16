'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import SuspenseBoundary from '@/components/SuspenseBoundary';

declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
    dataLayer: any[];
  }
}

function AnalyticsProviderContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && typeof window.gtag !== 'undefined' && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}

export default function AnalyticsProvider({ children }: { children: ReactNode }) {
  return (
    <SuspenseBoundary>
      <AnalyticsProviderContent>
        {children}
      </AnalyticsProviderContent>
    </SuspenseBoundary>
  );
} 