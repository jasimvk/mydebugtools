import React from 'react';
import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Terms of Service | MyDebugTools',
  description: 'Terms of Service for MyDebugTools - Read our terms and conditions for using our developer tools.',
  robots: 'index, follow',
};

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <StructuredData
        title="Terms of Service | MyDebugTools"
        description="Terms of Service for MyDebugTools"
        toolType="WebPage"
      />

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-sm text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Agreement to Terms</h2>
        <p>
          By accessing and using MyDebugTools ("the Service"), you accept and agree to be bound by the terms 
          and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Description of Service</h2>
        <p>
          MyDebugTools provides a collection of web-based development tools including but not limited to:
        </p>
        <ul>
          <li>JSON Formatter and Validator</li>
          <li>JWT Token Decoder</li>
          <li>Base64 Encoder/Decoder</li>
          <li>API Testing Tools</li>
          <li>Code Formatters</li>
          <li>Developer Utilities</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Acceptable Use Policy</h2>
        <p>You agree not to use the Service to:</p>
        <ul>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe on intellectual property rights</li>
          <li>Transmit malicious code or harmful content</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Interfere with the proper functioning of the Service</li>
          <li>Use the Service for commercial purposes without permission</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Data Processing</h2>
        <p>
          Our development tools process data locally in your browser. We do not store or transmit 
          the content you process through our tools to our servers. However:
        </p>
        <ul>
          <li>We may collect usage analytics to improve our Service</li>
          <li>We use cookies and tracking technologies as described in our Privacy Policy</li>
          <li>Third-party services (Google Analytics, AdSense) may collect data as per their policies</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Intellectual Property Rights</h2>
        <p>
          The Service and its original content, features, and functionality are owned by MyDebugTools 
          and are protected by international copyright, trademark, patent, trade secret, and other 
          intellectual property laws.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">User Content</h2>
        <p>
          You retain ownership of any content you process through our tools. By using our Service, 
          you grant us the right to process this content solely for the purpose of providing the 
          requested functionality.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Disclaimer of Warranties</h2>
        <p>
          The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations 
          or warranties of any kind, express or implied, regarding:
        </p>
        <ul>
          <li>The accuracy or completeness of the Service</li>
          <li>The availability or uninterrupted access to the Service</li>
          <li>The fitness for a particular purpose</li>
          <li>The security of data processed through our tools</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Limitation of Liability</h2>
        <p>
          In no event shall MyDebugTools be liable for any indirect, incidental, special, 
          consequential, or punitive damages, including without limitation, loss of profits, 
          data, use, goodwill, or other intangible losses.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Advertising</h2>
        <p>
          Our Service may display advertisements provided by third-party advertising networks, 
          including Google AdSense. These ads may be targeted based on your interests and browsing 
          behavior. We do not control the content of these advertisements.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Modifications to Service</h2>
        <p>
          We reserve the right to modify or discontinue the Service at any time, with or without 
          notice. We shall not be liable to you or any third party for any modification, 
          suspension, or discontinuance of the Service.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Termination</h2>
        <p>
          We may terminate or suspend your access to the Service immediately, without prior notice 
          or liability, for any reason, including breach of these Terms.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the 
          jurisdiction in which MyDebugTools operates, without regard to conflict of law provisions.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Changes to Terms</h2>
        <p>
          We reserve the right to update these Terms at any time. We will notify users of any 
          material changes by posting the new Terms on this page and updating the "Last updated" date.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Information</h2>
        <p>
          If you have questions about these Terms, please contact us at:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mt-4">
          <p><strong>Email:</strong> support@mydebugtools.com</p>
          <p><strong>Website:</strong> https://mydebugtools.com</p>
        </div>
      </div>
    </div>
  );
}