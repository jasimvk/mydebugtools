'use client';

import Link from 'next/link';
import { 
  CodeBracketIcon, 
  WrenchIcon, 
  ArrowRightIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';
import AdSlot from './components/AdSlot';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
              <WrenchIcon className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            MyDebugTools
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Essential developer tools for debugging, formatting, and optimization.
            <br />
            Simple. Fast. Free.
          </p>

          {/* CTA Button */}
          <Link 
            href="/tools"
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <SparklesIcon className="h-5 w-5 mr-2" />
            Explore Tools
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </Link>
        </div>

        {/* Quick Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CodeBracketIcon className="h-8 w-8 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">JSON Tools</h3>
            <p className="text-gray-600 text-sm">Format, validate, and beautify JSON data</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <WrenchIcon className="h-8 w-8 text-indigo-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Code Diff</h3>
            <p className="text-gray-600 text-sm">Compare and analyze code differences</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <SparklesIcon className="h-8 w-8 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">More Tools</h3>
            <p className="text-gray-600 text-sm">Base64, JWT, CSS, HTML, and much more</p>
          </div>
        </div>

        {/* Ad Slot - Above Footer */}
        <div className="mt-16 max-w-4xl mx-auto">
          <AdSlot adSlot="8212501976" />
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 text-sm">
            Built by{' '}
            <a 
              href="https://x.com/jasimvk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              Jasim
            </a>
          </p>
          <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
            <Link href="/privacy-policy" className="hover:text-blue-600 hover:underline">
              Privacy
            </Link>
            <Link href="/tools" className="hover:text-blue-600 hover:underline">
              Tools
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
