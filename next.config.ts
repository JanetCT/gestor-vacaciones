/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://tu-servidor-o-backend.com/api/:path*', // Reemplaza con tu URL si aplicaba un proxy de API
      },
    ];
  },
};

module.exports = nextConfig;