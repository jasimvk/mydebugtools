'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowDownTrayIcon,
  ClipboardIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { CRASH_TYPES, type CrashType, type ParsedCrashLine } from './crashConfig';
import { parseReactNative } from './parsers/parseReactNative';
import { parseAndroidLogcat } from './parsers/parseAndroidLogcat';
import { parseIOSCrash } from './parsers/parseIOSCrash';
import { parseFlutter } from './parsers/parseFlutter';
import { getCrashType } from './utils/getCrashType';
import PageWrapper from '@/components/PageWrapper';
import StructuredData from '@/components/StructuredData';

function CrashBeautifier() {
  const [input, setInput] = useState('');
  const [selectedType, setSelectedType] = useState<CrashType | ''>('');
  const [parsedLines, setParsedLines] = useState<ParsedCrashLine[]>([]);
  const [copied, setCopied] = useState(false);
  const [autoDetect, setAutoDetect] = useState(true);

  useEffect(() => {
    if (autoDetect && input) {
      const detectedType = getCrashType(input);
      if (detectedType) {
        setSelectedType(detectedType);
      }
    }
  }, [input, autoDetect]);

  const parseLog = () => {
    if (!input || !selectedType) return;

    let parser;
    switch (selectedType) {
      case 'react-native':
        parser = parseReactNative;
        break;
      case 'android-logcat':
        parser = parseAndroidLogcat;
        break;
      case 'ios-crash':
        parser = parseIOSCrash;
        break;
      case 'flutter':
        parser = parseFlutter;
        break;
      default:
        return;
    }

    const parsed = parser(input);
    setParsedLines(parsed);
  };

  useEffect(() => {
    parseLog();
  }, [input, selectedType]);

  const handleCopy = () => {
    const formattedOutput = parsedLines
      .map(line => line.content)
      .join('\n');
    navigator.clipboard.writeText(formattedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const formattedOutput = parsedLines
      .map(line => line.content)
      .join('\n');
    const blob = new Blob([formattedOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beautified-crash${selectedType ? `.${selectedType}` : ''}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <StructuredData
        title="Crash Beautifier | MyDebugTools"
        description="Format and beautify crash logs from React Native, Android, iOS, and Flutter applications."
        toolType="WebApplication"
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crash Beautifier</h1>
        <p className="text-lg text-gray-600">
          Format and beautify crash logs from various platforms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as CrashType | '');
                  setAutoDetect(false);
                }}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select crash type...</option>
                {CRASH_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoDetect}
                  onChange={(e) => setAutoDetect(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Auto-detect</span>
              </label>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your crash log here..."
            className="w-full h-[600px] font-mono text-sm p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Output Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Formatted Output</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4 mr-1.5 text-green-500" />
                ) : (
                  <ClipboardIcon className="h-4 w-4 mr-1.5" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
                Download
              </button>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 h-[600px] overflow-auto">
            <pre className="font-mono text-sm">
              {parsedLines.map((line, index) => (
                <div
                  key={index}
                  className={`${
                    line.type === 'error' ? 'text-red-400' :
                    line.type === 'stack' ? 'text-blue-400' :
                    'text-gray-400'
                  }`}
                >
                  {line.content}
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-medium text-blue-900 mb-4">Supported Crash Log Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CRASH_TYPES.map(type => (
            <div key={type.id} className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 mb-2">{type.label}</h3>
              <p className="text-sm text-gray-600">{type.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <PageWrapper>
      <CrashBeautifier />
    </PageWrapper>
  );
} 