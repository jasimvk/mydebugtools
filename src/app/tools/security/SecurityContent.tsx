'use client';

import React, { useState, useEffect } from 'react';

export default function SecurityContent() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">Security Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Password Generator */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Password Generator</h2>
          <p className="text-gray-600 mb-4">Generate secure, random passwords.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Generate Password
          </button>
        </div>

        {/* Hash Generator */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Hash Generator</h2>
          <p className="text-gray-600 mb-4">Generate hashes using various algorithms.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Generate Hash
          </button>
        </div>

        {/* SSL Checker */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">SSL Checker</h2>
          <p className="text-gray-600 mb-4">Check SSL certificate information.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Check SSL
          </button>
        </div>

        {/* Encryption Tool */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Encryption Tool</h2>
          <p className="text-gray-600 mb-4">Encrypt and decrypt text using various algorithms.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Start Encryption
          </button>
        </div>
      </div>
    </div>
  );
} 