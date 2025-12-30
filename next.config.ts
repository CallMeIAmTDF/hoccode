import type { NextConfig } from "next";

import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";

const nextConfig: NextConfig = {
    // webpack: (config, { isServer }) => {
    //     if (!isServer) {
    //         config.plugins.push(
    //             new MonacoWebpackPlugin({
    //                 languages: ["python", "cpp", "java"],
    //             })
    //         );
    //     }
    //     return config;
    // },
    reactStrictMode: false,
    onDemandEntries: {
        // tắt refresh overlay khi gặp lỗi params
        maxInactiveAge: 1000 * 60 * 60,
    },
    output: 'standalone',
    images: {
        unoptimized: true
    },
    webpack(config) {
        config.ignoreWarnings = [
            {
                module: /params/,
                message: /param property was accessed directly/,
            },
        ];
        return config;
    },
};

export default nextConfig;
