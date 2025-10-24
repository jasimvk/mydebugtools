'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  KeyIcon,
  ArrowsRightLeftIcon,
  SwatchIcon,
  DocumentTextIcon,
  DocumentCheckIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { CurlyBracesIcon, Terminal, Github } from 'lucide-react';
import { useState } from 'react';
import AdSlot from '@/app/components/AdSlot';

// Tools organized by category
const tools = [
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
    name: 'HTTP Status',
    description: 'HTTP status codes reference',
    path: '/tools/http-status',
    icon: GlobeAltIcon
  },
  {
    name: 'Code Diff',
    description: 'Compare code differences',
    path: '/tools/code-diff',
    icon: ArrowsRightLeftIcon
  },
  {
    name: 'Base64',
    description: 'Encode and decode Base64',
    path: '/tools/base64',
    icon: DocumentCheckIcon
  },
  {
    name: 'Color Picker',
    description: 'Pick and convert colors',
    path: '/tools/color',
    icon: SwatchIcon
  },
  {
    name: 'SVG Optimizer',
    description: 'Optimize SVG files',
    path: '/tools/svg',
    icon: DocumentTextIcon
  }
];

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex flex-col min-h-screen bg-white" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* Clean Professional Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-[#FF6C37]" strokeWidth={2.5} />
              <span className="text-base font-semibold text-gray-900">MyDebugTools</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const active = isActive(tool.path);
                return (
                  <Link
                    key={tool.name}
                    href={tool.path}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded ${
                      active
                        ? 'bg-[#FF6C37] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                    <span>{tool.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://github.com/jasimvk/mydebugtools"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Github className="h-4 w-4" strokeWidth={2} />
                <span>GitHub</span>
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const active = isActive(tool.path);
                return (
                  <Link
                    key={tool.name}
                    href={tool.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded ${
                      active
                        ? 'bg-[#FF6C37] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                    <span>{tool.name}</span>
                  </Link>
                );
              })}
              <a
                href="https://github.com/jasimvk/mydebugtools"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
              >
                <Github className="h-4 w-4" strokeWidth={2} />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="flex-1 bg-gray-50">
        {children}
        
        {/* Ad placement above footer */}
        <div className="container mx-auto px-4 md:px-6 py-4">
          <AdSlot adSlot="8212501976" />
        </div>
        
        <footer className="border-t border-gray-200 bg-white mt-12">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/jasimvk/mydebugtools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  Star on GitHub
                </a>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
                <Link href="/privacy-policy" className="hover:text-gray-900">Privacy</Link>
                <Link href="/terms-of-service" className="hover:text-gray-900">Terms</Link>
                <Link href="/cookie-policy" className="hover:text-gray-900">Cookies</Link>
                <Link href="/contact" className="hover:text-gray-900">Contact</Link>
              </div>
              <div className="text-sm text-gray-600">
                Made by <a href="https://x.com/jasimvk" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-[#FF6C37] font-medium">Jasim</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
