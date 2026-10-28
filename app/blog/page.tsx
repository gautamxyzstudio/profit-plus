import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { headers } from "next/headers";
import { BlogPost } from "@/constants/blogs";
import { API_ENDPOINTS } from "@/constants/endpoints";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blogs | Profit Plus",
  description:
    "Explore articles on AI-driven investing, market strategies, and smart automation — curated by the ProfitPlus team.",
};

async function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "http";
    if (host) {
      return `${protocol}://${host}`;
    }
  } catch {
    // fallback if headers() is unavailable
  }
  return "http://localhost:3000";
}

async function getBlogs(): Promise<{ featured: BlogPost | null; list: BlogPost[] }> {
  try {
    const baseUrl = await getBaseUrl();
    const apiUrl = `${baseUrl}${API_ENDPOINTS.BLOG}`;
    const res = await fetch(apiUrl, {
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      const dbBlogs = json?.data;
      
      if (dbBlogs && Array.isArray(dbBlogs) && dbBlogs.length > 0) {
        const formatted: BlogPost[] = dbBlogs.map((b: any) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          date: new Date(b.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          featuredImage: b.featuredImage || "/blog/no-blogs.jpg",
          shortDescription: b.shortDescription || "",
          content: b.content,
          metaTitle: b.metaTitle || undefined,
          metaDescription: b.metaDescription || undefined,
        }));

        return {
          featured: formatted[0] || null,
          list: formatted.length > 1 ? formatted.slice(1) : [],
        };
      }
    } else {
      console.error(`[BlogPage] API returned error status: ${res.status} ${res.statusText}`);
    }
  } catch (err) {
    console.error("Error fetching blogs from API:", err);
  }

  // Do not show dummy posts
  return {
    featured: null,
    list: [],
  };
}

