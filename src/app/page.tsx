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
        {/* Hero Section - Modern & Engaging */}
        <div className="text-center max-w-6xl mx-auto py-12 md:py-16">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-white border border-[#FF6C37]/20 rounded-full text-xs text-gray-700 font-semibold mb-6 shadow-sm">
            <SparklesIcon className="h-4 w-4 text-[#FF6C37]" />
            <span>✨ Free • Open Source • Privacy First</span>
          </div>

          {/* Powerful Title with Better Hierarchy */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight">
            <span className="text-gray-900 block">
              Developer Tools
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6C37] to-[#ff5722]">
              You Need
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto font-medium">
            30+ professional utilities for formatting, validating, converting, and debugging code.
            <span className="block text-gray-900 font-bold mt-1">Fast. Reliable. Privacy-focused. 100% free.</span>
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

        {/* Featured Tools - Improved Cards with Better Spacing */}
        <div className="max-w-7xl mx-auto py-12 md:py-16">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Popular Tools
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Start with these widely-used utilities, or explore 30+ tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {/* JSON Tool */}
            <Link href="/tools/json" className="group bg-white rounded-xl border-2 border-gray-200 hover:border-[#FF6C37] transition-all duration-200 p-6 hover:shadow-lg hover:scale-105">
              <div className="inline-flex p-3 rounded-lg bg-gray-100 group-hover:bg-[#FF6C37] transition-all duration-200 mb-4">
                <CurlyBraces className="h-6 w-6 text-gray-900 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                JSON Formatter
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Format, validate, and visualize JSON data instantly
              </p>
              <div className="flex items-center text-[#FF6C37] font-bold text-sm group-hover:gap-2 transition-all">
                Try it now
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </div>
            </Link>
            
            {/* JWT Tool */}
            <Link href="/tools/jwt" className="group bg-white rounded-xl border-2 border-gray-200 hover:border-[#FF6C37] transition-all duration-200 p-6 hover:shadow-lg hover:scale-105">
              <div className="inline-flex p-3 rounded-lg bg-gray-100 group-hover:bg-[#FF6C37] transition-all duration-200 mb-4">
                <KeyIcon className="h-6 w-6 text-gray-900 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                JWT Decoder
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Decode and verify JSON Web Tokens with ease
              </p>
              <div className="flex items-center text-[#FF6C37] font-bold text-sm group-hover:gap-2 transition-all">
                Try it now
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </div>
            </Link>
            
            {/* API Tester */}
            <Link href="/tools/api" className="group bg-white rounded-xl border-2 border-gray-200 hover:border-[#FF6C37] transition-all duration-200 p-6 hover:shadow-lg hover:scale-105">
              <div className="inline-flex p-3 rounded-lg bg-gray-100 group-hover:bg-[#FF6C37] transition-all duration-200 mb-4">
                <BeakerIcon className="h-6 w-6 text-gray-900 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                API Tester
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Test REST APIs with custom headers and authentication
              </p>
              <div className="flex items-center text-[#FF6C37] font-bold text-sm group-hover:gap-2 transition-all">
                Try it now
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </div>
            </Link>
            
            {/* Base64 */}
            <Link href="/tools/base64" className="group bg-white rounded-xl border-2 border-gray-200 hover:border-[#FF6C37] transition-all duration-200 p-6 hover:shadow-lg hover:scale-105">
              <div className="inline-flex p-3 rounded-lg bg-gray-100 group-hover:bg-[#FF6C37] transition-all duration-200 mb-4">
                <DocumentCheckIcon className="h-6 w-6 text-gray-900 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Base64 Encoder
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Encode and decode Base64 strings and files
              </p>
              <div className="flex items-center text-[#FF6C37] font-bold text-sm group-hover:gap-2 transition-all">
                Try it now
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </div>
            </Link>
            
            {/* Code Diff */}
            <Link href="/tools/code-diff" className="group bg-white rounded-xl border-2 border-gray-200 hover:border-[#FF6C37] transition-all duration-200 p-6 hover:shadow-lg hover:scale-105">
              <div className="inline-flex p-3 rounded-lg bg-gray-100 group-hover:bg-[#FF6C37] transition-all duration-200 mb-4">
                <CodeBracketIcon className="h-6 w-6 text-gray-900 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Code Diff
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Compare code with syntax highlighting
              </p>
              <div className="flex items-center text-[#FF6C37] font-bold text-sm group-hover:gap-2 transition-all">
                Try it now
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </div>
            </Link>
            
            {/* View All Tools */}
            <Link href="/tools" className="group bg-gradient-to-br from-gray-900 to-gray-800 hover:from-[#FF6C37] hover:to-[#ff5722] rounded-xl border-2 border-gray-900 hover:border-[#FF6C37] transition-all duration-200 p-6 hover:shadow-lg hover:scale-105">
              <div className="inline-flex p-3 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all duration-200 mb-4">
                <WrenchIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                View All Tools
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Explore our complete collection of 30+ utilities
              </p>
              <div className="flex items-center text-white font-bold text-sm group-hover:gap-2 transition-all">
                Browse all
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </div>
            </Link>
          </div>
        </div>

        {/* Footer - Modern Design */}
        <footer className="max-w-7xl mx-auto py-12 md:py-16">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-8 md:p-10 shadow-xl">
            <div className="flex flex-col gap-8">
              {/* Footer Links Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center md:text-left">
                <a href="https://github.com/jasimvk/mydebugtools" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#FF6C37] transition-colors font-medium text-sm">
                  ⭐ Star on GitHub
                </a>
                <a href="https://github.com/jasimvk/mydebugtools/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#FF6C37] transition-colors font-medium text-sm">
                  MIT License
                </a>
                <a href="https://github.com/jasimvk/mydebugtools/issues" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#FF6C37] transition-colors font-medium text-sm">
                  Report Issue
                </a>
                <a href="https://github.com/jasimvk/mydebugtools/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#FF6C37] transition-colors font-medium text-sm">
                  Contribute
                </a>
                <Link href="/contact" className="text-gray-300 hover:text-[#FF6C37] transition-colors font-medium text-sm">
                  Contact
                </Link>
                <Link href="/faq" className="text-gray-300 hover:text-[#FF6C37] transition-colors font-medium text-sm">
                  FAQ
                </Link>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-700"></div>

              {/* Footer Bottom */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-[#FF6C37]" />
                  <span className="text-gray-300">
                    MyDebugTools © 2024. Built for developers.
                  </span>
                </div>
                <Link href="/privacy-policy" className="text-gray-300 hover:text-[#FF6C37] transition-colors underline">
                  Privacy & Terms
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
