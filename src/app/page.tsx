'use client';

import Link from 'next/link';
import { 
  CodeBracketIcon, 
  KeyIcon, 
  CommandLineIcon,
  WrenchIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { CurlyBracesIcon, Github, Terminal, Zap, Shield, Code2, Cpu, Star, Search } from 'lucide-react';
import React, { useState } from 'react';

const tools = [
  {
    name: 'JSON Formatter',
    description: 'Format, validate, and beautify your JSON data with syntax highlighting',
    path: '/tools/json',
    icon: CurlyBracesIcon,
    bgClass: 'bg-gradient-to-br from-blue-100 to-blue-200'
  },
  {
    name: 'JWT Decoder',
    description: 'Decode and verify JWT tokens instantly',
    path: '/tools/jwt',
    icon: KeyIcon,
    bgClass: 'bg-gradient-to-br from-green-100 to-green-200'
  },
  {
    name: 'Base64 Tools',
    description: 'Encode and decode Base64 strings with a single click',
    path: '/tools/base64',
    icon: CommandLineIcon,
    bgClass: 'bg-gradient-to-br from-purple-100 to-purple-200'
  },
  {
    name: 'API Tester',
    description: 'Test your APIs with a lightweight, fast interface',
    path: '/tools/api',
    icon: WrenchIcon,
    bgClass: 'bg-gradient-to-br from-orange-100 to-orange-200'
  },
  {
    name: 'Icon Finder',
    description: 'Find the perfect icon for your project',
    path: '/tools/icons',
    icon: MagnifyingGlassIcon,
    bgClass: 'bg-gradient-to-br from-pink-100 to-pink-200'
  }
];

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

export default function Home() {
  const [search, setSearch] = useState('');
  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(search.toLowerCase()) ||
    tool.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-blue-950 flex flex-col">
      {/* Header */}
      <nav className="w-full py-6 px-6 flex justify-between items-center container mx-auto">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-blue-900/40 p-2 shadow-lg">
            <Terminal className="h-10 w-10 text-blue-500" />
          </span>
          <span className="text-2xl font-extrabold text-white tracking-tight">MyDebugTools</span>
        </div>
        <div className="flex gap-4 items-center">
          <a href="https://github.com/yourusername/mydebugtools" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-300 hover:text-white text-sm font-medium">
            <Github className="h-5 w-5" />
            GitHub
          </a>
          <a href="#tools" className="text-gray-300 hover:text-white text-sm font-medium">Tools</a>
          <a href="#why" className="text-gray-300 hover:text-white text-sm font-medium">Why?</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-6 py-16 text-center flex flex-col items-center relative">
        <div className="flex justify-center mb-6">
          <span className="rounded-full bg-blue-900/30 p-6 shadow-2xl animate-bounce-slow">
            <Terminal className="h-16 w-16 text-blue-500" />
          </span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
          Welcome to <span className="text-blue-400">MyDebugTools</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-medium">
          Your friendly, all-in-one debugging toolkit. Fast, free, and beautifully simple—just like devtoys, but for the web!
        </p>
        <div className="w-full max-w-md mx-auto mb-8">
          <div className="flex items-center bg-gray-800/80 rounded-lg px-4 py-2 shadow-lg focus-within:ring-2 ring-blue-500">
            <Search className="h-5 w-5 text-blue-400 mr-2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tools (e.g. JSON, JWT, API...)"
              className="w-full bg-transparent outline-none text-white placeholder-gray-400 text-lg py-2"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#tools"
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 text-lg shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Zap className="h-5 w-5" />
            Try Now
          </a>
          <a
            href="https://github.com/yourusername/mydebugtools"
            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 text-lg shadow-lg transition-all duration-200 hover:scale-105"
            target="_blank" rel="noopener noreferrer"
          >
            <Star className="h-5 w-5" />
            Star on GitHub
          </a>
        </div>
      </header>

      {/* Why Use MyDebugTools? */}
      <section id="why" className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Why Use MyDebugTools?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-lg p-6 text-center shadow-md hover:shadow-blue-700/30 transition-shadow">
            <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-pulse" />
            <h3 className="text-lg font-semibold text-white mb-2">Speed</h3>
            <p className="text-gray-400">Instant results, no sign-up, no bloat. Get what you need, fast.</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center shadow-md hover:shadow-blue-700/30 transition-shadow">
            <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-pulse" />
            <h3 className="text-lg font-semibold text-white mb-2">Clean UI</h3>
            <p className="text-gray-400">A distraction-free, modern interface designed for productivity.</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center shadow-md hover:shadow-blue-700/30 transition-shadow">
            <Cpu className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-pulse" />
            <h3 className="text-lg font-semibold text-white mb-2">Free Forever</h3>
            <p className="text-gray-400">No paywalls, no limits. Always free for developers and teams.</p>
          </div>
        </div>
      </section>

      {/* Tools Preview Section */}
      <section id="tools" className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Tools Preview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredTools.length === 0 && (
            <div className="col-span-full text-center text-gray-400 text-lg py-12">No tools found. Try another search!</div>
          )}
          {filteredTools.map((tool, idx) => (
            <Link
              key={tool.name}
              href={tool.path}
              className={
                `group block overflow-hidden rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 shadow-lg transition-all duration-200 hover:scale-105 hover:border-blue-500 hover:shadow-blue-700/30 ${tool.bgClass}`
              }
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="aspect-video w-full flex items-center justify-center">
                <tool.icon className="h-12 w-12 text-blue-200 group-hover:text-blue-500 transition-colors" />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-bold text-white group-hover:text-blue-400 mb-1">
                  {tool.name}
                </h2>
                <p className="text-sm text-gray-300 font-normal leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 text-center text-gray-400 mt-auto">
        <div className="flex justify-center gap-4 mb-4">
          <a href="https://github.com/jasimvk" className="hover:text-white" target="_blank" rel="noopener noreferrer">
            <Github className="h-6 w-6" />
          </a>
        </div>
        <p> Built<span className="text-blue-400"></span> by <a href="https://x.com/jasimvk" className="underline hover:text-white">Jasim</a> • © {new Date().getFullYear()} MyDebugTools</p>
      </footer>
    </div>
  );
}
