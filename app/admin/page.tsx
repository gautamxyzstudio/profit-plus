"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAdminAuth } from "./context/AdminAuthContext";
import { useToast } from "./context/ToastContext";

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  featuredImage: string | null;
  date: string;
  shortDescription: string;
  createdAt: string;
}

interface InquiryItem {
  id: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  referralCode?: string | null;
  message: string;
  createdAt: string;
}

interface DemoItem {
  id: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  message: string;
  isRead?: boolean;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const { user, authFetch } = useAdminAuth();
  const { error } = useToast();

  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [demos, setDemos] = useState<DemoItem[]>([]);

  // Active view modal
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<DemoItem | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [blogsRes, inqRes, demoRes] = await Promise.all([
        authFetch("/api/blog"),
        authFetch("/api/contact-us"),
        authFetch("/api/book-demo"),
      ]);

      if (blogsRes.ok) {
        const data = await blogsRes.json();
        setBlogs(data.data || []);
      }
      if (inqRes.ok) {
        const data = await inqRes.json();
        setInquiries(data.data || []);
      }
      if (demoRes.ok) {
        const data = await demoRes.json();
        setDemos(data.data || []);
      }
    } catch (err) {
      console.error("Dashboard fetch error", err);
      error("Error loading dashboard", "Could not fetch all dashboard metrics.");
    } finally {
      setLoading(false);
    }
  }, [authFetch, error]);

  useEffect(() => {
    fetchDashboardData();

    const handleStatsUpdated = () => {
      fetchDashboardData();
    };

    window.addEventListener("admin_stats_updated", handleStatsUpdated);
    return () => {
      window.removeEventListener("admin_stats_updated", handleStatsUpdated);
    };
  }, [fetchDashboardData]);

  // Lock html and body scroll when any modal is open
  useEffect(() => {
    if (selectedInquiry || selectedDemo) {
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
  }, [selectedInquiry, selectedDemo]);

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

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0d4f2b] to-[#199250] p-6 sm:p-8 overflow-hidden shadow-lg shadow-emerald-950/10 text-white">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-['Manrope'] font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              Profit Plus Administrator
            </div>
            <h2 className="font-['Outfit'] font-black text-2xl sm:text-3xl tracking-tight">
              Welcome Back, {user?.name || "Admin"}
            </h2>
            <p className="font-['Manrope'] text-emerald-50 text-xs sm:text-sm mt-1 max-w-xl opacity-90">
              Manage your published blogs, review prospective client demo requests, and respond to incoming contact inquiries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/blogs/new"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-[#0d4f2b] font-['Manrope'] font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-[#199250]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>+ Create Blog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Total Blogs Card */}
        <Link
          href="/admin/blogs"
          className="group rounded-3xl bg-white border border-zinc-200/80 hover:border-emerald-500/50 p-6 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#199250] flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <span className="text-xs text-zinc-400 group-hover:text-emerald-700 font-['Manrope'] font-semibold flex items-center gap-1 transition-colors">
              Manage
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>

          <div className="mt-5">
            <p className="font-['Manrope'] text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Published Blogs
            </p>
            <p className="font-['Outfit'] font-black text-3xl sm:text-4xl text-zinc-900 mt-1">
              {loading ? (
                <span className="inline-block w-8 h-8 bg-zinc-100 rounded-lg animate-pulse" />
              ) : (
                blogs.length
              )}
            </p>
          </div>
        </Link>

        {/* Contact Inquiries Card */}
        <Link
          href="/admin/inquiries"
          className="group rounded-3xl bg-white border border-zinc-200/80 hover:border-emerald-500/50 p-6 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#199250] flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="text-xs text-zinc-400 group-hover:text-emerald-700 font-['Manrope'] font-semibold flex items-center gap-1 transition-colors">
              View All
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>

          <div className="mt-5">
            <p className="font-['Manrope'] text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Contact Inquiries
            </p>
            <p className="font-['Outfit'] font-black text-3xl sm:text-4xl text-zinc-900 mt-1">
              {loading ? (
                <span className="inline-block w-8 h-8 bg-zinc-100 rounded-lg animate-pulse" />
              ) : (
                inquiries.length
              )}
            </p>
          </div>
        </Link>

        {/* Demo Requests Card */}
        {(() => {
          const unreadDemosCount = demos.filter((d) => !d.isRead).length;
          return (
            <Link
              href="/admin/demo-requests"
              className="group rounded-3xl bg-white border border-zinc-200/80 hover:border-amber-500/50 p-6 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform relative">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {unreadDemosCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white animate-pulse" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadDemosCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[10px] font-bold shadow-xs">
                      {unreadDemosCount} New
                    </span>
                  ) : demos.length > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      All Read
                    </span>
                  ) : null}
                  <span className="text-xs text-zinc-400 group-hover:text-amber-600 font-['Manrope'] font-semibold flex items-center gap-1 transition-colors">
                    Review
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <p className="font-['Manrope'] text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Demo Requests
                </p>
                <p className="font-['Outfit'] font-black text-3xl sm:text-4xl text-zinc-900 mt-1">
                  {loading ? (
                    <span className="inline-block w-8 h-8 bg-zinc-100 rounded-lg animate-pulse" />
                  ) : (
                    demos.length
                  )}
                </p>
              </div>
            </Link>
          );
        })()}
      </div>

      {/* Grid of Recent Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Contact Inquiries */}
        <div className="rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div>
              <h3 className="font-['Outfit'] font-bold text-lg text-zinc-900">
                Recent Inquiries
              </h3>
              <p className="font-['Manrope'] text-xs text-zinc-500">
                Latest messages from contact form
              </p>
            </div>
            <Link
              href="/admin/inquiries"
              className="text-xs font-['Manrope'] font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              View All ({inquiries.length}) →
            </Link>
          </div>

          <div className="flex-1 mt-4 divide-y divide-zinc-100 overflow-hidden">
            {loading ? (
              <div className="py-8 text-center text-zinc-400 text-xs">Loading inquiries...</div>
            ) : inquiries.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-xs">No inquiries received yet.</div>
            ) : (
              inquiries.slice(0, 3).map((inq) => (
                <div
                  key={inq.id}
                  onClick={() => setSelectedInquiry(inq)}
                  className="py-3.5 flex items-start justify-between gap-3 hover:bg-emerald-50/40 -mx-2 px-2 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-['Outfit'] font-bold text-sm text-zinc-900 group-hover:text-[#199250] transition-colors truncate">
                        {inq.name}
                      </p>
                      {inq.referralCode && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {inq.referralCode}
                        </span>
                      )}
                    </div>
                    <p className="font-['Manrope'] text-xs text-zinc-500 truncate mt-0.5">
                      {inq.email} • {inq.countryCode} {inq.phone}
                    </p>
                    <p className="font-['Manrope'] text-xs text-zinc-700 line-clamp-1 mt-1 italic">
                      &ldquo;{inq.message}&rdquo;
                    </p>
                  </div>
                  <span className="text-[11px] text-zinc-400 shrink-0 font-mono">
                    {formatDate(inq.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Demo Requests */}
        <div className="rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div>
              <h3 className="font-['Outfit'] font-bold text-lg text-zinc-900">
                Recent Demo Requests
              </h3>
              <p className="font-['Manrope'] text-xs text-zinc-500">
                Latest prospective client demo requests
              </p>
            </div>
            <Link
              href="/admin/demo-requests"
              className="text-xs font-['Manrope'] font-semibold text-amber-700 hover:text-amber-800 transition-colors"
            >
              View All ({demos.length}) →
            </Link>
          </div>

          <div className="flex-1 mt-4 divide-y divide-zinc-100 overflow-hidden">
            {loading ? (
              <div className="py-8 text-center text-zinc-400 text-xs">Loading demo requests...</div>
            ) : demos.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-xs">No demo requests yet.</div>
            ) : (
              demos.slice(0, 3).map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    setSelectedDemo(d);
                    if (!d.isRead) {
                      setDemos((prev) =>
                        prev.map((item) => (item.id === d.id ? { ...item, isRead: true } : item))
                      );
                    }
                  }}
                  className="py-3.5 flex items-start justify-between gap-3 hover:bg-amber-50/40 -mx-2 px-2 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-['Outfit'] font-bold text-sm text-zinc-900 group-hover:text-amber-700 transition-colors truncate">
                        {d.name}
                      </p>
                      {d.isRead === false ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                          NEW
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Read
                        </span>
                      )}
                    </div>
                    <p className="font-['Manrope'] text-xs text-zinc-500 truncate mt-0.5">
                      {d.email} • {d.countryCode} {d.phone}
                    </p>
                    <p className="font-['Manrope'] text-xs text-zinc-700 line-clamp-1 mt-1 italic">
                      &ldquo;{d.message}&rdquo;
                    </p>
                  </div>
                  <span className="text-[11px] text-zinc-400 shrink-0 font-mono">
                    {formatDate(d.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Blogs Section */}
      <div className="rounded-3xl bg-white border border-zinc-200/80 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <h3 className="font-['Outfit'] font-bold text-lg text-zinc-900">
              Published Blogs &amp; Insights
            </h3>
            <p className="font-['Manrope'] text-xs text-zinc-500">
              Manage your blog posts, editorial content, and SEO tags
            </p>
          </div>
          <Link
            href="/admin/blogs"
            className="text-xs font-['Manrope'] font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            All Blogs ({blogs.length}) →
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full py-8 text-center text-zinc-400 text-xs">
              Loading blogs...
            </div>
          ) : blogs.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <p className="text-zinc-500 text-sm">No blogs published yet.</p>
              <Link
                href="/admin/blogs/new"
                className="mt-3 inline-block px-4 py-2 rounded-xl bg-[#199250] text-white text-xs font-bold"
              >
                + Create First Blog
              </Link>
            </div>
          ) : (
            blogs.slice(0, 3).map((blog) => (
              <div
                key={blog.id}
                className="rounded-2xl bg-zinc-50 border border-zinc-200/80 overflow-hidden flex flex-col group hover:border-emerald-500/50 hover:shadow-md transition-all"
              >
                {/* Thumbnail */}
                <div className="relative h-36 w-full bg-zinc-100 overflow-hidden">
                  {blog.featuredImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-mono text-zinc-700 border border-zinc-200 shadow-xs">
                    {formatDate(blog.date)}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-['Outfit'] font-bold text-sm text-zinc-900 line-clamp-1 group-hover:text-[#199250] transition-colors">
                      {blog.title}
                    </h4>
                    <p className="font-['Manrope'] text-xs text-zinc-600 line-clamp-2 mt-1.5 leading-relaxed">
                      {blog.shortDescription}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-200/60 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-500 truncate max-w-[140px]">
                      /{blog.slug}
                    </span>
                    <Link
                      href={`/admin/blogs/edit/${blog.slug}`}
                      className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#199250] text-xs font-semibold transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div
          onClick={() => setSelectedInquiry(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs overflow-y-auto overscroll-contain animate-in fade-in"
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white border border-zinc-200 p-6 sm:p-7 shadow-2xl text-zinc-900 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-['Outfit'] font-bold text-lg text-zinc-900">Contact Inquiry</h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 font-['Manrope'] text-xs sm:text-sm">
              <div>
                <span className="text-zinc-400 text-xs">Date:</span>
                <p className="text-zinc-700 font-medium">{formatDateTime(selectedInquiry.createdAt)}</p>
              </div>
              <div>
                <span className="text-zinc-400 text-xs">Name:</span>
                <p className="font-bold text-zinc-900">{selectedInquiry.name}</p>
              </div>
              <div>
                <span className="text-zinc-400 text-xs">Email:</span>
                <p className="text-[#199250] font-medium">
                  <a href={`mailto:${selectedInquiry.email}`} className="hover:underline">
                    {selectedInquiry.email}
                  </a>
                </p>
              </div>
              <div>
                <span className="text-zinc-400 text-xs">Phone:</span>
                <p className="text-zinc-800">
                  <a href={`tel:${selectedInquiry.countryCode}${selectedInquiry.phone}`} className="hover:underline">
                    {selectedInquiry.countryCode} {selectedInquiry.phone}
                  </a>
                </p>
              </div>
              {selectedInquiry.referralCode && (
                <div>
                  <span className="text-zinc-400 text-xs">Referral Code:</span>
                  <p className="text-emerald-700 font-mono font-semibold">{selectedInquiry.referralCode}</p>
                </div>
              )}
              <div className="pt-2">
                <span className="text-zinc-400 text-xs">Message:</span>
                <div className="mt-1 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
              <a
                href={`mailto:${selectedInquiry.email}?subject=Regarding your inquiry on Profit Plus`}
                className="px-4 py-2 rounded-xl bg-[#199250] hover:bg-[#147a42] text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                ✉️ Reply via Email
              </a>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Detail Modal */}
      {selectedDemo && (
        <div
          onClick={() => setSelectedDemo(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs overflow-y-auto overscroll-contain animate-in fade-in"
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white border border-zinc-200 p-6 sm:p-7 shadow-2xl text-zinc-900 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="font-['Outfit'] font-bold text-lg text-zinc-900">Demo Request</h3>
              </div>
              <button
                onClick={() => setSelectedDemo(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 font-['Manrope'] text-xs sm:text-sm">
              <div>
                <span className="text-zinc-400 text-xs">Date:</span>
                <p className="text-zinc-700 font-medium">{formatDateTime(selectedDemo.createdAt)}</p>
              </div>
              <div>
                <span className="text-zinc-400 text-xs">Requester:</span>
                <p className="font-bold text-zinc-900">{selectedDemo.name}</p>
              </div>
              <div>
                <span className="text-zinc-400 text-xs">Email:</span>
                <p className="text-amber-700 font-medium">
                  <a href={`mailto:${selectedDemo.email}`} className="hover:underline">
                    {selectedDemo.email}
                  </a>
                </p>
              </div>
              <div>
                <span className="text-zinc-400 text-xs">Phone:</span>
                <p className="text-zinc-800">
                  <a href={`tel:${selectedDemo.countryCode}${selectedDemo.phone}`} className="hover:underline">
                    {selectedDemo.countryCode} {selectedDemo.phone}
                  </a>
                </p>
              </div>
              <div className="pt-2">
                <span className="text-zinc-400 text-xs">Requirements / Message:</span>
                <div className="mt-1 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {selectedDemo.message}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
              <a
                href={`mailto:${selectedDemo.email}?subject=Profit Plus Demo Request Confirmation`}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                ✉️ Schedule / Contact
              </a>
              <button
                onClick={() => setSelectedDemo(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
