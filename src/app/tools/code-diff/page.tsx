'use client';

import { useState, useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowsRightLeftIcon, 
  DocumentDuplicateIcon, 
  ArrowPathIcon, 
  LanguageIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  CodeBracketIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClipboardDocumentIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  Cog6ToothIcon,
  CommandLineIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

// Language options for syntax highlighting
const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'sql', label: 'SQL' },
  { value: 'shell', label: 'Shell' },
  { value: 'plaintext', label: 'Plain Text' }
];

// Word wrap options
const wordWrapOptions = [
  { value: 'on', label: 'On' },
  { value: 'off', label: 'Off' },
  { value: 'wordWrapColumn', label: 'Word Wrap Column' },
  { value: 'bounded', label: 'Bounded' }
] as const;

// Export format options
const exportFormats = [
  { value: 'html', label: 'HTML Report', icon: '🌐' },
  { value: 'pdf', label: 'PDF Document', icon: '📄' },
  { value: 'json', label: 'JSON Data', icon: '📊' },
  { value: 'markdown', label: 'Markdown', icon: '📝' },
  { value: 'txt', label: 'Plain Text', icon: '📄' }
];

// Theme options
const themeOptions = [
  { value: 'vs', label: 'Light' },
  { value: 'vs-dark', label: 'Dark' },
  { value: 'hc-black', label: 'High Contrast Dark' },
  { value: 'hc-light', label: 'High Contrast Light' }
];

// Keyboard shortcuts
const keyboardShortcuts = [
  { key: 'Ctrl+S / Cmd+S', description: 'Swap code' },
  { key: 'Ctrl+C / Cmd+C', description: 'Copy code' },
  { key: 'Ctrl+L / Cmd+L', description: 'Clear code' },
  { key: 'Ctrl+M / Cmd+M', description: 'Toggle view mode' },
  { key: 'Ctrl+H / Cmd+H', description: 'Show/hide help' }
];

