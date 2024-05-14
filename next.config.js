/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['bringatrailer.com', 'lh3.googleusercontent.com'],
    },
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    },
    webpack: (config, { isServer }) => {
        config.module.rules.push({
            test: /\.(png|jpe?g|gif|svg)$/i,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        publicPath: '/_next/static/images',
                        outputPath: 'static/images',
                        name: '[name].[hash].[ext]',
                        esModule: false,
                    },
                },
            ],
        });

        return config;
    },
};

module.exports = nextConfig;
