"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredToken, centersApi, departmentsApi, divisionsApi, type Center, type Division } from "@/lib/api";

interface User {
  id: string;
  idKaryawan: string;
  nama: string;
  jabatan?: string;
  departemen?: string;
  email?: string;
  role: string;
  approved: boolean;
  supervisorId?: string | null;
  // FK fields baru
  centerId?: string | null;
  departmentId?: string | null;
  divisionId?: string | null;
}

type FilterStatus = "all" | "active" | "inactive";

// ── Edit Modal ──────────────────────────────────────────
function EditUserModal({
  user,
  onClose,
  onSave,
}: {
  user: User;
  onClose: () => void;
  onSave: (updated: Partial<User>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    nama:         user.nama         || "",
    jabatan:      user.jabatan      || "",
    departemen:   user.departemen   || "",
    email:        user.email        || "",
    centerId:     user.centerId     || "",
    departmentId: user.departmentId || "",
    divisionId:   user.divisionId   || "",
  });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  // Data untuk dropdown
  const [centers,   setCenters]   = useState<Center[]>([]);
  const [allDepts,  setAllDepts]  = useState<any[]>([]);
  const [allDivs,   setAllDivs]   = useState<Division[]>([]);

  useEffect(() => {
    centersApi.getAll().then(setCenters).catch(() => {});
    departmentsApi.getAll().then(setAllDepts).catch(() => {});
    divisionsApi.getAll().then(setAllDivs).catch(() => {});
  }, []);

  // Filter berdasarkan pilihan bertingkat
  const filteredDepts = form.centerId
    ? allDepts.filter((d: any) => d.centerId === form.centerId)
    : allDepts;

  const filteredDivs = form.departmentId
    ? allDivs.filter(d => d.departmentId === form.departmentId)
    : allDivs;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({
        nama:         form.nama,
        jabatan:      form.jabatan,
        departemen:   form.departemen,
        email:        form.email,
        centerId:     form.centerId     || null,
        departmentId: form.departmentId || null,
        divisionId:   form.divisionId   || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3.5 py-2.5 bg-white border border-[#c5c0bb] text-[14px] text-[#231f20] rounded-lg focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]";
  const labelCls = "block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#e5e0db] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0db] sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-bold text-[16px] text-[#231f20]">Edit Profil User</h2>
            <p className="text-[12px] text-[#6b6560] mt-0.5">{user.idKaryawan} &middot; {user.nama}</p>
          </div>
          <button onClick={onClose}
            className="p-2 text-[#6b6560] hover:text-[#231f20] hover:bg-[#f1f0ee] rounded-lg transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nama */}
          <div>
            <label className={labelCls}>Nama Lengkap</label>
            <input type="text" className={inputCls} value={form.nama}
              onChange={e => setForm({ ...form, nama: e.target.value })} />
          </div>

          {/* Jabatan */}
          <div>
            <label className={labelCls}>Jabatan</label>
            <input type="text" className={inputCls} value={form.jabatan}
              onChange={e => setForm({ ...form, jabatan: e.target.value })} />
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" className={inputCls} value={form.email} placeholder="opsional"
              onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>

          {/* ── Organisasi — dropdown bertingkat FK ── */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#f15a22] mb-3">
              Penempatan Organisasi (FK)
            </p>

            {/* Pusat */}
            <div className="mb-3">
              <label className={labelCls}>Pusat</label>
              <select className={inputCls} value={form.centerId}
                onChange={e => setForm({ ...form, centerId: e.target.value, departmentId: '', divisionId: '' })}>
                <option value="">— Tidak ditetapkan —</option>
                {centers.map(c => (
                  <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>

            {/* Departemen (filter by pusat) */}
            <div className="mb-3">
              <label className={labelCls}>Departemen</label>
              <select className={inputCls} value={form.departmentId}
                onChange={e => setForm({ ...form, departmentId: e.target.value, divisionId: '' })}>
                <option value="">— Tidak ditetapkan —</option>
                {filteredDepts.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
                ))}
              </select>
              {form.centerId && filteredDepts.length === 0 && (
                <p className="text-[11px] text-gray-400 mt-1">Belum ada departemen di pusat ini</p>
              )}
            </div>

            {/* Divisi (filter by departemen) */}
            <div className="mb-3">
              <label className={labelCls}>Divisi</label>
              <select className={inputCls} value={form.divisionId}
                onChange={e => setForm({ ...form, divisionId: e.target.value })}>
                <option value="">— Tidak ditetapkan —</option>
                {filteredDivs.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} — PIC: {d.pic.idKaryawan}
                  </option>
                ))}
              </select>
              {form.departmentId && filteredDivs.length === 0 && (
                <p className="text-[11px] text-gray-400 mt-1">Belum ada divisi di departemen ini</p>
              )}
            </div>

            {/* Departemen string lama (backward compat) */}
            <div>
              <label className={labelCls}>Departemen (teks lama — legacy)</label>
              <input type="text" className={inputCls} value={form.departemen} placeholder="opsional, untuk kompatibilitas"
                onChange={e => setForm({ ...form, departemen: e.target.value })} />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[13px]">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-[#f15a22] text-white font-bold text-[13px] rounded-lg hover:bg-[#d44d1a] transition-colors disabled:opacity-60">
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-[#e5e0db] text-[#231f20] font-bold text-[13px] rounded-lg hover:bg-[#d0cbc6] transition-colors">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Assign Supervisor Modal ─────────────────────────────
function AssignSupervisorModal({
  user,
  supervisors,
  onClose,
  onSave,
}: {
  user: User;
  supervisors: User[];
  onClose: () => void;
  onSave: (supervisorId: string | null) => Promise<void>;
}) {
  const [selected, setSelected] = useState<string>(user.supervisorId || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const currentSupervisor = supervisors.find((s) => s.id === user.supervisorId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave(selected || null);
      onClose();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan supervisor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#e5e0db]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0db]">
          <div>
            <h2 className="font-bold text-[16px] text-[#231f20]">Assign Supervisor</h2>
            <p className="text-[12px] text-[#6b6560] mt-0.5">{user.idKaryawan} · {user.nama}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6b6560] hover:text-[#231f20] hover:bg-[#f1f0ee] rounded-lg transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Info supervisor saat ini */}
          <div className="p-3 bg-[#faf9f7] border border-[#e5e0db] rounded-lg text-[12px]">
            <span className="text-[#6b6560] font-semibold uppercase tracking-wide text-[10px]">Supervisor Saat Ini</span>
            <p className="text-[#231f20] font-medium mt-1">
              {currentSupervisor
                ? `${currentSupervisor.nama} (${currentSupervisor.idKaryawan})`
                : <span className="text-[#6b6560] italic">Belum ada supervisor</span>}
            </p>
          </div>

          {/* Dropdown pilih supervisor */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">
              Pilih Supervisor Baru
            </label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#c5c0bb] text-[14px] text-[#231f20] rounded-lg focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
            >
              <option value="">— Tidak ada supervisor —</option>
              {supervisors
                .filter((s) => s.id !== user.id) // Tidak bisa assign diri sendiri
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} — {s.jabatan || "Supervisor"} {s.departemen ? `(${s.departemen})` : ""}
                  </option>
                ))}
            </select>
            {supervisors.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1.5">
                ⚠️ Belum ada user dengan role supervisor atau admin.
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[13px]">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-[#f15a22] text-white font-bold text-[13px] rounded-lg hover:bg-[#d44d1a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Menyimpan..." : "Simpan Supervisor"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-[#e5e0db] text-[#231f20] font-bold text-[13px] rounded-lg hover:bg-[#d0cbc6] transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Admin Page ─────────────────────────────────────
export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [assigningSupervisorUser, setAssigningSupervisorUser] = useState<User | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [newUser, setNewUser] = useState({
    idKaryawan: "",
    nama: "",
    jabatan: "",
    departemen: "",
    password: "",
    role: "user",
  });

  // ── Auth guard ──
  useEffect(() => {
    if (!isAuthenticated && !isLoading) router.push("/login");
    if (isAuthenticated && user?.role !== "admin") router.push("/dashboard");
    if (isAuthenticated && user?.role === "admin") fetchUsers();
  }, [isAuthenticated, isLoading, user, router]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-dismiss toast ──
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (msg: string, type: "success" | "error" = "success") =>
    setToast({ msg, type });

  // ── Fetch all users ──
  const fetchUsers = async () => {
    try {
      const token = getStoredToken();
      const res = await fetch("/api/users", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        // Normalise field name (backend returns 'nama', old frontend expected 'name')
        setUsers(
          data.map((u: any) => ({
            ...u,
            nama: u.nama || u.name || "",
          }))
        );
      } else {
        setError("Gagal memuat data pengguna");
      }
    } catch {
      setError("Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  };

  // ── Filter + Search ──────────────────────────────────
  const filteredUsers = useMemo(() => {
    let result = users;

    // Filter by status
    if (filterStatus === "active") result = result.filter((u) => u.approved);
    else if (filterStatus === "inactive") result = result.filter((u) => !u.approved);

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.nama?.toLowerCase().includes(q) ||
          u.idKaryawan?.toLowerCase().includes(q) ||
          u.departemen?.toLowerCase().includes(q) ||
          u.jabatan?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [users, filterStatus, searchQuery]);

  const activeCount   = users.filter((u) => u.approved).length;
  const inactiveCount = users.filter((u) => !u.approved).length;

  // ── Add User ──
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const token = getStoredToken();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        setNewUser({ idKaryawan: "", nama: "", jabatan: "", departemen: "", password: "", role: "user" });
        setShowAddForm(false);
        fetchUsers();
        showToast("User berhasil dibuat");
      } else {
        const d = await res.json();
        setError(d.error || d.message || "Gagal membuat user");
      }
    } catch {
      setError("Gagal membuat user");
    }
  };

  // ── Soft Delete Toggle ──
  const handleToggleStatus = async (u: User) => {
    const action = u.approved ? "deactivate" : "activate";
    const label = u.approved ? "nonaktifkan" : "aktifkan";
    if (!confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} user ${u.nama}?`)) return;

    const token = getStoredToken();
    try {
      const res = await fetch(`/api/users/${u.id}/${action}`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        showToast(`User berhasil di${label}kan`);
        fetchUsers();
      } else {
        const d = await res.json();
        showToast(d.message || "Gagal", "error");
      }
    } catch {
      showToast("Gagal menghubungi server", "error");
    }
  };

  // ── Edit User Save ──
  const handleEditSave = async (updated: Partial<User>) => {
    if (!editingUser) return;
    const token = getStoredToken();
    const res = await fetch(`/api/users/${editingUser.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(updated),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal menyimpan");
    showToast("Profil berhasil diperbarui");
    fetchUsers();
  };

  // ── Assign Supervisor ──
  const handleAssignSupervisor = async (supervisorId: string | null) => {
    if (!assigningSupervisorUser) return;
    const token = getStoredToken();
    const res = await fetch(`/api/users/${assigningSupervisorUser.id}/supervisor`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ supervisorId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal menyimpan supervisor");
    showToast(
      supervisorId
        ? "Supervisor berhasil di-assign"
        : "Supervisor berhasil dihapus"
    );
    fetchUsers();
  };

  // ── List supervisors: role supervisor atau admin, yang aktif ──
  const supervisorList = users.filter(
    (u) => (u.role === "supervisor" || u.role === "admin") && u.approved
  );

  // ── Update Role ──
  const handleRoleChange = async (id: string, newRole: string) => {
    const token = getStoredToken();
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId: id, role: newRole }),
      });
      if (res.ok) {
        showToast("Role berhasil diperbarui");
        fetchUsers();
      } else {
        showToast("Gagal mengubah role", "error");
      }
    } catch {
      showToast("Gagal menghubungi server", "error");
    }
  };

  // ── Loading States ──
  if (isLoading || loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-[#e5e0db] rounded" />
          <div className="h-4 w-72 bg-[#e5e0db] rounded" />
          <div className="h-64 bg-[#e5e0db] rounded-lg mt-6" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[#f1f0ee]">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-[13px] font-semibold text-white transition-all ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? "✓ " : "✕ "}{toast.msg}
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Assign Supervisor Modal */}
      {assigningSupervisorUser && (
        <AssignSupervisorModal
          user={assigningSupervisorUser}
          supervisors={supervisorList}
          onClose={() => setAssigningSupervisorUser(null)}
          onSave={handleAssignSupervisor}
        />
      )}

      {/* Page Header */}
      <div className="bg-[#231f20] px-6 md:px-10 py-8 border-b-[3px] border-b-[#f15a22]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-[11px] text-[#6b6560] mb-4 flex-wrap">
            <Link href="/" className="hover:text-[#f15a22] transition-colors flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Home
            </Link>
            <span>/</span>
            <Link href="/dashboard" className="hover:text-[#f15a22] transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-[#f15a22]">Admin Panel</span>
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-2">Admin Panel</div>
              <h1 className="font-bold text-white text-[clamp(28px,5vw,48px)] leading-tight">
                User Management
              </h1>
              <p className="text-[#8a8580] text-[13px] mt-1">
                Kelola pengguna dan persetujuan akun sistem SMK3
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3a3535] text-[#c5c0bb] text-[12px] font-medium rounded-lg hover:bg-[#f15a22] hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/" className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3a3535] text-[#c5c0bb] text-[12px] font-medium rounded-lg hover:bg-[#f15a22] hover:text-white transition-colors">
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="px-6 md:px-10 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-[#e5e0db] p-4 text-center">
              <div className="text-[28px] font-bold text-[#231f20]">{users.length}</div>
              <div className="text-[11px] text-[#6b6560] font-semibold uppercase tracking-wide mt-0.5">Total User</div>
            </div>
            <div className="bg-white rounded-xl border border-[#e5e0db] p-4 text-center">
              <div className="text-[28px] font-bold text-green-600">{activeCount}</div>
              <div className="text-[11px] text-[#6b6560] font-semibold uppercase tracking-wide mt-0.5">Aktif</div>
            </div>
            <div className="bg-white rounded-xl border border-[#e5e0db] p-4 text-center">
              <div className="text-[28px] font-bold text-[#f15a22]">{inactiveCount}</div>
              <div className="text-[11px] text-[#6b6560] font-semibold uppercase tracking-wide mt-0.5">Nonaktif</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[#e5e0db]">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e0db] flex-wrap gap-3">
              <h2 className="font-bold text-[18px] text-[#231f20]">Daftar Pengguna</h2>
              <button
                onClick={() => { setShowAddForm(!showAddForm); setError(""); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f15a22] text-white font-bold text-[13px] rounded-lg hover:bg-[#d44d1a] transition-colors"
              >
                {showAddForm ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Batal
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Tambah User
                  </>
                )}
              </button>
            </div>

            {/* Add User Form */}
            {showAddForm && (
              <div className="px-6 py-6 bg-[#faf9f7] border-b border-[#e5e0db]">
                <h3 className="font-bold text-[15px] text-[#231f20] mb-4">Tambah Pengguna Baru</h3>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "ID Karyawan *", field: "idKaryawan", type: "text", placeholder: "Contoh: 82400469" },
                      { label: "Nama Lengkap *", field: "nama", type: "text", placeholder: "Nama lengkap" },
                      { label: "Jabatan *", field: "jabatan", type: "text", placeholder: "Jabatan / posisi" },
                      { label: "Departemen *", field: "departemen", type: "text", placeholder: "Nama departemen" },
                      { label: "Password *", field: "password", type: "password", placeholder: "Password" },
                    ].map(({ label, field, type, placeholder }) => (
                      <div key={field}>
                        <label className="block text-[12px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">{label}</label>
                        <input
                          type={type}
                          required
                          value={(newUser as any)[field]}
                          onChange={(e) => setNewUser({ ...newUser, [field]: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#c5c0bb] text-[14px] text-[#231f20] rounded-lg focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
                          placeholder={placeholder}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-[12px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">Role *</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#c5c0bb] text-[14px] text-[#231f20] rounded-lg focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
                      >
                        <option value="user">User</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[13px]">{error}</div>
                  )}

                  <div className="flex gap-3">
                    <button type="submit" className="px-6 py-2.5 bg-[#f15a22] text-white font-bold text-[13px] rounded-lg hover:bg-[#d44d1a] transition-colors">
                      Buat Pengguna
                    </button>
                    <button type="button" onClick={() => { setShowAddForm(false); setError(""); }}
                      className="px-6 py-2.5 bg-[#e5e0db] text-[#231f20] font-bold text-[13px] rounded-lg hover:bg-[#d0cbc6] transition-colors">
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── TASK 10 & 11: Filter + Search Bar ── */}
            <div className="px-6 py-4 border-b border-[#e5e0db] flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c5c0bb]"
                  width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari nama, ID karyawan, departemen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#faf9f7] border border-[#e5e0db] text-[13px] text-[#231f20] rounded-lg focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22] placeholder:text-[#c5c0bb]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c5c0bb] hover:text-[#231f20]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filter tabs */}
              <div className="flex rounded-lg border border-[#e5e0db] overflow-hidden text-[12px] font-semibold">
                {(["all", "active", "inactive"] as FilterStatus[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterStatus(f)}
                    className={`px-4 py-2 transition-colors ${
                      filterStatus === f
                        ? "bg-[#f15a22] text-white"
                        : "bg-white text-[#6b6560] hover:bg-[#faf9f7]"
                    }`}
                  >
                    {f === "all" ? `Semua (${users.length})` : f === "active" ? `Aktif (${activeCount})` : `Nonaktif (${inactiveCount})`}
                  </button>
                ))}
              </div>
            </div>

            {/* ── User Table ── */}
            <div className="p-6">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-[#6b6560] text-[13px]">
                  {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Tidak ada pengguna ditemukan"}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-[#e5e0db]">
                        {["Nama", "ID Karyawan", "Jabatan", "Departemen", "Supervisor", "Role", "Status", "Aksi"].map((h) => (
                          <th key={h} className="text-left py-2 px-3 font-semibold text-[#6b6560] text-[11px] uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f0ee]">
                      {filteredUsers.map((u) => {
                        const supervisorName = u.supervisorId
                          ? users.find((s) => s.id === u.supervisorId)?.nama
                          : null;
                        return (
                        <tr key={u.id} className={`hover:bg-[#faf9f7] transition-colors ${!u.approved ? "opacity-60" : ""}`}>
                          <td className="py-3 px-3 font-medium text-[#231f20]">{u.nama}</td>
                          <td className="py-3 px-3 text-[#6b6560] font-mono text-[12px]">{u.idKaryawan}</td>
                          <td className="py-3 px-3 text-[#6b6560]">{u.jabatan || "—"}</td>
                          <td className="py-3 px-3 text-[#6b6560]">{u.departemen || "—"}</td>
                          {/* Kolom Supervisor */}
                          <td className="py-3 px-3">
                            {supervisorName ? (
                              <span className="inline-flex items-center gap-1 text-[12px] text-[#231f20]">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                {supervisorName}
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#c5c0bb] italic">Belum diset</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="px-2.5 py-1.5 bg-white border border-[#c5c0bb] text-[12px] text-[#231f20] rounded focus:outline-none focus:border-[#f15a22]"
                            >
                              <option value="user">User</option>
                              <option value="supervisor">Supervisor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="py-3 px-3">
                            {u.approved ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[11px] font-bold rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 text-[11px] font-bold rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Nonaktif
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              {/* Edit button */}
                              <button
                                onClick={() => setEditingUser(u)}
                                title="Edit profil"
                                className="p-1.5 text-[#6b6560] hover:text-[#f15a22] hover:bg-[#f15a22]/10 rounded-lg transition-colors"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              {/* Assign Supervisor button */}
                              <button
                                onClick={() => setAssigningSupervisorUser(u)}
                                title="Assign supervisor"
                                className="p-1.5 text-[#6b6560] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <line x1="19" y1="8" x2="19" y2="14" />
                                  <line x1="22" y1="11" x2="16" y2="11" />
                                </svg>
                              </button>
                              {/* Toggle active/inactive */}
                              <button
                                onClick={() => handleToggleStatus(u)}
                                title={u.approved ? "Nonaktifkan user" : "Aktifkan user"}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  u.approved
                                    ? "text-[#6b6560] hover:text-red-600 hover:bg-red-50"
                                    : "text-[#6b6560] hover:text-green-600 hover:bg-green-50"
                                }`}
                              >
                                {u.approved ? (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                  </svg>
                                ) : (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Result count */}
              {filteredUsers.length > 0 && (
                <div className="mt-4 text-[12px] text-[#6b6560]">
                  Menampilkan {filteredUsers.length} dari {users.length} pengguna
                </div>
              )}
            </div>
          </div>

          {/* Bottom navigation */}
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#c5c0bb] text-[13px] text-[#231f20] font-medium rounded-lg hover:border-[#f15a22] hover:text-[#f15a22] transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
              </svg>
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
