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
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [results, setResults] = useState<{match: boolean, matches: string[], groups: string[][]}>({ match: false, matches: [], groups: [] });
  const [replacedText, setReplacedText] = useState('');
  const [error, setError] = useState<string | null>(null);
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

  // Test regex
  const testRegex = () => {
    if (!pattern) {
      setError('Please enter a regex pattern');
      return;
    }

    try {
      setError(null);
      const flags = selectedFlags.join('');
      const regex = new RegExp(pattern, flags);
      
      // Test if there's a match
      const match = regex.test(testString);
      
      // Find all matches
      const matches: string[] = [];
      const groups: string[][] = [];
      
      if (match) {
        let result;
        const regexWithGlobal = new RegExp(pattern, flags + 'g');
        
        while ((result = regexWithGlobal.exec(testString)) !== null) {
          matches.push(result[0]);
          groups.push(result.slice(1));
        }
      }
      
      setResults({ match, matches, groups });
      
      // Apply replacement if there's a replacement string
      if (replacement) {
        const replaced = testString.replace(regex, replacement);
        setReplacedText(replaced);
      } else {
        setReplacedText('');
      }
      
      showNotification('Regex tested successfully', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid regex pattern');
      setResults({ match: false, matches: [], groups: [] });
      setReplacedText('');
    }
  };

  // Reset all
  const resetAll = () => {
    setPattern('');
    setTestString('');
    setReplacement('');
    setSelectedFlags([]);
    setResults({ match: false, matches: [], groups: [] });
    setReplacedText('');
    setError(null);
    showNotification('All fields reset', 'info');
  };

  // Copy results to clipboard
  const copyResults = () => {
    const resultText = `Pattern: ${pattern}\nFlags: ${selectedFlags.join('')}\nTest String: ${testString}\n\nMatches: ${results.matches.length}\n${results.matches.map((m, i) => `${i+1}. ${m}`).join('\n')}\n\nGroups: ${results.groups.length}\n${results.groups.map((g, i) => `${i+1}. ${g.join(', ')}`).join('\n')}`;
    navigator.clipboard.writeText(resultText);
    showNotification('Results copied to clipboard', 'success');
  };

  // Apply common pattern
  const applyCommonPattern = (pattern: string) => {
    setPattern(pattern);
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
      
      // Ctrl/Cmd + C to copy results
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copyResults();
      }
      
      // Ctrl/Cmd + H to toggle help
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowHelp(!showHelp);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pattern, testString, replacement, selectedFlags]);

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
              className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              Test
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
                <label className="block text-sm font-medium mb-1">Pattern</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
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
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Test String</label>
                <textarea
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                  placeholder="Enter text to test against..."
                  className="w-full h-32 p-2 border rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Replacement (optional)</label>
                <input
                  type="text"
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  placeholder="Enter replacement text..."
                  className="w-full p-2 border rounded-md font-mono"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Results</h3>
                <div className="p-2 border rounded-md bg-gray-50 dark:bg-gray-800 min-h-[200px]">
                  {results.match ? (
                    <div>
                      <p className="text-green-500 font-medium">Match found!</p>
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
                                Group {index + 1}: {group.join(', ')}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {replacedText && (
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