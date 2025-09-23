/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Handle IPFS dependencies properly and chunk loading errors
  webpack: (config, { isServer, dev }) => {
    // Fixes npm packages that depend on `fetch` API
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Fix for IPFS libraries issue with fetch.node
    config.module.rules.push({
      test: /node_modules\/ipfs-utils\/src\/http\/fetch\.js$/,
      loader: 'string-replace-loader',
      options: {
        search: 'const fetch = require(implName)',
        replace: 'const fetch = (typeof window !== "undefined" ? window.fetch.bind(window) : require("node-fetch"))',
      },
    });

    // Improve chunk loading reliability
    if (!isServer && !dev) {
      // Add retry logic for chunk loading
      config.output.chunkLoadTimeout = 30000; // 30 seconds timeout
      
      // Ensure consistent chunk naming
      config.output.chunkFilename = 'static/chunks/[name].[contenthash].js';
    }

    return config;
  },
  // Add dependencies that should be transpiled
  transpilePackages: [
    'ipfs-utils',
    'ipfs-http-client',
  ],
  // Configure headers for CORS and local storage
  async headers() {
    return [
      {
        // Ensure access to the uploads directory
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
      {
        // Enable CORS for API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ],
      },
    ];
  },
}

export default nextConfig
