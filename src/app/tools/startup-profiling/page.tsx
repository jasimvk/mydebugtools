'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowDownTrayIcon,
  ClipboardIcon,
  CheckIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import PageWrapper from '@/components/PageWrapper';
import StructuredData from '@/components/StructuredData';

interface StartupMetric {
  name: string;
  duration: number;
  phase: 'js-init' | 'native-init' | 'render' | 'network' | 'other';
}

interface ProfileData {
  /** Sum of every phase duration. Markers carry no offsets, so this is not wall-clock time. */
  totalDuration: number;
  metrics: StartupMetric[];
  jsInitTime: number;
  nativeInitTime: number;
  firstRenderTime: number;
}

function StartupProfiling() {
  const [input, setInput] = useState('');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

  const parseProfileData = (log: string): ProfileData | null => {
    try {
      const lines = log.split('\n');
      const metrics: StartupMetric[] = [];
      let jsInitTime = 0;
      let nativeInitTime = 0;
      let firstRenderTime = 0;
      let totalDuration = 0;

      lines.forEach(line => {
        // Match React Native performance markers. Durations are often fractional
        // (`350.4ms`) or expressed in seconds (`1.2s`).
        const markerMatch = line.match(/\[Performance\]\s+(.+?):\s+(\d+(?:\.\d+)?)\s*(ms|s)\b/i);
        if (markerMatch) {
          const [, name, rawDuration, unit] = markerMatch;
          const duration = parseFloat(rawDuration) * (unit.toLowerCase() === 's' ? 1000 : 1);

          let phase: StartupMetric['phase'] = 'other';
          if (name.includes('JavaScript')) {
            phase = 'js-init';
            jsInitTime += duration;
          } else if (name.includes('Native')) {
            phase = 'native-init';
            nativeInitTime += duration;
          } else if (/Render|Layout/.test(name)) {
            phase = 'render';
            // Only the First Render marker is the first-render duration; a Layout marker
            // is a different phase and must not overwrite it.
            if (/First Render/i.test(name)) firstRenderTime = duration;
          } else if (name.includes('Network') || name.includes('API')) {
            phase = 'network';
          }

          metrics.push({ name, duration, phase });
          totalDuration += duration;
        }
      });

      if (metrics.length === 0) {
        return null;
      }

      return {
        totalDuration,
        metrics,
        jsInitTime,
        nativeInitTime,
        firstRenderTime
      };
    } catch (error) {
      console.error('Error parsing profile data:', error);
      return null;
    }
  };

  useEffect(() => {
    setProfileData(input.trim() ? parseProfileData(input) : null);
  }, [input]);

  const noMarkersFound = Boolean(input.trim()) && !profileData;

  const formatMs = (value: number) => `${Number(value.toFixed(1))}ms`;

  const buildSummary = (data: ProfileData) => `React Native Startup Profile Summary:
Sum of phase durations: ${formatMs(data.totalDuration)}
JavaScript Init: ${formatMs(data.jsInitTime)}
Native Init: ${formatMs(data.nativeInitTime)}
First Render: ${formatMs(data.firstRenderTime)}

Detailed Metrics:
${data.metrics.map(m => `${m.name}: ${formatMs(m.duration)} (${m.phase})`).join('\n')}`;

  const handleCopy = async () => {
    if (!profileData) return;
    setCopyError('');
    try {
      await navigator.clipboard.writeText(buildSummary(profileData));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError('Clipboard is unavailable in this browser. Use Download instead.');
    }
  };

  const handleDownload = () => {
    if (!profileData) return;
    const summary = buildSummary(profileData);

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rn-startup-profile.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    setInput(`[Performance] Native Bridge Init: 120ms
[Performance] JavaScript Init: 350ms
[Performance] First Render: 250ms
[Performance] API Bootstrap: 180ms
[Performance] Layout Commit: 90ms`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <StructuredData
        title="React Native Startup Profiling | debugtools"
        description="Analyze and visualize React Native app startup performance metrics"
        toolType="WebApplication"
      />

      <div className="mb-4 flex flex-col justify-between gap-3 rounded-md border border-[#e4e4e7] bg-white px-5 py-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#71717a]">tools/startup</p>
          <h1 className="mt-2 text-[#09090b]">Startup Profiling</h1>
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
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900">Performance Log Input</h2>
            <p className="text-sm text-gray-600 mt-1">
              Paste your React Native performance log here
            </p>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="[Performance] JavaScript Init: 350ms
[Performance] Native Bridge Init: 120ms
[Performance] First Render: 250ms
..."
            className="w-full h-[400px] font-mono text-sm p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Output Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Analysis Results</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleCopy}
                disabled={!profileData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
                disabled={!profileData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
                Download
              </button>
            </div>
          </div>

          {copyError && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{copyError}</p>
          )}

          {profileData ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Sum of phase durations</div>
                  <div className="text-2xl font-bold text-blue-900">{formatMs(profileData.totalDuration)}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">First Render</div>
                  <div className="text-2xl font-bold text-green-900">{formatMs(profileData.firstRenderTime)}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">JavaScript Init</div>
                  <div className="text-2xl font-bold text-purple-900">{formatMs(profileData.jsInitTime)}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Native Init</div>
                  <div className="text-2xl font-bold text-orange-900">{formatMs(profileData.nativeInitTime)}</div>
                </div>
              </div>

              {/* Phase durations. Markers carry no start offsets, so bars are relative
                  widths rather than positions on a wall-clock timeline. */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Phase durations</h3>
                <div className="space-y-2">
                  {profileData.metrics.map((metric, index) => (
                    <div key={index} className="relative">
                      <div className="text-xs text-gray-500">{metric.name}</div>
                      <div className="h-6 relative w-full bg-gray-200 rounded">
                        <div
                          className={`absolute h-full rounded ${
                            metric.phase === 'js-init' ? 'bg-purple-500' :
                            metric.phase === 'native-init' ? 'bg-blue-500' :
                            metric.phase === 'render' ? 'bg-green-500' :
                            metric.phase === 'network' ? 'bg-blue-500' :
                            'bg-gray-500'
                          }`}
                          style={{
                            width: profileData.totalDuration > 0
                              ? `${(metric.duration / profileData.totalDuration) * 100}%`
                              : '0%'
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 text-right">{formatMs(metric.duration)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : noMarkersFound ? (
            <div className="h-[400px] flex items-center justify-center text-gray-500">
              <div className="text-center px-6">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-4" />
                <p className="font-medium text-gray-700">No performance markers found</p>
                <p className="mt-1 text-sm">
                  Lines must look like <code>[Performance] JavaScript Init: 350ms</code> (<code>ms</code> or <code>s</code>).
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-4" />
                <p>Paste a performance log to see the analysis</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-md border border-[#e4e4e7] bg-white px-4 py-3 text-sm text-[#71717a]">
        Accepts performance markers like <code>[Performance] JavaScript Init: 350ms</code>.
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <PageWrapper>
      <StartupProfiling />
    </PageWrapper>
  );
} 
