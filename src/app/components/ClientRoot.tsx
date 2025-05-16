'use client';

import GoogleAnalytics from './GoogleAnalytics';
import AnalyticsProvider from './AnalyticsProvider';
import Providers from '../providers';

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <>
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
      <AnalyticsProvider>
        <Providers>
          {children}
        </Providers>
      </AnalyticsProvider>
    </>
  );
} 