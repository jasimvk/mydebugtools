'use client';

import Link from 'next/link';
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
  GlobeAltIcon,
  PhotoIcon,
  CodeBracketIcon as LucideCodeBracketIcon,
  PaintBrushIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { 
  CurlyBracesIcon, 
  Github, 
  Terminal, 
  Zap, 
  Shield, 
  Code2, 
  Cpu, 
  Star, 
  Search, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Users, 
  Globe, 
  Rocket, 
  Heart 
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

const tools = [
  {
    name: 'JSON',
    description: 'Format, validate, and beautify JSON data',
    path: '/tools/json',
    icon: DocumentTextIcon,
    bgClass: 'bg-blue-500',
  },
  {
    name: 'JWT Decoder',
    description: 'Decode and verify JSON Web Tokens',
    path: '/tools/jwt',
    icon: KeyIcon,
    bgClass: 'bg-purple-500',
  },
  {
    name: 'API Tester',
    description: 'Test and debug API endpoints',
    path: '/tools/api',
    icon: GlobeAltIcon,
    bgClass: 'bg-green-500',
  },
  {
    name: 'Regex Tester',
    description: 'Test and validate regular expressions',
    path: '/tools/regex',
    icon: MagnifyingGlassIcon,
    bgClass: 'bg-yellow-500',
  },
  {
    name: 'Code Diff',
    description: 'Compare and visualize code differences',
    path: '/tools/code-diff',
    icon: CodeBracketIcon,
    bgClass: 'bg-red-500',
  },
  {
    name: 'Base64 Tools',
    description: 'Encode and decode Base64 data',
    path: '/tools/base64',
    icon: CommandLineIcon,
    bgClass: 'bg-indigo-500',
  },
  {
    name: 'HTML Validator',
    description: 'Validate and format HTML code',
    path: '/tools/html',
    icon: WrenchScrewdriverIcon,
    bgClass: 'bg-orange-500',
  },
  {
    name: 'CSS Tools',
    description: 'Format and optimize CSS code',
    path: '/tools/css',
    icon: PaintBrushIcon,
    bgClass: 'bg-pink-500',
  },
  {
    name: 'Color Picker',
    description: 'Pick and convert colors',
    path: '/tools/color',
    icon: SwatchIcon,
    bgClass: 'bg-teal-500',
  },
  {
    name: 'Markdown Preview',
    description: 'Preview and convert Markdown',
    path: '/tools/markdown',
    icon: DocumentTextIcon,
    bgClass: 'bg-gray-500',
  },
  {
    name: 'Icon Finder',
    description: 'Search and download icons',
    path: '/tools/icons',
    icon: PhotoIcon,
    bgClass: 'bg-cyan-500',
  },
];

const features = [
  {
    icon: <Zap className="h-8 w-8 text-blue-500" />,
    title: "Lightning Fast",
    description: "Get instant results with our optimized tools. No waiting, no frustration."
  },
  {
    icon: <Shield className="h-8 w-8 text-blue-500" />,
    title: "Privacy Focused",
    description: "Your data stays on your device. No tracking, no storage, no worries."
  },
  {
    icon: <Cpu className="h-8 w-8 text-blue-500" />,
    title: "Zero Dependencies",
    description: "Works offline, no sign-up required. Just open and start using."
  },
  {
    icon: <Code2 className="h-8 w-8 text-blue-500" />,
    title: "Developer Friendly",
    description: "Built by developers, for developers. Clean, efficient, and powerful."
  }
];

const roadmapItems = [
  {
    title: "Chrome Extension",
    status: "in-progress",
    icon: <Rocket className="h-5 w-5 text-blue-500" />
  },
  {
    title: "Database Query Tool",
    status: "planned",
    icon: <Terminal className="h-5 w-5 text-blue-500" />
  },
  {
    title: "Performance Monitoring",
    status: "planned",
    icon: <Cpu className="h-5 w-5 text-blue-500" />
  },
  {
    title: "Collaboration Features",
    status: "planned",
    icon: <Users className="h-5 w-5 text-blue-500" />
  },
  {
    title: "More Tool Integrations",
    status: "planned",
    icon: <Code2 className="h-5 w-5 text-blue-500" />
  },
  {
    title: "UI/UX Polish",
    status: "ongoing",
    icon: <Star className="h-5 w-5 text-blue-500" />
  },
  {
    title: "Better Error Handling",
    status: "ongoing",
    icon: <Shield className="h-5 w-5 text-blue-500" />
  },
  {
    title: "User Preferences",
    status: "planned",
    icon: <Heart className="h-5 w-5 text-blue-500" />
  },
  {
    title: "Mobile Experience",
    status: "planned",
    icon: <Globe className="h-5 w-5 text-blue-500" />
  },
  {
    title: "Community & Open Source",
    status: "ongoing",
    icon: <Github className="h-5 w-5 text-blue-500" />
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

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
      <div className="mb-4">
        <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 32 32">
          <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
        </svg>
      </div>
      <p className="text-gray-300 mb-4 italic">"{quote}"</p>
      <div>
        <p className="text-white font-medium">{author}</p>
        <p className="text-gray-400 text-sm">{role}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('all');
  const [isVisible, setIsVisible] = useState(false);
  
  const filteredTools = tools.filter(tool =>
    (activeTab === 'all' || tool.name.toLowerCase().includes(activeTab))
  );

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
          <a href="https://github.com/jasimvk/mydebugtools" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-300 hover:text-white text-sm font-medium">
            <Github className="h-5 w-5" />
            GitHub
          </a>
          <a href="#tools" className="text-gray-300 hover:text-white text-sm font-medium">Tools</a>
          <a href="#features" className="text-gray-300 hover:text-white text-sm font-medium">Features</a>
          <a href="#roadmap" className="text-gray-300 hover:text-white text-sm font-medium">Roadmap</a>
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
          Your <span className="text-blue-400">Developer Toolkit</span> for the Web
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-medium">
          A powerful collection of development tools that help you debug, format, and test your code faster than ever.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#tools"
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 text-lg shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Zap className="h-5 w-5" />
            Try Now
          </a>
          <a
            href="https://github.com/jasimvk/mydebugtools"
            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 text-lg shadow-lg transition-all duration-200 hover:scale-105"
            target="_blank" rel="noopener noreferrer"
          >
            <Star className="h-5 w-5" />
            Star on GitHub
          </a>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 w-full max-w-4xl">
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <p className="text-3xl font-bold text-blue-400">11+</p>
            <p className="text-gray-400">Tools</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <p className="text-3xl font-bold text-blue-400">100%</p>
            <p className="text-gray-400">Free</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <p className="text-3xl font-bold text-blue-400">0</p>
            <p className="text-gray-400">Sign-up</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <p className="text-3xl font-bold text-blue-400">MIT</p>
            <p className="text-gray-400">License</p>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Why Choose MyDebugTools?</h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Built with developers in mind, our tools are designed to make your workflow faster and more efficient.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-blue-700/30 transition-shadow"
              style={{ 
                animationDelay: `${index * 100}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease'
              }}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tools Preview Section */}
      <section id="tools" className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Powerful Tools at Your Fingertips
        </h2>
        <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
          Our collection of tools helps you with common development tasks, from formatting JSON to testing APIs.
        </p>
        
        {/* Tool Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Tools
          </button>
          {tools.map(tool => (
            <button 
              key={tool.name}
              onClick={() => setActiveTab(tool.name.toLowerCase())}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tool.name.toLowerCase() 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tool.name}
            </button>
          ))}
        </div>
        
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
              style={{ 
                animationDelay: `${idx * 60}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease'
              }}
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
                <div className="mt-4 flex items-center text-blue-400 text-sm font-medium">
                  Try it now
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Roadmap</h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          We're constantly working on new features and improvements. Here's what's coming next.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roadmapItems.map((item, index) => (
            <div 
              key={index}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              style={{ 
                animationDelay: `${index * 100}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                {item.icon}
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                {item.status === 'in-progress' ? (
                  <>
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-yellow-500 text-sm">In Progress</span>
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 text-blue-500" />
                    <span className="text-blue-500 text-sm">Planned</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <a 
            href="https://github.com/jasimvk/mydebugtools/issues" 
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
            target="_blank" 
            rel="noopener noreferrer"
          >
            Suggest a feature
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to boost your productivity?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Start using MyDebugTools today and experience the difference in your development workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#tools"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 text-lg shadow-lg transition-all duration-200 hover:scale-105"
            >
              <Zap className="h-5 w-5" />
              Get Started
            </a>
            <a
              href="https://github.com/jasimvk/mydebugtools"
              className="bg-blue-900/50 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 text-lg shadow-lg transition-all duration-200 hover:scale-105"
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
              Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 text-center text-gray-400 mt-auto">
        <div className="flex justify-center gap-6 mb-6">
          <a href="https://github.com/jasimvk/mydebugtools" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
            <Github className="h-6 w-6" />
          </a>
          <a href="https://x.com/jasimvk" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-semibold mb-4">Tools</h3>
            <ul className="space-y-2">
              {tools.map(tool => (
                <li key={tool.name}>
                  <Link href={tool.path} className="text-gray-400 hover:text-white transition-colors">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-gray-400 hover:text-white transition-colors">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/jasimvk/mydebugtools/issues" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                  Report Issues
                </a>
              </li>
              <li>
                <a href="https://github.com/jasimvk/mydebugtools" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                  Contribute
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="https://github.com/jasimvk/mydebugtools/blob/main/LICENSE" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                  License
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8">
          <p className="mb-2">Built by <a href="https://github.com/jasimvk" className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">Jasim</a></p>
          <p>© {new Date().getFullYear()} MyDebugTools • <a href="https://github.com/jasimvk/mydebugtools" className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">Open Source</a></p>
        </div>
      </footer>
    </div>
  );
}
