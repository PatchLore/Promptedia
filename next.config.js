/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kcuhjqhxlnlzuozqhwoa.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'onpointprompt.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.openai.com',
      },
    ],
    unoptimized: false,
  },
};

module.exports = nextConfig;



