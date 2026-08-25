/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard/LabelGuard',
        permanent: false,
      },
      {
        source: '/dashboard',
        destination: '/dashboard/LabelGuard/dashboard',
        permanent: false,
      },
      {
        source: '/login',
        destination: '/dashboard/LabelGuard/login',
        permanent: false,
      },
      {
        source: '/signup',
        destination: '/dashboard/LabelGuard/login',
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
