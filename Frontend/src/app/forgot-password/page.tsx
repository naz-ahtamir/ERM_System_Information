"use client";

import { useState } from "react";
import Link from "next/link";

type Step = "form" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("form");
  const [idKaryawan, setIdKaryawan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState(""); // Hanya di dev mode

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idKaryawan.trim()) {
      setError("ID Karyawan wajib diisi");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idKaryawan: idKaryawan.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Terjadi kesalahan. Coba lagi.");
        return;
      }

      // Dev mode: jika backend kasih resetToken, tampilkan link langsung
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }

      setStep("success");
    } catch {
      setError("Gagal menghubungi server. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#FFF1E8] border border-[#FF6B1A]/20 rounded-2xl mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="font-bold text-2xl text-[#1F2937] tracking-tight">Lupa Password</h1>
          <p className="text-xs text-[#6B7280] mt-1.5">
            Masukkan ID Karyawan untuk mendapatkan token reset
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E7EB] p-8">
          {step === "form" ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#374151] mb-1.5">
                    ID Karyawan
                  </label>
                  <input
                    type="text"
                    value={idKaryawan}
                    onChange={(e) => { setIdKaryawan(e.target.value); setError(""); }}
                    placeholder="Contoh: 82400469"
                    autoFocus
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
                      Memproses...
                    </span>
                  ) : "Kirim Token Reset"}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[#E5E7EB] text-center">
                <p className="text-xs text-[#6B7280]">
                  Ingat password?{" "}
                  <Link href="/login" className="text-[#FF6B1A] font-semibold hover:underline">
                    Kembali Login
                  </Link>
                </p>
              </div>
            </>
          ) : (
            /* ── Success State ── */
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>

              <div>
                <h2 className="font-bold text-[18px] text-[#1F2937]">Token Dibuat!</h2>
                <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                  Token reset password untuk ID Karyawan <strong>{idKaryawan}</strong> telah dibuat dan berlaku 1 jam.
                </p>
              </div>

              {/* Dev mode: tampilkan token */}
              {resetToken && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1.5">
                    Dev Mode — Token Reset
                  </p>
                  <p className="text-xs text-amber-900 break-all font-mono">
                    {resetToken}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2.5 pt-2">
                <Link
                  href={resetToken ? `/reset-password?token=${resetToken}` : "/reset-password"}
                  className="w-full py-2.5 bg-[#FF6B1A] text-white font-semibold text-sm rounded-lg hover:bg-[#E85D0F] shadow-sm transition-colors text-center"
                >
                  Lanjut ke Reset Password
                </Link>
                <Link
                  href="/login"
                  className="w-full py-2.5 bg-[#F3F4F6] text-[#374151] font-semibold text-sm rounded-lg hover:bg-[#E5E7EB] transition-colors text-center"
                >
                  Kembali ke Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
