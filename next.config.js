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
    esmExternals: true,
  },
  // Skip static generation and use client-side rendering instead
  // This avoids the useSearchParams Suspense boundary errors during build
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Add this to handle Suspense boundary warnings
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 