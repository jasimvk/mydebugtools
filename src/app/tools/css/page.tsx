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

// Keyboard shortcuts
const keyboardShortcuts = [
  { key: 'Ctrl+B / Cmd+B', description: 'Beautify CSS' },
  { key: 'Ctrl+M / Cmd+M', description: 'Minify CSS' },
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

interface CssIssue {
  line: number;
  message: string;
}

// Blanks out comments, string literals and url() payloads (keeping offsets and newlines intact)
// so the structural checks below never trip over braces or colons that live inside them.
const stripCssNoise = (source: string): { stripped: string; unterminatedCommentAt: number | null } => {
  let stripped = '';
  let unterminatedCommentAt: number | null = null;
  let i = 0;

  const blank = (from: number, to: number) => {
    for (let k = from; k < to; k++) {
      stripped += source[k] === '\n' ? '\n' : ' ';
    }
  };

  while (i < source.length) {
    const char = source[i];

    if (char === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      if (end === -1) unterminatedCommentAt = i;
      const stop = end === -1 ? source.length : end + 2;
      blank(i, stop);
      i = stop;
      continue;
    }

    if (char === '"' || char === "'") {
      const quote = char;
      let j = i + 1;
      while (j < source.length && source[j] !== quote) {
        j += source[j] === '\\' ? 2 : 1;
      }
      const stop = Math.min(j + 1, source.length);
      blank(i, stop);
      i = stop;
      continue;
    }

    if (/^url\(/i.test(source.slice(i, i + 4))) {
      const end = source.indexOf(')', i + 4);
      const stop = end === -1 ? source.length : end + 1;
      blank(i, stop);
      i = stop;
      continue;
    }

    stripped += char;
    i += 1;
  }

  return { stripped, unterminatedCommentAt };
};

// Local structural validation — the CSS never leaves the browser.
const validateCssStructure = (source: string): { valid: boolean; errors: CssIssue[]; warnings: CssIssue[] } => {
  const errors: CssIssue[] = [];
  const warnings: CssIssue[] = [];
  const { stripped, unterminatedCommentAt } = stripCssNoise(source);
  const lineAt = (index: number) => source.slice(0, index).split('\n').length;

  if (unterminatedCommentAt !== null) {
    errors.push({ line: lineAt(unterminatedCommentAt), message: 'Unclosed comment — missing "*/"' });
  }

  const checkDeclarations = (body: string, bodyStart: number) => {
    let offset = 0;
    const segments = body.split(';');

    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1;
      const segmentStart = bodyStart + offset + (segment.length - segment.trimStart().length);
      offset += segment.length + 1;

      const trimmed = segment.trim();
      if (!trimmed) return;

      const colons = (trimmed.match(/:/g) || []).length;
      if (colons === 0) {
        errors.push({ line: lineAt(segmentStart), message: `Declaration is missing ":" — "${trimmed.split('\n')[0].slice(0, 40)}"` });
      } else if (colons > 1) {
        errors.push({ line: lineAt(segmentStart), message: 'Missing ";" between declarations' });
      } else if (isLast) {
        warnings.push({ line: lineAt(segmentStart), message: 'Last declaration is not terminated with ";"' });
      }
    });
  };

  const openBraces: number[] = [];
  for (let i = 0; i < stripped.length; i += 1) {
    const char = stripped[i];

    if (char === '{') {
      openBraces.push(i);
      continue;
    }

    if (char !== '}') continue;

    const start = openBraces.pop();
    if (start === undefined) {
      errors.push({ line: lineAt(i), message: 'Unexpected "}" with no matching "{"' });
      continue;
    }

    const body = stripped.slice(start + 1, i);
    if (!body.trim()) {
      warnings.push({ line: lineAt(start), message: 'Empty rule — the block has no declarations' });
    } else if (!body.includes('{')) {
      // Only leaf blocks hold declarations; at-rule bodies are checked via their inner blocks.
      checkDeclarations(body, start + 1);
    }
  }

  openBraces.forEach((index) => {
    errors.push({ line: lineAt(index), message: 'Unclosed block — missing "}"' });
  });

  return { valid: errors.length === 0, errors, warnings };
};

