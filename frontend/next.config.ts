import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   matcher: ["/dashboard/:path*"],
};

export default nextConfig;
