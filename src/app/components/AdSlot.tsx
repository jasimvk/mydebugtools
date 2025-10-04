'use client';

import { useEffect, useRef, useState } from 'react';
import AdManager from './AdManager';
import { hasConsentForCategory } from './cookieUtils';

declare global {
  interface Window {
    adsbygoogle: any[] & { 
      requestNonPersonalizedAds?: number;
      pauseAdRequests?: number;
    }
  }
}

export default function AdSlot({
  adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = { display: 'block' },
  className = 'adsbygoogle'
}: {
  adClient?: string
  adSlot: string
  adFormat?: string
  fullWidthResponsive?: boolean
  style?: React.CSSProperties
  className?: string
}) {
  const adRef = useRef<HTMLModElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const adManager = AdManager.getInstance();
  const slotId = `${adClient}-${adSlot}`;

  useEffect(() => {
    setIsClient(true);
    adManager.initialize();
  }, [adManager]);

  useEffect(() => {
    if (!isClient || adLoaded || !adRef.current) return;

    // Check if this slot is already loaded
    if (adManager.isSlotLoaded(slotId)) {
      console.log('AdSense: Slot already loaded, skipping:', slotId);
      setAdLoaded(true);
      return;
    }

    const loadAd = () => {
      try {
        // Check if advertising cookies are allowed
        const allowAds = hasConsentForCategory('advertising');
        
        if (!allowAds) {
          console.log('AdSense: Advertising cookies not allowed, skipping ad load');
          return;
        }

        const insElement = adRef.current;
        if (!insElement) return;

        // Check if this specific element already has ads loaded
        if (insElement.dataset.adsbygoogleStatus === 'done') {
          console.log('AdSense: Element already has ads loaded');
          return;
        }

        // Set up non-personalized ads if needed (use non-personalized ads same as advertising consent for simplicity)
        if (!allowAds || process.env.NEXT_PUBLIC_ADSENSE_NPA === '1') {
          (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1;
        }

        // Mark this element as processing
        insElement.dataset.adsbygoogleStatus = 'processing';

        // Push to adsbygoogle array
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        
        // Mark slot as loaded in our manager
        adManager.markSlotAsLoaded(slotId);
        setAdLoaded(true);
        
        console.log('AdSense: Ad loaded successfully for slot:', slotId);

      } catch (err) {
        console.error('AdSense error:', err);
        // Reset the element status on error
        if (adRef.current) {
          adRef.current.dataset.adsbygoogleStatus = '';
        }
        // Clear from manager on error
        adManager.clearSlot(slotId);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(loadAd, 100);
    
    return () => clearTimeout(timer);
  }, [isClient, adLoaded, adManager, slotId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      adManager.clearSlot(slotId);
    };
  }, [adManager, slotId]);

  // Don't render anything on server side
  if (!isClient) {
    return <div style={{ ...style, minHeight: '90px', backgroundColor: '#f5f5f5' }} />;
  }

  return (
    <div style={{ minHeight: '90px', width: '100%' }}>
      <ins
        ref={adRef}
        className={className}
        style={style}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
        data-adtest={process.env.NEXT_PUBLIC_ADSENSE_TEST === '1' ? 'on' : undefined}
      />
    </div>
  );
}