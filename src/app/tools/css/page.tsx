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
  XMarkIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  SwatchIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  PaintBrushIcon,
  BeakerIcon,
  MagnifyingGlassIcon
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

// Export format options
const exportFormats = [
  { value: 'css', label: 'CSS File', icon: '🎨' },
  { value: 'scss', label: 'SCSS File', icon: '💎' },
  { value: 'less', label: 'LESS File', icon: '📝' },
  { value: 'html', label: 'HTML with CSS', icon: '🌐' },
  { value: 'json', label: 'JSON Report', icon: '📊' }
];

// CSS processors
const processors = [
  { value: 'autoprefixer', label: 'Add Vendor Prefixes', icon: '🔧' },
  { value: 'cssnano', label: 'Advanced Minify', icon: '⚡' },
  { value: 'purge', label: 'Remove Unused CSS', icon: '🗑️' },
  { value: 'rtl', label: 'RTL Conversion', icon: '🔄' }
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

export default function CSSToolsPage() {
  const [css, setCSS] = useState(sampleCSS);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [validationResults, setValidationResults] = useState<{
    valid: boolean;
    errors: any[];
    warnings: any[];
  } | null>(null);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [cssStats, setCssStats] = useState<{
    selectors: number;
    properties: number;
    rules: number;
    fileSize: number;
    colors: string[];
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeProcessor, setActiveProcessor] = useState('');

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Analyze CSS
  const analyzeCSS = () => {
    try {
      const rules = css.match(/{[^}]*}/g) || [];
      const selectors = css.match(/[^{}]+(?={)/g) || [];
      const properties = css.match(/[a-z-]+\s*:/gi) || [];
      const colors = css.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\b|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)/g) || [];
      const fileSize = new Blob([css]).size;
      
      setCssStats({
        selectors: selectors.length,
        properties: properties.length,
        rules: rules.length,
        fileSize,
        colors: [...new Set(colors)]
      });
    } catch (error) {
      showNotification('Error analyzing CSS', 'error');
    }
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
    setCssStats(null);
    showNotification('CSS reset', 'info');
  };

  // Export CSS in various formats
  const exportCSS = (format: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `styles-${timestamp}`;
    
    switch (format) {
      case 'css':
        downloadFile(css, `${filename}.css`, 'text/css');
        break;
      case 'scss':
        downloadFile(css, `${filename}.scss`, 'text/scss');
        break;
      case 'less':
        downloadFile(css, `${filename}.less`, 'text/less');
        break;
      case 'html':
        exportAsHTML(filename);
        break;
      case 'json':
        exportAsJSON(filename);
        break;
      default:
        showNotification('Export format not supported', 'error');
    }
  };

  const exportAsHTML = (filename: string) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Preview - ${filename}</title>
    <style>
${css}
    </style>
</head>
<body>
    <div class="container">
        <h1>CSS Preview</h1>
        <p>This is a preview of your CSS styles.</p>
        <button class="button">Sample Button</button>
    </div>
</body>
</html>`;
    
    downloadFile(html, `${filename}.html`, 'text/html');
    showNotification('HTML file exported successfully', 'success');
  };

  const exportAsJSON = (filename: string) => {
    const data = {
      metadata: {
        exportDate: new Date().toISOString(),
        fileSize: new Blob([css]).size,
        timestamp: Date.now()
      },
      css,
      statistics: cssStats,
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

  // Analyze CSS when it changes
  useEffect(() => {
    if (css) {
      analyzeCSS();
    }
  }, [css]);

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-700 text-white">
        <div className="mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center justify-center">
              <SwatchIcon className="h-12 w-12 mr-3 text-purple-200" />
              CSS Toolkit Pro
            </h1>
            <p className="text-purple-100 text-lg md:text-xl max-w-3xl mx-auto">
              Professional CSS processing with validation, optimization, and export capabilities
            </p>
          </div>
          
          {/* Statistics Bar */}
          {cssStats && (
            <div className="mt-6 flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="flex items-center gap-6 text-sm flex-wrap justify-center">
                  <div className="flex items-center gap-2">
                    <PaintBrushIcon className="h-4 w-4" />
                    <span><strong>{cssStats.selectors}</strong> selectors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AdjustmentsHorizontalIcon className="h-4 w-4" />
                    <span><strong>{cssStats.properties}</strong> properties</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    <span><strong>{cssStats.rules}</strong> rules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BeakerIcon className="h-4 w-4" />
                    <span><strong>{(cssStats.fileSize / 1024).toFixed(1)}KB</strong> size</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SwatchIcon className="h-4 w-4" />
                    <span><strong>{cssStats.colors.length}</strong> colors</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto p-4">
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
                <PaintBrushIcon className="h-6 w-6 text-purple-500" />
                Advanced CSS Processing
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
                  title="Preview CSS"
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
              Process, validate, and optimize your CSS with professional tools and export options
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

          {/* Export Panel */}
          {showExportPanel && (
            <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <ArrowDownTrayIcon className="h-5 w-5 text-purple-500" />
                Export CSS
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {exportFormats.map((format) => (
                  <button
                    key={format.value}
                    onClick={() => exportCSS(format.value)}
                    className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                  >
                    <span className="text-2xl">{format.icon}</span>
                    <span className="text-sm font-medium">{format.label}</span>
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

          {/* CSS Preview Panel */}
          {showPreview && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <EyeIcon className="h-5 w-5 text-blue-500" />
                Live CSS Preview
              </h3>
              <div className="bg-white border rounded-lg p-4" style={{ minHeight: '200px' }}>
                <style dangerouslySetInnerHTML={{ __html: css }} />
                <div className="space-y-4">
                  <h1>Sample Heading</h1>
                  <p>This is a sample paragraph to demonstrate your CSS styles.</p>
                  <button className="button">Sample Button</button>
                  <div className="container">
                    <p>Container content with your styles applied.</p>
                  </div>
                </div>
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
                onClick={beautifyCSS}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <SparklesIcon className="h-4 w-4" />
                Beautify
              </button>
              <button 
                onClick={minifyCSS}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <BeakerIcon className="h-4 w-4" />
                Minify
              </button>
              <button 
                onClick={validateCSS}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <CheckIcon className="h-4 w-4" />
                Validate
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
                onClick={resetCSS}
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
    </div>
  );
} 