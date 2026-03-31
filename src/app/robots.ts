import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/profile/", "/my_wallet/"],
    },
    sitemap: "https://www.velocity-markets.com/sitemap.xml",
  };
}
