'use client';

import Link from 'next/link';
import { 
  CodeBracketIcon, 
  WrenchIcon, 
  ArrowRightIcon,
  SparklesIcon,
  DocumentCheckIcon,
  KeyIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import AdSlot from './components/AdSlot';
import { Terminal, CurlyBraces } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <Terminal className="h-8 w-8 text-gray-900" />
              <span className="text-2xl font-bold text-gray-900">
                MyDebugTools
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/jasimvk/mydebugtools"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
                title="⭐ Star on GitHub if you like it"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>Star</span>
              </a>
              <Link 
                href="/tools"
                className="px-6 py-2.5 bg-[#FF6C37] hover:bg-[#ff5722] text-white font-semibold rounded-lg transition-colors shadow-lg"
              >
                Browse Tools
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 relative z-10">
        {/* Hero Section - Clean & Minimal */}
        <div className="text-center max-w-6xl mx-auto py-8">
          {/* Simple Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-full text-xs text-gray-700 font-medium mb-4">
            <SparklesIcon className="h-3.5 w-3.5" />
            <span>Free • Open Source • No Sign-up Required</span>
          </div>

          {/* Clean Title - Black & Orange Only */}
          <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight">
            <span className="text-gray-900">
              Developer Tools
            </span>
            <br />
            <span className="text-[#FF6C37]">
              You Need
            </span>
          </h1>
          
          <p className="text-base text-gray-600 mb-5 leading-relaxed max-w-2xl mx-auto">
            Professional developer utilities for formatting, validating, converting, and debugging. 
            <strong className="text-gray-900"> Fast, reliable, and privacy-focused.</strong>
          </p>

          {/* CTA Buttons - Clean */}
          {/* <div className="flex items-center justify-center gap-3 mb-6">
            <Link 
              href="/tools"
              className="inline-flex items-center bg-[#FF6C37] hover:bg-[#ff5722] text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-lg"
            >
              <Terminal className="h-4 w-4 mr-2" />
              Explore Tools
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Link>
            <a 
              href="https://github.com/jasimvk/mydebugtools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-white hover:bg-gray-900 text-gray-900 hover:text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors border-2 border-gray-900 shadow"
            >
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
          </div> */}

          {/* Stats Pills - Black & Orange Only
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <div className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-full shadow-sm">
              <span className="text-xs font-bold text-gray-900">🚀 30+ Tools</span>
            </div>
            <div className="px-3 py-1 bg-[#FF6C37] border border-[#FF6C37] rounded-full shadow-sm">
              <span className="text-xs font-bold text-white">⚡ Instant Results</span>
            </div>
            <div className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-full shadow-sm">
              <span className="text-xs font-bold text-gray-900">🔒 Privacy First</span>
            </div>
            <div className="px-3 py-1 bg-[#FF6C37] border border-[#FF6C37] rounded-full shadow-sm">
              <span className="text-xs font-bold text-white">💯 Free Forever</span>
            </div>
          </div> */}
        </div>

        {/* Featured Tools - Clean Cards */}
        <div className="max-w-7xl mx-auto pb-8">
          {/* <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
              Popular Tools
            </h2>
            <p className="text-sm text-gray-600">
              Most used by developers worldwide
            </p>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* JSON Tool */}
            <Link href="/tools/json" className="group bg-white rounded-xl border-2 border-gray-200 hover:border-[#FF6C37] transition-colors p-5 hover:shadow-xl">
              <div className="inline-flex p-2.5 rounded-lg bg-gray-100 group-hover:bg-[#FF6C37] transition-colors mb-3">
                <CurlyBraces className="h-5 w-5 text-gray-900 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-base font-black text-gray-900 mb-1.5">
                JSON Formatter
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed mb-3">
                Format, validate, and visualize JSON data
              </p>
              <div className="flex items-center text-[#FF6C37] font-bold text-xs">
                Try it now
                <ArrowRightIcon className="h-3 w-3 ml-1" />
              </div>
            </Link>
            
            {/* JWT Tool */}
            <Link href="/tools/jwt" className="group bg-white rounded-xl border-2 border-gray-200 hover:border-[#FF6C37] transition-colors p-5 hover:shadow-xl">
              <div className="inline-flex p-2.5 rounded-lg bg-gray-100 group-hover:bg-[#FF6C37] transition-colors mb-3">
                <KeyIcon className="h-5 w-5 text-gray-900 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-base font-black text-gray-900 mb-1.5">
                JWT Decoder
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed mb-3">
                Decode and verify JSON Web Tokens
              </p>
              <div className="flex items-center text-[#FF6C37] font-bold text-xs">
                Try it now
                <ArrowRightIcon className="h-3 w-3 ml-1" />
              </div>
            </Link>
            
            {/* API Tester */}
            <Link href="/tools/api" className="group bg-white rounded-xl border-2 border-gray-200 hover:border-[#FF6C37] transition-colors p-5 hover:shadow-xl">
              <div className="inline-flex p-2.5 rounded-lg bg-gray-100 group-hover:bg-[#FF6C37] transition-colors mb-3">
                <BeakerIcon className="h-5 w-5 text-gray-900 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-base font-black text-gray-900 mb-1.5">
                API Tester
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed mb-3">
                Test REST APIs with custom headers
              </p>
              <div className="flex items-center text-[#FF6C37] font-bold text-xs">
                Try it now
                <ArrowRightIcon className="h-3 w-3 ml-1" />
              </div>
            </Link>
            
            {/* Base64 */}
            <Link href="/tools/base64" className="group bg-white rounded-xl border-2 border-gray-200 hover:border-[#FF6C37] transition-colors p-5 hover:shadow-xl">
              <div className="inline-flex p-2.5 rounded-lg bg-gray-100 group-hover:bg-[#FF6C37] transition-colors mb-3">
                <DocumentCheckIcon className="h-5 w-5 text-gray-900 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-base font-black text-gray-900 mb-1.5">
                Base64 Encoder
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed mb-3">
                Encode and decode Base64 strings
              </p>
              <div className="flex items-center text-[#FF6C37] font-bold text-xs">
                Try it now
                <ArrowRightIcon className="h-3 w-3 ml-1" />
              </div>
            </Link>
            
            {/* Code Diff */}
            <Link href="/tools/code-diff" className="group bg-white rounded-xl border-2 border-gray-200 hover:border-[#FF6C37] transition-colors p-5 hover:shadow-xl">
              <div className="inline-flex p-2.5 rounded-lg bg-gray-100 group-hover:bg-[#FF6C37] transition-colors mb-3">
                <CodeBracketIcon className="h-5 w-5 text-gray-900 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-base font-black text-gray-900 mb-1.5">
                Code Diff
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed mb-3">
                Compare code with syntax highlighting
              </p>
              <div className="flex items-center text-[#FF6C37] font-bold text-xs">
                Try it now
                <ArrowRightIcon className="h-3 w-3 ml-1" />
              </div>
            </Link>
            
            {/* View All Tools */}
            <Link href="/tools" className="group bg-gray-900 hover:bg-[#FF6C37] rounded-xl border-2 border-gray-900 hover:border-[#FF6C37] transition-colors p-5 hover:shadow-xl">
              <div className="inline-flex p-2.5 rounded-lg bg-white/10 mb-3">
                <WrenchIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-black text-white mb-1.5">
                View All Tools
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed mb-3">
                Explore 30+ developer utilities
              </p>
              <div className="flex items-center text-white font-bold text-xs">
                Browse all
                <ArrowRightIcon className="h-3 w-3 ml-1" />
              </div>
            </Link>
          </div>
        </div>

        {/* Footer - Clean */}
        <footer className="max-w-7xl mx-auto pb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs">
                <a href="https://github.com/jasimvk/mydebugtools" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">
                  ⭐ Star on GitHub
                </a>
                <a href="https://github.com/jasimvk/mydebugtools/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">
                  MIT License
                </a>
                <a href="https://github.com/jasimvk/mydebugtools/issues" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">Report Issue</a>
                <a href="https://github.com/jasimvk/mydebugtools/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">Contribute</a>
                <Link href="/contact" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">Contact</Link>
                <Link href="/faq" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">FAQ</Link>
                <Link href="/privacy-policy" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">Privacy & Terms</Link>
              </div>
              <div className="text-xs text-gray-600">
                Built by <a href="https://x.com/jasimvk" target="_blank" rel="noopener noreferrer" className="text-[#FF6C37] hover:underline font-semibold">@jasimvk</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
