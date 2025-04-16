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
}

module.exports = nextConfig 