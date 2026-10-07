"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../context/AdminAuthContext";
import { useToast } from "../../../context/ToastContext";
import RichTextEditor from "../../../components/RichTextEditor";
import DatePicker from "../../../components/DatePicker";

interface EditBlogPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { authFetch } = useAdminAuth();
  const { success, error, warning } = useToast();

  const originalSlug = decodeURIComponent(resolvedParams.slug);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Existing image vs new upload
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

  const [seoAccordionOpen, setSeoAccordionOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadBlog() {
      setLoading(true);
      try {
        const res = await authFetch(
          `/api/blog/${encodeURIComponent(originalSlug)}`,
        );
        if (!res.ok) {
          error(
            "Blog Not Found",
            `Could not find blog with slug "${originalSlug}".`,
          );
          router.push("/admin/blogs");
          return;
        }

        const data = await res.json();
        const b = data.data;

        if (isMounted && b) {
          setTitle(b.title || "");
          setSlug(b.slug || "");
          const d = b.date ? new Date(b.date).toISOString().split("T")[0] : "";
          setDate(d);
          setShortDescription(b.shortDescription || "");
          setContent(b.content || "");
          setMetaTitle(b.metaTitle || "");
          setMetaDescription(b.metaDescription || "");
          setExistingImageUrl(b.featuredImage || null);
        }
      } catch (err) {
        console.error("Error loading blog for edit", err);
        error("Fetch Error", "Failed to load blog details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBlog();

    return () => {
      isMounted = false;
    };
  }, [originalSlug, authFetch, error, router]);

  const handleSlugChange = (val: string) => {
    const cleaned = val
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

    setNewImageFile(file);
    const preview = URL.createObjectURL(file);
    setNewImagePreview(preview);
  };

  const handleRemoveImage = () => {
    setNewImageFile(null);
    if (newImagePreview) {
      URL.revokeObjectURL(newImagePreview);
      setNewImagePreview(null);
    }
    setExistingImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      warning("Missing Title", "Please provide a blog title.");
      return;
    }

    if (!slug.trim()) {
      warning("Missing Slug", "Please provide a valid slug.");
      return;
    }

    if (!date.trim()) {
      warning("Missing Date", "Please specify a publish date.");
      return;
    }

    if (!shortDescription.trim()) {
      warning(
        "Missing Short Description",
        "Please provide a short description.",
      );
      return;
    }

    if (!content.trim()) {
      warning("Missing Content", "Please provide article content.");
      return;
    }

    if (!existingImageUrl && !newImageFile) {
      warning(
        "Missing Featured Image",
        "A featured cover image is required for the blog.",
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
      formData.append("metaTitle", metaTitle.trim());
      formData.append("metaDescription", metaDescription.trim());

      if (newImageFile) {
        formData.append("featuredImage", newImageFile);
      }

      const res = await authFetch(
        `/api/blog/${encodeURIComponent(originalSlug)}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      const data = await res.json();

      if (res.ok) {
        success("Blog Updated", `"${title}" was saved successfully.`);
        window.dispatchEvent(new Event("admin_stats_updated"));
        router.push("/admin/blogs");
      } else {
        error("Update Failed", data.message || "Failed to save changes.");
      }
    } catch (err) {
      console.error("Error updating blog", err);
      error(
        "Network Error",
        "Could not submit changes. Please check your connection.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-zinc-500 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-[#199250] rounded-full animate-spin mb-3" />
        <p className="text-sm font-['Manrope'] font-medium">
          Loading blog for editing...
        </p>
      </div>
    );
  }

  const currentImage = newImagePreview || existingImageUrl;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300 pb-32">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/blogs"
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors shrink-0"
            title="Back to Blogs"
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
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-semibold">
                Editing
              </span>
              <span className="text-xs text-zinc-500 font-mono truncate hidden sm:inline-block">
                /{originalSlug}
              </span>
            </div>
            <h2 className="font-['Outfit'] font-black text-xl sm:text-2xl text-zinc-900 tracking-tight mt-0.5 truncate">
              {title || "Edit Blog"}
            </h2>
          </div>
        </div>
      </div>

      {/* Main Edit Form */}
      <form id="blog-edit-form" onSubmit={handleSubmit} className="space-y-6">
        {/* General Blog Information */}
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
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-300 text-zinc-900 focus:outline-none focus:bg-white focus:border-emerald-500 text-sm sm:text-base font-['Outfit'] font-bold transition-all"
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
                  /blogs/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="slug"
                  className="w-full pl-16 pr-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-emerald-800 focus:outline-none focus:bg-white focus:border-emerald-500 text-xs sm:text-sm font-mono transition-all"
                />
              </div>
            </div>

            {/* Date Picker */}
            <DatePicker
              value={date}
              onChange={setDate}
              label="Publish Date"
              required
            />
          </div>

          {/* Summary / Excerpt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-['Outfit'] font-semibold text-xs uppercase tracking-wider text-zinc-700">
                Summary / Excerpt{" "}
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
              placeholder="Article summary..."
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-300 text-zinc-900 focus:outline-none focus:bg-white focus:border-emerald-500 text-xs sm:text-sm font-['Manrope'] leading-relaxed transition-all"
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

          {currentImage ? (
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
                src={currentImage}
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

        {/* Content Body Editor Card */}
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
            placeholder="Edit article text..."
            height="460px"
          />
        </div>

        {/* SEO Meta Tags (Collapsible) */}
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
                Customize search result title and meta description
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
              {/* Google Snippet */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 font-['Manrope'] mt-4">
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Google Search Snippet Preview
                </p>
                <div className="space-y-1">
                  <p className="text-xs text-emerald-700 font-mono">
                    https://profitplus.us/blog/{slug}
                  </p>
                  <h4 className="text-blue-700 font-medium text-base hover:underline cursor-pointer line-clamp-1">
                    {metaTitle || title} | Profit Plus
                  </h4>
                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                    {metaDescription || shortDescription}
                  </p>
                </div>
              </div>

              {/* Meta Title */}
              <div>
                <label className="block font-['Outfit'] font-semibold text-xs uppercase tracking-wider text-zinc-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Defaults to article title"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-zinc-900 focus:outline-none focus:bg-white focus:border-emerald-500 text-xs sm:text-sm font-['Manrope'] transition-all"
                />
              </div>

              {/* Meta Description */}
              <div>
                <label className="block font-['Outfit'] font-semibold text-xs uppercase tracking-wider text-zinc-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Defaults to short description"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-zinc-900 focus:outline-none focus:bg-white focus:border-emerald-500 text-xs sm:text-sm font-['Manrope'] transition-all"
                />
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Fixed Bottom Action Bar */}
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
            form="blog-edit-form"
            disabled={isSubmitting}
            className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-[#199250] hover:bg-[#147a42] text-white font-['Outfit'] font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving Changes...</span>
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
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
