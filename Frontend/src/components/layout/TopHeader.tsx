'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { useNotifications } from '@/contexts/NotificationContext';

interface TopHeaderProps {
  user?: {
    name: string;
    role: string;
    email: string;
  } | null;
}

export function TopHeader({ user: propsUser }: TopHeaderProps) {
  const { user: authUser, logout } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayUser = propsUser || authUser;
  const name  = (authUser as any)?.nama || displayUser?.name || '';
  const role  = displayUser?.role || 'user';
  const email = displayUser?.email || '';
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || '?';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const roleBadge =
    role === 'admin'      ? 'bg-red-50 text-red-700 border border-red-200' :
    role === 'supervisor' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-[#FFF1E8] text-[#FF6B1A] border border-[#FF6B1A]/30';

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[280px] bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-4 md:px-6 z-40 h-14 flex items-center transition-all">
      <div className="flex items-center justify-between w-full">
        {/* Left — breadcrumbs / system info */}
        <div className="flex items-center gap-2">
          {/* <div className="hidden sm:flex items-center gap-2 text-xs text-[#6B7280]">
            <span className="font-semibold text-[#1F2937]">ERM SYSTEM</span>
            <span className="text-gray-300">/</span>
            <span className="text-[#9CA3AF]">PT. QMB New Energy Materials</span>
          </div> */}
        </div>

        {/* Right — notification bell + user avatar dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Bell */}
          <NotificationDropdown
            notifications={notifications}
            unreadCount={unreadCount}
          />

          {/* User Avatar Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#E5E7EB] hover:opacity-90 transition-opacity"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-[#FF6B1A] flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-xs ring-2 ring-[#FFF1E8]">
                {initials}
              </div>
              <div className="hidden sm:block text-left mr-0.5">
                <p className="text-xs font-semibold text-[#1F2937] leading-tight truncate max-w-[130px]">{name}</p>
                {/* <p className="text-[10px] text-[#6B7280] uppercase tracking-wider font-medium">{role}</p> */}
              </div>
              <svg
                width="12" height="12"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className={`text-[#6B7280] transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* Dropdown panel */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden z-50 animate-slide-in">
                {/* User info header */}
                <div className="px-4 py-3.5 bg-[#FAFAFA] border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FF6B1A] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-xs ring-2 ring-[#FFF1E8]">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1F2937] truncate">{name}</p>
                      {email && !email.endsWith('@smk3.local') && (
                        <p className="text-[11px] text-[#6B7280] truncate">{email}</p>
                      )}
                      <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${roleBadge}`}>
                        {role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5 space-y-0.5">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#374151] rounded-lg hover:bg-[#FFF1E8] hover:text-[#FF6B1A] transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                    Profile Saya
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#374151] rounded-lg hover:bg-[#FFF1E8] hover:text-[#FF6B1A] transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Pengaturan
                  </Link>

                  <Link
                    href="/change-password"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#374151] rounded-lg hover:bg-[#FFF1E8] hover:text-[#FF6B1A] transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                    Ubah Password
                  </Link>

                  {role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#FF6B1A] rounded-lg hover:bg-[#FFF1E8] transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      Admin Panel
                    </Link>
                  )}
                </div>

                {/* Divider + Logout */}
                <div className="border-t border-[#E5E7EB] p-1.5 bg-[#FAFAFA]">
                  <button
                    onClick={() => { setMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Keluar (Sign Out)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
