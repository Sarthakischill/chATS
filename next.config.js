/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    domains: ['sswsfvjhixtqgxsagxbu.supabase.co'] 
  },
  swcMinify: true,
  transpilePackages: [
    '@radix-ui',
    'cmdk',
    'vaul',
    'input-otp',
    'embla-carousel-react',
    'lucide-react'
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  optimizeFonts: true,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
