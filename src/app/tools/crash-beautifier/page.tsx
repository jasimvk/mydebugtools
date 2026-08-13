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
  const [copyError, setCopyError] = useState('');
  const [autoDetect, setAutoDetect] = useState(true);
  const [detectionError, setDetectionError] = useState('');

  useEffect(() => {
    if (!autoDetect || !input) {
      setDetectionError('');
      return;
    }

    const detectedType = getCrashType(input);
    if (detectedType) {
      setSelectedType(detectedType);
      setDetectionError('');
      return;
    }

    // Keeping the previous type here would silently run the wrong parser.
    setSelectedType('');
    setDetectionError('Could not detect the crash format. Pick a type manually or turn off auto-detect.');
  }, [input, autoDetect]);

  const parseLog = () => {
    if (!input || !selectedType) {
      setParsedLines([]);
      return;
    }

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

  const formatLocation = (line: ParsedCrashLine) =>
    [line.file, line.line, line.column].filter(part => part !== undefined && part !== '').join(':');

  const isFrame = (line: ParsedCrashLine) => line.type === 'stack' && Boolean(line.functionName || line.file);

  // Export the parsed fields, not the raw input: the whole point of the tool is the
  // function/file/line split the parsers already produced.
  const formatOutput = () =>
    parsedLines
      .map(line => (isFrame(line) ? `    ${line.functionName || '<anonymous>'}\t${formatLocation(line)}` : line.content))
      .join('\n');

  const handleCopy = async () => {
    setCopyError('');
    try {
      await navigator.clipboard.writeText(formatOutput());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError('Clipboard is unavailable in this browser. Use Download instead.');
    }
  };

  const handleDownload = () => {
    const formattedOutput = formatOutput();
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

  const loadSample = () => {
    setInput(`TypeError: Cannot read property 'map' of undefined
    at UserList.render (src/screens/UserList.tsx:42:18)
    at finishClassComponent (node_modules/react-reconciler/cjs/react-reconciler.development.js:17160:31)
    at updateClassComponent (node_modules/react-reconciler/cjs/react-reconciler.development.js:17110:24)`);
    setSelectedType('react-native');
    setAutoDetect(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <StructuredData
        title="Crash Beautifier | debugtools"
        description="Format and beautify crash logs from React Native, Android, iOS, and Flutter applications."
        toolType="WebApplication"
      />

      <div className="mb-4 flex flex-col justify-between gap-3 rounded-md border border-[#e4e4e7] bg-white px-5 py-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#71717a]">tools/crash</p>
          <h1 className="mt-2 text-[#09090b]">Crash Beautifier</h1>
        </div>
        <button
          type="button"
          onClick={loadSample}
          className="rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm font-semibold text-[#09090b] hover:bg-[#fafafa]"
        >
          Sample
        </button>
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

          {detectionError && (
            <p className="mb-2 rounded-md border border-[#bf8700] bg-[#fff8c5] px-3 py-2 text-sm text-[#7d4e00]">
              {detectionError}
            </p>
          )}

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
                disabled={parsedLines.length === 0}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
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
                disabled={parsedLines.length === 0}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
                Download
              </button>
            </div>
          </div>

          {copyError && (
            <p className="mb-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{copyError}</p>
          )}

          <div className="bg-gray-900 rounded-lg p-4 h-[600px] overflow-auto">
            {parsedLines.length === 0 ? (
              <p className="text-sm text-gray-500">
                Paste a crash log on the left. Parsed frames appear here as function and file:line:column.
              </p>
            ) : (
              <pre className="font-mono text-sm">
                {parsedLines.map((line, index) => (
                  isFrame(line) ? (
                    <div key={index} className="grid grid-cols-1 gap-x-4 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
                      <span className="truncate text-blue-400">{line.functionName || '<anonymous>'}</span>
                      <span className="break-all text-gray-400">{formatLocation(line)}</span>
                    </div>
                  ) : (
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
                  )
                ))}
              </pre>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-[#e4e4e7] bg-white p-4">
        <h2 className="text-[#09090b]">Supported inputs</h2>
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
