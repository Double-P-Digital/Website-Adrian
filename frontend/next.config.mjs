/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    minimumCacheTTL: 2678400 * 6,
    formats: ['image/avif', 'image/webp'], 
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], 
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '', 
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'a0.muscache.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig