/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_COMMIT: process.env.VERCEL_GIT_COMMIT_SHA || 'dev',
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || 'local',
  },
  webpack: (config, { isServer }) => {
    // Resolver problemas com WebSocket e Supabase no Vercel
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        bufferutil: false,
        'utf-8-validate': false,
      };
    }
    
    // Configurações específicas para resolver problemas do Supabase
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        'bufferutil': 'bufferutil',
        'utf-8-validate': 'utf-8-validate',
      });
    }
    
    return config;
  },
  // Configurações para otimização
  images: {
    domains: ['localhost'],
  },
  // Configurações de segurança
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