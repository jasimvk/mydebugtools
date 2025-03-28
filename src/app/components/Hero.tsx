import Link from 'next/link';

export default function Hero() {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Your all-in-one debugging toolkit
            </h1>
            <p className="text-xl text-gray-300">
              Streamline your development workflow with powerful tools for JSON formatting,
              JWT decoding, API testing, and more — all in one place.
            </p>
            <div className="flex gap-4">
              <Link
                href="/tools"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Try Now
              </Link>
              <Link
                href="#features"
                className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
              {/* Placeholder for tool preview/screenshot */}
              <div className="aspect-video bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 