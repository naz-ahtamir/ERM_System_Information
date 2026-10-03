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
    role === 'admin'    ? 'bg-red-500/20 text-red-400' :
    role === 'supervisor' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400';

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[280px] bg-[#231f20] border-b border-[#3a3535] px-4 py-0 z-40 h-14 flex items-center">
      <div className="flex items-center justify-between w-full">
        {/* Left — empty or breadcrumb placeholder */}
        <div className="flex-1" />

        {/* Right — notification bell + user avatar dropdown */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <NotificationDropdown
            notifications={notifications}
            unreadCount={unreadCount}
          />

          {/* User Avatar Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 pl-3 border-l border-[#3a3535] hover:opacity-80 transition-opacity"
              aria-label="User menu"
            >
              {/* Avatar circle only */}
              <div className="w-8 h-8 rounded-full bg-[#f15a22] flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0 ring-2 ring-[#3a3535]">
                {initials}
              </div>
              {/* Chevron */}
              <svg
                width="12" height="12"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className={`text-[#6b6560] transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* Dropdown panel */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#2a2526] border border-[#3a3535] rounded-xl shadow-2xl overflow-hidden z-50">
                {/* User info header */}
                <div className="px-4 py-3.5 border-b border-[#3a3535]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f15a22] flex items-center justify-center text-white font-bold text-[15px] flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate">{name}</p>
                      {email && !email.endsWith('@smk3.local') && (
                        <p className="text-[11px] text-[#6b6560] truncate">{email}</p>
                      )}
                      <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${roleBadge}`}>
                        {role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  <Link
                    href="/change-password"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#c5c0bb] hover:bg-[rgba(241,90,34,0.12)] hover:text-white transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                    Change Password
                  </Link>

                  {role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#c5c0bb] hover:bg-[rgba(241,90,34,0.12)] hover:text-white transition-colors"
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
                <div className="border-t border-[#3a3535] py-1.5">
                  <button
                    onClick={() => { setMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
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
