/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    domains: ['k6hrqrxuu8obbfwn.public.blob.vercel-storage.com'],
  },
}

module.exports = nextConfig