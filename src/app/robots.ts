import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rinrelife.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/dashboard", "/login", "/register", "/forgot-password", "/reset-password", "/change-password"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
