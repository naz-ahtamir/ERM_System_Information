"use client";

/**
 * /reset-password — Redirect ke /change-password?token=...
 * Halaman ini hanya sebagai alias / shortcut dari forgot-password flow.
 */
import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function RedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      router.replace(`/change-password?token=${token}`);
    } else {
      router.replace("/forgot-password");
    }
  }, [token, router]);

  return (
    <div className="min-h-screen bg-[#f1f0ee] flex items-center justify-center">
      <div className="animate-pulse text-[#6b6560] text-[14px]">Mengalihkan...</div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f1f0ee] flex items-center justify-center">
        <div className="animate-pulse text-[#6b6560] text-[14px]">Memuat...</div>
      </div>
    }>
      <RedirectContent />
    </Suspense>
  );
}