export default async function BlogPage() {
  const { featured, list } = await getBlogs();
  const hasBlogs = Boolean(featured || list.length > 0);

  return (
    <div className="bg-white min-h-screen text-zinc-900 pb-20 sm:pb-28  ">
      {/* Hero Header */}
      <section className="pt-32 sm:pt-36 md:pt-40 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <h1 className="font-outfit font-black text-4xl sm:text-5xl md:text-[62px] text-[#111827] tracking-tight leading-none mb-4">
          Blogs
        </h1>
        <p className="font-manrope text-zinc-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Explore articles on AI-driven investing, market strategies, and smart
          automation — curated by the ProfitPlus team.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!hasBlogs ? (
          /* Empty State with Premium AI & Trading Illustration */
          <section className="mb-14 sm:mb-16">
            <div className="rounded-[28px] sm:rounded-[36px] border border-zinc-200/90 bg-gradient-to-b from-white to-[#f4fbf6] p-6 sm:p-10 lg:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Illustration Banner */}
                <div className="lg:col-span-7 w-full aspect-[16/10] sm:aspect-[16/9] relative rounded-[22px] sm:rounded-[28px] overflow-hidden shadow-lg border border-[#199250]/20 bg-zinc-950">
                  <Image
                    src="/blog/no-blogs.jpg"
                    alt="AI Automated Trading Insights - Coming Soon"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#199250] text-white shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      AI Insights & Analysis
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-5 flex flex-col justify-center text-left">
                  <span className="inline-block text-[#199250] font-outfit font-bold text-xs sm:text-sm tracking-wider uppercase mb-2">
                    Stay Ahead of the Market
                  </span>
                  <h2 className="font-outfit font-black text-2xl sm:text-3xl lg:text-[36px] text-[#111827] leading-[1.2] tracking-tight mb-4">
                    Exclusive Market Articles Coming Soon
                  </h2>
                  <p className="font-manrope text-zinc-600 text-sm sm:text-base leading-relaxed mb-6">
                    Our team of quantitative analysts and AI researchers are preparing in-depth guides, strategy breakdowns, and automated futures trading insights.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3.5">
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#199250] hover:bg-[#055027] text-white font-outfit font-semibold text-sm sm:text-base transition-colors shadow-md shadow-[#199250]/20"
                    >
                      <span>Book a Live Demo</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </Link>
                    <Link
                      href="/about-software"
                      className="inline-flex items-center justify-center px-6 py-3.5 rounded-full border border-zinc-300 hover:border-zinc-400 text-zinc-800 font-outfit font-semibold text-sm sm:text-base transition-colors"
                    >
                      Explore Software
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Latest Blog Section */}
            {featured && (
              <section className="mb-14 sm:mb-16">
                <h2 className="font-outfit font-bold text-xl sm:text-2xl text-[#111827] tracking-tight mb-4">
                  Latest Blog
                </h2>

                <Link
                  href={`/blog/${featured.slug}`}
                  className="block rounded-[26px] sm:rounded-[32px] border border-zinc-200/90 bg-white p-5 sm:p-7 lg:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-10 lg:gap-12 items-center">
                    {/* Left: Featured Image */}
                    <div className="w-full aspect-[4/3] sm:aspect-[16/11] md:aspect-[4/3] lg:aspect-[16/11] min-h-[280px] sm:min-h-[360px] lg:min-h-[420px] relative rounded-[20px] sm:rounded-[24px] overflow-hidden bg-zinc-100">
                      <Image
                        src={featured.featuredImage}
                        alt={featured.title}
                        fill
                        unoptimized={Boolean(featured.featuredImage?.startsWith("/api/"))}
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        priority
                      />
                    </div>

                    {/* Right: Title, Date, Excerpt */}
                    <div className="flex flex-col justify-center py-2 sm:py-4">
                      <h3 className="font-outfit font-bold text-2xl sm:text-3xl lg:text-[34px] text-[#111827] leading-[1.25] tracking-tight group-hover:text-[#199250] transition-colors">
                        {featured.title}
                      </h3>

                      {/* Date with Calendar Icon */}
                      <div className="flex items-center gap-2 text-zinc-500 font-manrope text-xs sm:text-sm mt-3.5 mb-4">
                        <svg
                          className="w-4 h-4 text-zinc-400 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{featured.date}</span>
                      </div>

                      {/* Summary */}
                      <p className="font-manrope text-zinc-600 text-sm sm:text-base lg:text-[16.5px] leading-relaxed line-clamp-5">
                        {featured.shortDescription}
                      </p>

                      <div className="mt-6 flex items-center gap-2 text-[#055027] font-outfit font-bold text-sm sm:text-base group-hover:translate-x-1.5 transition-transform">
                        <span>Read Article</span>
                        <svg
                          className="w-4 h-4 sm:w-4.5 sm:h-4.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* Grid of Blog Posts */}
            {list.length > 0 && (
              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                  {list.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="rounded-[22px] sm:rounded-[26px] bg-[#9fd1af] p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg group text-left cursor-pointer"
                    >
                      <div>
                        {/* Thumbnail Image */}
                        <div className="aspect-[16/10] relative rounded-[16px] overflow-hidden bg-white mb-4 shadow-2xs">
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            unoptimized={Boolean(post.featuredImage?.startsWith("/api/"))}
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Title */}
                        <h3 className="font-outfit font-bold text-[17px] sm:text-[18px] text-[#0f172a] leading-snug line-clamp-2 mb-2 group-hover:text-[#055027] transition-colors">
                          {post.title}
                        </h3>

                        {/* Date with Calendar Icon */}
                        <div className="flex items-center gap-1.5 text-zinc-700 font-manrope text-[12px] font-medium mb-3">
                          <svg
                            className="w-3.5 h-3.5 text-zinc-600 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>{post.date}</span>
                        </div>

                        {/* Excerpt */}
                        <p className="font-manrope text-zinc-800/85 text-xs sm:text-[13px] leading-relaxed line-clamp-3">
                          {post.shortDescription}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
