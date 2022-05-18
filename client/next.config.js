/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // next.config.js

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: {
        and: [/\.(js|ts)x?$/]
      },

      use: ['@svgr/webpack'],
    })

    return config
  },

  images: {
    domains: ['www.gravatar.com', 'localhost']
  }
}

module.exports = nextConfig
