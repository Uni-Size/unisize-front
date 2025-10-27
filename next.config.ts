/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  allowedDevOrigins: ["http://192.168.0.41:3000", "http://localhost:3000"],
  output: 'standalone',
};

module.exports = nextConfig;
