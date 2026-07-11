import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  experimental: {
    // Safety margin above the default 1MB — VIN photos are downscaled
    // client-side before reaching the scanVinWithVision Server Action, but
    // this covers edge cases where downscaling falls back to the original file.
    serverActions: {
      bodySizeLimit: "4mb",
    },
    // Enables the `forbidden()` function + `app/forbidden.tsx` boundary so
    // the access-protection proxy can rewrite to a real 403 response.
    authInterrupts: true,
  },
};

export default nextConfig;
