'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CodeBracketIcon, 
  ArrowPathIcon, 
  DocumentDuplicateIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import beautify from 'js-beautify';
import w3cValidator from 'w3c-css-validator';

// Keyboard shortcuts
const keyboardShortcuts = [
  { key: 'Ctrl+B / Cmd+B', description: 'Beautify CSS' },
  { key: 'Ctrl+M / Cmd+M', description: 'Minify CSS' },
  { key: 'Ctrl+V / Cmd+V', description: 'Validate CSS' },
  { key: 'Ctrl+C / Cmd+C', description: 'Copy CSS' },
  { key: 'Ctrl+R / Cmd+R', description: 'Reset CSS' },
  { key: 'Ctrl+H / Cmd+H', description: 'Show/hide help' }
];

// Sample CSS
const sampleCSS = `/* Sample CSS */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
  font-size: 2em;
  margin-bottom: 1em;
}

p {
  line-height: 1.6;
  color: #666;
}

.button {
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button:hover {
  background-color: #0056b3;
}`;

function CSSFormatterContent() {
  const [css, setCSS] = useState(sampleCSS);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [validationResults, setValidationResults] = useState<{
    valid: boolean;
    errors: any[];
    warnings: any[];
  } | null>(null);

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Beautify CSS
  const beautifyCSS = () => {
    try {
      const beautified = beautify(css, {
        indent_size: 2,
        indent_char: ' ',
        max_preserve_newlines: 2,
        preserve_newlines: true,
        keep_array_indentation: false,
        break_chained_methods: false,
        brace_style: 'collapse',
        space_before_conditional: true,
        unescape_strings: false,
        jslint_happy: false,
        end_with_newline: true,
        wrap_line_length: 0,
        comma_first: false,
        e4x: false
      });
      setCSS(beautified);
      showNotification('CSS beautified', 'success');
    } catch (error) {
      showNotification('Error beautifying CSS', 'error');
    }
  };

  // Minify CSS
  const minifyCSS = () => {
    try {
      const minified = css
        .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '') // Remove comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\s*{\s*/g, '{') // Remove spaces around {
        .replace(/\s*}\s*/g, '}') // Remove spaces around }
        .replace(/\s*:\s*/g, ':') // Remove spaces around :
        .replace(/\s*;\s*/g, ';') // Remove spaces around ;
        .replace(/\s*,\s*/g, ',') // Remove spaces around ,
        .replace(/\s*>\s*/g, '>') // Remove spaces around >
        .replace(/\s*\+\s*/g, '+') // Remove spaces around +
        .replace(/\s*~\s*/g, '~') // Remove spaces around ~
        .replace(/\s*\[\s*/g, '[') // Remove spaces around [
        .replace(/\s*\]\s*/g, ']') // Remove spaces around ]
        .replace(/\s*\(\s*/g, '(') // Remove spaces around (
        .replace(/\s*\)\s*/g, ')') // Remove spaces around )
        .trim();
      setCSS(minified);
      showNotification('CSS minified', 'success');
    } catch (error) {
      showNotification('Error minifying CSS', 'error');
    }
  };

  // Validate CSS
  const validateCSS = async () => {
    try {
      const results = await w3cValidator.validateText(css);
      setValidationResults({
        valid: results.valid,
        errors: results.errors || [],
        warnings: results.warnings || []
      });
      if (results.valid) {
        showNotification('CSS is valid', 'success');
      } else {
        showNotification('CSS has validation errors', 'error');
      }
    } catch (error) {
      showNotification('Error validating CSS', 'error');
    }
  };

  // Copy CSS to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(css);
    showNotification('CSS copied to clipboard', 'success');
  };

  // Reset CSS
  const resetCSS = () => {
    setCSS(sampleCSS);
    setValidationResults(null);
    showNotification('CSS reset', 'info');
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        beautifyCSS();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        minifyCSS();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        validateCSS();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copyToClipboard();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        resetCSS();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowHelp(!showHelp);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [css]);

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
              <CodeBracketIcon className="h-6 w-6 text-blue-500" />
              CSS Tools
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
            Minify, beautify, and validate your CSS code
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
                    <li>Paste your CSS code in the editor</li>
                    <li>Use the toolbar to beautify, minify, or validate</li>
                    <li>Copy the processed CSS to clipboard</li>
                    <li>View validation results and fix any issues</li>
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

          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button 
              onClick={beautifyCSS}
              className="flex items-center gap-1 px-3 py-1 rounded bg-blue-500 text-white"
            >
              <CheckIcon className="h-4 w-4" />
              Beautify
            </button>
            <button 
              onClick={minifyCSS}
              className="flex items-center gap-1 px-3 py-1 rounded bg-blue-500 text-white"
            >
              <XMarkIcon className="h-4 w-4" />
              Minify
            </button>
            <button 
              onClick={validateCSS}
              className="flex items-center gap-1 px-3 py-1 rounded bg-blue-500 text-white"
            >
              <CheckIcon className="h-4 w-4" />
              Validate
            </button>
            <div className="flex-1" />
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
              Copy
            </button>
            <button 
              onClick={resetCSS}
              className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Reset
            </button>
          </div>

          {/* Editor and Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">CSS Editor</label>
              <textarea
                value={css}
                onChange={(e) => setCSS(e.target.value)}
                className="w-full h-[500px] p-4 border rounded-md font-mono resize-none"
                placeholder="Paste your CSS here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Validation Results</label>
              <div className="w-full h-[500px] p-4 border rounded-md overflow-auto">
                {validationResults ? (
                  <div>
                    <div className={`flex items-center gap-2 mb-4 ${
                      validationResults.valid ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {validationResults.valid ? (
                        <CheckIcon className="h-5 w-5" />
                      ) : (
                        <XMarkIcon className="h-5 w-5" />
                      )}
                      <span className="font-medium">
                        {validationResults.valid ? 'CSS is valid' : 'CSS has validation errors'}
                      </span>
                    </div>

                    {validationResults.errors.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-red-500 mb-2">Errors</h4>
                        <ul className="space-y-2">
                          {validationResults.errors.map((error, index) => (
                            <li key={index} className="text-sm">
                              <span className="font-medium">Line {error.line}:</span> {error.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {validationResults.warnings.length > 0 && (
                      <div>
                        <h4 className="font-medium text-yellow-500 mb-2">Warnings</h4>
                        <ul className="space-y-2">
                          {validationResults.warnings.map((warning, index) => (
                            <li key={index} className="text-sm">
                              <span className="font-medium">Line {warning.line}:</span> {warning.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Click "Validate" to check your CSS for errors and warnings.
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CSSFormatter() {
  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={
        <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 font-medium">Loading CSS Formatter...</p>
          </div>
        </div>
      }>
        <CSSFormatterContent />
      </Suspense>
    </div>
  );
} 