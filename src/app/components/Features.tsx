import { 
  CodeBracketIcon,
  KeyIcon,
  CommandLineIcon,
  WrenchIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'JSON Formatter & Beautifier',
    description: 'Format, validate, and beautify your JSON data with ease.',
    icon: CodeBracketIcon,
  },
  {
    name: 'JWT Decoder',
    description: 'Decode and verify JSON Web Tokens instantly.',
    icon: KeyIcon,
  },
  {
    name: 'Base64 Tools',
    description: 'Encode and decode Base64 strings with a single click.',
    icon: CommandLineIcon,
  },
  {
    name: 'API Tester',
    description: 'Test your APIs with a lightweight, fast interface.',
    icon: WrenchIcon,
  },
  {
    name: 'Icon Finder',
    description: 'Find the perfect icon for your project quickly.',
    icon: MagnifyingGlassIcon,
  },
];

export default function Features() {
  return (
    <div id="features" className="py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Powerful Tools at Your Fingertips
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Everything you need to debug and develop faster, all in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{feature.name}</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 