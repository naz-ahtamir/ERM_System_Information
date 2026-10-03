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
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-[#f1f0ee] last:border-0">
      <span className="text-[11px] font-bold uppercase tracking-wide text-[#6b6560] sm:w-44 flex-shrink-0 mb-0.5 sm:mb-0">
        {label}
      </span>
      <span className="text-[14px] text-[#231f20]">{value ?? "—"}</span>
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
      <div className="p-8 animate-pulse space-y-4">
        <div className="h-8 w-48 bg-[#e5e0db] rounded" />
        <div className="h-32 bg-[#e5e0db] rounded-xl mt-4" />
        <div className="h-64 bg-[#e5e0db] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f0ee]">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-[13px] font-semibold text-white ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.type === "success" ? "✓ " : "✕ "}{toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-[#231f20] px-6 md:px-10 py-8 border-b-[3px] border-b-[#f15a22]">
        <div className="max-w-3xl mx-auto">
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-2">Account</div>
          <h1 className="font-bold text-white text-[clamp(28px,5vw,42px)] leading-tight">My Profile</h1>
          <p className="text-[#8a8580] text-[13px] mt-1">View and manage your personal information</p>
        </div>
      </div>

      <div className="px-6 md:px-10 py-8 max-w-3xl mx-auto space-y-6">

        {/* Avatar card */}
        <div className="bg-white rounded-xl border border-[#e5e0db] p-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-[#f15a22] flex items-center justify-center text-white font-bold text-[28px] flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-[20px] text-[#231f20] truncate">{profile?.nama}</h2>
            <p className="text-[14px] text-[#6b6560] truncate">{profile?.jabatan || "—"}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-full ${roleBadge}`}>
                {profile?.role}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-full ${profile?.approved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {profile?.approved ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className={`flex-shrink-0 px-4 py-2 text-[12px] font-bold rounded-lg transition-colors ${editing ? "bg-[#e5e0db] text-[#231f20] hover:bg-[#d0cbc6]" : "bg-[#f15a22] text-white hover:bg-[#d44d1a]"}`}
          >
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="bg-white rounded-xl border border-[#f15a22] p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-[15px] text-[#231f20]">Edit Information</h3>
              {user?.role !== "admin" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-700 rounded-lg">
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
                  { label: "Full Name", key: "nama" },
                  { label: "Position / Jabatan", key: "jabatan" },
                  { label: "Department", key: "departemen" },
                  { label: "Division", key: "divisi" },
                ].map(({ label, key }) => {
                  const isLocked = user?.role !== "admin";
                  return (
                    <div key={key}>
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">
                        {label}
                        {isLocked && (
                          <svg className="inline ml-1.5 text-[#c5c0bb]" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        )}
                      </label>
                      <input
                        type="text"
                        value={(form as any)[key]}
                        disabled={isLocked}
                        onChange={(e) => !isLocked && setForm({ ...form, [key]: e.target.value })}
                        className={`w-full px-3.5 py-2.5 border text-[14px] rounded-lg focus:outline-none transition-colors ${
                          isLocked
                            ? "bg-[#f1f0ee] border-[#e5e0db] text-[#a09a95] cursor-not-allowed"
                            : "bg-white border-[#c5c0bb] text-[#231f20] focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
                        }`}
                      />
                    </div>
                  );
                })}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="optional"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#c5c0bb] text-[14px] text-[#231f20] rounded-lg focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22] placeholder:text-[#c5c0bb]"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#f15a22] text-white font-bold text-[13px] rounded-lg hover:bg-[#d44d1a] transition-colors disabled:opacity-60">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="px-6 py-2.5 bg-[#e5e0db] text-[#231f20] font-bold text-[13px] rounded-lg hover:bg-[#d0cbc6] transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Personal info */}
        <div className="bg-white rounded-xl border border-[#e5e0db] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e5e0db]">
            <h3 className="font-bold text-[15px] text-[#231f20]">Personal Information</h3>
          </div>
          <div className="px-6 py-2">
            <InfoRow label="Employee ID" value={profile?.idKaryawan} />
            <InfoRow label="Full Name" value={profile?.nama} />
            <InfoRow label="Position" value={profile?.jabatan} />
            <InfoRow label="Department" value={profile?.departemen} />
            <InfoRow label="Division" value={profile?.divisi} />
            <InfoRow label="Company" value={profile?.perusahaan} />
            <InfoRow label="Email" value={profile?.email && !profile.email.endsWith("@smk3.local") ? profile.email : undefined} />
          </div>
        </div>

        {/* Employment info */}
        <div className="bg-white rounded-xl border border-[#e5e0db] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e5e0db]">
            <h3 className="font-bold text-[15px] text-[#231f20]">Employment Details</h3>
          </div>
          <div className="px-6 py-2">
            <InfoRow label="Role" value={profile?.role} />
            <InfoRow label="Start Date" value={profile?.tanggalMulaiKerja ? new Date(profile.tanggalMulaiKerja).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : undefined} />
            <InfoRow label="Length of Service" value={profile?.masaKerja} />
            <InfoRow label="Account Status" value={profile?.approved ? "Active" : "Inactive"} />
          </div>
        </div>

        {/* Personal data */}
        {(profile?.tanggalLahir || profile?.tempatLahir || profile?.agama || profile?.jenisKelamin) && (
          <div className="bg-white rounded-xl border border-[#e5e0db] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e5e0db]">
              <h3 className="font-bold text-[15px] text-[#231f20]">Personal Data</h3>
            </div>
            <div className="px-6 py-2">
              <InfoRow label="Date of Birth" value={profile?.tanggalLahir ? new Date(profile.tanggalLahir).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : undefined} />
              <InfoRow label="Place of Birth" value={profile?.tempatLahir} />
              <InfoRow label="Age" value={profile?.umur ? `${profile.umur} years old` : undefined} />
              <InfoRow label="Gender" value={profile?.jenisKelamin} />
              <InfoRow label="Religion" value={profile?.agama} />
              <InfoRow label="Education" value={profile?.pendidikan} />
              <InfoRow label="School / University" value={profile?.namaSekolah} />
              <InfoRow label="Major" value={profile?.jurusan} />
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/change-password"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#c5c0bb] text-[13px] text-[#231f20] font-medium rounded-lg hover:border-[#f15a22] hover:text-[#f15a22] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
            Change Password
          </Link>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#c5c0bb] text-[13px] text-[#231f20] font-medium rounded-lg hover:border-[#f15a22] hover:text-[#f15a22] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#c5c0bb] text-[13px] text-[#231f20] font-medium rounded-lg hover:border-[#f15a22] hover:text-[#f15a22] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