export default function CodeDiffPage() {
  const [originalCode, setOriginalCode] = useState('');
  const [modifiedCode, setModifiedCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [renderSideBySide, setRenderSideBySide] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState<'on' | 'off' | 'wordWrapColumn' | 'bounded'>('on');
  const [fontSize, setFontSize] = useState(14);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  const [exportFormat, setExportFormat] = useState('html');
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCaseChanges, setIgnoreCaseChanges] = useState(false);
  const [showInlineView, setShowInlineView] = useState(false);
  const [diffStats, setDiffStats] = useState<{additions: number, deletions: number, changes: number} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightSimilarities, setHighlightSimilarities] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // ChatGPT defaults to dark
  const [isMinimized, setIsMinimized] = useState(false);

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isOriginal: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (isOriginal) {
        setOriginalCode(content);
      } else {
        setModifiedCode(content);
      }
      setIsLoading(false);
      showNotification(`File loaded successfully`, 'success');
    };
    reader.readAsText(file);
  };

  // Copy code to clipboard
  const copyToClipboard = (text: string, type: 'original' | 'modified') => {
    navigator.clipboard.writeText(text);
    showNotification(`${type === 'original' ? 'Original' : 'Modified'} code copied to clipboard`, 'success');
  };

  // Swap original and modified code
  const swapCode = () => {
    const temp = originalCode;
    setOriginalCode(modifiedCode);
    setModifiedCode(temp);
    showNotification('Code swapped', 'info');
  };

  // Clear both code areas
  const clearCode = () => {
    setOriginalCode('');
    setModifiedCode('');
    showNotification('Code cleared', 'info');
  };

  // Update Monaco theme based on dark mode
  useEffect(() => {
    setTheme(isDarkMode ? 'vs-dark' : 'vs');
  }, [isDarkMode]);

  // Calculate diff statistics
  const calculateDiffStats = () => {
    if (!originalCode || !modifiedCode) {
      setDiffStats(null);
      return;
    }

    const originalLines = originalCode.split('\n');
    const modifiedLines = modifiedCode.split('\n');
    
    let additions = 0;
    let deletions = 0;
    let changes = 0;
    
    const maxLines = Math.max(originalLines.length, modifiedLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || '';
      const modifiedLine = modifiedLines[i] || '';
      
      if (originalLine !== modifiedLine) {
        if (!originalLine) additions++;
        else if (!modifiedLine) deletions++;
        else changes++;
      }
    }
    
    setDiffStats({ additions, deletions, changes });
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setRenderSideBySide(!renderSideBySide);
    showNotification(`View mode changed to ${renderSideBySide ? 'inline' : 'side-by-side'}`, 'info');
  };



  // Export diff in various formats
  const exportDiff = (format: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `code-diff-${timestamp}`;
    
    switch (format) {
      case 'html':
        exportAsHTML(filename);
        break;
      case 'json':
        exportAsJSON(filename);
        break;
      case 'markdown':
        exportAsMarkdown(filename);
        break;
      case 'txt':
        exportAsText(filename);
        break;
      default:
        showNotification('Export format not supported yet', 'error');
    }
  };

  const exportAsHTML = (filename: string) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Diff Report - ${filename}</title>
    <style>
        body { font-family: 'Courier New', monospace; margin: 20px; background: #f5f5f5; }
        .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { background: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .diff-container { display: flex; gap: 20px; }
        .code-block { flex: 1; }
        .code-block h3 { background: #2196f3; color: white; padding: 10px; margin: 0; }
        .code-block pre { background: #f8f9fa; padding: 15px; border: 1px solid #ddd; margin: 0; white-space: pre-wrap; }
        .addition { background-color: #d4edda; }
        .deletion { background-color: #f8d7da; }
        .change { background-color: #fff3cd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Code Difference Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        ${diffStats ? `
        <div class="stats">
            <h3>📊 Diff Statistics</h3>
            <p><strong>Additions:</strong> ${diffStats.additions} lines</p>
            <p><strong>Deletions:</strong> ${diffStats.deletions} lines</p>
            <p><strong>Changes:</strong> ${diffStats.changes} lines</p>
        </div>
        ` : ''}
        <div class="diff-container">
            <div class="code-block">
                <h3>📄 Original Code</h3>
                <pre>${originalCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            </div>
            <div class="code-block">
                <h3>📝 Modified Code</h3>
                <pre>${modifiedCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            </div>
        </div>
    </div>
</body>
</html>`;
    
    downloadFile(html, `${filename}.html`, 'text/html');
    showNotification('HTML report exported successfully', 'success');
  };

  const exportAsJSON = (filename: string) => {
    const data = {
      metadata: {
        exportDate: new Date().toISOString(),
        language,
        settings: {
          renderSideBySide,
          showLineNumbers,
          wordWrap,
          fontSize,
          ignoreWhitespace,
          ignoreCaseChanges
        }
      },
      originalCode,
      modifiedCode,
      statistics: diffStats
    };
    
    downloadFile(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json');
    showNotification('JSON data exported successfully', 'success');
  };

  const exportAsMarkdown = (filename: string) => {
    const markdown = `# 🔍 Code Difference Report

**Generated:** ${new Date().toLocaleString()}  
**Language:** ${language}  

${diffStats ? `## 📊 Statistics

- **Additions:** ${diffStats.additions} lines
- **Deletions:** ${diffStats.deletions} lines  
- **Changes:** ${diffStats.changes} lines

` : ''}## 📄 Original Code

\`\`\`${language}
${originalCode}
\`\`\`

## 📝 Modified Code

\`\`\`${language}
${modifiedCode}
\`\`\`

---
*Generated by MyDebugTools Code Diff*`;
    
    downloadFile(markdown, `${filename}.md`, 'text/markdown');
    showNotification('Markdown file exported successfully', 'success');
  };

  const exportAsText = (filename: string) => {
    const text = `CODE DIFFERENCE REPORT\n${'='.repeat(50)}\n\nGenerated: ${new Date().toLocaleString()}\nLanguage: ${language}\n\n${diffStats ? `STATISTICS:\n- Additions: ${diffStats.additions} lines\n- Deletions: ${diffStats.deletions} lines\n- Changes: ${diffStats.changes} lines\n\n` : ''}ORIGINAL CODE:\n${'-'.repeat(30)}\n${originalCode}\n\nMODIFIED CODE:\n${'-'.repeat(30)}\n${modifiedCode}\n\n---\nGenerated by MyDebugTools Code Diff`;
    
    downloadFile(text, `${filename}.txt`, 'text/plain');
    showNotification('Text file exported successfully', 'success');
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



  // Calculate diff stats when code changes
  useEffect(() => {
    calculateDiffStats();
  }, [originalCode, modifiedCode]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if target is an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + S to swap code
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        swapCode();
      }
      
      // Ctrl/Cmd + M to toggle view mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        toggleViewMode();
      }
      
      // Ctrl/Cmd + H to toggle help
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowHelp(!showHelp);
      }
      

    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [originalCode, modifiedCode, renderSideBySide]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div >
        <div >
           
          
          {/* Statistics Bar */}
          {diffStats && (
            <div className="mt-6 flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded"></div>
                    <span><strong>{diffStats?.additions || 0}</strong> additions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded"></div>
                    <span><strong>{diffStats?.deletions || 0}</strong> deletions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                    <span><strong>{diffStats?.changes || 0}</strong> changes</span>
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
            notification?.type === 'success' ? 'bg-green-500 text-white' :
            notification?.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {notification?.type === 'success' && <CheckCircleIcon className="h-5 w-5" />}
            {notification?.type === 'error' && <ExclamationCircleIcon className="h-5 w-5" />}
            {notification?.type === 'info' && <InformationCircleIcon className="h-5 w-5" />}
            {notification?.message}
          </div>
        )}

        {/* ChatGPT-style Main Content */}
        <div className={`rounded-xl border transition-colors duration-300 overflow-hidden ${
          isDarkMode 
            ? 'bg-gray-900 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          {/* ChatGPT-style Help panel */}
          {showHelp && (
            <div className={`mb-4 p-4 rounded-lg border transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">How to use Code Diff</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className={`font-medium mb-2 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>Quick Start</h4>
                  <ol className={`list-decimal list-inside space-y-1 text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <li>Paste your original code in the left editor</li>
                    <li>Paste your modified code in the right editor</li>
                    <li>The differences will be highlighted automatically</li>
                    <li>Use the toolbar buttons for additional actions</li>
                  </ol>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>Keyboard Shortcuts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {keyboardShortcuts.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className={`text-xs font-mono px-2 py-1 rounded ${
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>{shortcut.key}</span>
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>{shortcut.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ChatGPT-style Export Panel */}
          {showExportPanel && (
            <div className={`mb-4 p-4 rounded-lg border transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <ArrowDownTrayIcon className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Export Options</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {exportFormats.map((format) => (
                  <button
                    key={format.value}
                    onClick={() => exportDiff(format.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 hover:bg-gray-700 hover:border-gray-500' 
                        : 'border-gray-200 hover:bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{format.icon}</span>
                    <span className="text-xs font-medium">{format.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex justify-end">
                <button 
                  onClick={() => setShowExportPanel(false)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          )}



          {/* Enhanced Action buttons */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <button 
                onClick={swapCode}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <ArrowsRightLeftIcon className="h-4 w-4" />
                Swap Code
              </button>
              <button 
                onClick={toggleViewMode}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <SparklesIcon className="h-4 w-4" />
                {renderSideBySide ? 'Inline View' : 'Side-by-Side'}
              </button>
              <button 
                onClick={clearCode}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Clear All
              </button>

              <button 
                onClick={() => setShowExportPanel(!showExportPanel)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* ChatGPT-style Code Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>Original Code</label>
                <div className="flex gap-1">
                  <button 
                    onClick={() => copyToClipboard(originalCode, 'original')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-gray-700 text-gray-400' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    title="Copy to clipboard"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  </button>
                  <label className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-400' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`} title="Upload file">
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, true)}
                    />
                    <DocumentArrowDownIcon className="h-4 w-4" />
                  </label>
                </div>
              </div>
              <textarea
                className={`w-full h-48 p-3 rounded-lg border font-mono text-sm resize-none transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={originalCode}
                onChange={(e) => setOriginalCode(e.target.value)}
                placeholder="Paste your original code here..."
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>Modified Code</label>
                <div className="flex gap-1">
                  <button 
                    onClick={() => copyToClipboard(modifiedCode, 'modified')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-gray-700 text-gray-400' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    title="Copy to clipboard"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  </button>
                  <label className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-400' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`} title="Upload file">
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, false)}
                    />
                    <DocumentArrowDownIcon className="h-4 w-4" />
                  </label>
                </div>
              </div>
              <textarea
                className={`w-full h-48 p-3 rounded-lg border font-mono text-sm resize-none transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={modifiedCode}
                onChange={(e) => setModifiedCode(e.target.value)}
                placeholder="Paste your modified code here..."
              />
            </div>
          </div>

          {/* Settings toggle */}
          <div className="mb-4">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showSettings ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
              {showSettings ? 'Hide Settings' : 'Show Settings'}
            </button>
          </div>

          {/* Enhanced Settings */}
          {showSettings && (
            <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-blue-500" />
                Comparison Settings
              </h3>
              
              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {languageOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <select 
                    value={theme} 
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {themeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Font Size</label>
                  <select 
                    value={fontSize} 
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="12">12px</option>
                    <option value="14">14px</option>
                    <option value="16">16px</option>
                    <option value="18">18px</option>
                    <option value="20">20px</option>
                    <option value="22">22px</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Word Wrap</label>
                  <select 
                    value={wordWrap} 
                    onChange={(e) => setWordWrap(e.target.value as 'on' | 'off' | 'wordWrapColumn' | 'bounded')}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {wordWrapOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="showLineNumbers" 
                    checked={showLineNumbers} 
                    onChange={(e) => setShowLineNumbers(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="showLineNumbers" className="text-sm font-medium">Line Numbers</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="ignoreWhitespace" 
                    checked={ignoreWhitespace} 
                    onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="ignoreWhitespace" className="text-sm font-medium">Ignore Whitespace</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="ignoreCaseChanges" 
                    checked={ignoreCaseChanges} 
                    onChange={(e) => setIgnoreCaseChanges(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="ignoreCaseChanges" className="text-sm font-medium">Ignore Case</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="compactMode" 
                    checked={compactMode} 
                    onChange={(e) => setCompactMode(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="compactMode" className="text-sm font-medium">Compact Mode</label>
                </div>
              </div>
            </div>
          )}

          {/* ChatGPT-style Diff Editor */}
          <div className={`h-[500px] border-t transition-colors duration-300 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className={`animate-spin rounded-full h-8 w-8 border-2 border-t-transparent ${
                  isDarkMode ? 'border-gray-400' : 'border-gray-600'
                }`}></div>
              </div>
            ) : (
              <DiffEditor
                height="100%"
                language={language}
                original={originalCode}
                modified={modifiedCode}
                theme={isDarkMode ? 'vs-dark' : 'vs'}
                options={{
                  readOnly: true,
                  renderSideBySide,
                  minimap: { enabled: !compactMode },
                  lineNumbers: showLineNumbers ? 'on' : 'off',
                  wordWrap,
                  fontSize,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  diffWordWrap: 'on',
                  ignoreTrimWhitespace: ignoreWhitespace,
                  renderIndicators: true,
                  renderWhitespace: 'selection',
                  renderValidationDecorations: 'on',
                  renderLineHighlight: 'all',
                  renderOverviewRuler: !compactMode,
                  renderFinalNewline: 'on',
                  renderControlCharacters: true,
                  renderLineHighlightOnlyWhenFocus: false,
                  enableSplitViewResizing: true,
                  padding: { top: 16, bottom: 16 },
                  smoothScrolling: true,
                  cursorBlinking: 'smooth'
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 