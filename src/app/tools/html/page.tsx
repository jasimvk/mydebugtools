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
  CheckCircleIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  EyeIcon,
  BeakerIcon,
  PaintBrushIcon,
  DocumentArrowDownIcon,
  GlobeAltIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { js as beautify } from 'js-beautify';

// Keyboard shortcuts
const keyboardShortcuts = [
  { key: 'Ctrl+B / Cmd+B', description: 'Beautify HTML' },
  { key: 'Ctrl+V / Cmd+V', description: 'Validate HTML' },
  { key: 'Ctrl+C / Cmd+C', description: 'Copy HTML' },
  { key: 'Ctrl+R / Cmd+R', description: 'Reset HTML' },
  { key: 'Ctrl+H / Cmd+H', description: 'Show/hide help' }
];

// Export format options
const exportFormats = [
  { value: 'html', label: 'HTML File', icon: '🌐' },
  { value: 'htm', label: 'HTM File', icon: '📄' },
  { value: 'txt', label: 'Plain Text', icon: '📝' },
  { value: 'pdf', label: 'PDF Document', icon: '📄' },
  { value: 'json', label: 'JSON Report', icon: '📊' }
];

// HTML processors
const processors = [
  { value: 'minify', label: 'Minify HTML', icon: '⚡' },
  { value: 'extract-css', label: 'Extract CSS', icon: '🎨' },
  { value: 'extract-js', label: 'Extract JS', icon: '📜' },
  { value: 'extract-links', label: 'Extract Links', icon: '🔗' }
];

// Sample HTML
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

