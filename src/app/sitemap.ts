import { MetadataRoute } from "next";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = "https://www.velocity-markets.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/tournaments`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/price_is_right`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/markets`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/how_it_works`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    await connectToDB();
    const db = mongoose.connection.db;
    if (!db) return staticPages;

    // Dynamic make/model pages from auction attributes
    const combinations = await db
      .collection("auctions")
      .aggregate([
        { $unwind: "$attributes" },
        {
          $group: {
            _id: "$_id",
            make: {
              $first: {
                $cond: [
                  { $eq: ["$attributes.key", "make"] },
                  "$attributes.value",
                  "$$REMOVE",
                ],
              },
            },
            model: {
              $first: {
                $cond: [
                  { $eq: ["$attributes.key", "model"] },
                  "$attributes.value",
                  "$$REMOVE",
                ],
              },
            },
            lastUpdated: { $first: "$updatedAt" },
          },
        },
        { $match: { make: { $exists: true, $ne: null }, model: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: { make: "$make", model: "$model" },
            lastAuction: { $max: "$lastUpdated" },
          },
        },
        { $limit: 2000 },
      ])
      .toArray();

    const dynamicPages: MetadataRoute.Sitemap = combinations
      .filter(
        (c) =>
          c._id.make &&
          c._id.model &&
          typeof c._id.make === "string" &&
          typeof c._id.model === "string"
      )
      .map((c) => ({
        url: `${BASE_URL}/prices/${(c._id.make as string).toLowerCase().replace(/\s+/g, "-")}-${(c._id.model as string).toLowerCase().replace(/\s+/g, "-")}-bat-auction-prices`,
        lastModified: c.lastAuction || new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));

    return [...staticPages, ...dynamicPages];
  } catch {
    return staticPages;
  }
}
