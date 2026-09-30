"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useToast } from "../../context/ToastContext";
import RichTextEditor from "../../components/RichTextEditor";
import DatePicker from "../../components/DatePicker";

export default function CreateBlogPage() {
  const router = useRouter();
  const { authFetch } = useAdminAuth();
  const { success, error, warning } = useToast();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Featured image
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seoAccordionOpen, setSeoAccordionOpen] = useState(false);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isSlugCustomized) {
      const generated = newTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const handleSlugChange = (newSlug: string) => {
    setIsSlugCustomized(true);
    const cleaned = newSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");
    setSlug(cleaned);
  };

  const handleImageSelect = (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      error(
        "Invalid Image Format",
        "Only JPEG, PNG, WebP, and GIF images are allowed.",
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      error("File Too Large", "Image size must not exceed 10MB.");
      return;
    }

    setFeaturedImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreviewUrl(preview);
  };

  const handleRemoveImage = () => {
    setFeaturedImageFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      warning("Missing Title", "Please provide a blog title.");
      return;
    }

    if (!slug.trim()) {
      warning("Missing Slug", "Please provide a URL slug for the blog.");
      return;
    }

    if (!date.trim()) {
      warning("Missing Date", "Please select a publish date.");
      return;
    }

    if (!shortDescription.trim()) {
      warning(
        "Missing Short Description",
        "Please provide a brief excerpt or summary.",
      );
      return;
    }

    if (!content.trim()) {
      warning("Missing Content", "Please write the article content.");
      return;
    }

    if (!featuredImageFile) {
      warning(
        "Missing Featured Image",
        "A featured image is required for the blog.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("slug", slug.trim().toLowerCase());
      formData.append("date", date);
      formData.append("shortDescription", shortDescription.trim());
      formData.append("content", content.trim());
      formData.append("featuredImage", featuredImageFile);

      if (metaTitle.trim()) {
        formData.append("metaTitle", metaTitle.trim());
      }
      if (metaDescription.trim()) {
        formData.append("metaDescription", metaDescription.trim());
      }

      const res = await authFetch("/api/blog", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        success(
          "Blog Published!",
          `"${title}" has been published successfully.`,
        );
        window.dispatchEvent(new Event("admin_stats_updated"));
        router.push("/admin/blogs");
      } else {
        error("Failed to Create Blog", data.message || "An error occurred.");
      }
    } catch (err) {
      console.error("Error creating blog", err);
      error(
        "Network Error",
        "Could not submit blog. Please check your connection.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300 pb-32">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/blogs"
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors shrink-0"
            title="Back to Blogs List"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div className="min-w-0">
            <h2 className="font-['Outfit'] font-black text-xl sm:text-2xl text-zinc-900 tracking-tight truncate">
              {title || "Create New Blog"}
            </h2>
            <p className="font-['Manrope'] text-xs text-zinc-500 truncate hidden sm:block">
              Compose a new article with rich formatting, imagery, and SEO metadata
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form id="blog-create-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider font-['Outfit'] border-b border-zinc-100 pb-3">
            <svg
              className="w-4 h-4 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>General Blog Information</span>
          </div>

          {/* Title */}
          <div>
            <label className="block font-['Outfit'] font-semibold text-xs uppercase tracking-wider text-zinc-700 mb-2">
              Blog Title <span className="text-emerald-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. How Algorithmic Trading Automates Profits in Volatile Markets"
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm sm:text-base font-['Outfit'] font-bold transition-all"
            />
          </div>

          {/* Slug & Date Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Slug */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-['Outfit'] font-semibold text-xs uppercase tracking-wider text-zinc-700">
                  URL Slug <span className="text-emerald-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const gen = title
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9\s-]/g, "")
                      .replace(/\s+/g, "-")
                      .replace(/-+/g, "-")
                      .replace(/^-+|-+$/g, "");
                    setSlug(gen);
                    setIsSlugCustomized(false);
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Auto-Generate</span>
                </button>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs text-zinc-400 font-mono">
                  /blog/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="how-algorithmic-trading-automates-profits"
                  className="w-full pl-16 pr-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-emerald-800 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-emerald-500 text-xs sm:text-sm font-mono transition-all"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1 font-['Manrope']">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>

            {/* Date Picker */}
            <DatePicker
              value={date}
              onChange={setDate}
              label="Publish Date"
              required
            />
          </div>

          {/* Short Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-['Outfit'] font-semibold text-xs uppercase tracking-wider text-zinc-700">
                Short Description / Excerpt{" "}
                <span className="text-emerald-600">*</span>
              </label>
              <span className="text-xs text-zinc-500 font-['Manrope']">
                {shortDescription.length} chars
              </span>
            </div>
            <textarea
              rows={3}
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Provide a concise 1-3 sentence summary displayed on cards and search results..."
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-emerald-500 text-xs sm:text-sm font-['Manrope'] leading-relaxed transition-all"
            />
          </div>
        </div>

        {/* Featured Hero Image Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider font-['Outfit']">
              <svg
                className="w-4 h-4 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span>Featured Hero Image</span>
              <span className="text-emerald-600">*</span>
            </div>
            <p className="font-['Manrope'] text-xs text-zinc-400 hidden sm:block">
              JPEG, PNG, WebP or GIF (Up to 10MB)
            </p>
          </div>

          {imagePreviewUrl ? (
            <div className="relative rounded-2xl sm:rounded-3xl border border-zinc-200/80 bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center min-h-[300px] sm:min-h-[360px] overflow-hidden group">
              {/* Action Buttons at Top Right */}
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center gap-2.5 z-10">
                <label className="px-3.5 sm:px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 font-['Manrope'] font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95">
                  <svg
                    className="w-3.5 h-3.5 text-zinc-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Replace</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageSelect(e.target.files[0]);
                      }
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white font-['Manrope'] font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Delete</span>
                </button>
              </div>

              {/* Centered Image Preview - Displays full image without cropping */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreviewUrl}
                alt="Featured Cover Image"
                className="max-h-[320px] sm:max-h-[380px] w-auto max-w-full object-contain rounded-xl sm:rounded-2xl shadow-sm border border-zinc-200/60"
              />
            </div>
          ) : (
            <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl sm:rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center cursor-pointer bg-emerald-50/20 hover:bg-emerald-50/50 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 text-[#199250] flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="font-['Outfit'] font-bold text-sm text-zinc-900 group-hover:text-emerald-800">
                Click to upload or drag &amp; drop featured image
              </p>
              <p className="font-['Manrope'] text-xs text-zinc-500 mt-1">
                PNG, JPG, WebP or GIF (Up to 10MB)
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                required
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleImageSelect(e.target.files[0]);
                  }
                }}
              />
            </label>
          )}
        </div>

        {/* Article Body Editor Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider font-['Outfit']">
              <svg
                className="w-4 h-4 text-[#199250]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Blog Content</span>
              <span className="text-emerald-600">*</span>
            </div>
            <span className="text-xs text-zinc-400 font-['Manrope'] hidden sm:inline-block">
              Supports headings, formatting, quotes, links &amp; media
            </span>
          </div>

          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your article body here... Add headings, lists, quotes, and links."
            minHeight="450px"
          />
        </div>

        {/* SEO Meta Tags Card (Collapsible) */}
        <div className="rounded-3xl bg-white border border-zinc-200/80 shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={() => setSeoAccordionOpen(!seoAccordionOpen)}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Outfit'] font-bold text-lg text-zinc-900">
                  Search Engine Optimization (SEO)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono font-semibold border border-emerald-200">
                  Optional
                </span>
              </div>
              <p className="font-['Manrope'] text-xs text-zinc-500 mt-0.5">
                Customize how your blog appears on Google and social search
                results
              </p>
            </div>
            <svg
              className={`w-5 h-5 text-zinc-400 transition-transform ${
                seoAccordionOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {seoAccordionOpen && (
            <div className="p-6 sm:p-8 pt-0 border-t border-zinc-100 space-y-6">
              {/* Google SERP Preview */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 font-['Manrope'] mt-4">
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Google Search Snippet Preview
                </p>
                <div className="space-y-1">
                  <p className="text-xs text-emerald-700 font-mono">
                    https://profitplus.us/blog/{slug || "article-slug"}
                  </p>
                  <h4 className="text-blue-700 font-medium text-base hover:underline cursor-pointer line-clamp-1">
                    {metaTitle || title || "Your Blog Title Will Appear Here"} |
                    Profit Plus
                  </h4>
                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                    {metaDescription ||
                      shortDescription ||
                      "Your article summary will be displayed here in search engine results."}
                  </p>
                </div>
              </div>

              {/* Meta Title */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-['Outfit'] font-semibold text-xs uppercase tracking-wider text-zinc-700">
                    Meta Title
                  </label>
                  <span
                    className={`text-xs font-['Manrope'] ${
                      metaTitle.length > 60
                        ? "text-amber-600 font-semibold"
                        : "text-zinc-500"
                    }`}
                  >
                    {metaTitle.length}/60 recommended
                  </span>
                </div>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Defaults to article title if empty"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-emerald-500 text-xs sm:text-sm font-['Manrope'] transition-all"
                />
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-['Outfit'] font-semibold text-xs uppercase tracking-wider text-zinc-700">
                    Meta Description
                  </label>
                  <span
                    className={`text-xs font-['Manrope'] ${
                      metaDescription.length > 160
                        ? "text-amber-600 font-semibold"
                        : "text-zinc-500"
                    }`}
                  >
                    {metaDescription.length}/160 recommended
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Defaults to short description if empty"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-emerald-500 text-xs sm:text-sm font-['Manrope'] transition-all"
                />
              </div>
            </div>
          )}
        </div>

      </form>

      {/* Fixed Bottom Action Bar - Docked flush to the bottom with no space below */}
      <div className="fixed bottom-0 left-0 right-0 md:left-72 z-40 bg-white border-t border-zinc-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-4 sm:px-8 py-3.5 sm:py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/admin/blogs"
            className="px-5 py-2.5 rounded-xl font-['Manrope'] font-semibold text-xs sm:text-sm text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            form="blog-create-form"
            disabled={isSubmitting}
            className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-[#199250] hover:bg-[#147a42] text-white font-['Outfit'] font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Publishing Blog...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Publish Blog</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
