"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  referralCode?: string | null;
  countryCode: string;
  phone: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
}

export default function ContactInquiriesPage() {
  const { authFetch } = useAdminAuth();
  const { success, error } = useToast();

  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterReferralOnly, setFilterReferralOnly] = useState(false);

  // Selected for full detail modal
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);

  // Delete modal
  const [inquiryToDelete, setInquiryToDelete] = useState<ContactInquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/contact-us");
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.data || []);
      } else {
        error("Error", "Failed to fetch contact inquiries");
      }
    } catch (err) {
      console.error("Error fetching inquiries", err);
      error("Network Error", "Could not load inquiries list");
    } finally {
      setLoading(false);
    }
  }, [authFetch, error]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Lock html and body scroll when inquiry modal is open
  useEffect(() => {
    if (selectedInquiry) {
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
  }, [selectedInquiry]);

  const handleDelete = async () => {
    if (!inquiryToDelete) return;
    setIsDeleting(true);

    try {
      const res = await authFetch(`/api/contact-us/${encodeURIComponent(inquiryToDelete.id)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        success("Inquiry Deleted", `Inquiry from "${inquiryToDelete.name}" was removed.`);
        setInquiries((prev) => prev.filter((item) => item.id !== inquiryToDelete.id));
        setInquiryToDelete(null);
        if (selectedInquiry?.id === inquiryToDelete.id) {
          setSelectedInquiry(null);
        }
        window.dispatchEvent(new Event("admin_stats_updated"));
      } else {
        const data = await res.json();
        error("Delete Failed", data.message || "Could not delete inquiry");
      }
    } catch (err) {
      console.error("Delete error", err);
      error("Delete Error", "An unexpected error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (inquiries.length === 0) return;

    const headers = ["ID", "Date", "Name", "Email", "Country Code", "Phone", "Referral Code", "Message"];
    const rows = inquiries.map((item) => [
      `"${item.id}"`,
      `"${new Date(item.createdAt).toISOString()}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.email.replace(/"/g, '""')}"`,
      `"${item.countryCode}"`,
      `"${item.phone}"`,
      `"${(item.referralCode || "").replace(/"/g, '""')}"`,
      `"${item.message.replace(/"/g, '""').replace(/\n/g, " ")}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `profit_plus_inquiries_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Export Complete", "Inquiries downloaded as CSV.");
  };

  const filteredInquiries = inquiries.filter((item) => {
    if (filterReferralOnly && !item.referralCode) {
      return false;
    }
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      item.name.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.phone.includes(query) ||
      (item.referralCode && item.referralCode.toLowerCase().includes(query)) ||
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
          <div className="flex items-center gap-2">
            <h2 className="font-['Outfit'] font-black text-2xl text-zinc-900 tracking-tight">
              Contact Inquiries
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-bold">
              {inquiries.length} Total
            </span>
          </div>
          <p className="font-['Manrope'] text-xs sm:text-sm text-zinc-500 mt-1">
            Review user messages, client support tickets, and referral submissions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={inquiries.length === 0}
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
            placeholder="Search by name, email, phone, message..."
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

        {/* Filter Toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-['Manrope'] text-zinc-600 font-medium">
            <input
              type="checkbox"
              checked={filterReferralOnly}
              onChange={(e) => setFilterReferralOnly(e.target.checked)}
              className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>With Referral Code Only</span>
          </label>

          <span className="text-xs font-['Manrope'] text-zinc-500">
            Showing <strong className="text-zinc-900">{filteredInquiries.length}</strong> inquiries
          </span>
        </div>
      </div>

      {/* Inquiries Table */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-[#199250] rounded-full animate-spin mb-3" />
          <p className="text-sm font-['Manrope'] font-medium">Loading contact inquiries...</p>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-zinc-200/80 p-8 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 text-[#199250] flex items-center justify-center mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="font-['Outfit'] font-bold text-lg text-zinc-900">
            {searchQuery || filterReferralOnly ? "No matching inquiries found" : "No contact inquiries yet"}
          </h3>
          <p className="font-['Manrope'] text-xs sm:text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            {searchQuery || filterReferralOnly
              ? "Try adjusting your search query or reset the filter."
              : "Inquiries submitted via the public Contact Us page will appear here."}
          </p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-zinc-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-['Manrope'] text-xs sm:text-sm">
              <thead>
                <tr className="bg-zinc-50/90 border-b border-zinc-200 text-zinc-500 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Sender Details</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4 text-center">Referral</th>
                  <th className="py-3.5 px-4 text-center">Message Snippet</th>
                  <th className="py-3.5 px-4">Received</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredInquiries.map((inq) => (
                  <tr
                    key={inq.id}
                    className="hover:bg-emerald-50/30 transition-colors group cursor-pointer"
                    onClick={() => setSelectedInquiry(inq)}
                  >
                    {/* Sender Details */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#199250] to-[#22c55e] flex items-center justify-center font-['Outfit'] font-bold text-xs text-white shrink-0 shadow-xs">
                          {inq.name ? inq.name[0].toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="font-['Outfit'] font-bold text-sm text-zinc-900 group-hover:text-[#199250] transition-colors">
                            {inq.name}
                          </p>
                          <a
                            href={`mailto:${inq.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-zinc-500 hover:text-[#199250] transition-colors"
                          >
                            {inq.email}
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <a
                        href={`tel:${inq.countryCode}${inq.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-mono text-zinc-700 hover:text-[#199250] transition-colors"
                      >
                        {inq.countryCode} {inq.phone}
                      </a>
                    </td>

                    {/* Referral Code */}
                    <td className="py-4 px-4 whitespace-nowrap text-center">
                      {inq.referralCode ? (
                        <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {inq.referralCode}
                        </span>
                      ) : (
                        <span className="text-zinc-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Message Preview */}
                    <td className="py-4 px-4 max-w-xs sm:max-w-sm text-center">
                      <p className="text-xs text-zinc-600 truncate italic text-center mx-auto">
                        &ldquo;{inq.message}&rdquo;
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-xs text-zinc-500 whitespace-nowrap font-mono">
                      {formatDateTime(inq.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {/* View Modal */}
                        <button
                          onClick={() => setSelectedInquiry(inq)}
                          title="View Full Inquiry"
                          className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setInquiryToDelete(inq)}
                          title="Delete Inquiry"
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

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div
          onClick={() => setSelectedInquiry(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in"
        >
          <div
            className="w-full max-w-xl rounded-3xl bg-white border border-zinc-200 p-6 sm:p-8 shadow-2xl text-zinc-900 font-['Manrope'] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#199250] flex items-center justify-center font-['Outfit'] font-bold text-base">
                  {selectedInquiry.name ? selectedInquiry.name[0].toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="font-['Outfit'] font-bold text-lg text-zinc-900">
                    {selectedInquiry.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    Received {formatDateTime(selectedInquiry.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
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
                    {selectedInquiry.email}
                  </a>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Phone Number
                  </span>
                  <a
                    className="text-[#199250] font-mono font-semibold mt-0.5 block"
                  >
                    {selectedInquiry.countryCode} {selectedInquiry.phone}
                  </a>
                </div>

                {selectedInquiry.referralCode && (
                  <div className="sm:col-span-2 pt-2 border-t border-zinc-200">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                      Referral Code Used
                    </span>
                    <span className="inline-block mt-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold text-xs">
                      {selectedInquiry.referralCode}
                    </span>
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                  Message Content
                </span>
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            {/* <div className="mt-6 pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  setInquiryToDelete(selectedInquiry);
                }}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors"
              >
                Delete Inquiry
              </button>

              <div className="flex items-center gap-3">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Regarding your inquiry with Profit Plus&body=Hi ${encodeURIComponent(selectedInquiry.name)},%0D%0A%0D%0AThank you for reaching out to Profit Plus.%0D%0A%0D%0A`}
                  className="px-5 py-2.5 rounded-xl bg-[#199250] hover:bg-[#147a42] text-white text-xs sm:text-sm font-bold shadow-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Reply via Email</span>
                </a>
              </div>
            </div> */}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!inquiryToDelete}
        isLoading={isDeleting}
        onClose={() => setInquiryToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Contact Inquiry"
        message={`Are you sure you want to delete the message from "${inquiryToDelete?.name}" (${inquiryToDelete?.email})? This record will be permanently deleted.`}
        confirmText="Yes, Delete Inquiry"
      />
    </div>
  );
}
