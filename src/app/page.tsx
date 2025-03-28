export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            MyDebugTools
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            A developer's all-in-one debugging toolkit — Coming Soon!
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://github.com/jasimvk/mydebugtools"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
