/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações de desenvolvimento
  env: {
    CUSTOM_PORT: process.env.PORT || '3009',
  },
  
  // Configurações de servidor
  experimental: {
    // Configurações experimentais se necessário
  },
  
  // Configurações de imagem
  images: {
    domains: [
      'localhost',
      'pdmnkyiuvyyuobfozlly.supabase.co'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pdmnkyiuvyyuobfozlly.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // Configurações de redirecionamento
  async redirects() {
    return [
      // Redirecionamentos se necessário
    ];
  },
};

module.exports = nextConfig; 