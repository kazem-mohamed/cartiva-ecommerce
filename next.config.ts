import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ecommerce.routemisr.com",
        pathname: "/**",
      },
    ],
  },

  async redirects() {
    return [
      {
        // After a card payment, the API builds Stripe's success URL as
        // `{url}/allorders` — it appends that path itself, and we only get
        // to supply the origin. Our route is /orders, so a successful
        // payment used to land the shopper on a 404 straight after paying.
        //
        // 307, not 308: a permanent redirect would be cached by the browser
        // forever, and this is a payment return path we may want to change.
        // Query values (Stripe appends its own) pass through automatically.
        source: "/allorders",
        destination: "/orders",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
