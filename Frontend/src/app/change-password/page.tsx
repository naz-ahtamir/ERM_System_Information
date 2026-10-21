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
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="font-bold text-[18px] text-[#1F2937]">Password Reset Berhasil</h2>
        <p className="text-[13px] text-[#6B7280]">Anda sekarang dapat masuk dengan password baru Anda.</p>
        <Link
          href="/login"
          className="inline-block w-full py-2.5 bg-[#FF6B1A] text-white font-semibold text-sm rounded-lg hover:bg-[#E85D0F] shadow-sm transition-colors text-center"
        >
          Masuk ke Akun
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="font-bold text-[18px] text-[#1F2937]">Reset Password</h2>
        <p className="text-[13px] text-[#6B7280] mt-1">Masukkan password baru Anda di bawah ini.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#374151] mb-1.5">
            Password Baru
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
            placeholder="Minimal 6 karakter"
            autoFocus
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] text-sm text-[#1F2937] rounded-lg focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 placeholder:text-[#9CA3AF] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#374151] mb-1.5">
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
            placeholder="Ulangi password baru"
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] text-sm text-[#1F2937] rounded-lg focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 placeholder:text-[#9CA3AF] transition-colors"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-start gap-2">
            <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[#FF6B1A] text-white font-semibold text-sm rounded-lg hover:bg-[#E85D0F] shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Menyimpan...
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
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="font-bold text-[18px] text-[#1F2937]">Password Berhasil Diperbarui</h2>
        <p className="text-[13px] text-[#6B7280]">Gunakan password baru Anda untuk login berikutnya.</p>
        <Link
          href="/dashboard"
          className="inline-block w-full py-2.5 bg-[#FF6B1A] text-white font-semibold text-sm rounded-lg hover:bg-[#E85D0F] shadow-sm transition-colors text-center"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="font-bold text-[18px] text-[#1F2937]">Ganti Password</h2>
        <p className="text-[13px] text-[#6B7280] mt-1">
          Halo <strong>{user?.nama || user?.name}</strong>, masukkan password Anda saat ini untuk melanjutkan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#374151] mb-1.5">
            Password Saat Ini
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => { setCurrentPassword(e.target.value); setError(""); }}
            placeholder="Password lama Anda"
            autoFocus
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] text-sm text-[#1F2937] rounded-lg focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 placeholder:text-[#9CA3AF] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#374151] mb-1.5">
            Password Baru
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
            placeholder="Minimal 6 karakter"
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] text-sm text-[#1F2937] rounded-lg focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 placeholder:text-[#9CA3AF] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#374151] mb-1.5">
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
            placeholder="Ulangi password baru"
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] text-sm text-[#1F2937] rounded-lg focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 placeholder:text-[#9CA3AF] transition-colors"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-start gap-2">
            <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[#FF6B1A] text-white font-semibold text-sm rounded-lg hover:bg-[#E85D0F] shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Menyimpan...
            </span>
          ) : "Perbarui Password"}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-[#E5E7EB] text-center">
        <Link href="/dashboard" className="text-xs font-semibold text-[#6B7280] hover:text-[#FF6B1A] transition-colors">
          ← Kembali ke Dashboard
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
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#FFF1E8] border border-[#FF6B1A]/20 rounded-2xl mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          </div>
          <h1 className="font-bold text-2xl text-[#1F2937] tracking-tight">
            {token ? "Reset Password" : "Ganti Password"}
          </h1>
          <p className="text-xs text-[#6B7280] mt-1.5">SMK3 · Safety Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E7EB] p-8">
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <ChangePasswordForm />
          )}
        </div>

        {!token && (
          <div className="mt-5 text-center">
            <Link href="/forgot-password" className="text-xs font-semibold text-[#6B7280] hover:text-[#FF6B1A] transition-colors">
              Lupa password Anda?
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
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <div className="animate-pulse text-[#6B7280] text-sm font-medium">Memuat...</div>
        </div>
      }
    >
      <ChangePasswordContent />
    </Suspense>
  );
}
