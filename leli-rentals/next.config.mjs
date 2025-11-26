/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    },
    // Increase middleware body size limit to avoid "stream ended unexpectedly"
    middlewareClientMaxBodySize: '50mb',
  },
  serverExternalPackages: ['cloudinary'],
  images: {
    unoptimized: true,
  },
}

export default nextConfig
