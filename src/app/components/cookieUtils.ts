// Cookie preferences utility
export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
  functional: boolean;
}

export const getCookiePreferences = (): CookiePreferences => {
  if (typeof window === 'undefined') {
    // Default preferences for server-side rendering
    return {
      essential: true,
      analytics: false,
      advertising: false,
      functional: false,
    };
  }

  const cookieConsentStatus = localStorage.getItem('cookie-consent-status');
  const cookieConsentData = localStorage.getItem('cookie-consent');

  // Default to accepting all if no preference set yet
  const defaultPreferences: CookiePreferences = {
    essential: true,
    analytics: true,
    advertising: true,
    functional: true,
  };

  if (!cookieConsentStatus) {
    return defaultPreferences;
  }

  if (cookieConsentStatus === 'accepted') {
    return defaultPreferences;
  }

  if (cookieConsentStatus === 'declined') {
    return {
      essential: true,
      analytics: false,
      advertising: false,
      functional: false,
    };
  }

  if (cookieConsentStatus === 'customized' && cookieConsentData) {
    try {
      const preferences = JSON.parse(cookieConsentData);
      return {
        essential: true, // Always true
        analytics: preferences.analytics || false,
        advertising: preferences.advertising || false,
        functional: preferences.functional || false,
      };
    } catch (e) {
      console.error('Error parsing cookie preferences:', e);
      return {
        essential: true,
        analytics: false,
        advertising: false,
        functional: false,
      };
    }
  }

  return defaultPreferences;
};

export const hasConsentForCategory = (category: keyof CookiePreferences): boolean => {
  const preferences = getCookiePreferences();
  return preferences[category];
};