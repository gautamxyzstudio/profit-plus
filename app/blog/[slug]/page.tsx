import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { BlogPost } from "@/constants/blogs";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

async function fetchBlog(rawSlug: string): Promise<BlogPost | undefined> {
  const slug = decodeURIComponent(rawSlug).trim();

  try {
    let dbBlog = await prisma.blog.findUnique({
      where: { slug },
    });

    if (!dbBlog) {
      dbBlog = await prisma.blog.findUnique({
        where: { id: slug },
      });
    }

    if (dbBlog) {
      const featuredImage = dbBlog.featuredImage?.startsWith("/api/blog/")
        ? `${dbBlog.featuredImage.split("?")[0]}?v=${new Date(
            dbBlog.updatedAt,
          ).getTime()}`
        : dbBlog.featuredImage || "/blog/no-blogs.jpg";

      return {
        id: dbBlog.id,
        title: dbBlog.title,
        slug: dbBlog.slug,
        date: new Date(dbBlog.date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        featuredImage,
        shortDescription: dbBlog.shortDescription || "",
        content: dbBlog.content,
        metaTitle: dbBlog.metaTitle || undefined,
        metaDescription: dbBlog.metaDescription || undefined,
      };
    }
  } catch (err) {
    console.error(`[BlogPostPage] Error fetching blog with slug "${slug}":`, err);
  }

  return undefined;
}

async function getRecentBlogs(currentSlug: string): Promise<BlogPost[]> {
  try {
    const dbBlogs = await prisma.blog.findMany({
      where: {
        slug: {
          not: currentSlug,
        },
      },
      orderBy: {
        date: "desc",
      },
      take: 3,
    });

    if (dbBlogs && dbBlogs.length > 0) {
      return dbBlogs.map((b) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        date: new Date(b.date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        featuredImage: b.featuredImage?.startsWith("/api/blog/")
          ? `${b.featuredImage.split("?")[0]}?v=${new Date(b.updatedAt).getTime()}`
          : b.featuredImage || "/blog/no-blogs.jpg",
        shortDescription: b.shortDescription || "",
        content: b.content,
        metaTitle: b.metaTitle || undefined,
        metaDescription: b.metaDescription || undefined,
      }));
    }
  } catch (err) {
    console.error("[BlogPostPage] Error fetching recent blogs:", err);
  }

  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlog(slug);

  if (!post) {
    return { title: "Blog Not Found | Profit Plus" };
  }

  return {
    title: `${post.title} | Profit Plus`,
    description: post.shortDescription,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchBlog(slug);

  if (!post) {
    notFound();
  }

  const recentPosts = await getRecentBlogs(post.slug);

  return (
    <div className="bg-white min-h-screen text-zinc-900 pb-20 sm:pb-28">
      {/* Main Container - max-w-7xl matches Navbar width so content starts directly from the left edge */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 text-left">
        {/* Breadcrumb Navigation matching Screenshot 3 */}
        <nav aria-label="Breadcrumb" className="mb-3 text-left">
          <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-[13px] font-manrope text-zinc-500">
            <Link
              href="/blog"
              className="text-zinc-500 hover:text-[#055027] transition-colors"
            >
              Blogs
            </Link>
            <span className="text-zinc-400 select-none">»</span>
            <span className="text-[#199250] font-medium">
              {post.title}
            </span>
          </div>
        </nav>

        {/* Article Title - Left Aligned / Start se start matching Screenshot 3 */}
        <h1 className="font-outfit font-black text-2xl sm:text-3xl md:text-[38px] lg:text-[42px] text-[#111827] tracking-tight leading-[1.18] text-left mt-2 mb-6 w-full">
          {post.title}
        </h1>

        {/* Featured Image Banner - Starts from left edge matching Navbar width */}
        <div className="w-full aspect-[16/9] relative rounded-[20px] sm:rounded-[28px] overflow-hidden bg-zinc-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] mb-8 sm:mb-12 border border-zinc-100">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            unoptimized={Boolean(post.featuredImage?.startsWith("/api/"))}
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Article Content with Rich Typography matching exact Inspector specs:
            - Paragraphs: 20px Manrope, #334155, 0 0 20px
            - Headings/Strong: 30px Manrope, #1E293B, line-height 41.33px */}
        <article
          className="blog-article w-full text-left"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Separator */}
        <div className="my-14 border-t border-zinc-200/80 w-full" />

        {/* Recent Posts Section */}
        {recentPosts.length > 0 && (
          <section className="mt-12 w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-outfit font-black text-xl sm:text-2xl text-[#111827] tracking-tight">
                Recent Posts
              </h2>
              <Link
                href="/blog"
                className="text-[#055027] hover:text-[#199250] font-outfit font-semibold text-xs sm:text-sm flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
              {recentPosts.map((recent) => (
                <Link
                  key={recent.id}
                  href={`/blog/${recent.slug}`}
                  className="rounded-[18px] border border-zinc-200/90 bg-white p-3.5 hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[16/10] relative rounded-[12px] overflow-hidden bg-zinc-100 mb-3 shadow-2xs">
                      <Image
                        src={recent.featuredImage}
                        alt={recent.title}
                        fill
                        unoptimized={Boolean(recent.featuredImage?.startsWith("/api/"))}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-outfit font-bold text-sm sm:text-[15px] text-[#111827] group-hover:text-[#055027] transition-colors leading-snug line-clamp-2">
                      {recent.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-manrope mt-3">
                    <svg
                      className="w-3.5 h-3.5 text-zinc-400"
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
                    <span>{recent.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
