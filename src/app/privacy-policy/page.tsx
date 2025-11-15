'use client';

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Terminal } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import StructuredData from '@/components/StructuredData';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <Terminal className="h-8 w-8 text-gray-900" />
              <span className="text-2xl font-bold text-gray-900">
                MyDebugTools
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/jasimvk/mydebugtools"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>Star</span>
              </a>
              <Link 
                href="/tools"
                className="px-6 py-2.5 bg-[#FF6C37] hover:bg-[#ff5722] text-white font-semibold rounded-lg transition-colors shadow-lg"
              >
                Browse Tools
              </Link>
            </div>
          </div>
        </div>
      </header>

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

      {/* Footer */}
      <footer className="max-w-7xl mx-auto pb-6 px-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs">
              <a href="https://github.com/jasimvk/mydebugtools" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">
                ⭐ Star on GitHub
              </a>
              <a href="https://github.com/jasimvk/mydebugtools/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">
                MIT License
              </a>
              <a href="https://github.com/jasimvk/mydebugtools/issues" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">Report Issue</a>
              <a href="https://github.com/jasimvk/mydebugtools/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">Contribute</a>
              <Link href="/contact" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">Contact</Link>
              <Link href="/faq" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">FAQ</Link>
              <Link href="/privacy-policy" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">Privacy & Terms</Link>
            </div>
            <div className="text-xs text-gray-600">
              Built by <a href="https://x.com/jasimvk" target="_blank" rel="noopener noreferrer" className="text-[#FF6C37] hover:underline font-semibold">@jasimvk</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </div>
  );
} 