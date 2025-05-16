'use client';

import React from 'react';

export default function SEOContent() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">SEO Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meta Tag Analyzer */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Meta Tag Analyzer</h2>
          <p className="text-gray-600 mb-4">Analyze and optimize meta tags.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Start Analysis
          </button>
        </div>

        {/* Keyword Density Checker */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Keyword Density Checker</h2>
          <p className="text-gray-600 mb-4">Check keyword density in your content.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Check Density
          </button>
        </div>

        {/* Robots.txt Validator */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Robots.txt Validator</h2>
          <p className="text-gray-600 mb-4">Validate your robots.txt file.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Validate File
          </button>
        </div>

        {/* Sitemap Generator */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Sitemap Generator</h2>
          <p className="text-gray-600 mb-4">Generate XML sitemaps for your website.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Generate Sitemap
          </button>
        </div>
      </div>
    </div>
  );
} 