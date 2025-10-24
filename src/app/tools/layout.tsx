'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  // {
  //   name: 'React Native',
  //   tools: [
  //     {
  //       name: 'Crash Decoder',
  //       description: 'Format and beautify crash logs from React Native, Android, iOS, and Flutter',
  //       path: '/tools/crash-beautifier',
  //       icon: ExclamationTriangleIcon
  //     },
  //     {
  //       name: 'Startup Profiling',
  //       description: 'Analyze and visualize React Native app startup performance metrics',
  //       path: '/tools/startup-profiling',
  //       icon: ChartBarIcon
  //     },
  //     {
  //       name: 'Bundle Size Analyzer',
  //       description: 'Analyze and optimize your app bundle size',
  //       path: '/tools/bundle-analyzer',
  //       icon: DocumentTextIcon
  //     },
  //     {
  //       name: 'Build Diff Viewer',
  //       description: 'Compare and analyze build differences',
  //       path: '/tools/build-diff',
  //       icon: ArrowsRightLeftIcon
  //     }
  //   ]
  // },
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
        name: 'Base64 Converter',
        description: 'Encode and decode Base64 strings, convert images and PDFs',
        path: '/tools/base64',
        icon: DocumentCheckIcon
      },
      {
        name: 'Color Picker',
        description: 'Pick, convert, and manage colors in various formats',
        path: '/tools/color',
        icon: SwatchIcon
      },
      {
        name: 'SVG Optimizer',
        description: 'Optimize and minify SVG files, remove unnecessary code',
        path: '/tools/svg',
        icon: DocumentTextIcon
      }
      // {
      //   name: 'Icon Finder',
      //   description: 'Find the perfect icon for your project',
      //   path: '/tools/icons',
      //   icon: MagnifyingGlassIcon
      // }
    ]
  }
];

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Always start collapsed
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
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

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f7f7f7]">
      {/* Sidebar - Postman Style */}
      <aside className={`hidden md:flex flex-col bg-[#1a1a1a] text-white transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="flex flex-col h-screen sticky top-0">
          {/* Header - Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            {!sidebarCollapsed ? (
              <>
                <Link href="/" className="flex items-center space-x-2">
                  <Terminal className="h-6 w-6 text-[#FF6C37]" />
                  <span className="text-lg font-bold">MyDebugTools</span>
                </Link>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
                  title="Collapse sidebar"
                >
                  <ChevronDownIcon className="h-4 w-4 text-gray-400 rotate-[-90deg]" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="flex items-center justify-center w-full p-2 hover:bg-gray-800 rounded-md transition-colors"
                title="Expand sidebar"
              >
                <Terminal className="h-6 w-6 text-[#FF6C37]" />
              </button>
            )}
          </div>
          
          {/* Search input - Postman style */}
          {!sidebarCollapsed && (
            <div className="p-3 border-b border-gray-800">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[#2a2a2a] border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FF6C37] focus:border-[#FF6C37] text-white placeholder-gray-500"
                />
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-2 py-3">
            {sidebarCollapsed ? (
              // Collapsed view - icons with names below
              <nav className="space-y-1">
                {filteredCategories.map((category) => (
                  category.tools.map((tool) => {
                    const Icon = tool.icon;
                    const active = isActive(tool.path);
                    return (
                      <Link
                        key={tool.name}
                        href={tool.path}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all group relative ${
                          active 
                            ? 'bg-[#FF6C37] text-white' 
                            : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-white'
                        }`}
                        title={tool.name}
                      >
                        <Icon className={`h-5 w-5 mb-1 ${active ? 'text-white' : ''}`} strokeWidth={2} />
                        <span className={`text-[9px] font-medium text-center leading-tight ${active ? 'text-white' : ''}`}>
                          {tool.name}
                        </span>
                      </Link>
                    );
                  })
                ))}
              </nav>
            ) : (
              // Expanded view - Postman style list
              <nav className="space-y-1">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <div key={category.name} className="mb-4">
                      <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {category.name}
                      </div>
                      <div className="space-y-0.5">
                        {category.tools.map((tool) => {
                          const Icon = tool.icon;
                          const active = isActive(tool.path);
                          return (
                            <Link
                              key={tool.name}
                              href={tool.path}
                              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group ${
                                active 
                                  ? 'bg-[#2a2a2a] text-white border-l-2 border-[#FF6C37]' 
                                  : 'text-gray-300 hover:bg-[#2a2a2a] hover:text-white'
                              }`}
                            >
                              <Icon className={`h-4 w-4 flex-shrink-0 ${
                                active ? 'text-[#FF6C37]' : 'text-gray-500 group-hover:text-[#FF6C37]'
                              }`} strokeWidth={2} />
                              <span className="text-sm font-medium">{tool.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No tools found
                  </div>
                )}
              </nav>
            )}
          </div>
          
          {/* Bottom Actions - Postman style */}
          {!sidebarCollapsed && (
            <div className="border-t border-gray-800 p-3">
              <a
                href="https://github.com/jasimvk/mydebugtools"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-[#FF6C37] hover:bg-[#ff5722] text-white text-sm font-medium rounded-md transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                Star on GitHub
              </a>
            </div>
          )}
          
          {/* Toggle button at bottom */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full p-2 hover:bg-[#FFF5F2] rounded-md transition-colors flex items-center justify-center"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRightIcon className="h-5 w-5 text-gray-600 hover:text-[#FF6C37]" />
              ) : (
                <div className="flex items-center space-x-2">
                  <ChevronDownIcon className="h-5 w-5 text-gray-600 rotate-[-90deg]" />
                  <span className="text-sm text-gray-600">Collapse</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen bg-[#f7f7f7]">
        {children}
        
        {/* Ad placement above footer */}
        <div className="container mx-auto px-4 md:px-6 py-4">
          <AdSlot adSlot="8212501976" />
        </div>
        
        <footer className="w-full flex flex-col items-center gap-4 py-6 border-t border-gray-200 mt-8 bg-white">
          <div className="flex justify-center items-center gap-4">
            <a
              href="https://github.com/jasimvk/mydebugtools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition-colors text-sm"
              title="⭐ Star our Open Source project on GitHub"
              aria-label="Star on GitHub"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span>Star on GitHub</span>
              <span className="text-xs bg-green-600 px-2 py-0.5 rounded">Open Source</span>
            </a>
          </div>
          <div className="flex justify-center items-center gap-4">
            <a
              href="https://github.com/jasimvk/mydebugtools/blob/main/CHANGELOG.md"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-1 text-gray-600 hover:text-[#FF6C37] font-medium transition-colors"
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
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-white hover:bg-[#FF6C37] rounded-md transition-all duration-200"
              title="🐞 Report an Issue on GitHub"
              aria-label="Report an Issue on GitHub"
            >
              <Bug className="h-5 w-5" />
              <span className="text-sm font-medium">Report Issue</span>
            </a>
            <a
              href="https://github.com/jasimvk/mydebugtools"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-white hover:bg-[#FF6C37] rounded-md transition-all duration-200"
              title="🤝 Contribute on GitHub"
              aria-label="Contribute on GitHub"
            >
              <Github className="h-5 w-5" />
              <span className="text-sm font-medium">Contribute</span>
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-gray-600">
            <Link href="/privacy-policy" className="hover:text-[#FF6C37] transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-[#FF6C37] transition-colors">Terms of Service</Link>
            <Link href="/cookie-policy" className="hover:text-[#FF6C37] transition-colors">Cookie Policy</Link>
            <Link href="/contact" className="hover:text-[#FF6C37] transition-colors">Contact</Link>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Made by <a href="https://x.com/jasimvk" target="_blank" rel="noopener noreferrer" className="text-[#FF6C37] hover:underline font-medium">Jasim</a>
          </div>
        </footer>
      </main>
    </div>
  );
} 