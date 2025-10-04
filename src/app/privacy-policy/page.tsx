import React from 'react';
import type { Metadata } from 'next';
import PageWrapper from '@/components/PageWrapper';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Privacy Policy | MyDebugTools',
  description: 'Privacy Policy for MyDebugTools - Learn how we collect, use, and protect your data.',
  robots: 'index, follow',
};

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <StructuredData
        title="Privacy Policy | MyDebugTools"
        description="Privacy Policy for MyDebugTools - AdSense Compliant"
        toolType="WebPage"
      />

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-sm text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Introduction</h2>
        <p>
          MyDebugTools ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
          how we collect, use, disclose, and safeguard your information when you visit our website 
          https://mydebugtools.com (the "Service").
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Information We Collect</h2>
        
        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Personal Information</h3>
        <p>We may collect personal information that you voluntarily provide to us when you:</p>
        <ul>
          <li>Visit our website</li>
          <li>Use our development tools</li>
          <li>Contact us for support</li>
          <li>Subscribe to our newsletter (if applicable)</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Automatically Collected Information</h3>
        <p>We automatically collect certain information when you visit our Service:</p>
        <ul>
          <li>IP address and location data</li>
          <li>Browser type and version</li>
          <li>Operating system</li>
          <li>Pages visited and time spent</li>
          <li>Referring website</li>
          <li>Device information</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Local Data Processing</h3>
        <p>
          Our development tools process data locally in your browser. This data includes:
        </p>
        <ul>
          <li>JSON data you format or validate</li>
          <li>JWT tokens you decode</li>
          <li>API requests you test</li>
          <li>Code snippets you format</li>
        </ul>
        <p>
          <strong>Important:</strong> All tool data is processed locally in your browser and is not transmitted 
          to our servers or stored permanently.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
        <p>We use the information we collect for:</p>
        <ul>
          <li>Providing and maintaining our Service</li>
          <li>Improving user experience</li>
          <li>Analyzing usage patterns and trends</li>
          <li>Detecting and preventing technical issues</li>
          <li>Responding to user inquiries</li>
          <li>Complying with legal obligations</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Third-Party Services</h2>
        
        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Google Analytics</h3>
        <p>
          We use Google Analytics to analyze website traffic and usage patterns. Google Analytics 
          may collect information such as your IP address, browser type, and pages visited. 
          You can opt out of Google Analytics by installing the 
          <a href="https://tools.google.com/dlpage/gaoptout" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer"> 
            Google Analytics Opt-out Browser Add-on
          </a>.
        </p>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Google AdSense</h3>
        <p>
          We use Google AdSense to display advertisements on our website. Google AdSense may use cookies 
          and other tracking technologies to serve ads based on your interests. These ads may be based on:
        </p>
        <ul>
          <li>Your visits to our site and other sites on the Internet</li>
          <li>Your demographic information</li>
          <li>Your interests as inferred from your browsing behavior</li>
        </ul>
        <p>
          You can customize your ad preferences or opt out of personalized advertising by visiting 
          <a href="https://www.google.com/settings/ads" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            Google Ad Settings
          </a>.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Cookies and Tracking Technologies</h2>
        <p>
          We use cookies and similar tracking technologies to enhance your experience. Cookies are small 
          data files stored on your device. We use:
        </p>
        <ul>
          <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
          <li><strong>Analytics Cookies:</strong> Help us understand how you use our website</li>
          <li><strong>Advertising Cookies:</strong> Used to show relevant advertisements</li>
        </ul>
        <p>
          You can control cookies through your browser settings, but disabling cookies may affect 
          website functionality.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Data Sharing and Disclosure</h2>
        <p>We may share your information in the following circumstances:</p>
        <ul>
          <li><strong>Service Providers:</strong> With third-party companies that help us operate our Service</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
          <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition</li>
        </ul>
        <p>We do not sell, trade, or rent your personal information to third parties.</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Data Security</h2>
        <p>
          We implement appropriate technical and organizational security measures to protect your 
          information. However, no method of transmission over the Internet is 100% secure, and 
          we cannot guarantee absolute security.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Your Rights and Choices</h2>
        <p>Depending on your location, you may have the following rights:</p>
        <ul>
          <li>Access to your personal information</li>
          <li>Correction of inaccurate information</li>
          <li>Deletion of your personal information</li>
          <li>Objection to processing</li>
          <li>Data portability</li>
          <li>Withdrawal of consent</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Children's Privacy</h2>
        <p>
          Our Service does not address anyone under the age of 13. We do not knowingly collect 
          personally identifiable information from children under 13. If you are a parent or 
          guardian and believe your child has provided us with personal information, please contact us.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries other than your own. 
          We take appropriate measures to ensure your information receives adequate protection.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes 
          by posting the new Privacy Policy on this page and updating the "Last updated" date.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Information</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mt-4">
          <p><strong>Email:</strong> support@mydebugtools.com</p>
          <p><strong>Website:</strong> https://mydebugtools.com</p>
        </div>
      </div>
    </div>
  );
} 