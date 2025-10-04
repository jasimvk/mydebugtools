'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
  functional: boolean;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    analytics: true,
    advertising: true,
    functional: true,
  });

  useEffect(() => {
    setMounted(true);
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      advertising: true,
      functional: true,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    localStorage.setItem('cookie-consent-status', 'accepted');
    setShowBanner(false);
  };

  const declineAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      advertising: false,
      functional: false,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(essentialOnly));
    localStorage.setItem('cookie-consent-status', 'declined');
    setShowBanner(false);
  };

  const savePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    localStorage.setItem('cookie-consent-status', 'customized');
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handlePreferenceChange = (category: keyof CookiePreferences) => {
    if (category === 'essential') return; // Essential cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  if (!mounted || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white shadow-lg z-50 border-t-4 border-blue-500">
      <div className="container mx-auto max-w-6xl p-4">
        {!showPreferences ? (
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">🍪 We use cookies</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                We use cookies to enhance your browsing experience, serve personalized ads, 
                and analyze our traffic. You can accept all cookies, decline non-essential ones, 
                or customize your preferences.{' '}
                <Link href="/cookie-policy" className="text-blue-400 hover:text-blue-300 underline">
                  Learn more
                </Link>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
              <button
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2 text-sm border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
              >
                Customize
              </button>
              <button
                onClick={declineAll}
                className="px-4 py-2 text-sm border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
              >
                Decline All
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Cookie Preferences</h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-gray-400 hover:text-white text-2xl"
                aria-label="Close preferences"
              >
                ×
              </button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {/* Essential Cookies */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-green-400">Essential Cookies</h4>
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  Necessary for basic website functionality, security, and user preferences.
                </p>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.essential}
                    disabled
                    className="sr-only"
                  />
                  <div className="w-5 h-5 bg-green-600 rounded border-2 border-green-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-400">Always active</span>
                </label>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Analytics Cookies</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.analytics}
                      onChange={() => handlePreferenceChange('analytics')}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-300">
                  Help us understand how you use our site with Google Analytics. No personal data is collected.
                </p>
              </div>

              {/* Advertising Cookies */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Advertising Cookies</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.advertising}
                      onChange={() => handlePreferenceChange('advertising')}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-300">
                  Allow personalized ads from Google AdSense based on your interests and browsing behavior.
                </p>
              </div>

              {/* Functional Cookies */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Functional Cookies</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.functional}
                      onChange={() => handlePreferenceChange('functional')}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-300">
                  Remember your preferences like theme settings and tool configurations for a better experience.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-700">
              <button
                onClick={declineAll}
                className="px-4 py-2 text-sm border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
              >
                Decline All
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-sm border border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white rounded-md transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={savePreferences}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}