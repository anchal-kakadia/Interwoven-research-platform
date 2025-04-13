/** @type {import('next').NextConfig} */
const nextConfig = {
    env:{
        API_URL: process.env.API_URL
    },
    experimental: {
        missingSuspenseWithCSRBailout: false,
      },
    async rewrites() {
        return [
            {
                source: "/",
                destination: "/signin",
            }
        ];
    },
};

module.exports = {
    ...nextConfig,
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.externals.push({ bufferutil: "bufferutil", "utf-8-validate": "utf-8-validate", "supports-color": "supports-color" });
        }
        return config;
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
};