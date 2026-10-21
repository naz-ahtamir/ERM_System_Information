"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getStoredToken } from "@/lib/api";
import Link from "next/link";

interface ProfileData {
  id: string;
  idKaryawan: string;
  nama: string;
  jabatan?: string;
  departemen?: string;
  divisi?: string;
  pusat?: string;
  perusahaan?: string;
  email?: string;
  role: string;
  tanggalLahir?: string;
  tempatLahir?: string;
  agama?: string;
  jenisKelamin?: string;
  pendidikan?: string;
  namaSekolah?: string;
  jurusan?: string;
  tanggalMulaiKerja?: string;
  umur?: number;
  masaKerja?: string;
  approved: boolean;
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-[#F3F4F6] last:border-0">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] sm:w-44 flex-shrink-0 mb-0.5 sm:mb-0">
        {label}
      </span>
      <span className="text-sm font-medium text-[#1F2937]">{value ?? "—"}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [form, setForm] = useState({
    nama: "",
    jabatan: "",
    departemen: "",
    divisi: "",
    email: "",
  });

  useEffect(() => {
    if (user?.id) fetchProfile();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchProfile = async () => {
    try {
      const token = getStoredToken();
      const res = await fetch(`/api/users/${user!.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setForm({
          nama: data.nama || "",
          jabatan: data.jabatan || "",
          departemen: data.departemen || "",
          divisi: data.divisi || "",
          email: data.email || "",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = getStoredToken();
      // User biasa hanya boleh kirim email; admin boleh kirim semua field
      const payload = user?.role === "admin"
        ? form
        : { email: form.email };
      const res = await fetch(`/api/users/${user!.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((p) => p ? { ...p, ...data.user } : p);
        setEditing(false);
        setToast({ msg: "Profile updated successfully", type: "success" });
      } else {
        setToast({ msg: data.message || "Failed to update", type: "error" });
      }
    } catch {
      setToast({ msg: "Unable to connect to server", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const initials = (profile?.nama || user?.nama || "")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  const roleBadge =
    profile?.role === "admin"
      ? "bg-red-100 text-red-700"
      : profile?.role === "supervisor"
      ? "bg-amber-100 text-amber-700"
      : "bg-blue-100 text-blue-700";

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-4 max-w-3xl mx-auto">
        <div className="h-8 w-48 bg-[#E5E7EB] rounded-lg" />
        <div className="h-32 bg-[#E5E7EB] rounded-xl mt-4" />
        <div className="h-64 bg-[#E5E7EB] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-[13px] font-semibold text-white ${toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"}`}>
          {toast.type === "success" ? "✓ " : "✕ "}{toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white px-6 md:px-10 py-8 border-b border-[#E5E7EB]">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#FFF1E8] border border-[#FF6B1A]/20 text-[11px] font-semibold text-[#FF6B1A] mb-2">
            Account Profile
          </div>
          <h1 className="font-extrabold text-[#1F2937] text-2xl md:text-3xl tracking-tight leading-tight">My Profile</h1>
          <p className="text-[#6B7280] text-xs mt-1">Lihat dan kelola informasi akun dan data kepegawaian Anda</p>
        </div>
      </div>

      <div className="px-6 md:px-10 py-8 max-w-3xl mx-auto space-y-6">

        {/* Avatar card */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF1E8] border border-[#FF6B1A]/20 flex items-center justify-center text-[#FF6B1A] font-bold text-2xl flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg text-[#1F2937] truncate">{profile?.nama}</h2>
            <p className="text-xs text-[#6B7280] truncate mt-0.5">{profile?.jabatan || "—"}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${roleBadge}`}>
                {profile?.role}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${profile?.approved ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-600 border border-rose-200"}`}>
                {profile?.approved ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className={`flex-shrink-0 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${editing ? "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]" : "bg-[#FF6B1A] text-white hover:bg-[#E85D0F] shadow-sm"}`}
          >
            {editing ? "Batal" : "Edit Profil"}
          </button>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="bg-white rounded-xl border border-[#FF6B1A]/30 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-sm text-[#1F2937]">Edit Informasi Profil</h3>
              {user?.role !== "admin" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF1E8] border border-[#FF6B1A]/20 text-[11px] font-semibold text-[#E85D0F] rounded-lg">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Hanya email yang dapat diubah
                </span>
              )}
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Nama Lengkap", key: "nama" },
                  { label: "Jabatan", key: "jabatan" },
                  { label: "Departemen", key: "departemen" },
                  { label: "Divisi", key: "divisi" },
                ].map(({ label, key }) => {
                  const isLocked = user?.role !== "admin";
                  return (
                    <div key={key}>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#374151] mb-1.5">
                        {label}
                        {isLocked && (
                          <svg className="inline ml-1.5 text-[#9CA3AF]" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        )}
                      </label>
                      <input
                        type="text"
                        value={(form as any)[key]}
                        disabled={isLocked}
                        onChange={(e) => !isLocked && setForm({ ...form, [key]: e.target.value })}
                        className={`w-full px-3.5 py-2.5 border text-sm rounded-lg focus:outline-none transition-colors ${
                          isLocked
                            ? "bg-[#F9FAFB] border-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
                            : "bg-white border-[#E5E7EB] text-[#1F2937] focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20"
                        }`}
                      />
                    </div>
                  );
                })}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#374151] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Opsional"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] text-sm text-[#1F2937] rounded-lg focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-[#FF6B1A] text-white font-semibold text-xs rounded-lg hover:bg-[#E85D0F] shadow-sm transition-colors disabled:opacity-60">
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="px-5 py-2.5 bg-[#F3F4F6] text-[#374151] font-semibold text-xs rounded-lg hover:bg-[#E5E7EB] transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Personal info */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="font-bold text-sm text-[#1F2937]">Informasi Pribadi</h3>
          </div>
          <div className="px-6 py-2">
            <InfoRow label="ID Karyawan" value={profile?.idKaryawan} />
            <InfoRow label="Nama Lengkap" value={profile?.nama} />
            <InfoRow label="Jabatan" value={profile?.jabatan} />
            <InfoRow label="Departemen" value={profile?.departemen} />
            <InfoRow label="Divisi" value={profile?.divisi} />
            <InfoRow label="Perusahaan" value={profile?.perusahaan} />
            <InfoRow label="Email" value={profile?.email && !profile.email.endsWith("@smk3.local") ? profile.email : undefined} />
          </div>
        </div>

        {/* Employment info */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="font-bold text-sm text-[#1F2937]">Detail Kepegawaian</h3>
          </div>
          <div className="px-6 py-2">
            <InfoRow label="Role" value={profile?.role} />
            <InfoRow label="Tanggal Mulai Kerja" value={profile?.tanggalMulaiKerja ? new Date(profile.tanggalMulaiKerja).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : undefined} />
            <InfoRow label="Masa Kerja" value={profile?.masaKerja} />
            <InfoRow label="Status Akun" value={profile?.approved ? "Aktif" : "Non-aktif"} />
          </div>
        </div>

        {/* Personal data */}
        {(profile?.tanggalLahir || profile?.tempatLahir || profile?.agama || profile?.jenisKelamin) && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="font-bold text-sm text-[#1F2937]">Data Pribadi Tambahan</h3>
            </div>
            <div className="px-6 py-2">
              <InfoRow label="Tanggal Lahir" value={profile?.tanggalLahir ? new Date(profile.tanggalLahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : undefined} />
              <InfoRow label="Tempat Lahir" value={profile?.tempatLahir} />
              <InfoRow label="Usia" value={profile?.umur ? `${profile.umur} tahun` : undefined} />
              <InfoRow label="Jenis Kelamin" value={profile?.jenisKelamin} />
              <InfoRow label="Agama" value={profile?.agama} />
              <InfoRow label="Pendidikan" value={profile?.pendidikan} />
              <InfoRow label="Sekolah / Universitas" value={profile?.namaSekolah} />
              <InfoRow label="Jurusan" value={profile?.jurusan} />
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/change-password"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] text-xs text-[#374151] font-semibold rounded-lg hover:border-[#FF6B1A] hover:text-[#FF6B1A] transition-colors shadow-xs"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
            Ganti Password
          </Link>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] text-xs text-[#374151] font-semibold rounded-lg hover:border-[#FF6B1A] hover:text-[#FF6B1A] transition-colors shadow-xs"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Pengaturan
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] text-xs text-[#374151] font-semibold rounded-lg hover:border-[#FF6B1A] hover:text-[#FF6B1A] transition-colors shadow-xs"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
            </svg>
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
