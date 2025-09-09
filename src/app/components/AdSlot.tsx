'use client';

import { useEffect } from 'react'

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export default function AdSlot({
  adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
  adSlot,
  style = { display: 'block' },
  format = 'auto',
  responsive = 'true',
}: {
  adClient?: string
  adSlot: string
  style?: React.CSSProperties
  format?: string
  responsive?: 'true' | 'false'
}) {
  useEffect(() => {
    try {
      // @ts-ignore
      if (process.env.NEXT_PUBLIC_ADSENSE_NPA === '1') {
        // Request non-personalized ads (diagnostic or when consent not obtained)
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1;
      }
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      data-ad-format={format}
      data-full-width-responsive={responsive}
      {...(process.env.NEXT_PUBLIC_ADSENSE_TEST === '1' ? { 'data-adtest': 'on' } : {})}
    />
  )
}


