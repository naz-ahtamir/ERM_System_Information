"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getStoredToken } from "@/lib/api";

interface EditForm {
  nama: string;
  jabatan: string;
  departemen: string;
  email: string;
}

export function UserProfileCard() {
  const { user, setUser } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState<EditForm>({
    nama: user?.nama || "",
    jabatan: (user as any)?.jabatan || "",
    departemen: user?.departemen || "",
    email: user?.email || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!user) return null;

  const roleLabel =
    user.role === "admin" ? "Administrator" :
    user.role === "supervisor" ? "Supervisor" : "User";

  const roleBadgeClass =
    user.role === "admin"
      ? "bg-[#f15a22] text-white"
      : user.role === "supervisor"
      ? "bg-blue-100 text-blue-700"
      : "bg-[#e5e0db] text-[#231f20]";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const token = getStoredToken();
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal menyimpan perubahan");
        return;
      }
      // Update AuthContext user state
      setUser({
        ...user,
        nama: form.nama || user.nama,
        name: form.nama || user.nama,
        departemen: form.departemen || user.departemen,
        department: form.departemen || user.departemen,
        email: form.email || user.email,
      });
      setSuccessMsg("Profil berhasil diperbarui");
      setShowEdit(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Gagal menghubungi server");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = () => {
    setForm({
      nama: user.nama || "",
      jabatan: (user as any)?.jabatan || "",
      departemen: user.departemen || "",
      email: user.email || "",
    });
    setError("");
    setShowEdit(true);
  };

  return (
    <div className="bg-white rounded-xl border border-[#e5e0db] shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="bg-[#231f20] px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-[#f15a22] flex items-center justify-center text-white font-bold text-[18px] select-none">
            {(user.nama || user.name || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-white font-bold text-[15px] leading-tight">
              {user.nama || user.name}
            </div>
            <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${roleBadgeClass}`}>
              {roleLabel}
            </span>
          </div>
        </div>
        <button
          onClick={openEdit}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#3a3535] hover:bg-[#f15a22] text-white text-[12px] font-semibold rounded-lg transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>
      </div>

      {/* Success Toast */}
      {successMsg && (
        <div className="px-6 py-2.5 bg-green-50 border-b border-green-200 text-green-700 text-[13px] font-semibold flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {successMsg}
        </div>
      )}

      {/* Profile Info */}
      {!showEdit ? (
        <div className="p-6 space-y-3">
          <InfoRow
            icon={<IdIcon />}
            label="ID Karyawan"
            value={user.idKaryawan}
            mono
          />
          <InfoRow
            icon={<BriefcaseIcon />}
            label="Jabatan"
            value={(user as any)?.jabatan || "—"}
          />
          <InfoRow
            icon={<BuildingIcon />}
            label="Departemen"
            value={user.departemen || "—"}
          />
          {user.email && (
            <InfoRow
              icon={<EmailIcon />}
              label="Email"
              value={user.email}
            />
          )}

          {/* Quick actions */}
          <div className="pt-3 border-t border-[#f1f0ee] flex flex-wrap gap-2">
            <Link
              href="/change-password"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#faf9f7] border border-[#e5e0db] text-[#6b6560] text-[12px] font-semibold rounded-lg hover:border-[#f15a22] hover:text-[#f15a22] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Ganti Password
            </Link>
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#faf9f7] border border-[#e5e0db] text-[#6b6560] text-[12px] font-semibold rounded-lg hover:border-[#f15a22] hover:text-[#f15a22] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* ── Edit Form ── */
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <p className="text-[12px] text-[#6b6560]">Edit informasi profil Anda di bawah ini.</p>

          {[
            { label: "Nama Lengkap", field: "nama", type: "text" },
            { label: "Jabatan", field: "jabatan", type: "text" },
            { label: "Departemen", field: "departemen", type: "text" },
            { label: "Email", field: "email", type: "email" },
          ].map(({ label, field, type }) => (
            <div key={field}>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">
                {label}
              </label>
              <input
                type={type}
                value={(form as any)[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#faf9f7] border border-[#e5e0db] text-[13px] text-[#231f20] rounded-lg focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
              />
            </div>
          ))}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[13px]">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-[#f15a22] text-white font-bold text-[13px] rounded-lg hover:bg-[#d44d1a] transition-colors disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => { setShowEdit(false); setError(""); }}
              className="flex-1 py-2.5 bg-[#e5e0db] text-[#231f20] font-bold text-[13px] rounded-lg hover:bg-[#d0cbc6] transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────
function InfoRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-[#c5c0bb] shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wide text-[#6b6560]">{label}</div>
        <div className={`text-[13px] text-[#231f20] font-medium mt-0.5 ${mono ? "font-mono" : ""}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

function IdIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
