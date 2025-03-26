/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    domains: ['sswsfvjhixtqgxsagxbu.supabase.co'] 
  },
  swcMinify: true,
};

module.exports = nextConfig;
