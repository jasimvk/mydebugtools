
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CodeBracketIcon, 
  KeyIcon, 
  CommandLineIcon,
  WrenchIcon,
  MagnifyingGlassIcon,
  ArrowsRightLeftIcon,
  SwatchIcon,
  DocumentTextIcon,
  CheckIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { CurlyBracesIcon } from 'lucide-react';

// Tools ordered by popularity and trending status
const tools = [
  {
    name: 'JSON',
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
    name: 'API Tester',
    description: 'Test your APIs with a lightweight, fast interface',
    path: '/tools/api',
    icon: WrenchIcon,
    bgClass: 'bg-gradient-to-br from-orange-100 to-orange-200'
  },
  {
    name: 'Regex Tester',
    description: 'Test and validate regular expressions with real-time matching',
    path: '/tools/regex',
    icon: MagnifyingGlassIcon,
    bgClass: 'bg-gradient-to-br from-teal-100 to-teal-200'
  },
  {
    name: 'Code Diff',
    description: 'Compare and analyze code differences',
    path: '/tools/code-diff',
    icon: ArrowsRightLeftIcon,
    bgClass: 'bg-blue-500'
  },
  {
    name: 'Base64 Tools',
    description: 'Encode and decode Base64 strings with a single click',
    path: '/tools/base64',
    icon: CommandLineIcon,
    bgClass: 'bg-gradient-to-br from-purple-100 to-purple-200'
  },
  {
    name: 'HTML Validator',
    description: 'Validate and format HTML code',
    path: '/tools/html',
    icon: DocumentCheckIcon,
    bgClass: 'bg-green-500'
  },
  {
    name: 'CSS Tools',
    description: 'Minify, beautify, and validate your CSS code',
    path: '/tools/css',
    icon: CodeBracketIcon,
    bgClass: 'bg-gradient-to-br from-cyan-100 to-cyan-200'
  },
  {
    name: 'Color Picker',
    description: 'Pick, convert, and manage colors in various formats',
    path: '/tools/color',
    icon: SwatchIcon,
    bgClass: 'bg-gradient-to-br from-rose-100 to-rose-200'
  },
  {
    name: 'Markdown Preview',
    description: 'Preview and edit Markdown with live rendering',
    path: '/tools/markdown',
    icon: DocumentTextIcon,
    bgClass: 'bg-gradient-to-br from-amber-100 to-amber-200'
  },
  {
    name: 'Icon Finder',
    description: 'Find the perfect icon for your project',
    path: '/tools/icons',
    icon: MagnifyingGlassIcon,
    bgClass: 'bg-gradient-to-br from-pink-100 to-pink-200'
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold">MyDebugTools</h2>
      </div>
      <div className="space-y-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = pathname === tool.path;
          
          return (
            <Link 
              key={tool.path} 
              href={tool.path}
              className={`flex items-center p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span>{tool.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 