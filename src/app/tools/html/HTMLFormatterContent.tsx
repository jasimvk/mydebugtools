'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DocumentCheckIcon, 
  ArrowPathIcon, 
  DocumentDuplicateIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  CheckIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { js as beautify } from 'js-beautify';

const keyboardShortcuts = [
  { key: 'Ctrl+B / Cmd+B', description: 'Beautify HTML' },
  { key: 'Ctrl+V / Cmd+V', description: 'Validate HTML' },
  { key: 'Ctrl+C / Cmd+C', description: 'Copy HTML' },
  { key: 'Ctrl+R / Cmd+R', description: 'Reset HTML' },
  { key: 'Ctrl+H / Cmd+H', description: 'Show/hide help' }
];

const sampleHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sample HTML</title>
  <style>
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
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to HTML Validator</h1>
    <p>This is a sample HTML document that you can use to test the validator.</p>
    <ul>
      <li>Check for syntax errors</li>
      <li>Validate HTML structure</li>
      <li>Format and beautify code</li>
    </ul>
  </div>
</body>
</html>`;

export default function HTMLFormatterContent() {
  const [html, setHTML] = useState(sampleHTML);
  const [showHelp, setShowHelp] = useState(false);
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

  const beautifyHTML = () => {
    try {
      const beautified = beautify(html, {
        indent_size: 2,
        space_in_empty_paren: true,
        preserve_newlines: true,
        max_preserve_newlines: 2,
        wrap_line_length: 80,
        end_with_newline: true,
        indent_char: ' ',
        indent_level: 0,
        space_before_conditional: true,
        unescape_strings: false,
        jslint_happy: false,
        space_after_anon_function: false,
        brace_style: 'collapse',
        break_chained_methods: false,
        keep_array_indentation: false
      });
      setHTML(beautified);
      showNotification('HTML beautified', 'success');
    } catch (error) {
      showNotification('Error beautifying HTML', 'error');
    }
  };

  const validateHTML = (html: string) => {
    const errors: string[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const parserErrors = doc.querySelectorAll('parsererror');
    if (parserErrors.length > 0) {
      errors.push('Invalid HTML structure detected');
    }
    const openTags = html.match(/<[^/][^>]*>/g) || [];
    const closeTags = html.match(/<\/[^">]+>/g) || [];
    if (openTags.length !== closeTags.length) {
      errors.push('Mismatched opening and closing tags');
    }
    const elements = doc.getElementsByTagName('*');
    for (const element of Array.from(elements)) {
      if (element.tagName === 'IMG' && !element.hasAttribute('alt')) {
        errors.push(`Missing alt attribute for image element`);
      }
      if (element.tagName === 'A' && !element.hasAttribute('href')) {
        errors.push(`Missing href attribute for anchor element`);
      }
    }
    return errors;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(html);
    showNotification('HTML copied to clipboard', 'success');
  };

  const resetHTML = () => {
    setHTML(sampleHTML);
    setValidationResults(null);
    showNotification('HTML reset', 'info');
  };

  const handleValidate = () => {
    const errors = validateHTML(html);
    setValidationResults({
      valid: errors.length === 0,
      errors: errors.map(error => ({ message: error })),
      warnings: []
    });
    if (errors.length === 0) {
      showNotification('HTML is valid', 'success');
    } else {
      showNotification('HTML has validation errors', 'error');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        beautifyHTML();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        handleValidate();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copyToClipboard();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        resetHTML();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowHelp(!showHelp);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [html, showHelp]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DocumentCheckIcon className="h-6 w-6 text-blue-500" />
            HTML Formatter
          </CardTitle>
          <CardDescription>Beautify, validate, and copy your HTML</CardDescription>
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
                    <li>Paste or write your HTML in the editor</li>
                    <li>Use the toolbar for actions</li>
                    <li>Validate or beautify your HTML</li>
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
            <button onClick={beautifyHTML} className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 text-gray-700">
              <DocumentCheckIcon className="h-4 w-4" /> Beautify
            </button>
            <button onClick={handleValidate} className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 text-gray-700">
              <CheckIcon className="h-4 w-4" /> Validate
            </button>
            <button onClick={copyToClipboard} className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 text-gray-700">
              <DocumentDuplicateIcon className="h-4 w-4" /> Copy
            </button>
            <button onClick={resetHTML} className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 text-gray-700">
              <ArrowPathIcon className="h-4 w-4" /> Reset
            </button>
            <button onClick={() => setShowHelp((prev) => !prev)} className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 text-gray-700">
              <QuestionMarkCircleIcon className="h-4 w-4" /> Help
            </button>
          </div>

          {/* Editor */}
          <textarea
            value={html}
            onChange={(e) => setHTML(e.target.value)}
            className="w-full h-[300px] p-4 border rounded-md font-mono resize-none mb-4"
            placeholder="Write or paste your HTML here..."
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
                  {validationResults.valid ? 'HTML is valid!' : 'HTML has errors'}
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