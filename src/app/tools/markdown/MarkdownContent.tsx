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

export default function MarkdownContent() {
  const [markdown, setMarkdown] = useState(sampleMarkdown);
  const [showPreview, setShowPreview] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        localStorage.setItem('markdown_content', markdown);
        showNotification('Markdown saved', 'success');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        setMarkdown(sampleMarkdown);
        showNotification('Markdown reset', 'info');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        navigator.clipboard.writeText(markdown);
        showNotification('Markdown copied to clipboard', 'success');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowHelp(!showHelp);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setShowPreview(!showPreview);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [markdown, showHelp, showPreview]);

  // Load saved markdown
  useEffect(() => {
    const savedMarkdown = localStorage.getItem('markdown_content');
    if (savedMarkdown) {
      setMarkdown(savedMarkdown);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Markdown Preview</h1>
          <p className="text-gray-600">Live preview with GitHub Flavored Markdown support</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Show/Hide Help"
          >
            <QuestionMarkCircleIcon className="h-5 w-5 text-gray-500" />
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Toggle Preview"
          >
            {showPreview ? (
              <PencilIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {showHelp && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Keyboard Shortcuts</CardTitle>
            <CardDescription>Use these shortcuts to quickly perform actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {keyboardShortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                    {shortcut.key}
                  </kbd>
                  <span className="text-gray-600">{shortcut.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${showPreview ? 'lg:col-span-1' : 'lg:col-span-2'}`}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Editor</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(markdown);
                  showNotification('Markdown copied to clipboard', 'success');
                }}
                className="p-1 hover:bg-gray-100 rounded"
                title="Copy to clipboard"
              >
                <DocumentDuplicateIcon className="h-5 w-5 text-gray-500" />
              </button>
              <button
                onClick={() => {
                  setMarkdown(sampleMarkdown);
                  showNotification('Markdown reset', 'info');
                }}
                className="p-1 hover:bg-gray-100 rounded"
                title="Reset to sample"
              >
                <ArrowPathIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="w-full h-[600px] p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Write your markdown here..."
          />
        </div>

        {showPreview && (
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Preview</label>
            </div>
            <div className="w-full h-[600px] p-4 bg-white border border-gray-200 rounded-lg overflow-auto">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex, rehypePrism]}
                >
                  {markdown}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>

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