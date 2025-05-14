'use client';

import React, { useState, Suspense } from 'react';

function PrivacyPolicyContent() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-blue-600 border-b-2 border-blue-600 pb-4 mb-8">
            MyDebugTools Privacy Policy
          </h1>
          
          <div className="text-gray-600 text-sm mb-8">
            Last updated: April 2, 2024
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-blue-600 mb-4">Overview</h2>
              <p className="text-gray-700">
                MyDebugTools is a developer-focused Chrome extension that provides various debugging and development tools. 
                This privacy policy explains how we handle data and use permissions in our extension.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-600 mb-4">Permissions and Their Use</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">activeTab</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li><strong>Purpose:</strong> Required to access the current tab's content for debugging and development purposes.</li>
                    <li><strong>Usage:</strong> Only used when explicitly requested by the user through the extension's interface.</li>
                    <li><strong>Data Handling:</strong> No data is collected or stored from the active tab.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">contextMenus</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li><strong>Purpose:</strong> Enables right-click menu integration for quick access to debugging tools.</li>
                    <li><strong>Usage:</strong> Provides context menu options for selected text to quickly format, decode, or analyze content.</li>
                    <li><strong>Data Handling:</strong> Only processes the selected text when explicitly requested by the user.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">storage</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li><strong>Purpose:</strong> Stores user preferences and tool settings locally.</li>
                    <li><strong>Usage:</strong> Saves theme preferences, last used tools, and input history for better user experience.</li>
                    <li><strong>Data Handling:</strong> All data is stored locally in the browser and is not transmitted to any external servers.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-600 mb-4">Data Collection and Usage</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>We do not collect any personal information or browsing data.</li>
                <li>All data processing happens locally in the user's browser.</li>
                <li>No data is transmitted to external servers.</li>
                <li>User preferences and settings are stored locally only.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-600 mb-4">Data Security</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>All data is stored locally in the browser's storage.</li>
                <li>No external connections are made except for user-initiated API tests.</li>
                <li>The extension uses strict Content Security Policy to prevent unauthorized code execution.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-600 mb-4">User Rights</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Users can clear all stored data at any time using the "Clear All Data" button.</li>
                <li>No personal data is collected, so no data deletion requests are necessary.</li>
                <li>Users can disable the extension at any time.</li>
              </ul>
            </section>

            <section className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-blue-600 mb-4">Contact Information</h2>
              <p className="text-gray-700">
                For privacy-related questions or concerns, please contact:
                <br />
                <a href="mailto:privacy@mydebugtools.com" className="text-blue-600 hover:text-blue-800">
                  privacy@mydebugtools.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-600 mb-4">Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. Users will be notified of any significant changes 
                through the extension's update process.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={
        <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 font-medium">Loading Privacy Policy...</p>
          </div>
        </div>
      }>
        <PrivacyPolicyContent />
      </Suspense>
    </div>
  );
} 