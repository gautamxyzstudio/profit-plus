import type { MetadataRoute } from "next";
import { prisma } from "@/app/lib/prisma";
import { BLOG_POSTS } from "@/constants/blogs";

export const revalidate = 3600; // Refresh sitemap cache every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.LIVE_URL || "https://profitplus.us";
  const now = new Date();

  // Core public static pages prioritized for SEO indexing
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about-software`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/success-story`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    // Legal & compliance routes
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-conditions`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/risk-disclaimer`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/earnings-disclaimer`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/us-government-disclaimer`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic Blog Posts from Database with fallback
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const dbBlogs = await prisma.blog.findMany({
      select: {
        slug: true,
        updatedAt: true,
        date: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    if (dbBlogs && dbBlogs.length > 0) {
      blogRoutes = dbBlogs.map((b) => ({
        url: `${baseUrl}/blog/${b.slug}`,
        lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(b.date),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    } else {
      blogRoutes = BLOG_POSTS.map((b) => ({
        url: `${baseUrl}/blog/${b.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // If DB is unreachable during build/generate, gracefully fallback to constants
    blogRoutes = BLOG_POSTS.map((b) => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  }

  return [...staticRoutes, ...blogRoutes];
}
