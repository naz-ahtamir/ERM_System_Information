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
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="animate-pulse text-[#6B7280] text-sm font-medium">Mengalihkan...</div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="animate-pulse text-[#6B7280] text-sm font-medium">Memuat...</div>
      </div>
    }>
      <RedirectContent />
    </Suspense>
  );
}
