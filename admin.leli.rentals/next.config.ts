import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/main/:path*',
        destination: 'http://localhost:3000/api/:path*', // Proxy to main app
      },
    ]
  },
};

export default nextConfig;
