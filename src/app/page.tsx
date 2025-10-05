'use client';

import Link from 'next/link';
import { 
  CodeBracketIcon, 
  WrenchIcon, 
  ArrowRightIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';
import AdSlot from './components/AdSlot';
import { Terminal } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-6 rounded-3xl border border-gray-200">
              <Terminal className="h-16 w-16 text-gray-600" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-8">
            MyDebugTools
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Essential developer tools for debugging, formatting, and optimization.
            <br />
            <span className="text-gray-800 font-semibold">Simple. Fast. Free.</span>
          </p>

          {/* CTA Button */}
          <Link 
            href="/tools"
            className="inline-flex items-center bg-gray-900 hover:bg-gray-800 text-white px-10 py-5 rounded-2xl font-semibold text-lg transition-all duration-300"
          >
            <SparklesIcon className="h-6 w-6 mr-3" />
            Explore Tools
            <ArrowRightIcon className="h-5 w-5 ml-3" />
          </Link>
        </div>

        {/* Quick Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:bg-gray-100 group">
            <div className="bg-gray-200 p-3 rounded-xl w-fit mx-auto mb-6">
              <CodeBracketIcon className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">JSON Tools</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Format, validate, and beautify JSON data with advanced features</p>
          </div>
          
          <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:bg-gray-100 group">
            <div className="bg-gray-200 p-3 rounded-xl w-fit mx-auto mb-6">
              <WrenchIcon className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">Code Diff</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Compare and analyze code differences with export options</p>
          </div>
          
          <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:bg-gray-100 group">
            <div className="bg-gray-200 p-3 rounded-xl w-fit mx-auto mb-6">
              <SparklesIcon className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">More Tools</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Base64, JWT, CSS, HTML, and much more developer utilities</p>
          </div>
        </div>

        {/* Ad Slot - Above Footer */}
        <div className="mt-16 max-w-4xl mx-auto">
          <AdSlot adSlot="8212501976" />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full flex flex-col items-center gap-2 py-8 border-t border-gray-200 mt-16 bg-gray-50">
        <div className="flex justify-center items-center gap-4">
          <a
            href="https://github.com/jasimvk/mydebugtools/blob/main/CHANGELOG.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 p-1 text-gray-600 hover:text-gray-900 hover:underline font-medium"
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
            className="flex items-center space-x-2 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-all duration-200 group"
            title="🐞 Report an Issue on GitHub"
            aria-label="Report an Issue on GitHub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-200">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">Report Issue</span>
          </a>
          <a
            href="https://github.com/jasimvk/mydebugtools"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-all duration-200 group"
            title="🤝 Contribute on GitHub"
            aria-label="Contribute on GitHub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-200">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">Contribute</span>
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-gray-500">
          <Link href="/privacy-policy" className="hover:text-gray-900 hover:underline transition-colors">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:text-gray-900 hover:underline transition-colors">Terms of Service</Link>
          <Link href="/cookie-policy" className="hover:text-gray-900 hover:underline transition-colors">Cookie Policy</Link>
          <Link href="/contact" className="hover:text-gray-900 hover:underline transition-colors">Contact</Link>
        </div>
        <div className="text-sm text-gray-500 mt-4">
          Built by <a href="https://x.com/jasimvk" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 hover:underline transition-colors font-medium">Jasim</a>
        </div>
      </footer>
    </div>
  );
}
