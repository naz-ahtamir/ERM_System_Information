"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getStoredToken } from "@/lib/api";

// ── Reset Password (via token from forgot-password flow) ──────────────────
function ResetPasswordForm({ token }: { token: string }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid or expired token. Please request a new one.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="font-bold text-[18px] text-[#231f20]">Password Reset Successful</h2>
        <p className="text-[13px] text-[#6b6560]">You can now log in with your new password.</p>
        <Link
          href="/login"
          className="inline-block w-full py-3 bg-[#f15a22] text-white font-bold text-[14px] rounded-xl hover:bg-[#d44d1a] transition-colors text-center"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="font-bold text-[18px] text-[#231f20]">Reset Password</h2>
        <p className="text-[13px] text-[#6b6560] mt-1">Enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[12px] font-bold uppercase tracking-wide text-[#231f20] mb-2">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
            placeholder="Minimum 6 characters"
            autoFocus
            className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e5e0db] text-[14px] text-[#231f20] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 placeholder:text-[#c5c0bb]"
          />
        </div>
        <div>
          <label className="block text-[12px] font-bold uppercase tracking-wide text-[#231f20] mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
            placeholder="Repeat new password"
            className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e5e0db] text-[14px] text-[#231f20] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 placeholder:text-[#c5c0bb]"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[13px] flex items-start gap-2">
            <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#f15a22] text-white font-bold text-[14px] rounded-xl hover:bg-[#d44d1a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Saving...
            </span>
          ) : "Reset Password"}
        </button>
      </form>
    </>
  );
}

// ── Change Password (logged-in user) ─────────────────────────────────────
// Calls /api/auth/me/change-password — backend reads user ID from JWT
function ChangePasswordForm() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword) {
      setError("Current password is required");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const token = getStoredToken();

      if (!token) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      // Use /me/change-password — backend reads user ID from JWT, no URL param needed
      const res = await fetch("/api/auth/me/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Map common backend error messages to English
        const msg: string = data.message || "";
        if (msg.includes("tidak sesuai") || msg.toLowerCase().includes("incorrect") || msg.toLowerCase().includes("invalid")) {
          setError("Current password is incorrect");
        } else if (msg.includes("tidak boleh sama") || msg.toLowerCase().includes("same")) {
          setError("New password must be different from the current password");
        } else {
          setError(msg || "Failed to update password. Please try again.");
        }
        return;
      }
      setSuccess(true);
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="font-bold text-[18px] text-[#231f20]">Password Updated!</h2>
        <p className="text-[13px] text-[#6b6560]">Use your new password the next time you log in.</p>
        <Link
          href="/dashboard"
          className="inline-block w-full py-3 bg-[#f15a22] text-white font-bold text-[14px] rounded-xl hover:bg-[#d44d1a] transition-colors text-center"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="font-bold text-[18px] text-[#231f20]">Change Password</h2>
        <p className="text-[13px] text-[#6b6560] mt-1">
          Hi <strong>{user?.nama}</strong>, enter your current password to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[12px] font-bold uppercase tracking-wide text-[#231f20] mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => { setCurrentPassword(e.target.value); setError(""); }}
            placeholder="Your current password"
            autoFocus
            className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e5e0db] text-[14px] text-[#231f20] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 placeholder:text-[#c5c0bb]"
          />
        </div>
        <div>
          <label className="block text-[12px] font-bold uppercase tracking-wide text-[#231f20] mb-2">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
            placeholder="Minimum 6 characters"
            className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e5e0db] text-[14px] text-[#231f20] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 placeholder:text-[#c5c0bb]"
          />
        </div>
        <div>
          <label className="block text-[12px] font-bold uppercase tracking-wide text-[#231f20] mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
            placeholder="Repeat new password"
            className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e5e0db] text-[14px] text-[#231f20] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 placeholder:text-[#c5c0bb]"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[13px] flex items-start gap-2">
            <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#f15a22] text-white font-bold text-[14px] rounded-xl hover:bg-[#d44d1a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Saving...
            </span>
          ) : "Update Password"}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-[#e5e0db] text-center">
        <Link href="/dashboard" className="text-[13px] text-[#6b6560] hover:text-[#f15a22] transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </>
  );
}

// ── Page Wrapper — check ?token= query param ──────────────────────────────
function ChangePasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="min-h-screen bg-[#f1f0ee] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#231f20] rounded-2xl mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f15a22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          </div>
          <h1 className="font-bold text-[24px] text-[#231f20]">
            {token ? "Reset Password" : "Change Password"}
          </h1>
          <p className="text-[13px] text-[#6b6560] mt-1">SMK3 · Safety Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e0db] p-8">
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <ChangePasswordForm />
          )}
        </div>

        {!token && (
          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-[13px] text-[#6b6560] hover:text-[#f15a22] transition-colors">
              Forgot your password?
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f1f0ee] flex items-center justify-center">
          <div className="animate-pulse text-[#6b6560] text-[14px]">Loading...</div>
        </div>
      }
    >
      <ChangePasswordContent />
    </Suspense>
  );
}
