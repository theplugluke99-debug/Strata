/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'stratafloors.co.uk' }],
        destination: 'https://www.stratafloors.co.uk/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
