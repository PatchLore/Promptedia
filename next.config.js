/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kcuhjqhxlnlzuozqhwoa.supabase.co',
      },
    ],
    unoptimized: false,
  },
};

module.exports = nextConfig;



