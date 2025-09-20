/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/sign-download',
        destination: 'https://your-worker.your-subdomain.workers.dev/sign-download',
      },
    ]
  },
}

module.exports = nextConfig
