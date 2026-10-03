'use client';

/**
 * AuthenticatedShell — komponen wrapper sidebar yang bisa dipakai
 * di semua folder yang perlu layout terautentikasi (smk3, admin, findings, dst.)
 * 
 * Ini mencegah sidebar hilang saat navigasi antar halaman.
 */

import React, { useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { useNotificationPolling } from '@/hooks/useNotificationPolling';

function SidebarSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#f1f0ee]">
      <div className="fixed top-0 left-0 h-screen w-[280px] bg-[#231f20] border-r-[3px] border-r-[#f15a22] flex flex-col md:sticky md:top-0 md:h-screen md:flex-shrink-0 z-[200]">
        <div className="flex items-center gap-3.5 px-6 py-5 border-b border-[#3a3535]">
          <div className="w-10 h-10 bg-[#f15a22] rounded-lg flex items-center justify-center font-extrabold text-lg text-white flex-shrink-0">K3</div>
          <div>
            <div className="h-4 w-28 bg-[#3a3535] rounded animate-pulse mb-1" />
            <div className="h-2.5 w-36 bg-[#3a3535] rounded animate-pulse" />
          </div>
        </div>
        <div className="flex-1 px-3 py-4 space-y-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-9 bg-[#3a3535] rounded-lg animate-pulse mx-1" />
          ))}
        </div>
        <div className="flex items-center gap-2.5 px-5 py-4 border-t border-[#3a3535]">
          <div className="w-7 h-7 rounded-full bg-[#3a3535] animate-pulse" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-24 bg-[#3a3535] rounded animate-pulse" />
            <div className="h-2.5 w-32 bg-[#3a3535] rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0 p-6">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-[#e5e0db] rounded animate-pulse" />
          <div className="h-4 w-72 bg-[#e5e0db] rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[1,2,3].map((i) => (
              <div key={i} className="h-28 bg-[#e5e0db] rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useNotificationPolling();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading || !user) return <SidebarSkeleton />;

  return (
    <div className="flex min-h-screen bg-[#f1f0ee]">
      <Sidebar
        user={{
          name: user.nama || user.name || '',
          role: user.role || 'user',
          email: user.email || `${user.idKaryawan}@smk3.local`,
        }}
        onLogout={handleLogout}
      />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <TopHeader
          user={{
            name: user.nama || user.name || '',
            role: user.role || 'user',
            email: user.email || `${user.idKaryawan}@smk3.local`,
          }}
        />
        <div className="pt-14">
          {children}
        </div>
      </main>
    </div>
  );
}
