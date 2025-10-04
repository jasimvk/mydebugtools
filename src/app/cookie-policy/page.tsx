import React from 'react';
import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Cookie Policy | MyDebugTools',
  description: 'Cookie Policy for MyDebugTools - Learn about our use of cookies and tracking technologies.',
  robots: 'index, follow',
};

export default function CookiePolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <StructuredData
        title="Cookie Policy | MyDebugTools"
        description="Cookie Policy for MyDebugTools"
        toolType="WebPage"
      />

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-sm text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What Are Cookies?</h2>
        <p>
          Cookies are small text files that are stored on your computer or mobile device when you visit a website. 
          They help websites remember information about your visit, such as your preferences and login status.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How We Use Cookies</h2>
        <p>
          MyDebugTools uses cookies to enhance your browsing experience and provide personalized content. 
          We use cookies for:
        </p>
        <ul>
          <li>Website functionality and user preferences</li>
          <li>Analytics and performance monitoring</li>
          <li>Advertising and marketing purposes</li>
          <li>Security and fraud prevention</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Types of Cookies We Use</h2>
        
        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Essential Cookies</h3>
        <p>
          These cookies are necessary for the website to function properly. They enable basic functions 
          like page navigation and access to secure areas of the website.
        </p>
        
        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Analytics Cookies</h3>
        <p>
          We use Google Analytics cookies to understand how visitors interact with our website. 
          These cookies collect information about:
        </p>
        <ul>
          <li>Pages visited and time spent on each page</li>
          <li>How users navigate through the site</li>
          <li>Technical information about browsers and devices</li>
          <li>General location information (country/city level)</li>
        </ul>
        
        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Advertising Cookies</h3>
        <p>
          We use Google AdSense to display advertisements. These cookies:
        </p>
        <ul>
          <li>Help show relevant ads based on your interests</li>
          <li>Measure ad effectiveness</li>
          <li>Prevent showing the same ad too many times</li>
          <li>Enable features like remarketing</li>
        </ul>
        
        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Functionality Cookies</h3>
        <p>
          These cookies remember your preferences and settings, such as:
        </p>
        <ul>
          <li>Theme preferences (dark/light mode)</li>
          <li>Tool settings and configurations</li>
          <li>Language preferences</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Third-Party Cookies</h2>
        <p>
          We use services from third parties that may set their own cookies:
        </p>
        
        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Google Analytics</h3>
        <p>
          Google Analytics uses cookies to track website usage. You can opt out by installing the 
          <a href="https://tools.google.com/dlpage/gaoptout" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            Google Analytics Opt-out Browser Add-on
          </a>.
        </p>
        
        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Google AdSense</h3>
        <p>
          Google AdSense uses cookies to serve personalized ads. You can manage your ad preferences at 
          <a href="https://www.google.com/settings/ads" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            Google Ad Settings
          </a>.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Managing Cookies</h2>
        <p>
          You can control and manage cookies in several ways:
        </p>
        
        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Browser Settings</h3>
        <p>
          Most browsers allow you to:
        </p>
        <ul>
          <li>View and delete cookies</li>
          <li>Block cookies from specific sites</li>
          <li>Block third-party cookies</li>
          <li>Clear all cookies when you close the browser</li>
        </ul>
        
        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Opt-Out Links</h3>
        <ul>
          <li>
            <a href="https://tools.google.com/dlpage/gaoptout" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Google Analytics Opt-out
            </a>
          </li>
          <li>
            <a href="https://www.google.com/settings/ads" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Google Ad Settings
            </a>
          </li>
          <li>
            <a href="http://www.networkadvertising.org/choices/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Network Advertising Initiative Opt-out
            </a>
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Impact of Disabling Cookies</h2>
        <p>
          While you can disable cookies, please note that:
        </p>
        <ul>
          <li>Some website features may not work properly</li>
          <li>Your preferences may not be saved</li>
          <li>You may see less relevant advertisements</li>
          <li>Analytics tracking will be affected</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Updates to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time. Any changes will be posted on this page 
          with an updated revision date.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Us</h2>
        <p>
          If you have any questions about our use of cookies, please contact us at:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mt-4">
          <p><strong>Email:</strong> support@mydebugtools.com</p>
          <p><strong>Website:</strong> https://mydebugtools.com</p>
        </div>
      </div>
    </div>
  );
}