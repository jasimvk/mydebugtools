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
  LinkIcon,
  ShareIcon
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

// Keyboard shortcuts
const keyboardShortcuts = [
  { key: 'Ctrl+S / Cmd+S', description: 'Swap code' },
  { key: 'Ctrl+C / Cmd+C', description: 'Copy code' },
  { key: 'Ctrl+L / Cmd+L', description: 'Clear code' },
  { key: 'Ctrl+M / Cmd+M', description: 'Toggle view mode' },
  { key: 'Ctrl+H / Cmd+H', description: 'Show/hide help' },
  { key: 'Ctrl+U / Cmd+U', description: 'Load from URL' }
];

function CodeDiffContent() {
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
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlInputType, setUrlInputType] = useState<'original' | 'modified'>('original');
  const [shareLink, setShareLink] = useState('');

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

  // Toggle view mode
  const toggleViewMode = () => {
    setRenderSideBySide(!renderSideBySide);
    showNotification(`View mode changed to ${renderSideBySide ? 'inline' : 'side-by-side'}`, 'info');
  };

  // Load code from URL
  const loadFromUrl = async () => {
    if (!urlInput) {
      showNotification('Please enter a URL', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(urlInput);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const content = await response.text();
      
      if (urlInputType === 'original') {
        setOriginalCode(content);
      } else {
        setModifiedCode(content);
      }
      
      showNotification(`Code loaded from URL successfully`, 'success');
      setShowUrlInput(false);
      setUrlInput('');
    } catch (error) {
      showNotification(`Error loading from URL: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate share link
  const generateShareLink = () => {
    const data = {
      original: originalCode,
      modified: modifiedCode,
      language,
      renderSideBySide,
      showLineNumbers,
      wordWrap,
      fontSize
    };
    
    const encodedData = btoa(JSON.stringify(data));
    const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
    setShareLink(shareUrl);
    showNotification('Share link generated', 'success');
  };

  // Copy share link to clipboard
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    showNotification('Share link copied to clipboard', 'success');
  };

  // Load shared data from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('data');
    
    if (dataParam) {
      try {
        const decodedData = JSON.parse(atob(dataParam));
        setOriginalCode(decodedData.original || '');
        setModifiedCode(decodedData.modified || '');
        setLanguage(decodedData.language || 'javascript');
        setRenderSideBySide(decodedData.renderSideBySide !== false);
        setShowLineNumbers(decodedData.showLineNumbers !== false);
        setWordWrap(decodedData.wordWrap || 'on');
        setFontSize(decodedData.fontSize || 14);
        showNotification('Shared comparison loaded', 'success');
      } catch (error) {
        showNotification('Error loading shared comparison', 'error');
      }
    }
  }, []);

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
      
      // Ctrl/Cmd + U to show URL input
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        setShowUrlInput(!showUrlInput);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [originalCode, modifiedCode, renderSideBySide]);

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
              <ArrowsRightLeftIcon className="h-6 w-6 text-blue-500" />
              Code Difference Checker
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
            Compare two code snippets and see the differences highlighted
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
                    <li>Paste your original code in the left textarea</li>
                    <li>Paste your modified code in the right textarea</li>
                    <li>View the differences in the diff viewer below</li>
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

          {/* URL Input Panel */}
          {showUrlInput && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-1">
                <LinkIcon className="h-5 w-5 text-blue-500" />
                Load Code from URL
              </h3>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setUrlInputType('original')}
                    className={`px-3 py-1 rounded ${
                      urlInputType === 'original' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Original Code
                  </button>
                  <button 
                    onClick={() => setUrlInputType('modified')}
                    className={`px-3 py-1 rounded ${
                      urlInputType === 'modified' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Modified Code
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Enter URL to load code from..."
                    className="flex-1 p-2 border rounded-md"
                  />
                  <button 
                    onClick={loadFromUrl}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Load
                  </button>
                  <button 
                    onClick={() => setShowUrlInput(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Share Link Panel */}
          {shareLink && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-1">
                <ShareIcon className="h-5 w-5 text-blue-500" />
                Share Comparison
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-700"
                />
                <button 
                  onClick={copyShareLink}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Copy Link
                </button>
              </div>
            </div>
          )}

          {/* Action buttons - Simplified like text-compare.com */}
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            <button 
              onClick={swapCode}
              className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <ArrowsRightLeftIcon className="h-4 w-4" />
              Switch texts
            </button>
            <button 
              onClick={toggleViewMode}
              className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Compare!
            </button>
            <button 
              onClick={clearCode}
              className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Clear all
            </button>
            <button 
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <LinkIcon className="h-4 w-4" />
              Load from URL
            </button>
            <button 
              onClick={generateShareLink}
              className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <ShareIcon className="h-4 w-4" />
              Share
            </button>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">Original Code</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => copyToClipboard(originalCode, 'original')}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Copy to clipboard"
                  >
                    <DocumentDuplicateIcon className="h-5 w-5" />
                  </button>
                  <label className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer" title="Upload file">
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, true)}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </label>
                </div>
              </div>
              <textarea
                className="w-full h-48 p-2 border rounded-md font-mono"
                value={originalCode}
                onChange={(e) => setOriginalCode(e.target.value)}
                placeholder="Paste your original code here..."
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">Modified Code</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => copyToClipboard(modifiedCode, 'modified')}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Copy to clipboard"
                  >
                    <DocumentDuplicateIcon className="h-5 w-5" />
                  </button>
                  <label className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer" title="Upload file">
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, false)}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </label>
                </div>
              </div>
              <textarea
                className="w-full h-48 p-2 border rounded-md font-mono"
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

          {/* Settings */}
          {showSettings && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">Language</label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {languageOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">View Mode</label>
                <select 
                  value={renderSideBySide ? 'side-by-side' : 'inline'} 
                  onChange={(e) => setRenderSideBySide(e.target.value === 'side-by-side')}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="side-by-side">Side by Side</option>
                  <option value="inline">Inline</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Font Size</label>
                <select 
                  value={fontSize} 
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                  <option value="16">16px</option>
                  <option value="18">18px</option>
                  <option value="20">20px</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Word Wrap</label>
                <select 
                  value={wordWrap} 
                  onChange={(e) => setWordWrap(e.target.value as 'on' | 'off' | 'wordWrapColumn' | 'bounded')}
                  className="w-full p-2 border rounded-md"
                >
                  {wordWrapOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="showLineNumbers" 
                  checked={showLineNumbers} 
                  onChange={(e) => setShowLineNumbers(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="showLineNumbers" className="text-sm font-medium">Show Line Numbers</label>
              </div>
            </div>
          )}

          {/* Diff Editor */}
          <div className="h-[500px] border rounded-md">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <DiffEditor
                height="100%"
                language={language}
                original={originalCode}
                modified={modifiedCode}
                theme={theme}
                options={{
                  readOnly: true,
                  renderSideBySide,
                  minimap: { enabled: false },
                  lineNumbers: showLineNumbers ? 'on' : 'off',
                  wordWrap,
                  fontSize,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  diffWordWrap: 'on',
                  ignoreTrimWhitespace: false,
                  renderIndicators: true,
                  renderWhitespace: 'selection',
                  renderValidationDecorations: 'on',
                  renderLineHighlight: 'all',
                  renderOverviewRuler: true,
                  renderFinalNewline: 'on',
                  renderControlCharacters: true,
                  renderLineHighlightOnlyWhenFocus: false
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CodeDiffContent; 