/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações para otimizar o build e evitar timeouts
  experimental: {
    // Reduzir uso de memória durante build
    workerThreads: false,
    cpus: 1
  },
  
  // Configurações de build
  typescript: {
    // Ignorar erros de TypeScript durante build se necessário
    ignoreBuildErrors: false,
  },
  
  // Configurações de ESLint
  eslint: {
    // Ignorar erros de ESLint durante build se necessário
    ignoreDuringBuilds: false,
  },

  // Configurações de imagem
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },

  // Configurações de ambiente
  env: {
    CUSTOM_KEY: 'cerimonial-facil',
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;