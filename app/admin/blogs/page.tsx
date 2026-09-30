"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";

interface Blog {
  id: string;
  title: string;
  slug: string;
  featuredImage: string | null;
  date: string;
  shortDescription: string;
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function BlogsListPage() {
  const { authFetch } = useAdminAuth();
  const { success, error } = useToast();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Deletion state
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview state
  const [previewBlog, setPreviewBlog] = useState<Blog | null>(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/blog");
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.data || []);
      } else {
        error("Error", "Failed to fetch blogs from server");
      }
    } catch (err) {
      console.error("Error fetching blogs", err);
      error("Network Error", "Could not load blogs list");
    } finally {
      setLoading(false);
    }
  }, [authFetch, error]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Lock html and body scroll when preview modal is open
  useEffect(() => {
    if (previewBlog) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.documentElement.classList.add("modal-open");
      document.body.classList.add("modal-open");
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.documentElement.classList.remove("modal-open");
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.documentElement.classList.remove("modal-open");
      document.body.classList.remove("modal-open");
    };
  }, [previewBlog]);

  const handleDelete = async () => {
    if (!blogToDelete) return;
    setIsDeleting(true);

    try {
      const res = await authFetch(`/api/blog/${encodeURIComponent(blogToDelete.slug)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        success("Blog Deleted", `"${blogToDelete.title}" was removed successfully.`);
        setBlogs((prev) => prev.filter((b) => b.id !== blogToDelete.id));
        setBlogToDelete(null);
        window.dispatchEvent(new Event("admin_stats_updated"));
      } else {
        const data = await res.json();
        error("Delete Failed", data.message || "Could not delete blog");
      }
    } catch (err) {
      console.error("Delete error", err);
      error("Delete Error", "An unexpected error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      blog.title.toLowerCase().includes(query) ||
      blog.slug.toLowerCase().includes(query) ||
      (blog.shortDescription && blog.shortDescription.toLowerCase().includes(query)) ||
      (blog.content && blog.content.toLowerCase().includes(query))
    );
  });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs">
        <div>
          <h2 className="font-['Outfit'] font-black text-2xl text-zinc-900 tracking-tight">
            Blogs
          </h2>
          <p className="font-['Manrope'] text-xs sm:text-sm text-zinc-500 mt-1">
            Create, edit, preview, and manage your editorial content
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/blogs/new"
            className="px-5 py-2.5 rounded-xl bg-[#199250] hover:bg-[#147a42] text-white font-['Manrope'] font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Create New Blog</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, slug, content..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 text-xs sm:text-sm font-['Manrope'] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-700"
            >
              ✕
            </button>
          )}
        </div>

        {/* View mode toggle & count */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <span className="text-xs font-['Manrope'] text-zinc-500">
            Showing <strong className="text-zinc-900">{filteredBlogs.length}</strong> of {blogs.length} blogs
          </span>

          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            <button
              onClick={() => setViewMode("table")}
              title="Table View"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "table"
                  ? "bg-white text-emerald-700 shadow-xs font-semibold"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-emerald-700 shadow-xs font-semibold"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Blogs Content */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-[#199250] rounded-full animate-spin mb-3" />
          <p className="text-sm font-['Manrope'] font-medium">Loading blogs...</p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-zinc-200/80 p-8 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 text-[#199250] flex items-center justify-center mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="font-['Outfit'] font-bold text-lg text-zinc-900">
            {searchQuery ? "No matching blogs found" : "No blogs published yet"}
          </h3>
          <p className="font-['Manrope'] text-xs sm:text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? "Try adjusting your search query or clear the filter."
              : "Start by creating your first blog to share market updates and trading insights."}
          </p>
          {!searchQuery && (
            <Link
              href="/admin/blogs/new"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#199250] hover:bg-[#147a42] text-white text-xs sm:text-sm font-bold shadow-sm"
            >
              + Create First Blog
            </Link>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="rounded-3xl bg-white border border-zinc-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-['Manrope'] text-xs sm:text-sm">
              <thead>
                <tr className="bg-zinc-50/90 border-b border-zinc-200 text-zinc-500 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Blog</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">SEO</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredBlogs.map((blog) => (
                  <tr
                    key={blog.id}
                    className="hover:bg-emerald-50/30 transition-colors group"
                  >
                    {/* Article Info */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-14 h-12 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                          {blog.featuredImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={blog.featuredImage}
                              alt={blog.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">
                              N/A
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-md">
                          <p className="font-['Outfit'] font-bold text-sm text-zinc-900 group-hover:text-[#199250] transition-colors truncate">
                            {blog.title}
                          </p>
                          <p className="text-xs text-zinc-500 truncate mt-0.5">
                            {blog.shortDescription}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-4 px-4 font-mono text-xs text-zinc-600 max-w-[200px] xl:max-w-[260px]">
                      <span
                        title={`/${blog.slug}`}
                        className="inline-block max-w-full truncate px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 align-middle text-zinc-700"
                      >
                        /{blog.slug}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-xs text-zinc-600 whitespace-nowrap">
                      {formatDate(blog.date)}
                    </td>

                    {/* SEO Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {blog.metaTitle && blog.metaDescription ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Partial
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Preview */}
                        <button
                          onClick={() => setPreviewBlog(blog)}
                          title="Preview Blog"
                          className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Edit */}
                        <Link
                          href={`/admin/blogs/edit/${blog.slug}`}
                          title="Edit Blog"
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#199250] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => setBlogToDelete(blog)}
                          title="Delete Blog"
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <div
              key={blog.id}
              className="rounded-3xl bg-white border border-zinc-200/80 overflow-hidden flex flex-col shadow-xs hover:shadow-md hover:border-emerald-500/50 transition-all group"
            >
              {/* Image Banner */}
              <div className="relative h-44 w-full bg-zinc-100 overflow-hidden">
                {blog.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={blog.featuredImage}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
                    No Featured Image
                  </div>
                )}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-mono text-zinc-700 border border-zinc-200 shadow-xs">
                  {formatDate(blog.date)}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono text-emerald-700 block mb-1 font-semibold truncate">
                    /{blog.slug}
                  </span>
                  <h3 className="font-['Outfit'] font-bold text-base text-zinc-900 group-hover:text-[#199250] transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="font-['Manrope'] text-xs text-zinc-600 line-clamp-3 mt-2 leading-relaxed">
                    {blog.shortDescription}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <button
                    onClick={() => setPreviewBlog(blog)}
                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors"
                  >
                    Preview
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/blogs/edit/${blog.slug}`}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#199250] text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => setBlogToDelete(blog)}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!blogToDelete}
        isLoading={isDeleting}
        onClose={() => setBlogToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Blog Article"
        message={`Are you sure you want to delete "${blogToDelete?.title}"? This action cannot be undone and will permanently remove this blog and its associated image.`}
        confirmText="Yes, Delete Blog"
      />

      {/* Full Preview Modal */}
      {previewBlog && (
        <div
          onClick={() => setPreviewBlog(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in"
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] rounded-3xl bg-white border border-zinc-200 shadow-2xl flex flex-col text-zinc-900 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-semibold">
                  Blog Preview
                </span>
                <span className="text-xs text-zinc-500 font-mono">/{previewBlog.slug}</span>
              </div>
              <button
                onClick={() => setPreviewBlog(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/50"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 font-['Manrope'] space-y-6">
              {/* Featured Image */}
              {previewBlog.featuredImage && (
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewBlog.featuredImage}
                    alt={previewBlog.title}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              )}

              {/* Title & Metadata */}
              <div>
                <div className="flex items-center gap-3 text-xs text-emerald-700 font-mono font-semibold mb-2">
                  <span>Published: {formatDate(previewBlog.date)}</span>
                </div>
                <h1 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-zinc-900">
                  {previewBlog.title}
                </h1>
                <p className="text-sm text-zinc-600 mt-2 italic border-l-2 border-emerald-500 pl-3">
                  {previewBlog.shortDescription}
                </p>
              </div>

              {/* Full Content */}
              <div
                className="pt-4 border-t border-zinc-100 text-zinc-800 text-sm sm:text-base leading-relaxed overflow-y-auto max-w-none [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2.5 [&_h2]:text-zinc-900 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-zinc-900 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-1.5 [&_h4]:text-zinc-800 [&_p]:mb-3.5 [&_p]:text-zinc-700 [&_strong]:text-zinc-900 [&_strong]:font-bold [&_b]:text-zinc-900 [&_b]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3.5 [&_ul]:text-zinc-700 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3.5 [&_ol]:text-zinc-700 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-[#199250] [&_blockquote]:bg-emerald-50/60 [&_blockquote]:rounded-r-xl [&_blockquote]:py-2.5 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-700 [&_blockquote]:my-3.5 [&_pre]:bg-zinc-50 [&_pre]:border [&_pre]:border-zinc-200 [&_pre]:text-emerald-800 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:font-mono [&_pre]:text-xs [&_pre]:my-3.5 [&_code]:font-mono [&_code]:text-xs [&_code]:bg-zinc-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-emerald-800 [&_a]:text-[#199250] [&_a]:underline [&_a]:font-medium [&_a:hover]:text-[#055027] [&_img]:rounded-xl [&_img]:max-h-80 [&_img]:my-3.5 [&_img]:border [&_img]:border-zinc-200 [&_hr]:border-zinc-200 [&_hr]:my-4"
                dangerouslySetInnerHTML={{ __html: previewBlog.content || "" }}
              />

              {/* SEO Tags Meta */}
              {(previewBlog.metaTitle || previewBlog.metaDescription) && (
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                  <p className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">
                    SEO Meta Data
                  </p>
                  {previewBlog.metaTitle && (
                    <p>
                      <strong className="text-zinc-700">Meta Title:</strong> {previewBlog.metaTitle}
                    </p>
                  )}
                  {previewBlog.metaDescription && (
                    <p>
                      <strong className="text-zinc-700">Meta Description:</strong>{" "}
                      {previewBlog.metaDescription}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <Link
                href={`/admin/blogs/edit/${previewBlog.slug}`}
                onClick={() => setPreviewBlog(null)}
                className="px-4 py-2 rounded-xl bg-[#199250] hover:bg-[#147a42] text-white text-xs font-bold shadow-xs"
              >
                Edit This Blog
              </Link>
              <button
                onClick={() => setPreviewBlog(null)}
                className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
