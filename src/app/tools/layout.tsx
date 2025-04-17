'use client';

import Link from 'next/link';
import { 
  CodeBracketIcon,
  KeyIcon,
  CommandLineIcon,
  WrenchIcon,
  MagnifyingGlassIcon,
  ArrowsRightLeftIcon,
  SwatchIcon,
  DocumentTextIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';
import { CurlyBracesIcon, Terminal } from 'lucide-react';
import { useState } from 'react';

// Tools ordered by popularity and trending status
const tools = [
  {
    name: 'JSON',
    description: 'Format, validate, and beautify your JSON data with syntax highlighting',
    path: '/tools/json',
    icon: CurlyBracesIcon
  },
  {
    name: 'JWT Decoder',
    description: 'Decode and verify JWT tokens instantly',
    path: '/tools/jwt',
    icon: KeyIcon
  },
  {
    name: 'API Tester',
    description: 'Test your APIs with a lightweight, fast interface',
    path: '/tools/api',
    icon: WrenchIcon
  },
  {
    name: 'Regex Tester',
    description: 'Test and validate regular expressions with real-time matching',
    path: '/tools/regex',
    icon: MagnifyingGlassIcon
  },
  {
    name: 'Code Diff',
    description: 'Compare and analyze code differences',
    path: '/tools/code-diff',
    icon: ArrowsRightLeftIcon
  },
  {
    name: 'Base64 Tools',
    description: 'Encode and decode Base64 strings with a single click',
    path: '/tools/base64',
    icon: CommandLineIcon
  },
  {
    name: 'HTML Validator',
    description: 'Validate and format HTML code',
    path: '/tools/html',
    icon: DocumentCheckIcon
  },
  {
    name: 'CSS Tools',
    description: 'Minify, beautify, and validate your CSS code',
    path: '/tools/css',
    icon: CodeBracketIcon
  },
  {
    name: 'Color Picker',
    description: 'Pick, convert, and manage colors in various formats',
    path: '/tools/color',
    icon: SwatchIcon
  },
  {
    name: 'Markdown Preview',
    description: 'Preview and edit Markdown with live rendering',
    path: '/tools/markdown',
    icon: DocumentTextIcon
  },
  {
    name: 'Icon Finder',
    description: 'Find the perfect icon for your project',
    path: '/tools/icons',
    icon: MagnifyingGlassIcon
  }
];

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile, shown on md+ screens */}
      <aside className="hidden md:block w-64 bg-white border-r border-gray-200">
        <div className="p-4 sticky top-0 h-screen overflow-y-auto">
          <Link href="/" className="flex items-center space-x-2 mb-4">
            <Terminal />
            <span className="text-xl font-bold">MyDebugTools</span>
          </Link>
          
          {/* Search input */}
          <div className="mb-6 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
          
          <nav className="space-y-1">
            {filteredTools.length > 0 ? (
              filteredTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.name}
                    href={tool.path}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-sm text-gray-500">{tool.description}</div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500">
                No tools found matching "{searchQuery}"
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 