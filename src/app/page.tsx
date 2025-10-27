'use client';

import Link from 'next/link';
import { 
  CodeBracketIcon, 
  WrenchIcon, 
  ArrowRightIcon,
  SparklesIcon,
  DocumentCheckIcon,
  KeyIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import AdSlot from './components/AdSlot';
import { Terminal, CurlyBraces } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <Terminal className="h-8 w-8 text-[#FF6C37]" />
              <span className="text-2xl font-semibold text-gray-900">MyDebugTools</span>
            </Link>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/jasimvk/mydebugtools"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition-colors"
                title="⭐ Star on GitHub if you like it"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>Star</span>
              </a>
              <Link 
                href="/tools"
                className="px-6 py-2.5 bg-[#FF6C37] hover:bg-[#ff5722] text-white font-medium rounded-md transition-colors"
              >
                Browse Tools
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-5xl mx-auto mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Dev Tools That <span className="text-[#FF6C37]">You Need</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
            Format, validate, convert, and debug with our suite of professional-grade developer tools. 
            <span className="font-semibold text-gray-800"> Fast, reliable, and always free.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <Link 
              href="/tools"
              className="inline-flex items-center bg-[#FF6C37] hover:bg-[#ff5722] text-white px-6 py-3 rounded-md font-semibold transition-colors"
            >
              <Terminal className="h-5 w-5 mr-2" />
              Browse Tools
            </Link>
            <a 
              href="https://github.com/jasimvk/mydebugtools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-md font-semibold transition-colors border border-gray-300"
            >
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
          </div>
        </div>

        {/* Tools Grid - Compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">
          <Link href="/tools/json" className="group bg-white rounded-lg border border-gray-200 hover:border-[#FF6C37] transition-all p-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-lg bg-[#FFF5F2] group-hover:bg-[#FF6C37] transition-colors mb-2">
                <CurlyBraces className="h-5 w-5 text-[#FF6C37] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">JSON</h3>
            </div>
          </Link>
          
          <Link href="/tools/jwt" className="group bg-white rounded-lg border border-gray-200 hover:border-[#FF6C37] transition-all p-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-lg bg-[#FFF5F2] group-hover:bg-[#FF6C37] transition-colors mb-2">
                <KeyIcon className="h-5 w-5 text-[#FF6C37] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">JWT</h3>
            </div>
          </Link>
          
          <Link href="/tools/base64" className="group bg-white rounded-lg border border-gray-200 hover:border-[#FF6C37] transition-all p-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-lg bg-[#FFF5F2] group-hover:bg-[#FF6C37] transition-colors mb-2">
                <DocumentCheckIcon className="h-5 w-5 text-[#FF6C37] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Base64</h3>
            </div>
          </Link>
          
          <Link href="/tools/code-diff" className="group bg-white rounded-lg border border-gray-200 hover:border-[#FF6C37] transition-all p-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-lg bg-[#FFF5F2] group-hover:bg-[#FF6C37] transition-colors mb-2">
                <CodeBracketIcon className="h-5 w-5 text-[#FF6C37] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Code Diff</h3>
            </div>
          </Link>
          
          <Link href="/tools/color" className="group bg-white rounded-lg border border-gray-200 hover:border-[#FF6C37] transition-all p-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-lg bg-[#FFF5F2] group-hover:bg-[#FF6C37] transition-colors mb-2">
                <SwatchIcon className="h-5 w-5 text-[#FF6C37] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Color</h3>
            </div>
          </Link>
          
          <Link href="/tools/http-status" className="group bg-white rounded-lg border border-gray-200 hover:border-[#FF6C37] transition-all p-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-lg bg-[#FFF5F2] group-hover:bg-[#FF6C37] transition-colors mb-2">
                <CodeBracketIcon className="h-5 w-5 text-[#FF6C37] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">HTTP</h3>
            </div>
          </Link>
          
          <Link href="/tools" className="group bg-white rounded-lg border border-gray-200 hover:border-[#FF6C37] transition-all p-4 md:col-span-2">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-lg bg-[#FFF5F2] group-hover:bg-[#FF6C37] transition-colors mb-2">
                <WrenchIcon className="h-5 w-5 text-[#FF6C37] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">30+ More Tools</h3>
            </div>
          </Link>
        </div>

        {/* Footer Links - Compact */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 mb-4">
            <a href="https://github.com/jasimvk/mydebugtools" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6C37] transition-colors">
              ⭐ Star on GitHub
            </a>
            <a href="https://github.com/jasimvk/mydebugtools/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6C37] transition-colors">
              MIT License
            </a>
            <Link href="/privacy-policy" className="hover:text-[#FF6C37] transition-colors">Privacy</Link>
            <Link href="/terms-of-service" className="hover:text-[#FF6C37] transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-[#FF6C37] transition-colors">Contact</Link>
          </div>
          <div className="text-xs text-gray-500 text-center">
            Developed & Maintained by <a href="https://x.com/jasimvk" target="_blank" rel="noopener noreferrer" className="text-[#FF6C37] hover:underline">Jasim</a>
          </div>
        </div>
      </div>
    </div>
  );
}
