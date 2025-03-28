import Image from 'next/image';
import Link from 'next/link';

const tools = [
  {
    name: 'JSON Formatter',
    description: 'Format and validate JSON with syntax highlighting',
    path: '/tools/json',
    imagePlaceholder: 'bg-gradient-to-br from-blue-100 to-blue-200'
  },
  {
    name: 'JWT Decoder',
    description: 'Decode and verify JWT tokens',
    path: '/tools/jwt',
    imagePlaceholder: 'bg-gradient-to-br from-green-100 to-green-200'
  },
  {
    name: 'Base64 Tools',
    description: 'Encode and decode Base64 strings',
    path: '/tools/base64',
    imagePlaceholder: 'bg-gradient-to-br from-purple-100 to-purple-200'
  },
  {
    name: 'API Tester',
    description: 'Test your APIs with a simple interface',
    path: '/tools/api',
    imagePlaceholder: 'bg-gradient-to-br from-orange-100 to-orange-200'
  },
  {
    name: 'Icon Finder',
    description: 'Find the perfect icon for your project',
    path: '/tools/icons',
    imagePlaceholder: 'bg-gradient-to-br from-pink-100 to-pink-200'
  }
];

export default function ToolsPreview() {
  return (
    <div className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Tools Preview
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Take a look at our powerful debugging tools
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.path}
              className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
            >
              <div className={`aspect-video w-full ${tool.imagePlaceholder}`} />
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  {tool.name}
                </h3>
                <p className="mt-2 text-gray-600">{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 