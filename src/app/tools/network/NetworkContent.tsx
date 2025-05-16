'use client';

import React, { useState, useEffect } from 'react';

export default function NetworkContent() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">Network Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Network Speed Test */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Network Speed Test</h2>
          <p className="text-gray-600 mb-4">Test your internet connection speed.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Start Speed Test
          </button>
        </div>

        {/* Port Scanner */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Port Scanner</h2>
          <p className="text-gray-600 mb-4">Scan for open ports on a host.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Start Port Scan
          </button>
        </div>

        {/* DNS Lookup */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">DNS Lookup</h2>
          <p className="text-gray-600 mb-4">Look up DNS records for a domain.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Start DNS Lookup
          </button>
        </div>

        {/* Ping Tool */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Ping Tool</h2>
          <p className="text-gray-600 mb-4">Ping a host to check connectivity.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Start Ping
          </button>
        </div>
      </div>
    </div>
  );
} 