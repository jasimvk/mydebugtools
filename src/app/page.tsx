'use client';

import Link from 'next/link';
import { 
  CodeBracketIcon, 
  KeyIcon, 
  CommandLineIcon,
  WrenchIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const tools = [
  {
    name: 'JSON Formatter',
    description: 'Format, validate, and beautify your JSON data with syntax highlighting',
    path: '/tools/json',
    icon: CodeBracketIcon,
    bgClass: 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800'
  },
  {
    name: 'JWT Decoder',
    description: 'Decode and verify JSON Web Tokens instantly',
    path: '/tools/jwt',
    icon: KeyIcon,
    bgClass: 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800'
  },
  {
    name: 'Base64 Tools',
    description: 'Encode and decode Base64 strings with a single click',
    path: '/tools/base64',
    icon: CommandLineIcon,
    bgClass: 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800'
  },
  {
    name: 'API Tester',
    description: 'Test your APIs with a lightweight, fast interface',
    path: '/tools/api',
    icon: WrenchIcon,
    bgClass: 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800'
  },
  {
    name: 'Icon Finder',
    description: 'Find the perfect icon for your project',
    path: '/tools/icons',
    icon: MagnifyingGlassIcon,
    bgClass: 'bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900 dark:to-pink-800'
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            MyDebugTools
          </h1>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <InformationCircleIcon className="h-5 w-5" />
            <span>About</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.path}
              className="group block overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all hover:shadow-lg"
            >
              <div className={`aspect-video w-full ${tool.bgClass} p-8 flex items-center justify-center`}>
                <tool.icon className="h-16 w-16 text-gray-700 dark:text-gray-200" />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {tool.name}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
