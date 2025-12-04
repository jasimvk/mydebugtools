'use client';

import Link from 'next/link';
import {
  KeyIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon,
  DocumentCheckIcon,
  GlobeAltIcon,
  BeakerIcon,
  SparklesIcon,
  CommandLineIcon,
  PaintBrushIcon,
  AdjustmentsHorizontalIcon,
  CubeTransparentIcon,
  BoltIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';
import { CurlyBracesIcon, Terminal } from 'lucide-react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

// Complete tools list - same as layout
const allTools = [
  {
    name: 'JSON Tools',
    description: 'Format, validate, and beautify your JSON data',
    path: '/tools/json',
    icon: CurlyBracesIcon
  },
  {
    name: 'JWT Decoder',
    description: 'Decode and verify JWT tokens',
    path: '/tools/jwt',
    icon: KeyIcon
  },
  {
    name: 'API Tester',
    description: 'Test and debug REST APIs',
    path: '/tools/api',
    icon: BeakerIcon
  },
  {
    name: 'HTTP Status',
    description: 'HTTP status codes reference',
    path: '/tools/http-status',
    icon: GlobeAltIcon
  },
  {
    name: 'Code Diff',
    description: 'Compare code differences',
    path: '/tools/code-diff',
    icon: ArrowsRightLeftIcon
  },
  {
    name: 'Base64',
    description: 'Encode and decode Base64',
    path: '/tools/base64',
    icon: DocumentCheckIcon
  },
  {
    name: 'Regex Tester',
    description: 'Test regular expressions',
    path: '/tools/regex',
    icon: CommandLineIcon
  },
  {
    name: 'Color Picker',
    description: 'Pick and convert colors',
    path: '/tools/color',
    icon: PaintBrushIcon
  },
  {
    name: 'CSS Tools',
    description: 'Minify, beautify, validate CSS',
    path: '/tools/css',
    icon: AdjustmentsHorizontalIcon
  },
  {
    name: 'HTML Tools',
    description: 'Format, minify, validate HTML',
    path: '/tools/html',
    icon: DocumentTextIcon
  },
  {
    name: 'Markdown Preview',
    description: 'Live markdown editor',
    path: '/tools/markdown',
    icon: DocumentTextIcon
  },
  {
    name: 'Icon Finder',
    description: 'Search and download icons',
    path: '/tools/icons',
    icon: SparklesIcon
  },
  {
    name: 'Crash Beautifier',
    description: 'Format and analyze stack traces',
    path: '/tools/crash-beautifier',
    icon: BoltIcon
  },
  {
    name: 'Build Diff',
    description: 'Compare build outputs',
    path: '/tools/build-diff',
    icon: CubeTransparentIcon
  },
  {
    name: 'Bundle Analyzer',
    description: 'Analyze bundle sizes',
    path: '/tools/bundle-analyzer',
    icon: BuildingLibraryIcon
  },
  {
    name: 'Database Query',
    description: 'SQLite query tool',
    path: '/tools/database',
    icon: BuildingLibraryIcon
  },
  {
    name: 'React Native Profiling',
    description: 'Timeline visualization for profiling',
    path: '/tools/startup-profiling',
    icon: BoltIcon
  },
];

export default function AllToolsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            All Tools
          </h1>
          <p className="text-lg text-gray-600">
            Explore our complete collection of developer utilities
          </p>
        </div>
      </div>

      {/* Tools Grid - 5 columns */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {allTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.path}
                href={tool.path}
                className="group relative bg-white rounded-xl border-2 border-gray-200 hover:border-[#FF6C37] hover:shadow-lg transition-all duration-200 p-5 flex flex-col"
              >
                {/* Icon Container */}
                <div className="inline-flex p-3 rounded-lg bg-gray-100 group-hover:bg-[#FF6C37] transition-colors mb-4 w-fit">
                  <Icon className="h-6 w-6 text-gray-900 group-hover:text-white transition-colors" />
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                  {tool.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                  {tool.description}
                </p>

                {/* Arrow */}
                <div className="flex items-center text-[#FF6C37] font-bold text-xs mt-auto">
                  Try now
                  <ArrowRightIcon className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-3 bg-[#FF6C37] hover:bg-[#ff5722] text-white font-semibold rounded-lg transition-colors shadow-lg"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
