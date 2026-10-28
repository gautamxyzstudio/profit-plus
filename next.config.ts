import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
  },
async redirects() {
    return [
      
      {
        source: "/futures-trading-hours-explained-best-times-to-trade-for-maximum-profit",
        destination: "/blog/futures-trading-hours-explained-best-times-to-trade-for-maximum-profit",
        permanent: true,
      },
      {
        source: "/top-futures-trading-platforms-and-software-that-traders-prefer-in-2026",
        destination: "/blog/top-futures-trading-platforms-and-software-that-traders-prefer-in-2026",
        permanent: true,
      },
      {
        source: "/futures-margin-explained-day-trading-vs-overnight-trading",
        destination: "/blog/futures-margin-explained-day-trading-vs-overnight-trading",
        permanent: true,
      },
      {
        source: "/what-happens-next-when-a-futures-contract-expires",
        destination:
          "/blog/what-happens-next-when-a-futures-contract-expires",
        permanent: true,
      },
      {
        source: "/understanding-gold-futures-trading-and-how-it-works",
        destination:
          "/blog/understanding-gold-futures-trading-and-how-it-works",
        permanent: true,
      },
      {
        source:
          "/futures-vs-options-vs-stocks-what-should-you-trade",
        destination:
          "/blog/futures-vs-options-vs-stocks-what-should-you-trade",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
