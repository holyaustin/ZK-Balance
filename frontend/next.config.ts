import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {

  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
      };

      // Fix: Use the locally scoped webpack object directly 
      config.plugins.push(
        new webpack.ProvidePlugin({
          //window: path.resolve("./app/window.js"),
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        })
      );
    }
    return config;
  },
  
};

export default nextConfig;