export default function CSSToolsPage() {
  const [css, setCSS] = useState(sampleCSS);
  const [showHelp, setShowHelp] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [validationResults, setValidationResults] = useState<{
    valid: boolean;
    errors: CssIssue[];
    warnings: CssIssue[];
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [cssStats, setCssStats] = useState<{
    selectors: number;
    properties: number;
    rules: number;
    fileSize: number;
    colors: string[];
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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
      const beautified = beautify.css(css, {
        indent_size: 2,
        indent_char: ' ',
        max_preserve_newlines: 2,
        preserve_newlines: true,
        end_with_newline: true,
        wrap_line_length: 0,
        newline_between_rules: true,
        selector_separator_newline: true
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
      // Spacing inside url()/calc()/var()/min()/max()/clamp() is significant, so those spans are
      // pulled out behind placeholders and put back untouched after the whitespace passes.
      const preserved: string[] = [];
      const functionStart = /\b(?:url|calc|min|max|clamp|var)\(/gi;
      const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');

      let guarded = '';
      let cursor = 0;
      let match: RegExpExecArray | null;

      while ((match = functionStart.exec(withoutComments)) !== null) {
        let depth = 1;
        let end = match.index + match[0].length;
        while (end < withoutComments.length && depth > 0) {
          if (withoutComments[end] === '(') depth += 1;
          else if (withoutComments[end] === ')') depth -= 1;
          end += 1;
        }

        guarded += withoutComments.slice(cursor, match.index) + `__CSSMIN${preserved.length}__`;
        preserved.push(withoutComments.slice(match.index, end));
        cursor = end;
        functionStart.lastIndex = end;
      }
      guarded += withoutComments.slice(cursor);

      const minified = guarded
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
        .trim()
        .replace(/__CSSMIN(\d+)__/g, (_full, index: string) => preserved[Number(index)]);
      setCSS(minified);
      showNotification('CSS minified', 'success');
    } catch (error) {
      showNotification('Error minifying CSS', 'error');
    }
  };

  // Validate CSS
  const validateCSS = () => {
    setIsValidating(true);
    // The scan is synchronous; yield a tick so the pending state paints on large stylesheets.
    setTimeout(() => {
      try {
        const results = validateCssStructure(css);
        setValidationResults(results);
        if (results.valid) {
          showNotification(
            results.warnings.length > 0 ? `No errors, ${results.warnings.length} warning(s)` : 'CSS is valid',
            results.warnings.length > 0 ? 'info' : 'success'
          );
        } else {
          showNotification('CSS has validation errors', 'error');
        }
      } catch (error) {
        showNotification('Error validating CSS', 'error');
      } finally {
        setIsValidating(false);
      }
    }, 0);
  };

  // Copy CSS to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(css);
      showNotification('CSS copied to clipboard', 'success');
    } catch {
      showNotification('Could not copy to clipboard', 'error');
    }
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
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        // Never hijack a real text selection
        if (window.getSelection()?.toString()) {
          return;
        }
        e.preventDefault();
        copyToClipboard();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        resetCSS();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowHelp(v => !v);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [css]);

  const previewDoc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>${css}</style>
</head>
<body>
<div class="space-y-4">
  <h1>Sample Heading</h1>
  <p>This is a sample paragraph to demonstrate your CSS styles.</p>
  <button class="button">Sample Button</button>
  <div class="container">
    <p>Container content with your styles applied.</p>
  </div>
</div>
</body>
</html>`;

  return (
    <div className="min-h-screen">
      <div className="rounded-md border border-[#d0d7de] bg-white">
        <div className="px-5 py-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#6e7781]">tools/css</p>
              <h1 className="mt-2 flex items-center gap-2 text-[#24292f]">
                <SwatchIcon className="h-5 w-5 text-[#0969da]" />
                CSS Tools
              </h1>
            </div>
          </div>
          
          {cssStats && (
            <div className="mt-4 rounded-md border border-[#d0d7de] bg-[#f6f8fa] px-4 py-3">
                <div className="flex flex-wrap items-center gap-5 text-xs text-[#57606a]">
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
          )}
        </div>
      </div>

      <div className="mx-auto pt-4">
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
              {/* Sandboxed so the edited CSS styles only the preview, never the app itself */}
              <iframe
                title="Live CSS preview"
                srcDoc={previewDoc}
                sandbox=""
                className="w-full bg-white border rounded-lg"
                style={{ minHeight: '200px' }}
              />
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
                disabled={isValidating}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-60"
              >
                <CheckIcon className="h-4 w-4" />
                {isValidating ? 'Validating…' : 'Validate'}
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
              <div aria-live="polite" aria-busy={isValidating} className="w-full h-[500px] p-4 border rounded-md overflow-auto">
                {isValidating ? (
                  <p className="text-gray-500 text-sm">Validating CSS…</p>
                ) : validationResults ? (
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
