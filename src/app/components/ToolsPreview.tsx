import Image from 'next/image';
import Link from 'next/link';

const tools = [
  {
    name: 'JSON Formatter',
    description: 'Format and validate JSON with syntax highlighting',
    path: '/tools/json',
    imagePlaceholder: 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800'
  },
  {
    name: 'JWT Decoder',
    description: 'Decode and verify JWT tokens',
    path: '/tools/jwt',
    imagePlaceholder: 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800'
  },
  {
    name: 'HTTP Status Codes',
    description: 'Comprehensive reference for HTTP status codes',
    path: '/tools/http-status',
    imagePlaceholder: 'bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800'
  },
  {
    name: 'Base64 Tools',
    description: 'Encode and decode Base64 strings',
    path: '/tools/base64',
    imagePlaceholder: 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800'
  },
  {
    name: 'API Tester',
    description: 'Test your APIs with a simple interface',
    path: '/tools/api',
    imagePlaceholder: 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800'
  },
  {
    name: 'Icon Finder',
    description: 'Find the perfect icon for your project',
    path: '/tools/icons',
    imagePlaceholder: 'bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900 dark:to-pink-800'
  }
];

export default function ToolsPreview() {
  return (
    <div className="py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Tools Preview
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Take a look at our powerful debugging tools
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.path}
              className="group block overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all hover:shadow-lg"
            >
              <div className={`aspect-video w-full ${tool.imagePlaceholder}`} />
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {tool.name}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 