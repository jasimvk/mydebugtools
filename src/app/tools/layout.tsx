import Link from 'next/link';
import { 
  CodeBracketIcon,
  KeyIcon,
  CommandLineIcon,
  WrenchIcon,
  MagnifyingGlassIcon,
  CodeBracketSquareIcon
} from '@heroicons/react/24/outline';
import { CurlyBracesIcon } from 'lucide-react'; 
const tools = [
  {
    name: 'JSON Formatter',
    description: 'Format and validate JSON',
    path: '/tools/json',
    icon: CurlyBracesIcon
  },
  {
    name: 'JWT Decoder',
    description: 'Decode and verify tokens',
    path: '/tools/jwt',
    icon: KeyIcon
  },
  {
    name: 'Base64 Tools',
    description: 'Encode/decode strings',
    path: '/tools/base64',
    icon: CommandLineIcon
  },
  {
    name: 'API Tester',
    description: 'Test your APIs',
    path: '/tools/api',
    icon: WrenchIcon
  },
  {
    name: 'Icon Finder',
    description: 'Find perfect icons',
    path: '/tools/icons',
    icon: MagnifyingGlassIcon
  }
];

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-4">
          <Link href="/" className="flex items-center space-x-2 mb-8">
            <CodeBracketIcon className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">MyDebugTools</span>
          </Link>
          <nav className="space-y-1">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.path}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <tool.icon className="h-5 w-5" />
                <div>
                  <div className="font-medium">{tool.name}</div>
                  <div className="text-sm text-gray-500">{tool.description}</div>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 