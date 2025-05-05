/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        'monaco-editor': false,
      };
    }
    return config;
  },
  experimental: {
    esmExternals: false,
  },
  // Skip static generation and use client-side rendering instead
  // This avoids the useSearchParams Suspense boundary errors during build
  output: 'export',
  trailingSlash: true,
}

module.exports = nextConfig 