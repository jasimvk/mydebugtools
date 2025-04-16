'use client';

import React from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  SparklesIcon,
  ArrowPathIcon,
  BeakerIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface RoadmapItem {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  icon: React.ReactNode;
  date?: string;
}

const RoadmapPage = () => {
  const roadmapItems: RoadmapItem[] = [
    {
      title: 'JSON Tool Enhancements',
      description: 'Advanced JSON validation, transformation, and comparison features',
      status: 'completed',
      icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
      date: 'Q1 2024'
    },
    {
      title: 'API Testing Tool',
      description: 'Comprehensive API testing and debugging capabilities',
      status: 'in-progress',
      icon: <ArrowPathIcon className="h-6 w-6 text-blue-500" />,
      date: 'Q2 2024'
    },
    {
      title: 'Database Query Tool',
      description: 'SQL and NoSQL database query interface with visualization',
      status: 'planned',
      icon: <BeakerIcon className="h-6 w-6 text-purple-500" />,
      date: 'Q3 2024'
    },
    {
      title: 'Performance Monitoring',
      description: 'Real-time performance metrics and optimization suggestions',
      status: 'planned',
      icon: <ChartBarIcon className="h-6 w-6 text-indigo-500" />,
      date: 'Q3 2024'
    },
    {
      title: 'Collaboration Features',
      description: 'Team workspaces and shared debugging sessions',
      status: 'planned',
      icon: <UserGroupIcon className="h-6 w-6 text-pink-500" />,
      date: 'Q4 2024'
    },
    {
      title: 'Internationalization',
      description: 'Multi-language support for all tools',
      status: 'planned',
      icon: <GlobeAltIcon className="h-6 w-6 text-yellow-500" />,
      date: 'Q4 2024'
    },
    {
      title: 'Security Enhancements',
      description: 'Advanced security features and vulnerability scanning',
      status: 'planned',
      icon: <ShieldCheckIcon className="h-6 w-6 text-red-500" />,
      date: 'Q1 2025'
    },
    {
      title: 'AI-Powered Debugging',
      description: 'Machine learning assisted debugging and code analysis',
      status: 'planned',
      icon: <SparklesIcon className="h-6 w-6 text-cyan-500" />,
      date: 'Q2 2025'
    },
    {
      title: 'Mobile App',
      description: 'Native mobile applications for iOS and Android',
      status: 'planned',
      icon: <RocketLaunchIcon className="h-6 w-6 text-orange-500" />,
      date: 'Q3 2025'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Completed</span>;
      case 'in-progress':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">In Progress</span>;
      case 'planned':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Planned</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Product Roadmap</h1>
        <p className="text-xl text-gray-600 mb-8">
          Our vision for the future of MyDebugTools
        </p>

        <div className="space-y-8">
          {roadmapItems.map((item, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  {item.icon}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="mt-2 text-gray-600">{item.description}</p>
                  {item.date && (
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{item.date}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 rounded-lg p-6 border border-blue-100">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">Have a Feature Request?</h2>
          <p className="text-blue-800 mb-4">
            We're always looking to improve our tools based on user feedback. If you have a feature you'd like to see in MyDebugTools, please let us know!
          </p>
          <a 
            href="https://github.com/yourusername/mydebugtools/issues" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit a Feature Request
          </a>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage; 