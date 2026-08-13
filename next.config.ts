/** @type {import('next').NextConfig} */
const nextConfig = {
  // Leaflet necesita ser transpilado para Next.js
  transpilePackages: ['leaflet', 'react-leaflet'],
}

module.exports = nextConfig
