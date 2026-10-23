"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { name: "HOME", href: "/" },
  { name: "SAFETY COMPLAIN", href: "/contact" },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const avatarRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Tutup semua saat route berubah
  useEffect(() => {
    setMobileOpen(false);
    setAvatarOpen(false);
  }, [pathname]);

  // Lock scroll saat mobile menu buka
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  const isAdmin = user?.role === "admin";
  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "U";

  const linkClass = (href: string) =>
    `text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
      isActive(href)
        ? "text-[#FF6B1A] bg-[#FFF1E8]"
        : "text-white hover:text-[#111827] hover:bg-gray-100"
    }`;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="h-[72px] flex items-center justify-between px-5 md:px-10 max-w-7xl mx-auto">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            {/* <div className="w-9 h-9 bg-[#FF6B1A] rounded-xl flex items-center justify-center
                            text-white font-bold text-sm shadow-xs ring-2 ring-[#FFF1E8]">
              K3
            </div> */}
            <div className="hidden sm:block">
              <div className="font-bold text-sm text-white leading-tight group-hover:text-[#FF6B1A] transition-colors">
                ERM DEPARTMENT
              </div>
              <div className="text-[10px] text-white/70 font-medium tracking-wide uppercase">
                PT. QMB New Energy Materials
              </div>
            </div>
            {/* Mobile fallback */}
            <div className="sm:hidden font-bold text-xs text-white uppercase tracking-wider">
              ERM DEPARTMENT
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1.5">

            {/* Nav links */}
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                {link.name}
              </Link>
            ))}

            {/* Divider */}
            <div className="w-px h-5 bg-[#E5E7EB] mx-2" />

            {/* Auth area */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-1">
                {/* Tombol Dashboard */}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 bg-[#FF6B1A] text-white hover:bg-[#E85D0F] rounded-lg shadow-xs hover:shadow transition-all"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Dashboard
                </Link>

                {/* Avatar dropdown */}
                <div className="relative" ref={avatarRef}>
                  <button
                    onClick={() => setAvatarOpen(prev => !prev)}
                    className="w-8 h-8 rounded-full bg-[#FFF1E8] border border-[#FF6B1A]/30 flex items-center
                               justify-center text-[#FF6B1A] font-bold text-xs hover:border-[#FF6B1A] transition-colors shadow-xs"
                    aria-label="User menu"
                  >
                    {userInitial}
                  </button>

                  {avatarOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56
                                    bg-white border border-[#E5E7EB] rounded-2xl
                                    shadow-xl py-1.5 z-50 animate-slide-in">
                      {/* User info */}
                      <div className="px-4 py-3 bg-[#FAFAFA] border-b border-[#E5E7EB] mb-1">
                        <div className="font-bold text-xs text-[#1F2937] truncate">
                          {user?.name}
                        </div>
                        <div className="text-[11px] text-[#6B7280] truncate mt-0.5">
                          {user?.role} · {user?.email}
                        </div>
                      </div>

                      <div className="p-1 space-y-0.5">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#4B5563] hover:text-[#FF6B1A] hover:bg-[#FFF1E8] rounded-lg transition-colors"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                          </svg>
                          Dashboard
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#FF6B1A] hover:bg-[#FFF1E8] rounded-lg transition-colors"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
                            </svg>
                            Admin Panel
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-[#E5E7EB] pt-1 px-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold text-white px-4 py-2 rounded-lg border border-white/40 hover:border-[#FF6B1A] hover:text-[#FF6B1A] hover:bg-[#FFF1E8]/40 transition-all ml-1 shadow-xs"
              >
                LOGIN
              </Link>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg text-white hover:bg-gray-100/20 transition-colors z-50"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(prev => !prev)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300
                    ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <div
        className={`fixed top-[72px] right-0 bottom-0 w-[280px] bg-white border-l border-[#E5E7EB] z-40
                    lg:hidden transform transition-transform duration-300 overflow-y-auto shadow-2xl
                    ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="py-4">

          {/* User info jika login */}
          {isAuthenticated && (
            <div className="px-5 pb-4 mb-2 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#FFF1E8] border border-[#FF6B1A]/30 rounded-full flex items-center
                                justify-center text-[#FF6B1A] font-bold text-sm flex-shrink-0 shadow-xs">
                  {userInitial}
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-sm text-[#1F2937] truncate">
                    {user?.name}
                  </div>
                  <div className="text-[11px] text-[#6B7280] truncate">
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nav links */}
          <div className="px-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`block font-semibold text-sm py-2.5 px-4 rounded-lg transition-all
                            ${isActive(link.href)
                              ? "bg-[#FFF1E8] text-[#FF6B1A]"
                              : "text-[#4B5563] hover:bg-gray-100 hover:text-[#1F2937]"
                            }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="mt-4 pt-4 border-t border-[#E5E7EB] px-3 space-y-1.5">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 font-semibold
                             text-sm py-2.5 px-4 bg-[#FF6B1A] text-white hover:bg-[#E85D0F]
                             transition-all rounded-lg shadow-xs"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Masuk ke Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block font-semibold text-sm py-2.5 px-4 text-[#FF6B1A] hover:bg-[#FFF1E8] rounded-lg transition-all"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left font-semibold text-sm py-2.5 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block text-center font-semibold text-sm py-2.5 px-4 bg-[#FF6B1A] text-white hover:bg-[#E85D0F] rounded-lg transition-all shadow-xs"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