export default function HTMLValidatorPage() {
  const [html, setHTML] = useState(sampleHTML);
  const [showHelp, setShowHelp] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [validationResults, setValidationResults] = useState<{
    valid: boolean;
    errors: any[];
    warnings: any[];
  } | null>(null);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [htmlStats, setHtmlStats] = useState<{
    elements: number;
    attributes: number;
    words: number;
    fileSize: number;
    images: number;
    links: number;
  } | null>(null);
  const [activeProcessor, setActiveProcessor] = useState('');

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Analyze HTML
  const analyzeHTML = () => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const elements = doc.querySelectorAll('*').length;
      const attributes = Array.from(doc.querySelectorAll('*')).reduce((acc, el) => acc + el.attributes.length, 0);
      const words = html.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
      const fileSize = new Blob([html]).size;
      const images = doc.querySelectorAll('img').length;
      const links = doc.querySelectorAll('a[href]').length;
      
      setHtmlStats({
        elements,
        attributes,
        words,
        fileSize,
        images,
        links
      });
    } catch (error) {
      showNotification('Error analyzing HTML', 'error');
    }
  };

  // Minify HTML
  const minifyHTML = () => {
    try {
      const minified = html
        .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\s*>\s*/g, '>') // Remove spaces around >
        .replace(/\s*<\s*/g, '<') // Remove spaces around <
        .replace(/\s*=\s*/g, '=') // Remove spaces around =
        .trim();
      setHTML(minified);
      showNotification('HTML minified', 'success');
    } catch (error) {
      showNotification('Error minifying HTML', 'error');
    }
  };

  // Extract CSS from HTML
  const extractCSS = () => {
    try {
      const cssMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
      const inlineStyles = html.match(/style=["']([^"']*)["']/gi) || [];
      
      let extractedCSS = '';
      cssMatches.forEach(match => {
        const css = match.replace(/<\/?style[^>]*>/gi, '');
        extractedCSS += css + '\n';
      });
      
      if (inlineStyles.length > 0) {
        extractedCSS += '\n/* Inline Styles */\n';
        inlineStyles.forEach((style, index) => {
          const css = style.replace(/style=["']/i, '').replace(/["']$/, '');
          extractedCSS += `.inline-style-${index + 1} { ${css} }\n`;
        });
      }
      
      if (extractedCSS) {
        downloadFile(extractedCSS, 'extracted-styles.css', 'text/css');
        showNotification('CSS extracted and downloaded', 'success');
      } else {
        showNotification('No CSS found in HTML', 'info');
      }
    } catch (error) {
      showNotification('Error extracting CSS', 'error');
    }
  };

  // Extract JavaScript from HTML
  const extractJS = () => {
    try {
      const jsMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
      const onclickMatches = html.match(/on\w+=["'][^"']*["']/gi) || [];
      
      let extractedJS = '';
      jsMatches.forEach(match => {
        const js = match.replace(/<\/?script[^>]*>/gi, '');
        if (js.trim() && !js.includes('src=')) {
          extractedJS += js + '\n\n';
        }
      });
      
      if (onclickMatches.length > 0) {
        extractedJS += '\n// Event Handlers\n';
        onclickMatches.forEach((handler, index) => {
          const js = handler.replace(/on\w+=["']/i, '').replace(/["']$/, '');
          extractedJS += `// Handler ${index + 1}: ${js}\n`;
        });
      }
      
      if (extractedJS) {
        downloadFile(extractedJS, 'extracted-scripts.js', 'text/javascript');
        showNotification('JavaScript extracted and downloaded', 'success');
      } else {
        showNotification('No JavaScript found in HTML', 'info');
      }
    } catch (error) {
      showNotification('Error extracting JavaScript', 'error');
    }
  };

  // Extract links from HTML
  const extractLinks = () => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const links = Array.from(doc.querySelectorAll('a[href]')).map(link => ({
        href: link.getAttribute('href'),
        text: link.textContent?.trim() || '',
        title: link.getAttribute('title') || ''
      }));
      
      if (links.length > 0) {
        const linkText = links.map((link, index) => 
          `${index + 1}. ${link.text} -> ${link.href}${link.title ? ` (${link.title})` : ''}`
        ).join('\n');
        
        downloadFile(`Links extracted from HTML:\n\n${linkText}`, 'extracted-links.txt', 'text/plain');
        showNotification(`${links.length} links extracted and downloaded`, 'success');
      } else {
        showNotification('No links found in HTML', 'info');
      }
    } catch (error) {
      showNotification('Error extracting links', 'error');
    }
  };

  // Beautify HTML
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

  // Validate HTML
  const validateHTML = (html: string) => {
    const errors: string[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Check for parsing errors
    const parserErrors = doc.querySelectorAll('parsererror');
    if (parserErrors.length > 0) {
      errors.push('Invalid HTML structure detected');
    }

    // Check for unclosed tags
    const openTags = html.match(/<[^/][^>]*>/g) || [];
    const closeTags = html.match(/<\/[^>]+>/g) || [];
    if (openTags.length !== closeTags.length) {
      errors.push('Mismatched opening and closing tags');
    }

    // Check for common HTML errors
    const elements = doc.getElementsByTagName('*');
    for (const element of Array.from(elements)) {
      // Check for required attributes
      if (element.tagName === 'IMG' && !element.hasAttribute('alt')) {
        errors.push(`Missing alt attribute for image element`);
      }
      if (element.tagName === 'A' && !element.hasAttribute('href')) {
        errors.push(`Missing href attribute for anchor element`);
      }
    }

    return errors;
  };

  // Copy HTML to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(html);
    showNotification('HTML copied to clipboard', 'success');
  };

  // Reset HTML
  const resetHTML = () => {
    setHTML(sampleHTML);
    setValidationResults(null);
    setHtmlStats(null);
    showNotification('HTML reset', 'info');
  };

  // Export HTML in various formats
  const exportHTML = (format: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `document-${timestamp}`;
    
    switch (format) {
      case 'html':
        downloadFile(html, `${filename}.html`, 'text/html');
        break;
      case 'htm':
        downloadFile(html, `${filename}.htm`, 'text/html');
        break;
      case 'txt':
        exportAsText(filename);
        break;
      case 'json':
        exportAsJSON(filename);
        break;
      default:
        showNotification('Export format not supported', 'error');
    }
  };

  const exportAsText = (filename: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const textContent = doc.body?.textContent || doc.textContent || '';
    
    downloadFile(textContent, `${filename}.txt`, 'text/plain');
    showNotification('Text content exported successfully', 'success');
  };

  const exportAsJSON = (filename: string) => {
    const data = {
      metadata: {
        exportDate: new Date().toISOString(),
        fileSize: new Blob([html]).size,
        timestamp: Date.now()
      },
      html,
      statistics: htmlStats,
      validation: validationResults
    };
    
    downloadFile(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json');
    showNotification('JSON report exported successfully', 'success');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Process HTML with different processors
  const processHTML = (processor: string) => {
    switch (processor) {
      case 'minify':
        minifyHTML();
        break;
      case 'extract-css':
        extractCSS();
        break;
      case 'extract-js':
        extractJS();
        break;
      case 'extract-links':
        extractLinks();
        break;
      default:
        showNotification('Processor not implemented', 'error');
    }
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

  // Analyze HTML when it changes
  useEffect(() => {
    if (html) {
      analyzeHTML();
    }
  }, [html]);

  // Handle keyboard shortcuts
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
  }, [html]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center justify-center">
              <GlobeAltIcon className="h-12 w-12 mr-3 text-orange-200" />
              HTML Toolkit Pro
            </h1>
            <p className="text-orange-100 text-lg md:text-xl max-w-3xl mx-auto">
              Professional HTML validation, processing, and export with advanced analysis tools
            </p>
          </div>
          
          {/* Statistics Bar */}
          {htmlStats && (
            <div className="mt-6 flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="flex items-center gap-6 text-sm flex-wrap justify-center">
                  <div className="flex items-center gap-2">
                    <CodeBracketIcon className="h-4 w-4" />
                    <span><strong>{htmlStats.elements}</strong> elements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AdjustmentsHorizontalIcon className="h-4 w-4" />
                    <span><strong>{htmlStats.attributes}</strong> attributes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    <span><strong>{htmlStats.words}</strong> words</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BeakerIcon className="h-4 w-4" />
                    <span><strong>{(htmlStats.fileSize / 1024).toFixed(1)}KB</strong> size</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PaintBrushIcon className="h-4 w-4" />
                    <span><strong>{htmlStats.images}</strong> images</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GlobeAltIcon className="h-4 w-4" />
                    <span><strong>{htmlStats.links}</strong> links</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {notification.type === 'success' && <CheckIcon className="h-5 w-5" />}
            {notification.type === 'error' && <XMarkIcon className="h-5 w-5" />}
            {notification.type === 'info' && <InformationCircleIcon className="h-5 w-5" />}
            {notification.message}
          </div>
        )}

        <Card className="bg-white rounded-xl shadow-lg overflow-hidden">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <DocumentCheckIcon className="h-6 w-6 text-orange-500" />
                Advanced HTML Processing
              </CardTitle>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowExportPanel(!showExportPanel)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1"
                  title="Export options"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span className="text-sm hidden sm:inline">Export</span>
                </button>
                <button 
                  onClick={() => setShowPreview(!showPreview)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1"
                  title="Preview HTML"
                >
                  <EyeIcon className="h-5 w-5" />
                  <span className="text-sm hidden sm:inline">Preview</span>
                </button>
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
              Validate, process, and optimize your HTML with professional tools and export capabilities
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
                    <li>Paste your HTML code in the editor</li>
                    <li>Use the toolbar to beautify or validate</li>
                    <li>Copy the processed HTML to clipboard</li>
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

          {/* Export Panel */}
          {showExportPanel && (
            <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <ArrowDownTrayIcon className="h-5 w-5 text-orange-500" />
                Export HTML
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                {exportFormats.map((format) => (
                  <button
                    key={format.value}
                    onClick={() => exportHTML(format.value)}
                    className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                  >
                    <span className="text-2xl">{format.icon}</span>
                    <span className="text-sm font-medium">{format.label}</span>
                  </button>
                ))}
              </div>
              <h4 className="text-md font-semibold mb-2 text-orange-700">HTML Processors</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {processors.map((processor) => (
                  <button
                    key={processor.value}
                    onClick={() => processHTML(processor.value)}
                    className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                  >
                    <span className="text-2xl">{processor.icon}</span>
                    <span className="text-sm font-medium">{processor.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button 
                  onClick={() => setShowExportPanel(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* HTML Preview Panel */}
          {showPreview && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <EyeIcon className="h-5 w-5 text-blue-500" />
                Live HTML Preview
              </h3>
              <div className="bg-white border rounded-lg p-4" style={{ minHeight: '300px' }}>
                <iframe
                  srcDoc={html}
                  className="w-full h-64 border-0"
                  title="HTML Preview"
                  sandbox="allow-same-origin"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button 
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Toolbar */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={beautifyHTML}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <SparklesIcon className="h-4 w-4" />
                Beautify
              </button>
              <button 
                onClick={handleValidate}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <CheckCircleIcon className="h-4 w-4" />
                Validate
              </button>
              <button 
                onClick={() => processHTML('minify')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <BeakerIcon className="h-4 w-4" />
                Minify
              </button>
              <button 
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <EyeIcon className="h-4 w-4" />
                Preview
              </button>
              <div className="flex-1" />
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                <DocumentDuplicateIcon className="h-4 w-4" />
                Copy
              </button>
              <button 
                onClick={() => setShowExportPanel(!showExportPanel)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Export
              </button>
              <button 
                onClick={resetHTML}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Editor and Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">HTML Editor</label>
              <textarea
                value={html}
                onChange={(e) => setHTML(e.target.value)}
                className="w-full h-[500px] p-4 border rounded-md font-mono resize-none"
                placeholder="Paste your HTML here..."
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
                        {validationResults.valid ? 'HTML is valid' : 'HTML has validation errors'}
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
                    Click "Validate" to check your HTML for errors and warnings.
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
} 