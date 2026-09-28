"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";

interface DemoRequest {
  id: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  message: string;
  isRead?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export default function DemoRequestsPage() {
  const { authFetch } = useAdminAuth();
  const { success, error } = useToast();

  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Selected for full detail modal
  const [selectedDemo, setSelectedDemo] = useState<DemoRequest | null>(null);

  // Delete modal
  const [demoToDelete, setDemoToDelete] = useState<DemoRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await authFetch("/api/book-demo/mark-all-read", {
        method: "PUT",
      });
      if (res.ok) {
        window.dispatchEvent(new Event("admin_stats_updated"));
      }
    } catch (err) {
      console.error("Error marking demo requests as read", err);
    }
  }, [authFetch]);

  const fetchDemos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/book-demo");
      if (res.ok) {
        const data = await res.json();
        const items: DemoRequest[] = data.data || [];
        setDemoRequests(items);

        // If there are unread items, mark all as read
        const hasUnread = items.some((item) => !item.isRead);
        if (hasUnread) {
          await markAllAsRead();
        }
      } else {
        error("Error", "Failed to fetch demo requests");
      }
    } catch (err) {
      console.error("Error fetching demo requests", err);
      error("Network Error", "Could not load demo requests list");
    } finally {
      setLoading(false);
    }
  }, [authFetch, error, markAllAsRead]);

  useEffect(() => {
    fetchDemos();
    markAllAsRead();
  }, [fetchDemos, markAllAsRead]);

  // Lock html and body scroll when demo modal is open
  useEffect(() => {
    if (selectedDemo) {
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
  }, [selectedDemo]);

  const handleDelete = async () => {
    if (!demoToDelete) return;
    setIsDeleting(true);

    try {
      const res = await authFetch(`/api/book-demo/${encodeURIComponent(demoToDelete.id)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        success("Demo Request Deleted", `Request from "${demoToDelete.name}" was removed.`);
        setDemoRequests((prev) => prev.filter((item) => item.id !== demoToDelete.id));
        setDemoToDelete(null);
        if (selectedDemo?.id === demoToDelete.id) {
          setSelectedDemo(null);
        }
        window.dispatchEvent(new Event("admin_stats_updated"));
      } else {
        const data = await res.json();
        error("Delete Failed", data.message || "Could not delete demo request");
      }
    } catch (err) {
      console.error("Delete error", err);
      error("Delete Error", "An unexpected error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (demoRequests.length === 0) return;

    const headers = ["ID", "Date", "Name", "Email", "Country Code", "Phone", "Message"];
    const rows = demoRequests.map((item) => [
      `"${item.id}"`,
      `"${new Date(item.createdAt).toISOString()}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.email.replace(/"/g, '""')}"`,
      `"${item.countryCode}"`,
      `"${item.phone}"`,
      `"${item.message.replace(/"/g, '""').replace(/\n/g, " ")}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `profit_plus_demo_requests_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Export Complete", "Demo requests downloaded as CSV.");
  };

  const handleSelectDemo = (demo: DemoRequest) => {
    setSelectedDemo(demo);
    if (!demo.isRead) {
      setDemoRequests((prev) =>
        prev.map((d) => (d.id === demo.id ? { ...d, isRead: true } : d))
      );
    }
  };

  const filteredDemos = demoRequests.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      item.name.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.phone.includes(query) ||
      item.message.toLowerCase().includes(query)
    );
  });

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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-['Outfit'] font-black text-2xl text-zinc-900 tracking-tight">
              Demo Booking Requests
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 font-mono text-xs font-bold">
              {demoRequests.length} Total
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              All Marked as Read
            </span>
          </div>
          <p className="font-['Manrope'] text-xs sm:text-sm text-zinc-500 mt-1">
            Review and schedule personalized software demos for interested traders &amp; investors
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={demoRequests.length === 0}
            className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 font-['Manrope'] font-semibold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4 text-[#199250]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
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
            placeholder="Search by name, email, phone, requirements..."
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

        <span className="text-xs font-['Manrope'] text-zinc-500">
          Showing <strong className="text-zinc-900">{filteredDemos.length}</strong> demo requests
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-[#199250] rounded-full animate-spin mb-3" />
          <p className="text-sm font-['Manrope'] font-medium">Loading demo requests...</p>
        </div>
      ) : filteredDemos.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-zinc-200/80 p-8 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 text-[#199250] flex items-center justify-center mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-['Outfit'] font-bold text-lg text-zinc-900">
            {searchQuery ? "No matching demo requests found" : "No demo requests yet"}
          </h3>
          <p className="font-['Manrope'] text-xs sm:text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? "Try adjusting your search terms or clear the search box."
              : "Demo bookings from potential traders will appear here."}
          </p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-zinc-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-['Manrope'] text-xs sm:text-sm">
              <thead>
                <tr className="bg-zinc-50/90 border-b border-zinc-200 text-zinc-500 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Requester</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4 text-center">Requirement / Message</th>
                  <th className="py-3.5 px-4 text-center">Is Read</th>
                  <th className="py-3.5 px-4">Requested At</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredDemos.map((demo) => (
                  <tr
                    key={demo.id}
                    className="hover:bg-emerald-50/30 transition-colors group cursor-pointer"
                    onClick={() => handleSelectDemo(demo)}
                  >
                    {/* Requester Name & Email */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#199250] to-[#22c55e] flex items-center justify-center font-['Outfit'] font-bold text-xs text-white shrink-0 shadow-xs">
                          {demo.name ? demo.name[0].toUpperCase() : "D"}
                        </div>
                        <div>
                          <p className="font-['Outfit'] font-bold text-sm text-zinc-900 group-hover:text-[#199250] transition-colors">
                            {demo.name}
                          </p>
                          <a
                            href={`mailto:${demo.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-zinc-500 hover:text-[#199250] transition-colors"
                          >
                            {demo.email}
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <a
                        href={`tel:${demo.countryCode}${demo.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-mono text-zinc-700 hover:text-[#199250] transition-colors"
                      >
                        {demo.countryCode} {demo.phone}
                      </a>
                    </td>

                    {/* Message Preview */}
                    <td className="py-4 px-4 max-w-xs sm:max-w-sm text-center">
                      <p className="text-xs text-zinc-600 truncate italic text-center mx-auto">
                        &ldquo;{demo.message}&rdquo;
                      </p>
                    </td>

                    {/* Is Read Tick */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {demo.isRead === false ? (
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 border border-amber-200 text-amber-600 mx-auto"
                          title="Unread"
                        >
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 text-[#199250] shadow-2xs mx-auto"
                          title="Read"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-xs text-zinc-500 whitespace-nowrap font-mono">
                      {formatDateTime(demo.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {/* View Details */}
                        <button
                          onClick={() => setSelectedDemo(demo)}
                          title="View Full Demo Details"
                          className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDemoToDelete(demo)}
                          title="Delete Demo Request"
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
      )}

      {/* Demo Detail Slide-Over / Modal */}
      {selectedDemo && (
        <div
          onClick={() => setSelectedDemo(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in"
        >
          <div
            className="w-full max-w-xl rounded-3xl bg-white border border-zinc-200 p-6 sm:p-8 shadow-2xl text-zinc-900 font-['Manrope'] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#199250] flex items-center justify-center font-['Outfit'] font-bold text-base">
                  {selectedDemo.name ? selectedDemo.name[0].toUpperCase() : "D"}
                </div>
                <div>
                  <h3 className="font-['Outfit'] font-bold text-lg text-zinc-900">
                    {selectedDemo.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-zinc-500 font-mono">
                      Requested on {formatDateTime(selectedDemo.createdAt)}
                    </p>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100/90 text-zinc-600 border border-zinc-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Read
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDemo(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                <div>
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Email Address
                  </span>
                  <a
                    className="text-[#199250] font-semibold break-all mt-0.5 block"
                  >
                    {selectedDemo.email}
                  </a>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Phone Number
                  </span>
                  <a
                    className="text-[#199250] font-mono font-semibold mt-0.5 block"
                  >
                    {selectedDemo.countryCode} {selectedDemo.phone}
                  </a>
                </div>
              </div>

              {/* Message */}
              <div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                  Requirements / Notes
                </span>
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto font-sans">
                  {selectedDemo.message}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            {/* <div className="mt-6 pt-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  setDemoToDelete(selectedDemo);
                }}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-semibold transition-colors"
              >
                Delete Request
              </button>

              <div className="flex items-center gap-3">
                <a
                  href={`mailto:${selectedDemo.email}?subject=Profit Plus 1-on-1 Demo Session Scheduling&body=Hi ${encodeURIComponent(selectedDemo.name)},%0D%0A%0D%0AThank you for requesting a demo of Profit Plus.%0D%0A%0D%0APlease let us know your preferred date and time for a personalized walkthrough.%0D%0A%0D%0ABest regards,%0D%0AProfit Plus Team`}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#199250] to-[#1eb564] hover:from-[#147a42] hover:to-[#199250] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Schedule Demo via Email</span>
                </a>
              </div>
            </div> */}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!demoToDelete}
        isLoading={isDeleting}
        onClose={() => setDemoToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Demo Request"
        message={`Are you sure you want to delete the demo request from "${demoToDelete?.name}" (${demoToDelete?.email})? This action cannot be undone.`}
        confirmText="Yes, Delete Request"
      />
    </div>
  );
}
