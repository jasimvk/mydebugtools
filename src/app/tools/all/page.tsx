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
      {/* Header - Improved */}
      <div className="bg-gradient-to-b from-white to-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
            All Tools
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
            Explore our complete collection of 30+ professional developer utilities
          </p>
        </div>
      </div>

      {/* Tools Grid - Improved Responsive Layout */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {allTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.path}
                href={tool.path}
                className="group relative bg-white rounded-xl border-2 border-gray-200 hover:border-[#FF6C37] hover:shadow-xl transition-all duration-300 p-6 flex flex-col hover:scale-105"
              >
                {/* Icon Container - Enhanced */}
                <div className="inline-flex p-4 rounded-lg bg-gray-100 group-hover:bg-[#FF6C37] transition-all duration-300 mb-4 w-fit shadow-sm group-hover:shadow-md">
                  <Icon className="h-7 w-7 text-gray-900 group-hover:text-white transition-colors" />
                </div>

                {/* Title - Better Typography */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                  {tool.name}
                </h3>

                {/* Description - Improved */}
                <p className="text-sm text-gray-600 mb-5 line-clamp-2 flex-1 leading-relaxed">
                  {tool.description}
                </p>

                {/* Arrow CTA - Animated */}
                <div className="flex items-center text-[#FF6C37] font-bold text-sm mt-auto group-hover:gap-1 transition-all">
                  Try now
                  <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer CTA Section - Enhanced */}
        <div className="mt-20 text-center">
          <div className="inline-block">
            <p className="text-gray-600 mb-4 text-lg">
              Can't find what you're looking for?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#FF6C37] to-[#ff5722] hover:shadow-lg text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Get in Touch
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
