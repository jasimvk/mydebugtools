'use client';

// Declare gtag types
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
    dataLayer: any[];
  }
}

// Track page views
export const pageview = (url: string, measurementId?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const id = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (id) {
      window.gtag('config', id, {
        page_path: url,
      });
    }
  }
};

// Track custom events
export const trackEvent = (action: string, category: string, label: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
};

// Track tool usage events
export const trackToolUsage = (toolName: string, action: string = 'use') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: 'Tool Usage',
      event_label: toolName,
      custom_parameter_tool: toolName,
    });
  }
};

// Track conversion events
export const trackConversion = (conversionType: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      event_category: 'Conversion',
      event_label: conversionType,
      value,
    });
  }
};

// Track user engagement
export const trackEngagement = (action: string, details?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: 'User Engagement',
      ...details,
    });
  }
}; 