/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        cpus: 1,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'bringatrailer.com',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'pbs.twimg.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'qtrypzzcjebvfcihiynt.supabase.co',
            },
        ],
    },
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    }
}

// Skip Sentry webpack plugin in CI (Amplify) — it adds ~800MB of build memory overhead.
// Sentry runtime error tracking still works; only source map uploads are skipped.
if (process.env.CI) {
  module.exports = nextConfig;
} else {
  const { withSentryConfig } = require("@sentry/nextjs");
  module.exports = withSentryConfig(
    nextConfig,
    {
      org: "velocity-markets",
      project: "javascript-nextjs",
      silent: true,
      widenClientFileUpload: false,
      tunnelRoute: "/monitoring",
      disableLogger: true,
    }
  );
}
