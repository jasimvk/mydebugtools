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
                href="https://buymeacoffee.com/jasimvk"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#FFDD00] hover:bg-[#FFED4E] text-gray-900 font-medium rounded-lg transition-colors shadow-sm"
                title="☕ Support this project"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 01.39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.153 1.735.207.526.047 1.053.087 1.58.119 1.677.102 3.362.118 5.04.048.943-.038 1.888-.123 2.826-.226.387-.043.779-.102 1.146-.181.244-.053.432.036.535.243.105.224.043.497-.146.68zm-13.814 3.149c-.035.031-.066.063-.096.096-.032.038-.062.077-.09.118-.018.026-.035.053-.051.08-.015.027-.03.055-.043.083-.015.032-.028.065-.04.098-.012.031-.022.063-.031.096-.011.036-.02.073-.028.11-.007.037-.013.074-.019.112-.005.037-.01.073-.013.11-.004.037-.007.074-.009.111-.002.037-.003.074-.003.111v.007c0 .037.002.074.004.111.002.037.005.074.009.111.003.037.008.073.013.11.006.037.012.074.02.111.007.037.016.074.027.111.009.033.02.065.032.097.011.032.024.064.038.096.014.031.029.061.045.09.016.028.033.055.052.082.018.025.038.05.058.074.02.024.042.047.064.07a.957.957 0 00.075.063c.025.02.05.04.077.058.026.018.053.035.081.051.027.016.055.031.084.044.029.014.058.026.088.038.03.012.06.023.09.033.03.01.06.018.091.025.031.007.063.013.094.018.032.005.064.009.096.012.032.003.064.005.096.006.032.001.064.001.096 0 .032 0 .064-.002.096-.005.032-.003.064-.007.095-.012.032-.005.063-.011.094-.018.031-.007.062-.015.092-.024.03-.01.06-.021.09-.033.03-.012.059-.025.088-.039.029-.014.057-.029.084-.045.028-.016.055-.033.081-.051.027-.018.052-.037.077-.058.025-.02.05-.041.074-.063.024-.022.047-.045.07-.069.022-.023.044-.048.064-.073.02-.025.04-.05.059-.076.018-.026.036-.053.052-.08.016-.029.031-.058.045-.088.014-.031.027-.063.038-.095.012-.033.023-.066.032-.099.01-.033.019-.067.027-.101.007-.034.013-.069.019-.104.005-.035.01-.07.013-.106.003-.036.006-.072.008-.109.002-.036.003-.072.003-.109v-.007c0-.036-.001-.073-.003-.109-.002-.036-.005-.073-.008-.109-.003-.035-.008-.071-.013-.106-.006-.035-.012-.07-.02-.104-.007-.034-.016-.068-.026-.101-.01-.033-.021-.066-.032-.099-.012-.032-.025-.064-.039-.095-.014-.03-.029-.059-.045-.088-.016-.027-.033-.054-.051-.08-.019-.027-.039-.053-.06-.077-.02-.025-.041-.049-.063-.073-.022-.024-.046-.047-.07-.069-.024-.022-.05-.043-.075-.063-.026-.02-.052-.039-.079-.057-.027-.018-.055-.035-.083-.051-.028-.016-.057-.03-.086-.044-.03-.014-.06-.027-.09-.039-.031-.012-.062-.022-.093-.032-.031-.01-.062-.018-.094-.025-.032-.007-.064-.013-.096-.018-.032-.005-.064-.009-.097-.012-.032-.003-.064-.005-.096-.006-.032-.001-.064-.001-.096 0-.032 0-.064.002-.096.005-.032.003-.064.007-.096.012-.032.005-.064.011-.095.018-.031.007-.062.015-.093.024-.03.01-.06.021-.09.033-.03.012-.06.025-.088.039-.029.014-.057.029-.085.045-.027.016-.054.033-.08.051-.026.018-.052.037-.077.058-.024.02-.05.041-.074.063a.956.956 0 00-.069.069z"/>
                </svg>
                <span className="hidden lg:inline">Buy me a coffee</span>
                <span className="lg:hidden">Donate</span>
              </a>
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
                <a href="https://buymeacoffee.com/jasimvk" target="_blank" rel="noopener noreferrer" className="text-[#FFDD00] hover:text-[#FFED4E] transition-colors font-semibold text-sm flex items-center justify-center md:justify-start gap-1">
                  ☕ Support Us
                </a>
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
