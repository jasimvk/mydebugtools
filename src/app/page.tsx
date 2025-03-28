'use client';

import Link from 'next/link';
import { 
  CodeBracketIcon, 
  KeyIcon, 
  CommandLineIcon,
  WrenchIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const tools = [
  {
    name: 'JSON Formatter',
    description: 'Format, validate, and beautify your JSON data with syntax highlighting',
    path: '/tools/json',
    icon: CodeBracketIcon,
    bgClass: 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700'
  },
  {
    name: 'JWT Decoder',
    description: 'Decode and verify JWT tokens instantly',
    path: '/tools/jwt',
    icon: KeyIcon,
    bgClass: 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700'
  },
  {
    name: 'Base64 Tools',
    description: 'Encode and decode Base64 strings with a single click',
    path: '/tools/base64',
    icon: CommandLineIcon,
    bgClass: 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700'
  },
  {
    name: 'API Tester',
    description: 'Test your APIs with a lightweight, fast interface',
    path: '/tools/api',
    icon: WrenchIcon,
    bgClass: 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-800 dark:to-orange-700'
  },
  {
    name: 'Icon Finder',
    description: 'Find the perfect icon for your project',
    path: '/tools/icons',
    icon: MagnifyingGlassIcon,
    bgClass: 'bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-800 dark:to-pink-700'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl tracking-tight font-bold text-gray-900 dark:text-white">
              MyDebugTools - All in one Developer Debugging Toolkit
            </h1>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.path}
                className="group block overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm transition-all hover:shadow-lg"
              >
                <div className={`aspect-video w-full ${tool.bgClass} p-4 flex items-center justify-center`}>
                  <tool.icon className="h-10 w-10 text-gray-700 dark:text-gray-100" />
                </div>
                <div className="p-3">
                  <h2 className="text-base font-medium text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400">
                    {tool.name}
                  </h2>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-200 font-normal leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <footer className="relative py-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 transform -skew-y-2"></div>
        <div className="relative container mx-auto px-4">
          <div className="flex items-center justify-center">
            <a
              href="https://x.com/jasimvk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-medium"
            >
              Built by @jasimvk
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
