'use client';

import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import StructuredData from '@/components/StructuredData';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <StructuredData
        title="Privacy Policy | MyDebugTools"
        description="Privacy Policy for MyDebugTools"
        toolType="WebPage"
      />

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>Introduction</h2>
        <p>
          MyDebugTools is committed to protecting your privacy. This Privacy Policy explains how we collect,
          use, and safeguard your information when you use our website.
        </p>

        <h2>Information We Collect</h2>
        <p>We collect information that you provide directly to us, including:</p>
        <ul>
          <li>Usage data and analytics</li>
          <li>Information about your device and browser</li>
          <li>Data you input into our tools</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide and maintain our services</li>
          <li>Improve and optimize our tools</li>
          <li>Analyze usage patterns</li>
          <li>Detect and prevent technical issues</li>
        </ul>

        <h2>Data Security</h2>
        <p>
          We implement appropriate security measures to protect your information. However, no method of
          transmission over the Internet is 100% secure.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at:
          support@mydebugtools.com
        </p>
      </div>
    </div>
  );
} 