'use client';

import { useState, useEffect } from 'react';
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

const keyboardShortcuts = [
  { key: 'Ctrl+B / Cmd+B', description: 'Beautify CSS' },
  { key: 'Ctrl+M / Cmd+M', description: 'Minify CSS' },
  { key: 'Ctrl+V / Cmd+V', description: 'Validate CSS' },
  { key: 'Ctrl+C / Cmd+C', description: 'Copy CSS' },
  { key: 'Ctrl+R / Cmd+R', description: 'Reset CSS' },
  { key: 'Ctrl+H / Cmd+H', description: 'Show/hide help' }
];

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

export default function CSSFormatterContent() {
  const [css, setCSS] = useState(sampleCSS);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [validationResults, setValidationResults] = useState<{
    valid: boolean;
    errors: any[];
    warnings: any[];
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

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

  const minifyCSS = () => {
    try {
      const minified = css
        .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*;\s*/g, ';')
        .replace(/\s*,\s*/g, ',')
        .replace(/\s*>\s*/g, '>')
        .replace(/\s*\+\s*/g, '+')
        .replace(/\s*~\s*/g, '~')
        .replace(/\s*\[\s*/g, '[')
        .replace(/\s*\]\s*/g, ']')
        .replace(/\s*\(\s*/g, '(')
        .replace(/\s*\)\s*/g, ')')
        .trim();
      setCSS(minified);
      showNotification('CSS minified', 'success');
    } catch (error) {
      showNotification('Error minifying CSS', 'error');
    }
  };

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(css);
    showNotification('CSS copied to clipboard', 'success');
  };

  const resetCSS = () => {
    setCSS(sampleCSS);
    setValidationResults(null);
    showNotification('CSS reset', 'info');
  };

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
        setShowHelp((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [css]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CodeBracketIcon className="h-6 w-6 text-blue-500" />
            CSS Formatter
          </CardTitle>
          <CardDescription>Beautify, minify, and validate your CSS</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Help panel */}
          {showHelp && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-1">
                <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                How to Use
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Basic Usage</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Paste or write your CSS in the editor</li>
                    <li>Use the toolbar for actions</li>
                    <li>Validate, beautify, or minify your CSS</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Keyboard Shortcuts</h4>
                  <ul className="space-y-1 text-sm">
                    {keyboardShortcuts.map((shortcut, index) => (
                      <li key={index} className="flex justify-between">
                        <span className="font-mono bg-gray-200 px-1 rounded">{shortcut.key}</span>
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
            <button onClick={beautifyCSS} className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 text-gray-700">
              <CodeBracketIcon className="h-4 w-4" /> Beautify
            </button>
            <button onClick={minifyCSS} className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 text-gray-700">
              <ArrowPathIcon className="h-4 w-4" /> Minify
            </button>
            <button onClick={validateCSS} className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 text-gray-700">
              <CheckIcon className="h-4 w-4" /> Validate
            </button>
            <button onClick={copyToClipboard} className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 text-gray-700">
              <DocumentDuplicateIcon className="h-4 w-4" /> Copy
            </button>
            <button onClick={resetCSS} className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 text-gray-700">
              <ArrowPathIcon className="h-4 w-4" /> Reset
            </button>
            <button onClick={() => setShowHelp((prev) => !prev)} className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 text-gray-700">
              <QuestionMarkCircleIcon className="h-4 w-4" /> Help
            </button>
          </div>

          {/* Editor */}
          <textarea
            value={css}
            onChange={(e) => setCSS(e.target.value)}
            className="w-full h-[300px] p-4 border rounded-md font-mono resize-none mb-4"
            placeholder="Write or paste your CSS here..."
          />

          {/* Validation Results */}
          {validationResults && (
            <div className={`mb-4 p-4 rounded-lg ${validationResults.valid ? 'bg-green-50' : 'bg-red-50'}`}> 
              <div className="flex items-center gap-2 mb-2">
                {validationResults.valid ? (
                  <CheckIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <XMarkIcon className="h-5 w-5 text-red-500" />
                )}
                <span className="font-semibold">
                  {validationResults.valid ? 'CSS is valid!' : 'CSS has errors'}
                </span>
              </div>
              {validationResults.errors.length > 0 && (
                <div className="text-red-600 text-sm">
                  <strong>Errors:</strong>
                  <ul className="list-disc pl-5">
                    {validationResults.errors.map((err, idx) => (
                      <li key={idx}>{err.message}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validationResults.warnings.length > 0 && (
                <div className="text-yellow-600 text-sm mt-2">
                  <strong>Warnings:</strong>
                  <ul className="list-disc pl-5">
                    {validationResults.warnings.map((warn, idx) => (
                      <li key={idx}>{warn.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {notification && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' :
          'bg-blue-500'
        } text-white`}>
          {notification.message}
        </div>
      )}
    </div>
  );
} 