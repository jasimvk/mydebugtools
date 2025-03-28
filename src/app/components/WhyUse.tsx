import { 
  BoltIcon,
  SparklesIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const benefits = [
  {
    name: 'Lightning Fast',
    description: 'No more waiting for heavy apps to load. MyDebugTools is optimized for speed.',
    icon: BoltIcon,
  },
  {
    name: 'Clean UI',
    description: 'A beautiful, intuitive interface that makes debugging a pleasure.',
    icon: SparklesIcon,
  },
  {
    name: 'Free Forever',
    description: 'All essential tools are and will always be free to use.',
    icon: HeartIcon,
  },
];

export default function WhyUse() {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Why Use MyDebugTools?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Built by developers, for developers.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.name}
              className="text-center p-6"
            >
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <benefit.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">{benefit.name}</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 