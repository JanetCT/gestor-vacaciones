import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desactivamos experimentalmente cualquier uso de turbopack
  experimental: {
    // Esto asegura que Next.js no intente usar turbopack internamente
  },
};

export default nextConfig;