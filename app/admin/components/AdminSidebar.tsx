"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "../context/AdminAuthContext";
import { IMAGES } from "@/constants/export";

interface AdminSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function AdminSidebar({
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout, authFetch } = useAdminAuth();
  const [unreadDemoCount, setUnreadDemoCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await authFetch("/api/book-demo");
      if (res.ok) {
        const data = await res.json();
        const unread = (data.data || []).filter(
          (item: { isRead?: boolean }) => !item.isRead
        ).length;
        setUnreadDemoCount(unread);
      }
    } catch (err) {
      console.error("Error fetching unread demo count", err);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchUnreadCount();

    const handleStatsUpdated = () => {
      fetchUnreadCount();
    };

    window.addEventListener("admin_stats_updated", handleStatsUpdated);
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      window.removeEventListener("admin_stats_updated", handleStatsUpdated);
      clearInterval(interval);
    };
  }, [fetchUnreadCount]);

  const handleDemoNavClick = async () => {
    onCloseMobile();
    try {
      setUnreadDemoCount(0);
      await authFetch("/api/book-demo/mark-all-read", { method: "PUT" });
      window.dispatchEvent(new Event("admin_stats_updated"));
    } catch (err) {
      console.error("Error marking demo requests as read", err);
    }
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      exact: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: "Blogs",
      href: "/admin/blogs",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
    {
      label: "Contact Inquiries",
      href: "/admin/inquiries",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      label: "Demo Requests",
      href: "/admin/demo-requests",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-xs md:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-zinc-200 shadow-sm flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header: Logo Centered */}
        <div className="py-5 px-6 border-b border-zinc-200/80 flex items-center justify-center relative">
          <Link
            href="/admin"
            onClick={onCloseMobile}
            className="flex items-center justify-center group select-none"
          >
            <div className="h-12 flex items-center justify-center">
              <Image
                src={IMAGES.logo}
                alt="Profit Plus Admin"
                width={180}
                height={50}
                className="h-11 w-auto object-contain"
                priority
                unoptimized
              />
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
            aria-label="Close Sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            const isDemoReq = item.href === "/admin/demo-requests";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={isDemoReq ? handleDemoNavClick : onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-['Manrope'] font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? "bg-[#199250] text-white shadow-md shadow-emerald-700/20 font-semibold"
                    : "text-zinc-600 hover:text-emerald-800 hover:bg-emerald-50/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`${
                      isActive ? "text-white" : "text-zinc-400 group-hover:text-emerald-600"
                    } transition-colors`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {isDemoReq && unreadDemoCount > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono transition-all ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-amber-500 text-white shadow-xs animate-pulse"
                    }`}
                  >
                    {unreadDemoCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section: Live Website Link & User Card */}
        <div className="p-3 border-t border-zinc-200/80 bg-zinc-50/80 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-300 text-zinc-700 hover:text-emerald-800 font-['Manrope'] text-xs font-semibold transition-all group shadow-xs"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Website
            </span>
            <svg
              className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>

          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-zinc-200/80 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#199250] to-[#22c55e] flex items-center justify-center font-['Outfit'] font-bold text-sm text-white shrink-0 shadow-sm">
                {user?.name ? user.name[0].toUpperCase() : "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-['Outfit'] font-bold text-xs text-zinc-900 truncate">
                  {user?.name || "Admin"}
                </p>
                <p className="font-['Manrope'] text-[11px] text-zinc-500 truncate">
                  {user?.email || "admin@profitplus.us"}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
              aria-label="Logout"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
