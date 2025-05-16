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
  startTime: number;
  endTime: number;
  phase: 'js-init' | 'native-init' | 'render' | 'network' | 'other';
}

interface ProfileData {
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

  const parseProfileData = (log: string): ProfileData | null => {
    try {
      const lines = log.split('\n');
      const metrics: StartupMetric[] = [];
      let jsInitTime = 0;
      let nativeInitTime = 0;
      let firstRenderTime = 0;
      let totalDuration = 0;

      lines.forEach(line => {
        // Match React Native performance markers
        const markerMatch = line.match(/\[Performance\]\s+(.+?):\s+(\d+)ms/);
        if (markerMatch) {
          const [_, name, duration] = markerMatch;
          const startTime = totalDuration;
          const endTime = startTime + parseInt(duration);

          let phase: StartupMetric['phase'] = 'other';
          if (name.includes('JavaScript')) {
            phase = 'js-init';
            jsInitTime += parseInt(duration);
          } else if (name.includes('Native')) {
            phase = 'native-init';
            nativeInitTime += parseInt(duration);
          } else if (name.includes('Render') || name.includes('Layout')) {
            phase = 'render';
            firstRenderTime = Math.max(firstRenderTime, endTime);
          } else if (name.includes('Network') || name.includes('API')) {
            phase = 'network';
          }

          metrics.push({
            name,
            duration: parseInt(duration),
            startTime,
            endTime,
            phase
          });

          totalDuration = endTime;
        }
      });

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
    if (input) {
      const data = parseProfileData(input);
      setProfileData(data);
    } else {
      setProfileData(null);
    }
  }, [input]);

  const handleCopy = () => {
    if (!profileData) return;
    const summary = `React Native Startup Profile Summary:
Total Duration: ${profileData.totalDuration}ms
JavaScript Init: ${profileData.jsInitTime}ms
Native Init: ${profileData.nativeInitTime}ms
First Render: ${profileData.firstRenderTime}ms

Detailed Metrics:
${profileData.metrics.map(m => `${m.name}: ${m.duration}ms (${m.phase})`).join('\n')}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!profileData) return;
    const summary = `React Native Startup Profile Summary:
Total Duration: ${profileData.totalDuration}ms
JavaScript Init: ${profileData.jsInitTime}ms
Native Init: ${profileData.nativeInitTime}ms
First Render: ${profileData.firstRenderTime}ms

Detailed Metrics:
${profileData.metrics.map(m => `${m.name}: ${m.duration}ms (${m.phase})`).join('\n')}`;

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <StructuredData
        title="React Native Startup Profiling | MyDebugTools"
        description="Analyze and visualize React Native app startup performance metrics"
        toolType="WebApplication"
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">React Native Startup Profiling</h1>
        <p className="text-lg text-gray-600">
          Analyze your React Native app's startup performance metrics
        </p>
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

          {profileData ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Total Duration</div>
                  <div className="text-2xl font-bold text-blue-900">{profileData.totalDuration}ms</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">First Render</div>
                  <div className="text-2xl font-bold text-green-900">{profileData.firstRenderTime}ms</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">JavaScript Init</div>
                  <div className="text-2xl font-bold text-purple-900">{profileData.jsInitTime}ms</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-orange-600 font-medium">Native Init</div>
                  <div className="text-2xl font-bold text-orange-900">{profileData.nativeInitTime}ms</div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Timeline</h3>
                <div className="space-y-2">
                  {profileData.metrics.map((metric, index) => (
                    <div key={index} className="relative">
                      <div className="text-xs text-gray-500">{metric.name}</div>
                      <div className="h-6 relative w-full bg-gray-200 rounded">
                        <div
                          className={`absolute h-full rounded ${
                            metric.phase === 'js-init' ? 'bg-purple-500' :
                            metric.phase === 'native-init' ? 'bg-orange-500' :
                            metric.phase === 'render' ? 'bg-green-500' :
                            metric.phase === 'network' ? 'bg-blue-500' :
                            'bg-gray-500'
                          }`}
                          style={{
                            left: `${(metric.startTime / profileData.totalDuration) * 100}%`,
                            width: `${(metric.duration / profileData.totalDuration) * 100}%`
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 text-right">{metric.duration}ms</div>
                    </div>
                  ))}
                </div>
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

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-medium text-blue-900 mb-4">How to Get Performance Logs</h2>
        <div className="prose prose-blue">
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Enable performance monitoring in your React Native app:
              <pre className="bg-blue-100 p-2 rounded mt-1 text-sm">
                {`import { PerformanceObserver } from 'react-native';

const observer = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach(entry => {
    console.log(\`[Performance] \${entry.name}: \${entry.duration}ms\`);
  });
});

observer.observe({ entryTypes: ['measure'] });`}
              </pre>
            </li>
            <li>Run your app in development mode</li>
            <li>Copy the performance logs from your console</li>
            <li>Paste them here for analysis</li>
          </ol>
        </div>
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