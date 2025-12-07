import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/dashboard': ['./public/data/**/*'],
    '/customers': ['./public/data/**/*'],
    '/sales': ['./public/data/**/*'],
    '/profile': ['./public/data/**/*'],
    '/settings': ['./public/data/**/*'],
  },
};

export default nextConfig;
