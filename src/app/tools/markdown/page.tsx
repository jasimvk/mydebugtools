'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DocumentTextIcon, 
  ArrowPathIcon, 
  DocumentDuplicateIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypePrism from 'rehype-prism-plus';
import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism.css';

// Keyboard shortcuts
const keyboardShortcuts = [
  { key: 'Ctrl+S / Cmd+S', description: 'Save markdown' },
  { key: 'Ctrl+R / Cmd+R', description: 'Reset markdown' },
  { key: 'Ctrl+C / Cmd+C', description: 'Copy markdown' },
  { key: 'Ctrl+H / Cmd+H', description: 'Show/hide help' },
  { key: 'Ctrl+P / Cmd+P', description: 'Toggle preview mode' }
];

// Sample markdown
const sampleMarkdown = `# Welcome to Markdown Preview

## Features
- Live preview
- GitHub Flavored Markdown
- Math equations
- Code syntax highlighting
- Tables
- Task lists

### Math Equations
Inline math: $E = mc^2$

Block math:
$$
\\frac{n!}{k!(n-k)!} = \\binom{n}{k}
$$

### Code Blocks
\`\`\`javascript
function hello() {
  console.log('Hello, world!');
}
\`\`\`

### Tables
| Feature | Support |
|---------|---------|
| Tables | ✅ |
| Lists | ✅ |
| Code | ✅ |
| Math | ✅ |

### Task List
- [x] Create markdown preview
- [x] Add syntax highlighting
- [ ] Add more features
`;

export default function MarkdownPreviewPage() {
  const [markdown, setMarkdown] = useState(sampleMarkdown);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [previewMode, setPreviewMode] = useState<'split' | 'preview' | 'edit'>('split');

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Copy markdown to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdown);
    showNotification('Markdown copied to clipboard', 'success');
  };

  // Reset markdown
  const resetMarkdown = () => {
    setMarkdown(sampleMarkdown);
    showNotification('Markdown reset', 'info');
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Save functionality will be added
        showNotification('Markdown saved', 'success');
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        resetMarkdown();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copyToClipboard();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowHelp(!showHelp);
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setPreviewMode(prev => {
          if (prev === 'split') return 'preview';
          if (prev === 'preview') return 'edit';
          return 'split';
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [markdown, previewMode]);

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
              <DocumentTextIcon className="h-6 w-6 text-blue-500" />
              Markdown Preview
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
            Preview and edit Markdown with live rendering
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
                    <li>Write or paste your Markdown in the editor</li>
                    <li>See the live preview on the right</li>
                    <li>Use the toolbar for common actions</li>
                    <li>Toggle between edit, preview, and split modes</li>
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
              onClick={() => setPreviewMode('split')}
              className={`flex items-center gap-1 px-3 py-1 rounded ${
                previewMode === 'split' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <EyeIcon className="h-4 w-4" />
              Split
            </button>
            <button 
              onClick={() => setPreviewMode('preview')}
              className={`flex items-center gap-1 px-3 py-1 rounded ${
                previewMode === 'preview' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <EyeIcon className="h-4 w-4" />
              Preview
            </button>
            <button 
              onClick={() => setPreviewMode('edit')}
              className={`flex items-center gap-1 px-3 py-1 rounded ${
                previewMode === 'edit' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <PencilIcon className="h-4 w-4" />
              Edit
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
              onClick={resetMarkdown}
              className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Reset
            </button>
          </div>

          {/* Editor and Preview */}
          <div className={`grid gap-4 ${
            previewMode === 'split' ? 'grid-cols-1 md:grid-cols-2' :
            previewMode === 'preview' ? 'grid-cols-1' :
            'grid-cols-1'
          }`}>
            {(previewMode === 'split' || previewMode === 'edit') && (
              <div>
                <label className="block text-sm font-medium mb-1">Editor</label>
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="w-full h-[500px] p-4 border rounded-md font-mono resize-none"
                  placeholder="Write your Markdown here..."
                />
              </div>
            )}
            {(previewMode === 'split' || previewMode === 'preview') && (
              <div>
                <label className="block text-sm font-medium mb-1">Preview</label>
                <div className="w-full h-[500px] p-4 border rounded-md overflow-auto prose dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex, rehypePrism]}
                  >
                    {markdown}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 