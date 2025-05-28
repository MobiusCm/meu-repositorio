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
    domains: ['localhost'],
  },
  
  // Configurações de redirecionamento
  async redirects() {
    return [
      // Redirecionamentos se necessário
    ];
  },
};

module.exports = nextConfig; 