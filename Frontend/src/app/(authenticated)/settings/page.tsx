"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

type Section = "account" | "security" | "notifications" | "appearance";

function SectionButton({ id, active, icon, label, onClick }: {
  id: Section; active: boolean;
  icon: React.ReactNode; label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-left transition-colors ${
        active
          ? "bg-[#FFF1E8] text-[#FF6B1A]"
          : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1F2937]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState<Section>("account");

  // Notification prefs (local state only — extend with backend if needed)
  const [notifPrefs, setNotifPrefs] = useState({
    findingSubmitted: true,
    approvalRequired: true,
    deadlineReminder: true,
    licenseExpiring: true,
    emailNotif: false,
  });

  // Appearance
  const [compactMode, setCompactMode] = useState(false);

  const toggle = (key: keyof typeof notifPrefs) =>
    setNotifPrefs((p) => ({ ...p, [key]: !p[key] }));

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${checked ? "bg-[#FF6B1A]" : "bg-[#E5E7EB]"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-1"}`} />
    </button>
  );

  const SettingRow = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3.5 border-b border-[#F3F4F6] last:border-0">
      <div>
        <p className="text-sm font-semibold text-[#1F2937]">{label}</p>
        {description && <p className="text-xs text-[#6B7280] mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white px-6 md:px-10 py-8 border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#FFF1E8] border border-[#FF6B1A]/20 text-[11px] font-semibold text-[#FF6B1A] mb-2">
            System Settings
          </div>
          <h1 className="font-extrabold text-[#1F2937] text-2xl md:text-3xl tracking-tight leading-tight">Pengaturan</h1>
          <p className="text-[#6B7280] text-xs mt-1">Kelola preferensi akun dan konfigurasi sistem Anda</p>
        </div>
      </div>

      <div className="px-6 md:px-10 py-8 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Sidebar nav */}
          <div className="md:w-52 flex-shrink-0">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-2 space-y-0.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <SectionButton id="account" active={active === "account"} onClick={() => setActive("account")} label="Akun"
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              />
              <SectionButton id="security" active={active === "security"} onClick={() => setActive("security")} label="Keamanan"
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              />
              <SectionButton id="notifications" active={active === "notifications"} onClick={() => setActive("notifications")} label="Notifikasi"
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
              />
              <SectionButton id="appearance" active={active === "appearance"} onClick={() => setActive("appearance")} label="Tampilan"
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>}
              />
            </div>
          </div>

          {/* Content panel */}
          <div className="flex-1 min-w-0">

            {/* ── Account ── */}
            {active === "account" && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E5E7EB]">
                  <h2 className="font-bold text-base text-[#1F2937]">Informasi Akun</h2>
                  <p className="text-xs text-[#6B7280] mt-0.5">Identitas profil Anda di sistem ERM SMK3</p>
                </div>
                <div className="px-6 py-2">
                  <SettingRow label="ID Karyawan" description="Tidak dapat diubah">
                    <span className="font-mono text-xs text-[#4B5563] bg-[#F3F4F6] px-3 py-1.5 rounded-lg border border-[#E5E7EB]">{user?.idKaryawan}</span>
                  </SettingRow>
                  <SettingRow label="Nama Lengkap" description="Dikelola oleh administrator">
                    <span className="text-sm font-semibold text-[#1F2937]">{user?.nama || user?.name}</span>
                  </SettingRow>
                  <SettingRow label="Role Akses" description="Ditentukan oleh administrator">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                      user?.role === "admin" ? "bg-[#FFF1E8] text-[#FF6B1A] border border-[#FF6B1A]/20" :
                      user?.role === "supervisor" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                      "bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]"
                    }`}>{user?.role}</span>
                  </SettingRow>
                  <SettingRow label="Departemen" description="Dikelola oleh administrator">
                    <span className="text-sm text-[#1F2937]">{user?.departemen || "—"}</span>
                  </SettingRow>
                </div>
                {/* Role restriction notice */}
                {user?.role !== "admin" && (
                  <div className="mx-6 mb-4 mt-2 flex items-start gap-2.5 px-4 py-3 bg-[#FFF1E8] border border-[#FF6B1A]/20 rounded-xl">
                    <svg className="flex-shrink-0 mt-0.5 text-[#FF6B1A]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <p className="text-xs text-[#E85D0F] leading-relaxed">
                      Nama, jabatan, departemen, dan divisi hanya dapat diubah oleh <strong>admin</strong>. Anda hanya dapat memperbarui <strong>email</strong> melalui halaman Edit Profil.
                    </p>
                  </div>
                )}
                <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#FAFAFA]">
                  <Link href="/profile" className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B1A] text-white text-xs font-semibold rounded-lg hover:bg-[#E85D0F] shadow-sm transition-colors">
                    {user?.role === "admin" ? "Edit Profil →" : "Perbarui Email →"}
                  </Link>
                </div>
              </div>
            )}

            {/* ── Security ── */}
            {active === "security" && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E5E7EB]">
                    <h2 className="font-bold text-base text-[#1F2937]">Password & Keamanan</h2>
                    <p className="text-xs text-[#6B7280] mt-0.5">Kelola kata sandi dan akses akun</p>
                  </div>
                  <div className="px-6 py-2">
                    <SettingRow label="Kata Sandi" description="Ganti kata sandi secara berkala">
                      <Link href="/change-password" className="px-4 py-2 bg-[#FF6B1A] text-white text-xs font-semibold rounded-lg hover:bg-[#E85D0F] shadow-sm transition-colors">
                        Ganti Password
                      </Link>
                    </SettingRow>
                    <SettingRow label="Reset Password" description="Gunakan ID karyawan untuk reset via token">
                      <Link href="/forgot-password" className="px-4 py-2 bg-white border border-[#E5E7EB] text-xs font-semibold text-[#374151] rounded-lg hover:border-[#FF6B1A] hover:text-[#FF6B1A] transition-colors">
                        Lupa Password
                      </Link>
                    </SettingRow>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E5E7EB]">
                    <h2 className="font-bold text-base text-[#1F2937]">Sesi Aktif</h2>
                  </div>
                  <div className="px-6 py-2">
                    <SettingRow label="Sesi Saat Ini" description="Token autentikasi aktif — kedaluwarsa dalam 7 hari">
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Aktif
                      </span>
                    </SettingRow>
                    <SettingRow label="Keluar Akun" description="Logout dari perangkat saat ini">
                      <button
                        onClick={() => logout()}
                        className="px-4 py-2 bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                      >
                        Keluar
                      </button>
                    </SettingRow>
                  </div>
                </div>
              </div>
            )}

            {/* ── Notifications ── */}
            {active === "notifications" && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E5E7EB]">
                  <h2 className="font-bold text-base text-[#1F2937]">Preferensi Notifikasi</h2>
                  <p className="text-xs text-[#6B7280] mt-0.5">Pilih jenis pemberitahuan yang ingin Anda terima</p>
                </div>
                <div className="px-6 py-2">
                  <SettingRow label="Temuan Baru Dilaporkan" description="Pemberitahuan saat ada temuan K3 baru dimasukkan">
                    <Toggle checked={notifPrefs.findingSubmitted} onChange={() => toggle("findingSubmitted")} />
                  </SettingRow>
                  <SettingRow label="Approval Dibutuhkan" description="Pemberitahuan saat temuan CLSD membutuhkan verifikasi Anda">
                    <Toggle checked={notifPrefs.approvalRequired} onChange={() => toggle("approvalRequired")} />
                  </SettingRow>
                  <SettingRow label="Pengingat Tenggat Waktu" description="Pengingat sebelum batas waktu perbaikan berakhir">
                    <Toggle checked={notifPrefs.deadlineReminder} onChange={() => toggle("deadlineReminder")} />
                  </SettingRow>
                  <SettingRow label="Masa Berlaku Izin/Lisensi" description="Pemberitahuan ketika lisensi objek K3 mendekati kedaluwarsa">
                    <Toggle checked={notifPrefs.licenseExpiring} onChange={() => toggle("licenseExpiring")} />
                  </SettingRow>
                </div>
                <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#FAFAFA]">
                  <p className="text-xs text-[#6B7280]">
                    Pemberitahuan email memerlukan alamat email yang valid pada profil akun Anda.
                  </p>
                </div>
              </div>
            )}

            {/* ── Appearance ── */}
            {active === "appearance" && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E5E7EB]">
                  <h2 className="font-bold text-base text-[#1F2937]">Tampilan & Desain</h2>
                  <p className="text-xs text-[#6B7280] mt-0.5">Sesuaikan preferensi visual antarmuka aplikasi</p>
                </div>
                <div className="px-6 py-2">
                  <SettingRow label="Tema Visual" description="Tema Modern Minimalist SaaS (Orange & White)">
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-[#FFF1E8] text-[#FF6B1A] border border-[#FF6B1A]/20 text-xs font-semibold rounded-lg">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B1A]" /> Modern Orange & White
                    </span>
                  </SettingRow>
                  <SettingRow label="Mode Rapat (Compact Mode)" description="Kurangi padding pada baris tabel dan kartu">
                    <Toggle checked={compactMode} onChange={() => setCompactMode(!compactMode)} />
                  </SettingRow>
                  <SettingRow label="Bahasa Sistem" description="Bahasa utama antarmuka pengguna">
                    <span className="text-xs font-semibold text-[#1F2937] bg-[#F3F4F6] px-3 py-1.5 rounded-lg border border-[#E5E7EB]">Bahasa Indonesia / English</span>
                  </SettingRow>
                </div>
                <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#FAFAFA]">
                  <p className="text-xs text-[#6B7280]">Desain diselaraskan dengan standar Minimalist Enterprise Dashboard.</p>
                </div>
              </div>
            )}

            {/* Back link */}
            <div className="mt-4">
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B7280] hover:text-[#FF6B1A] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
                </svg>
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
