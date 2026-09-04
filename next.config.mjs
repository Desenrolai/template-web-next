/** @type {import('next').NextConfig} */
const nextConfig = {
  // O runtime do forge roda com readOnlyRootFilesystem: só o build standalone
  // (sem escrita em disco em runtime) sobrevive lá.
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
};

export default nextConfig;
