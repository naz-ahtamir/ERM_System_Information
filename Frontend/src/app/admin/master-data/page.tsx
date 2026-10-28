'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function MasterDataRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'pelatihan') {
      router.replace('/admin/daftar-pelatihan');
    } else if (tab === 'pic') {
      router.replace('/admin/org-structure?tab=pic');
    } else if (tab === 'departemen') {
      router.replace('/admin/org-structure?tab=departemen');
    } else if (tab === 'divisi') {
      router.replace('/admin/org-structure?tab=divisi');
    } else {
      router.replace('/admin/org-structure');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[#FF6B1A] border-t-transparent rounded-full animate-spin" />
        <p className="text-[13px] text-[#6B7280]">Mengalihkan ke modul admin yang sesuai...</p>
      </div>
    </div>
  );
}

export default function MasterDataPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#FF6B1A] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MasterDataRedirect />
    </Suspense>
  );
}
