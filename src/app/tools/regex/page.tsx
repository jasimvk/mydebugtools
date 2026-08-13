'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MagnifyingGlassIcon, 
  ArrowPathIcon, 
  DocumentDuplicateIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { buildRegexFlags, type RegexResults } from '@/app/tools/lib/tool-utils';
import { runRegexTestSafely } from '@/app/tools/lib/regex-worker-client';

const emptyResults: RegexResults = { match: false, matches: [], groups: [], truncated: false, timedOut: false };

// Regex flags
const regexFlags = [
  { value: 'g', label: 'Global (g)' },
  { value: 'i', label: 'Case-insensitive (i)' },
  { value: 'm', label: 'Multiline (m)' },
  { value: 's', label: 'Dot all (s)' },
  { value: 'u', label: 'Unicode (u)' },
  { value: 'y', label: 'Sticky (y)' }
];

// Common regex patterns
const commonPatterns = [
  { name: 'Email', pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' },
  { name: 'URL', pattern: '^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$' },
  { name: 'Phone (US)', pattern: '^\\+?1?\\s*\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$' },
  { name: 'Date (YYYY-MM-DD)', pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$' },
  { name: 'Time (HH:MM:SS)', pattern: '^([01]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)$' },
  { name: 'IPv4', pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$' },
  { name: 'Hex Color', pattern: '^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$' },
  { name: 'Username', pattern: '^[a-zA-Z0-9_]{3,16}$' },
  { name: 'Password', pattern: '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$' },
  { name: 'Credit Card', pattern: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\\d{3})\\d{11})$' }
];

// Keyboard shortcuts
const keyboardShortcuts = [
  { key: 'Ctrl+Enter / Cmd+Enter', description: 'Test regex' },
  { key: 'Ctrl+R / Cmd+R', description: 'Reset all' },
  { key: 'Ctrl+C / Cmd+C', description: 'Copy results' },
  { key: 'Ctrl+H / Cmd+H', description: 'Show/hide help' }
];

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [replacement, setReplacement] = useState('');
  // An empty string is a valid replacement, so intent is tracked separately from the value.
  const [replacementEnabled, setReplacementEnabled] = useState(false);
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [results, setResults] = useState<RegexResults>(emptyResults);
  const [replacedText, setReplacedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Toggle flag
  const toggleFlag = (flag: string) => {
    if (selectedFlags.includes(flag)) {
      setSelectedFlags(selectedFlags.filter(f => f !== flag));
    } else {
      setSelectedFlags([...selectedFlags, flag]);
    }
  };

  // Clear results whenever the inputs change so stale matches are never shown
  const clearResults = () => {
    setResults(emptyResults);
    setReplacedText(null);
    setError(null);
  };

  // Test regex. Matching runs in a terminable worker: a catastrophically
  // backtracking pattern never returns from a single exec(), so an in-loop time
  // check cannot save the tab — only killing the thread can.
  const testRegex = async () => {
    if (!pattern) {
      setError('Please enter a regex pattern');
      return;
    }

    setIsTesting(true);
    setError(null);

    try {
      const nextResults = await runRegexTestSafely(pattern, testString, selectedFlags);

      if (nextResults.error) {
        setError(nextResults.error);
        setResults(emptyResults);
        setReplacedText(null);
        return;
      }

      setResults(nextResults);

      // Replacement runs on the main thread, so only attempt it once the worker
      // has shown the pattern is well-behaved on this input.
      if (replacementEnabled && !nextResults.timedOut) {
        // Same flags the matcher used, so both panes agree.
        const replaced = testString.replace(new RegExp(pattern, buildRegexFlags(selectedFlags)), replacement);
        setReplacedText(replaced);
      } else {
        setReplacedText(null);
      }

      if (nextResults.timedOut) {
        showNotification('Pattern took too long and was stopped — try a less ambiguous pattern', 'error');
      } else if (nextResults.truncated) {
        showNotification('Too many matches — showing the first 1000', 'info');
      } else {
        showNotification('Regex tested successfully', 'success');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid regex pattern');
      setResults(emptyResults);
      setReplacedText(null);
    } finally {
      setIsTesting(false);
    }
  };

  // Reset all
  const resetAll = () => {
    setPattern('');
    setTestString('');
    setReplacement('');
    setReplacementEnabled(false);
    setSelectedFlags([]);
    setResults(emptyResults);
    setReplacedText(null);
    setError(null);
    showNotification('All fields reset', 'info');
  };

  // Copy results to clipboard
  const copyResults = async () => {
    const resultText = `Pattern: ${pattern}\nFlags: ${selectedFlags.join('')}\nTest String: ${testString}\n\nMatches: ${results.matches.length}\n${results.matches.map((m, i) => `${i+1}. ${m}`).join('\n')}\n\nGroups: ${results.groups.length}\n${results.groups.map((g) => `Match ${g.matchIndex}: ${g.values.join(', ')}`).join('\n')}`;
    try {
      await navigator.clipboard.writeText(resultText);
      showNotification('Results copied to clipboard', 'success');
    } catch {
      showNotification('Could not copy to clipboard', 'error');
    }
  };

  // Apply common pattern
  const applyCommonPattern = (pattern: string) => {
    setPattern(pattern);
    clearResults();
    showNotification('Pattern applied', 'info');
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if target is an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + Enter to test regex
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        testRegex();
      }
      
      // Ctrl/Cmd + R to reset all
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        resetAll();
      }
      
      // Ctrl/Cmd + C to copy results, but never over a real text selection
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (window.getSelection()?.toString()) {
          return;
        }
        e.preventDefault();
        copyResults();
      }

      // Ctrl/Cmd + H to toggle help
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowHelp(v => !v);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pattern, testString, replacement, replacementEnabled, selectedFlags, results]);

  return (
    <div className="container mx-auto p-4">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <MagnifyingGlassIcon className="h-6 w-6 text-blue-500" />
              Regular Expression Tester
            </CardTitle>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowHelp(!showHelp)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Show help"
              >
                <QuestionMarkCircleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <CardDescription>
            Test and validate regular expressions with real-time matching and replacement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Help panel */}
          {showHelp && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-1">
                <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                How to Use
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Basic Usage</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Enter your regex pattern in the Pattern field</li>
                    <li>Select regex flags (g, i, m, etc.)</li>
                    <li>Enter text to test against in the Test String field</li>
                    <li>Click "Test" or press Ctrl+Enter to see matches</li>
                    <li>Optionally enter a replacement string to see the result</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Keyboard Shortcuts</h4>
                  <ul className="space-y-1 text-sm">
                    {keyboardShortcuts.map((shortcut, index) => (
                      <li key={index} className="flex justify-between">
                        <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">{shortcut.key}</span>
                        <span>{shortcut.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Common patterns */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Common Patterns</h3>
            <div className="flex flex-wrap gap-2">
              {commonPatterns.map((item, index) => (
                <button
                  key={index}
                  onClick={() => applyCommonPattern(item.pattern)}
                  className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            <button
              onClick={testRegex}
              disabled={isTesting}
              className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              {isTesting ? 'Testing…' : 'Test'}
            </button>
            <button 
              onClick={resetAll}
              className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Reset
            </button>
            <button 
              onClick={copyResults}
              className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
              Copy Results
            </button>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="regex-pattern" className="block text-sm font-medium mb-1">Pattern</label>
                <div className="flex gap-2">
                  <input
                    id="regex-pattern"
                    type="text"
                    value={pattern}
                    onChange={(e) => { setPattern(e.target.value); clearResults(); }}
                    placeholder="Enter regex pattern..."
                    className="flex-1 p-2 border rounded-md font-mono"
                  />
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Regex flags"
                  >
                    <FlagIcon className="h-5 w-5" />
                  </button>
                </div>
                {error && <p role="alert" className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              <div>
                <label htmlFor="regex-test-string" className="block text-sm font-medium mb-1">Test String</label>
                <textarea
                  id="regex-test-string"
                  value={testString}
                  onChange={(e) => { setTestString(e.target.value); clearResults(); }}
                  placeholder="Enter text to test against..."
                  className="w-full h-32 p-2 border rounded-md font-mono"
                />
              </div>

              <div>
                <label htmlFor="regex-replacement" className="block text-sm font-medium mb-1">Replacement (optional)</label>
                <input
                  id="regex-replacement"
                  type="text"
                  value={replacement}
                  onChange={(e) => { setReplacement(e.target.value); setReplacementEnabled(true); setReplacedText(null); }}
                  placeholder="Enter replacement text..."
                  className="w-full p-2 border rounded-md font-mono"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Results</h3>
                <div aria-live="polite" className="p-2 border rounded-md bg-gray-50 dark:bg-gray-800 min-h-[200px]">
                  {results.match ? (
                    <div>
                      <p className="text-green-500 font-medium">Match found!</p>
                      {results.timedOut && (
                        <p className="text-red-500 text-sm mt-1">Pattern took too long to run — showing partial results.</p>
                      )}
                      {results.truncated && (
                        <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">Match limit reached — showing the first 1000 matches.</p>
                      )}
                      <div className="mt-2">
                        <p className="font-medium text-gray-900 dark:text-white">Matches ({results.matches.length}):</p>
                        <ul className="list-disc list-inside mt-1">
                          {results.matches.map((match, index) => (
                            <li key={index} className="font-mono text-sm text-gray-800 dark:text-gray-200">{match}</li>
                          ))}
                        </ul>
                      </div>
                      {results.groups.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium text-gray-900 dark:text-white">Groups:</p>
                          <ul className="list-disc list-inside mt-1">
                            {results.groups.map((group, index) => (
                              <li key={index} className="font-mono text-sm text-gray-800 dark:text-gray-200">
                                Match {group.matchIndex}: {group.values.join(', ')}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {replacedText !== null && (
                        <div className="mt-2">
                          <p className="font-medium text-gray-900 dark:text-white">Replaced Text:</p>
                          <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm overflow-x-auto text-gray-800 dark:text-gray-200">
                            {replacedText}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No matches found. Enter a pattern and test string, then click "Test".</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Settings toggle */}
          <div className="mb-4">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showSettings ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
              {showSettings ? 'Hide Flags' : 'Show Flags'}
            </button>
          </div>

          {/* Regex flags */}
          {showSettings && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Regex Flags</h3>
              <div className="flex flex-wrap gap-2">
                {regexFlags.map((flag) => (
                  <button
                    key={flag.value}
                    onClick={() => toggleFlag(flag.value)}
                    className={`px-3 py-1 rounded ${
                      selectedFlags.includes(flag.value)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {flag.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
