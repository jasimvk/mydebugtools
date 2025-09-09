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
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { CurlyBracesIcon, Terminal, Github, Bug } from 'lucide-react';
import { useState } from 'react';
import AdSlot from '@/app/components/AdSlot';

// Tools organized by category
const toolCategories = [
  {
    name: 'React Native',
    tools: [
      {
        name: 'Crash Decoder',
        description: 'Format and beautify crash logs from React Native, Android, iOS, and Flutter',
        path: '/tools/crash-beautifier',
        icon: ExclamationTriangleIcon
      },
      {
        name: 'Startup Profiling',
        description: 'Analyze and visualize React Native app startup performance metrics',
        path: '/tools/startup-profiling',
        icon: ChartBarIcon
      },
      {
        name: 'Bundle Size Analyzer',
        description: 'Analyze and optimize your app bundle size',
        path: '/tools/bundle-analyzer',
        icon: DocumentTextIcon
      },
      {
        name: 'Build Diff Viewer',
        description: 'Compare and analyze build differences',
        path: '/tools/build-diff',
        icon: ArrowsRightLeftIcon
      }
    ]
  },
  {
    name: 'General Tools',
    tools: [
      {
        name: 'JSON Tools',
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
        name: 'HTTP Status Codes',
        description: 'Comprehensive reference for HTTP status codes with explanations and best practices',
        path: '/tools/http-status',
        icon: GlobeAltIcon
      },
      {
        name: 'Code Diff',
        description: 'Compare and analyze code differences',
        path: '/tools/code-diff',
        icon: ArrowsRightLeftIcon
      },
      {
        name: 'Color Picker',
        description: 'Pick, convert, and manage colors in various formats',
        path: '/tools/color',
        icon: SwatchIcon
      },
      {
        name: 'Icon Finder',
        description: 'Find the perfect icon for your project',
        path: '/tools/icons',
        icon: MagnifyingGlassIcon
      }
    ]
  }
];

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'React Native': true, // Default expanded
    'General Tools': true
  });
  
  const filteredCategories = toolCategories.map(category => ({
    ...category,
    tools: category.tools.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.tools.length > 0);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile, shown on md+ screens */}
      <aside className="hidden md:block w-72 bg-white border-r border-gray-200">
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

          <nav className="space-y-6">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div key={category.name}>
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="w-full flex items-center justify-between px-3 mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    <span>{category.name}</span>
                    {expandedCategories[category.name] ? (
                      <ChevronDownIcon className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                  </button>
                  {expandedCategories[category.name] && (
                    <div className="space-y-1">
                      {category.tools.map((tool) => {
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
                      })}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No tools found matching "{searchQuery}"
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto relative">
        <div className="container mx-auto p-4 md:p-6">
          {/* Above-the-fold ad placement */}
          <div className="mb-4">
            <AdSlot adSlot="8212501976" />
          </div>
          {children}
        </div>
        <div className="container mx-auto px-4 md:px-6 mt-4">
          <AdSlot adSlot="8212501976" />
        </div>
        <footer className="w-full flex flex-col items-center gap-2 py-4 border-t border-gray-200 mt-8">
          <div className="flex justify-center items-center gap-4">
            <a
              href="https://github.com/jasimvk/mydebugtools/blob/main/CHANGELOG.md"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-1 text-blue-600 hover:underline font-medium"
              title="View recent updates and changelog"
              aria-label="Updates"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
              </svg>
              <span>Updates</span>
            </a>
            <a
              href="https://github.com/jasimvk/mydebugtools/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-1 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all duration-200 group"
              title="🐞 Report an Issue on GitHub"
              aria-label="Report an Issue on GitHub"
            >
              <Bug className="h-5 w-5 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm font-medium hidden sm:inline">Report Issue</span>
            </a>
            <a
              href="https://github.com/jasimvk/mydebugtools"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-1 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all duration-200 group"
              title="🤝 Contribute on GitHub"
              aria-label="Contribute on GitHub"
            >
              <Github className="h-5 w-5 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm font-medium hidden sm:inline">Contribute</span>
            </a>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Built by <a href="https://x.com/jasimvk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Jasim</a>
          </div>
        </footer>
      </main>
    </div>
  );
} 