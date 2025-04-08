'use client';

import Link from 'next/link';
import { 
  CodeBracketIcon, 
  KeyIcon, 
  CommandLineIcon,
  WrenchIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { CodeSquare, CurlyBracesIcon } from 'lucide-react';

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

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl tracking-tight font-bold text-gray-900 flex items-center gap-2">
              <CodeBracketIcon color='blue' className="h-10 w-10" />
              MyDebugTools - <span className="italic">All in one Developer Debugging Toolkit</span>
            </h1>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.path}
                className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
              >
                <div className={`aspect-video w-full ${tool.bgClass} p-4 flex items-center justify-center`}>
                  <tool.icon className="h-10 w-10 text-gray-700" />
                </div>
                <div className="p-3">
                  <h2 className="text-base font-medium text-gray-900 group-hover:text-blue-500">
                    {tool.name}
                  </h2>
                  <p className="mt-1 text-xs text-gray-600 font-normal leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <footer className="mt-auto border-t border-gray-200">
        <div className="w-full bg-gradient-to-b from-transparent via-gray-100/50 to-gray-100">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex items-center space-x-1">
                <a
                  href="https://x.com/jasimvk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm text-gray-600 hover:text-blue-500 transition-colors duration-200"
                >
                  Built by @jasimvk
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
