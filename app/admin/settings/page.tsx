"use client";

import React, { useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useToast } from "../context/ToastContext";

export default function AdminSettingsPage() {
  const { user, authFetch, logout } = useAdminAuth();
  const { success, error, warning } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<"otp_send" | "otp_verify" | "otp_reset">("otp_send");
  const [otpCode, setOtpCode] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotConfirmPass, setForgotConfirmPass] = useState("");
  const [showForgotNewPass, setShowForgotNewPass] = useState(false);
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotCooldown, setForgotCooldown] = useState(0);

  // Resend cooldown timer for settings modal
  React.useEffect(() => {
    if (forgotCooldown > 0) {
      const timer = setTimeout(() => setForgotCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [forgotCooldown]);

  const forgotStrength = getPasswordStrength(forgotNewPass);

  const handleSendForgotOtp = async () => {
    if (!user?.email) {
      error("Missing Email", "Admin email could not be determined.");
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (res.ok) {
        success("OTP Sent!", `A 6-digit verification code was sent to ${user.email}`);
        setForgotCooldown(60);
        setForgotStep("otp_verify");
      } else {
        error("Failed to Send OTP", data.message || "Could not send verification code.");
      }
    } catch (err) {
      console.error("Send OTP error", err);
      error("Network Error", "Could not connect to server.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleVerifyForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    const clean = otpCode.trim();
    if (clean.length !== 6) {
      warning("Invalid Code", "Please enter 6 digits.");
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, otp: clean }),
      });
      const data = await res.json();
      if (res.ok) {
        success("Code Verified", "Please choose your new password.");
        setForgotStep("otp_reset");
      } else {
        error("Verification Failed", data.message || "Invalid or expired code.");
      }
    } catch (err) {
      console.error("Verify OTP error", err);
      error("Network Error", "Could not verify code.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResetForgotPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    if (!forgotNewPass || forgotNewPass.length < 6) {
      warning("Password Too Short", "New password must be at least 6 characters.");
      return;
    }

    if (forgotNewPass !== forgotConfirmPass) {
      error("Password Mismatch", "Passwords do not match.");
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          otp: otpCode.trim(),
          newPassword: forgotNewPass,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        success("Password Reset!", "Your password has been successfully reset.");
        setShowForgotModal(false);
        setForgotStep("otp_send");
        setOtpCode("");
        setForgotNewPass("");
        setForgotConfirmPass("");
      } else {
        error("Reset Failed", data.message || "Could not reset password.");
      }
    } catch (err) {
      console.error("Reset password error", err);
      error("Network Error", "Could not reset password.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      warning("Missing Password", "Please enter your current password.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      warning("Password Too Short", "New password must be at least 6 characters long.");
      return;
    }

    if (newPassword === currentPassword) {
      warning("Same Password", "New password must be different from current password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      error("Password Mismatch", "New password and confirmation do not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await authFetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        success("Password Updated!", "Your admin password was changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        error("Update Failed", data.message || "Could not change password.");
      }
    } catch (err) {
      console.error("Change password error", err);
      error("Network Error", "An error occurred while changing password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300 pb-16 font-['Manrope']">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs">
        <h2 className="font-['Outfit'] font-black text-2xl text-zinc-900 tracking-tight">
          Admin Settings &amp; Security
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Manage your administrator profile, security credentials, and system configurations
        </p>
      </div>

      {/* Admin Profile Details */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <h3 className="font-['Outfit'] font-bold text-lg text-zinc-900">
            Administrator Profile
          </h3>
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-bold uppercase tracking-wider">
            {user?.role || "ADMIN"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#199250] to-[#22c55e] flex items-center justify-center font-['Outfit'] font-black text-3xl text-white shadow-md shadow-emerald-700/20 shrink-0">
            {user?.name ? user.name[0].toUpperCase() : "A"}
          </div>

          <div className="space-y-1">
            <h4 className="font-['Outfit'] font-bold text-xl text-zinc-900">
              {user?.name || "Administrator"}
            </h4>
            <p className="text-sm text-[#199250] font-medium">
              {user?.email || "admin@profitplus.us"}
            </p>
            <p className="text-xs text-zinc-500">
              Account Role: <strong className="text-zinc-700 font-semibold">{user?.role}</strong> (Full Administrative Control)
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-6">
        <div className="border-b border-zinc-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-['Outfit'] font-bold text-lg text-zinc-900">
              Change Password
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Update your account password regularly to ensure admin account safety
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForgotModal(true);
              setForgotStep("otp_send");
              setOtpCode("");
              setForgotNewPass("");
              setForgotConfirmPass("");
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#199250] hover:text-[#147a42] bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/70 px-3 py-1.5 rounded-xl transition-all self-start sm:self-auto cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Forgot Current Password? Reset via OTP
          </button>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-5 max-w-lg">
          {/* Current Password */}
          <div>
            <label className="block font-['Outfit'] font-semibold text-xs uppercase tracking-wider text-zinc-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-['Manrope'] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
              >
                {showCurrentPassword ? (
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

          {/* New Password */}
          <div>
            <label className="block font-['Outfit'] font-semibold text-xs uppercase tracking-wider text-zinc-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-['Manrope'] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
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
                <p className="text-[11px] text-zinc-500">
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
            <label className="block font-['Outfit'] font-semibold text-xs uppercase tracking-wider text-zinc-700 mb-2">
              Confirm New Password
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
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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
            disabled={isChangingPassword}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#199250] to-[#1eb564] hover:from-[#147a42] hover:to-[#199250] text-white font-['Outfit'] font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isChangingPassword ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>
      </div>

      {/* Forgot Password OTP Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200/80 animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="pr-8 mb-6">
              <h3 className="font-['Outfit'] font-black text-xl text-zinc-900">
                Reset Password via OTP
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Securely reset your admin password using a one-time verification code.
              </p>
            </div>

            {/* Step 1: Send OTP */}
            {forgotStep === "otp_send" && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1">
                  <p className="font-semibold text-zinc-900">Registered Admin Email:</p>
                  <p className="font-mono text-[#199250] font-bold text-sm break-all">{user?.email}</p>
                  <p className="text-[11px] text-zinc-500 pt-1">
                    Click below to receive a 6-digit one-time passcode to this email.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSendForgotOtp}
                  disabled={isForgotLoading}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#199250] to-[#1eb564] hover:from-[#147a42] hover:to-[#199250] text-white font-['Outfit'] font-bold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isForgotLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <span>Send Verification Code</span>
                  )}
                </button>
              </div>
            )}

            {/* Step 2: Verify OTP */}
            {forgotStep === "otp_verify" && (
              <form onSubmit={handleVerifyForgotOtp} className="space-y-5">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900">
                  Verification code sent to <strong className="font-semibold">{user?.email}</strong>.
                </div>

                <div>
                  <label className="block font-['Outfit'] font-semibold text-xs uppercase tracking-wider text-zinc-700 mb-2">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    autoFocus
                    className="w-full text-center py-3 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-2xl font-mono font-bold tracking-[8px] focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Didn&apos;t receive code?</span>
                  {forgotCooldown > 0 ? (
                    <span className="text-zinc-400 font-mono">Resend in {forgotCooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendForgotOtp}
                      disabled={isForgotLoading}
                      className="text-[#199250] hover:text-[#147a42] font-semibold"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep("otp_send")}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-['Outfit'] font-semibold text-xs transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading || otpCode.trim().length !== 6}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#199250] to-[#1eb564] hover:from-[#147a42] hover:to-[#199250] text-white font-['Outfit'] font-bold text-xs shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50"
                  >
                    {isForgotLoading ? "Verifying..." : "Verify Code"}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Set New Password */}
            {forgotStep === "otp_reset" && (
              <form onSubmit={handleResetForgotPass} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block font-['Outfit'] font-semibold text-xs uppercase tracking-wider text-zinc-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showForgotNewPass ? "text" : "password"}
                      required
                      value={forgotNewPass}
                      onChange={(e) => setForgotNewPass(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-4 pr-11 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-['Manrope'] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPass(!showForgotNewPass)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600"
                    >
                      {showForgotNewPass ? (
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

                  {forgotNewPass && (
                    <div className="mt-1.5 space-y-1">
                      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            forgotStrength <= 25
                              ? "w-1/4 bg-rose-500"
                              : forgotStrength <= 50
                              ? "w-2/4 bg-amber-500"
                              : forgotStrength <= 75
                              ? "w-3/4 bg-sky-500"
                              : "w-full bg-[#199250]"
                          }`}
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        Strength:{" "}
                        <span
                          className={`font-semibold ${
                            forgotStrength <= 25
                              ? "text-rose-600"
                              : forgotStrength <= 50
                              ? "text-amber-600"
                              : forgotStrength <= 75
                              ? "text-sky-600"
                              : "text-[#199250]"
                          }`}
                        >
                          {forgotStrength <= 25 ? "Weak" : forgotStrength <= 50 ? "Fair" : forgotStrength <= 75 ? "Good" : "Strong"}
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
                      type={showForgotConfirmPass ? "text" : "password"}
                      required
                      value={forgotConfirmPass}
                      onChange={(e) => setForgotConfirmPass(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-4 pr-11 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-['Manrope'] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600"
                    >
                      {showForgotConfirmPass ? (
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

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep("otp_verify")}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-['Outfit'] font-semibold text-xs transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#199250] to-[#1eb564] hover:from-[#147a42] hover:to-[#199250] text-white font-['Outfit'] font-bold text-xs shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50"
                  >
                    {isForgotLoading ? "Saving..." : "Save New Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
