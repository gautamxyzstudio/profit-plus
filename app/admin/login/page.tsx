"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useToast } from "../context/ToastContext";
import { IMAGES } from "@/constants/export";

type AuthMode = "login" | "forgot_email" | "forgot_otp" | "forgot_password" | "forgot_success";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const { success, error, warning } = useToast();

  // Mode
  const [mode, setMode] = useState<AuthMode>("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password flow state
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 10) score += 25;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strength = getPasswordStrength(newPassword);

  // --- Handlers ---

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      error("Login Failed", "Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email.trim(), password);

      if (result.success) {
        success("Welcome back!", "Logged in successfully to Admin Portal");
        router.replace("/admin");
      } else {
        error("Login Failed", result.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error", err);
      error("Login Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail.trim()) {
      warning("Email Required", "Please enter your admin email address.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        success("OTP Sent!", "A 6-digit verification code has been sent to your email.");
        setResendCooldown(60);
        setMode("forgot_otp");
      } else {
        error("Failed to Send OTP", data.message || "Could not send verification code.");
      }
    } catch (err) {
      console.error("Send OTP error", err);
      error("Network Error", "Could not connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      warning("Invalid Code", "Please enter the complete 6-digit code.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail.trim(),
          otp: cleanOtp,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        success("Code Verified", "Please set your new password.");
        setMode("forgot_password");
      } else {
        error("Verification Failed", data.message || "Invalid or expired code.");
      }
    } catch (err) {
      console.error("Verify OTP error", err);
      error("Network Error", "Could not verify code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      warning("Password Too Short", "New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      error("Password Mismatch", "Passwords do not match. Please re-check.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        success("Password Reset!", "Your password has been successfully updated.");
        setEmail(resetEmail.trim());
        setPassword("");
        setMode("forgot_success");
      } else {
        error("Reset Failed", data.message || "Could not reset password.");
      }
    } catch (err) {
      console.error("Reset password error", err);
      error("Network Error", "Could not reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4faf6] text-zinc-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-['Manrope']">
      {/* Soft Green Radiant Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-200/40 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[300px] bg-emerald-100/60 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Top Branding */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="h-12 flex items-center justify-center mb-4">
            <Image
              src={IMAGES.logo}
              alt="Profit Plus Logo"
              width={180}
              height={50}
              className="h-11 w-auto object-contain"
              priority
              unoptimized
            />
          </div>

          <h1 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-zinc-900 tracking-tight">
            Admin Portal
          </h1>
          <p className="font-['Manrope'] text-zinc-600 text-xs sm:text-sm mt-1">
            {mode === "login"
              ? "Sign in to manage blogs, view inquiries & demo requests"
              : "Secure Administrator Password Recovery"}
          </p>
        </div>

        {/* Card Content Based on Mode */}
        <div className="rounded-3xl bg-white border border-zinc-200/80 p-7 sm:p-9 shadow-xl shadow-emerald-950/5 transition-all">

          {/* MODE 1: Standard Login */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-5 animate-in fade-in duration-200">
              {/* Email Field */}
              <div>
                <label className="block font-['Outfit'] font-semibold text-xs uppercase tracking-wider text-zinc-700 mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@profitplus.us"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-['Manrope'] transition-all"
                  />
                </div>
              </div>

              {/* Password Field with Forgot Link */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-['Outfit'] font-semibold text-xs uppercase tracking-wider text-zinc-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setMode("forgot_email");
                    }}
                    className="text-xs font-['Manrope'] font-semibold text-[#199250] hover:text-[#147a42] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-['Manrope'] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#199250] to-[#1eb564] hover:from-[#147a42] hover:to-[#199250] active:scale-[0.98] text-white font-['Outfit'] font-bold text-sm shadow-lg shadow-emerald-700/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: Forgot Password - Step 1 (Enter Email) */}
          {mode === "forgot_email" && (
            <form onSubmit={handleSendOtp} className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h3 className="font-['Outfit'] font-bold text-base text-zinc-900">
                  Reset Password
                </h3>
              </div>

              <p className="text-xs text-zinc-500 leading-relaxed">
                Enter your admin account email. We will send you a 6-digit one-time verification code.
              </p>

              <div>
                <label className="block font-['Outfit'] font-semibold text-xs uppercase tracking-wider text-zinc-700 mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="admin@profitplus.us"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-['Manrope'] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#199250] to-[#1eb564] hover:from-[#147a42] hover:to-[#199250] active:scale-[0.98] text-white font-['Outfit'] font-bold text-sm shadow-lg shadow-emerald-700/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-xs text-zinc-500 hover:text-zinc-800 font-medium transition-colors"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* MODE 3: Forgot Password - Step 2 (Enter OTP) */}
          {mode === "forgot_otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                <button
                  type="button"
                  onClick={() => setMode("forgot_email")}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h3 className="font-['Outfit'] font-bold text-base text-zinc-900">
                  Enter 6-Digit Code
                </h3>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900">
                We sent a 6-digit OTP code to <strong className="font-semibold break-all">{resetEmail}</strong>. Please enter it below.
              </div>

              <div>
                <label className="block font-['Outfit'] font-semibold text-xs uppercase tracking-wider text-zinc-700 mb-2">
                  Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    autoFocus
                    className="w-full text-center py-3.5 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-2xl font-mono font-bold tracking-[8px] transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-['Manrope']">
                <span className="text-zinc-500">Didn&apos;t receive code?</span>
                {resendCooldown > 0 ? (
                  <span className="text-zinc-400 font-mono">
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="text-[#199250] hover:text-[#147a42] font-semibold transition-colors"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.trim().length !== 6}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#199250] to-[#1eb564] hover:from-[#147a42] hover:to-[#199250] active:scale-[0.98] text-white font-['Outfit'] font-bold text-sm shadow-lg shadow-emerald-700/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 4: Forgot Password - Step 3 (Set New Password) */}
          {mode === "forgot_password" && (
            <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in duration-200">
              <div className="pb-2 border-b border-zinc-100">
                <h3 className="font-['Outfit'] font-bold text-base text-zinc-900">
                  Set New Password
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Create a strong new password for your admin account.
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="block font-['Outfit'] font-semibold text-xs uppercase tracking-wider text-zinc-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-['Manrope'] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showNewPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Strength meter bar */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          strength <= 25
                            ? "w-1/4 bg-rose-500"
                            : strength <= 50
                            ? "w-2/4 bg-amber-500"
                            : strength <= 75
                            ? "w-3/4 bg-sky-500"
                            : "w-full bg-[#199250]"
                        }`}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      Strength:{" "}
                      <span
                        className={`font-semibold ${
                          strength <= 25
                            ? "text-rose-600"
                            : strength <= 50
                            ? "text-amber-600"
                            : strength <= 75
                            ? "text-sky-600"
                            : "text-[#199250]"
                        }`}
                      >
                        {strength <= 25 ? "Weak" : strength <= 50 ? "Fair" : strength <= 75 ? "Good" : "Strong"}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block font-['Outfit'] font-semibold text-xs uppercase tracking-wider text-zinc-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-['Manrope'] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#199250] to-[#1eb564] hover:from-[#147a42] hover:to-[#199250] active:scale-[0.98] text-white font-['Outfit'] font-bold text-sm shadow-lg shadow-emerald-700/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 5: Success State */}
          {mode === "forgot_success" && (
            <div className="text-center py-4 space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 text-[#199250] flex items-center justify-center shadow-md shadow-emerald-700/10">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h3 className="font-['Outfit'] font-black text-xl text-zinc-900">
                  Password Reset Successfully!
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  Your administrator password has been updated. You can now log in with your new credentials.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMode("login")}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#199250] to-[#1eb564] hover:from-[#147a42] hover:to-[#199250] active:scale-[0.98] text-white font-['Outfit'] font-bold text-sm shadow-lg shadow-emerald-700/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Back to Sign In</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Back to site link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="font-['Manrope'] text-xs text-zinc-500 hover:text-emerald-700 font-medium transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Public Website
          </a>
        </div>
      </div>
    </div>
  );
}
