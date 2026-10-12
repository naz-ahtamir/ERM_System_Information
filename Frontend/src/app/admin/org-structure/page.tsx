'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { centersApi, departmentsApi, divisionsApi } from '@/lib/api';
import type { Center, Division } from '@/lib/api';
import toast from 'react-hot-toast';

// ── Types ─────────────────────────────────────────────────────────────────────

interface DepartmentFull {
  id: string;
  name: string;
  code: string;
  centerId?: string | null;
  center?: { id: string; name: string; code: string } | null;
  _count?: { divisions: number; users: number };
}

interface UserPic {
  id: string;
  idKaryawan: string;
  nama: string;
  jabatan?: string | null;
  departemen?: string | null;
  divisionId?: string | null;
}

// ── Shared Helpers ────────────────────────────────────────────────────────────

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('smk3_token') || '';
}

function authHeaders(): HeadersInit {
  const t = getToken();
  return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

async function apiFetch(url: string, opts: RequestInit = {}) {
  const res = await fetch(url, { ...opts, headers: { ...authHeaders(), ...(opts.headers ?? {}) } });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.message || data?.error || `Error ${res.status}`);
  return data;
}

// ── Modal component ──────────────────────────────────────────────────────────

function Modal({
  title, subtitle, onClose, children, footer,
}: {
  title: string; subtitle?: string; onClose: () => void;
  children: React.ReactNode; footer: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#e5e0db] flex-shrink-0">
          <div>
            <h2 className="font-bold text-[15px] text-[#231f20]">{title}</h2>
            {subtitle && <p className="text-[12px] text-[#6b6560] mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1 mt-0.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">{children}</div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e0db] flex-shrink-0">
          {footer}
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full border border-[#c5c0bb] rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 transition-colors bg-white';
const labelCls = 'block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: PUSAT
// ─────────────────────────────────────────────────────────────────────────────

function TabPusat() {
  const [centers, setCenters]   = useState<Center[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search,  setSearch]    = useState('');
  const [modal,   setModal]     = useState<{ mode: 'add' | 'edit'; data?: Center } | null>(null);
  const [form,    setForm]      = useState({ name: '', code: '' });
  const [saving,  setSaving]    = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setCenters(await centersApi.getAll()); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setForm({ name: '', code: '' }); setModal({ mode: 'add' }); }
  function openEdit(c: Center) { setForm({ name: c.name, code: c.code }); setModal({ mode: 'edit', data: c }); }

  async function handleSave() {
    if (!form.name.trim() || !form.code.trim()) { toast.error('Nama dan kode wajib diisi'); return; }
    setSaving(true);
    try {
      if (modal?.mode === 'add') {
        await centersApi.create({ name: form.name.trim(), code: form.code.trim().toUpperCase() });
        toast.success('Pusat berhasil ditambahkan');
      } else {
        await centersApi.update(modal!.data!.id, { name: form.name.trim(), code: form.code.trim().toUpperCase() });
        toast.success('Pusat berhasil diperbarui');
      }
      setModal(null);
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(c: Center) {
    if (!confirm(`Hapus Pusat "${c.name}"? Pastikan tidak ada departemen yang terhubung.`)) return;
    setDeletingId(c.id);
    try {
      await centersApi.remove(c.id);
      toast.success('Pusat dihapus');
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setDeletingId(null); }
  }

  const filtered = centers.filter(c =>
    !search.trim() ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a09b96]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Cari nama atau kode pusat..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20" />
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors whitespace-nowrap">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Pusat
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e5e0db] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-[#f1f0ee] rounded-xl animate-pulse"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#a09b96]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <p className="text-[13px]">{search ? 'Tidak ada hasil' : 'Belum ada data pusat'}</p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#faf9f7] border-b border-[#e5e0db]">
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560] w-10">#</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Kode</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Nama Pusat</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Departemen</th>
                <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f0ee]">
              {filtered.map((c, idx) => (
                <tr key={c.id} className="hover:bg-[#faf9f7] transition-colors">
                  <td className="px-4 py-3 text-[#a09b96]">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-[#f15a22]/10 text-[#f15a22] font-mono font-bold text-[11px] px-2 py-0.5 rounded">{c.code}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#231f20]">{c.name}</td>
                  <td className="px-4 py-3 text-[#6b6560]">
                    {c._count?.departments ?? '—'} departemen
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg text-[#6b6560] hover:text-[#f15a22] hover:bg-[#f1f0ee] transition-colors" title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(c)} disabled={deletingId === c.id}
                        className="p-1.5 rounded-lg text-[#6b6560] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50" title="Hapus">
                        {deletingId === c.id
                          ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"/>
                          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 14.142A2 2 0 0 1 16.138 22H7.862a2 2 0 0 1-1.995-1.858L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-[#f1f0ee] text-[12px] text-[#a09b96] bg-[#faf9f7]">
            {filtered.length} dari {centers.length} pusat
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {modal && (
        <Modal
          title={modal.mode === 'add' ? 'Tambah Pusat' : 'Edit Pusat'}
          subtitle={modal.data?.name}
          onClose={() => setModal(null)}
          footer={<>
            <button onClick={() => setModal(null)} disabled={saving}
              className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors">
              Batal
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors disabled:opacity-60">
              {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
              {saving ? 'Menyimpan...' : modal.mode === 'add' ? 'Tambah Pusat' : 'Simpan Perubahan'}
            </button>
          </>}
        >
          <Field label="Nama Pusat *">
            <input type="text" className={inputCls} placeholder="misal: Pusat Jakarta" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Kode Pusat *">
            <input type="text" className={inputCls} placeholder="misal: JKT (akan diupcase otomatis)" value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
            <p className="text-[11px] text-[#a09b96] mt-1">Kode harus unik, akan diubah ke huruf kapital.</p>
          </Field>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: DEPARTEMEN
// ─────────────────────────────────────────────────────────────────────────────

function TabDepartemen() {
  const [departments, setDepartments] = useState<DepartmentFull[]>([]);
  const [centers,     setCenters]     = useState<Center[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [filterCenter, setFilterCenter] = useState('');
  const [modal,       setModal]       = useState<{ mode: 'add' | 'edit'; data?: DepartmentFull } | null>(null);
  const [form,        setForm]        = useState({ name: '', code: '', centerId: '' });
  const [saving,      setSaving]      = useState(false);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [deps, ctrs] = await Promise.all([
        apiFetch('/api/departments'),
        centersApi.getAll(),
      ]);
      setDepartments(deps);
      setCenters(ctrs);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setForm({ name: '', code: '', centerId: '' }); setModal({ mode: 'add' }); }
  function openEdit(d: DepartmentFull) {
    setForm({ name: d.name, code: d.code, centerId: d.centerId || '' });
    setModal({ mode: 'edit', data: d });
  }

  async function handleSave() {
    if (!form.name.trim() || !form.code.trim()) { toast.error('Nama dan kode wajib diisi'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), code: form.code.trim().toUpperCase(), centerId: form.centerId || null };
      if (modal?.mode === 'add') {
        await departmentsApi.create(payload);
        toast.success('Departemen berhasil ditambahkan');
      } else {
        await departmentsApi.update(modal!.data!.id, payload);
        toast.success('Departemen berhasil diperbarui');
      }
      setModal(null); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(d: DepartmentFull) {
    if (!confirm(`Hapus Departemen "${d.name}"? Pastikan tidak ada divisi yang terhubung.`)) return;
    setDeletingId(d.id);
    try {
      await departmentsApi.remove(d.id);
      toast.success('Departemen dihapus');
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setDeletingId(null); }
  }

  const filtered = departments.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q);
    const matchCenter = !filterCenter || d.centerId === filterCenter;
    return matchSearch && matchCenter;
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a09b96]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Cari nama atau kode..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20" />
        </div>
        <select value={filterCenter} onChange={e => setFilterCenter(e.target.value)}
          className="py-2 px-3 text-[13px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22]">
          <option value="">Semua Pusat</option>
          {centers.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
        </select>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors whitespace-nowrap">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Departemen
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e5e0db] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-10 bg-[#f1f0ee] rounded-xl animate-pulse"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#a09b96]">
            <p className="text-[13px]">{search || filterCenter ? 'Tidak ada hasil' : 'Belum ada data departemen'}</p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#faf9f7] border-b border-[#e5e0db]">
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560] w-10">#</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Kode</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Nama Departemen</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Pusat</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Divisi</th>
                <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f0ee]">
              {filtered.map((d, idx) => (
                <tr key={d.id} className="hover:bg-[#faf9f7] transition-colors">
                  <td className="px-4 py-3 text-[#a09b96]">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-blue-50 text-blue-700 font-mono font-bold text-[11px] px-2 py-0.5 rounded">{d.code}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#231f20]">{d.name}</td>
                  <td className="px-4 py-3 text-[#6b6560]">
                    {d.center ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="inline-block bg-[#f15a22]/10 text-[#f15a22] font-mono text-[10px] px-1.5 py-0.5 rounded">{d.center.code}</span>
                        {d.center.name}
                      </span>
                    ) : <span className="text-[#c5c0bb] italic text-[12px]">Belum diset</span>}
                  </td>
                  <td className="px-4 py-3 text-[#6b6560]">{d._count?.divisions ?? '—'} divisi</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(d)}
                        className="p-1.5 rounded-lg text-[#6b6560] hover:text-[#f15a22] hover:bg-[#f1f0ee] transition-colors" title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(d)} disabled={deletingId === d.id}
                        className="p-1.5 rounded-lg text-[#6b6560] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50" title="Hapus">
                        {deletingId === d.id
                          ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"/>
                          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 14.142A2 2 0 0 1 16.138 22H7.862a2 2 0 0 1-1.995-1.858L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-[#f1f0ee] text-[12px] text-[#a09b96] bg-[#faf9f7]">
            {filtered.length} dari {departments.length} departemen
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <Modal
          title={modal.mode === 'add' ? 'Tambah Departemen' : 'Edit Departemen'}
          subtitle={modal.data?.name}
          onClose={() => setModal(null)}
          footer={<>
            <button onClick={() => setModal(null)} disabled={saving}
              className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors">Batal</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors disabled:opacity-60">
              {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
              {saving ? 'Menyimpan...' : modal.mode === 'add' ? 'Tambah' : 'Simpan'}
            </button>
          </>}
        >
          <Field label="Nama Departemen *">
            <input type="text" className={inputCls} placeholder="misal: Safety Department" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Kode Departemen *">
            <input type="text" className={inputCls} placeholder="misal: SAFETY (akan diupcase)" value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
          </Field>
          <Field label="Pusat (opsional)">
            <select className={inputCls} value={form.centerId} onChange={e => setForm(f => ({ ...f, centerId: e.target.value }))}>
              <option value="">— Tidak ditetapkan —</option>
              {centers.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
          </Field>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: DIVISI
// ─────────────────────────────────────────────────────────────────────────────

function TabDivisi() {
  const [divisions,   setDivisions]   = useState<Division[]>([]);
  const [departments, setDepartments] = useState<DepartmentFull[]>([]);
  const [users,       setUsers]       = useState<UserPic[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [filterDept,  setFilterDept]  = useState('');
  const [modal,       setModal]       = useState<{ mode: 'add' | 'edit'; data?: Division } | null>(null);
  const [form,        setForm]        = useState({ name: '', departmentId: '', picId: '' });
  const [saving,      setSaving]      = useState(false);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [divs, deps, usrs] = await Promise.all([
        divisionsApi.getAll(),
        apiFetch('/api/departments'),
        apiFetch('/api/users'),
      ]);
      setDivisions(divs);
      setDepartments(deps);
      setUsers(usrs.map((u: any) => ({ id: u.id, idKaryawan: u.idKaryawan, nama: u.nama || u.name || '', jabatan: u.jabatan, departemen: u.departemen, divisionId: u.divisionId })));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setForm({ name: '', departmentId: '', picId: '' }); setModal({ mode: 'add' }); }
  function openEdit(d: Division) {
    setForm({ name: d.name, departmentId: d.departmentId, picId: d.picId });
    setModal({ mode: 'edit', data: d });
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Nama divisi wajib diisi'); return; }
    if (!form.departmentId) { toast.error('Departemen wajib dipilih'); return; }
    if (!form.picId) { toast.error('PIC wajib dipilih'); return; }
    setSaving(true);
    try {
      if (modal?.mode === 'add') {
        await divisionsApi.create({ name: form.name.trim(), departmentId: form.departmentId, picId: form.picId });
        toast.success('Divisi berhasil ditambahkan');
      } else {
        await divisionsApi.update(modal!.data!.id, { name: form.name.trim(), departmentId: form.departmentId, picId: form.picId });
        toast.success('Divisi berhasil diperbarui');
      }
      setModal(null); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(d: Division) {
    if (!confirm(`Hapus Divisi "${d.name}"? Pastikan tidak ada user/PICA yang terhubung.`)) return;
    setDeletingId(d.id);
    try {
      await divisionsApi.remove(d.id);
      toast.success('Divisi dihapus');
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setDeletingId(null); }
  }

  const filtered = divisions.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.pic.nama.toLowerCase().includes(q);
    const matchDept = !filterDept || d.departmentId === filterDept;
    return matchSearch && matchDept;
  });

  const selectedDept = departments.find(d => d.id === form.departmentId);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a09b96]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Cari nama divisi atau PIC..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20" />
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
          className="py-2 px-3 text-[13px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22]">
          <option value="">Semua Departemen</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.code} — {d.name}</option>)}
        </select>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors whitespace-nowrap">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Divisi
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e5e0db] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-[#f1f0ee] rounded-xl animate-pulse"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#a09b96]">
            <p className="text-[13px]">{search || filterDept ? 'Tidak ada hasil' : 'Belum ada data divisi'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#faf9f7] border-b border-[#e5e0db]">
                  <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560] w-10">#</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Nama Divisi</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Departemen</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Pusat</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">PIC</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">ID Karyawan PIC</th>
                  <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f0ee]">
                {filtered.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-[#faf9f7] transition-colors">
                    <td className="px-4 py-3 text-[#a09b96]">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-[#231f20]">{d.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-blue-50 text-blue-700 font-mono text-[11px] px-1.5 py-0.5 rounded mr-1">{d.department.code}</span>
                      <span className="text-[#6b6560]">{d.department.name}</span>
                    </td>
                    <td className="px-4 py-3 text-[#6b6560]">
                      {d.department.center
                        ? <span className="inline-block bg-[#f15a22]/10 text-[#f15a22] font-mono text-[10px] px-1.5 py-0.5 rounded">{d.department.center.code}</span>
                        : <span className="text-[#c5c0bb]">—</span>}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#231f20]">{d.pic.nama}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-[#6b6560]">{d.pic.idKaryawan}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(d)}
                          className="p-1.5 rounded-lg text-[#6b6560] hover:text-[#f15a22] hover:bg-[#f1f0ee] transition-colors" title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(d)} disabled={deletingId === d.id}
                          className="p-1.5 rounded-lg text-[#6b6560] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50" title="Hapus">
                          {deletingId === d.id
                            ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"/>
                            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 14.142A2 2 0 0 1 16.138 22H7.862a2 2 0 0 1-1.995-1.858L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-[#f1f0ee] text-[12px] text-[#a09b96] bg-[#faf9f7]">
            {filtered.length} dari {divisions.length} divisi
          </div>
        )}
      </div>

      {/* Modal Add/Edit Divisi */}
      {modal && (
        <Modal
          title={modal.mode === 'add' ? 'Tambah Divisi' : 'Edit Divisi'}
          subtitle={modal.data?.name}
          onClose={() => setModal(null)}
          footer={<>
            <button onClick={() => setModal(null)} disabled={saving}
              className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors">Batal</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors disabled:opacity-60">
              {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
              {saving ? 'Menyimpan...' : modal.mode === 'add' ? 'Tambah' : 'Simpan'}
            </button>
          </>}
        >
          <Field label="Nama Divisi *">
            <input type="text" className={inputCls} placeholder="misal: Safety Operation" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Departemen *">
            <select className={inputCls} value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}>
              <option value="">— Pilih Departemen —</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.code} — {d.name}</option>)}
            </select>
            {selectedDept?.center && (
              <p className="text-[11px] text-[#a09b96] mt-1">Pusat: {selectedDept.center.code} — {selectedDept.center.name}</p>
            )}
          </Field>
          <Field label="PIC (Person In Charge) *">
            <select className={inputCls} value={form.picId} onChange={e => setForm(f => ({ ...f, picId: e.target.value }))}>
              <option value="">— Pilih PIC —</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.idKaryawan} — {u.nama}{u.jabatan ? ` (${u.jabatan})` : ''}
                </option>
              ))}
            </select>
            {form.picId && (() => {
              const u = users.find(x => x.id === form.picId);
              return u ? (
                <div className="mt-2 p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-[12px]">
                  <span className="font-bold text-blue-700">{u.nama}</span>
                  <span className="text-blue-500 ml-2">ID: {u.idKaryawan}</span>
                  {u.jabatan && <span className="text-blue-400 ml-2">· {u.jabatan}</span>}
                </div>
              ) : null;
            })()}
          </Field>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: PIC per DIVISI
// ─────────────────────────────────────────────────────────────────────────────

function TabPIC() {
  const [divisions,  setDivisions]  = useState<Division[]>([]);
  const [users,      setUsers]      = useState<UserPic[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [modal,      setModal]      = useState<Division | null>(null);
  const [picId,      setPicId]      = useState('');
  const [saving,     setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [divs, usrs] = await Promise.all([
        divisionsApi.getAll(),
        apiFetch('/api/users'),
      ]);
      setDivisions(divs);
      setUsers(usrs.map((u: any) => ({ id: u.id, idKaryawan: u.idKaryawan, nama: u.nama || u.name || '', jabatan: u.jabatan, departemen: u.departemen })));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openChangePic(d: Division) { setPicId(d.picId); setModal(d); }

  async function handleSave() {
    if (!picId) { toast.error('Pilih PIC terlebih dahulu'); return; }
    setSaving(true);
    try {
      await divisionsApi.update(modal!.id, { picId });
      toast.success(`PIC divisi "${modal!.name}" berhasil diperbarui`);
      setModal(null);
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  const filtered = divisions.filter(d => {
    const q = search.toLowerCase();
    return !q || d.name.toLowerCase().includes(q) || d.pic.nama.toLowerCase().includes(q) || d.pic.idKaryawan.toLowerCase().includes(q);
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a09b96]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Cari divisi atau nama PIC..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e0db] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-[#f1f0ee] rounded-xl animate-pulse"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#a09b96]">
            <p className="text-[13px]">Tidak ada data divisi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#faf9f7] border-b border-[#e5e0db]">
                  <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560] w-10">#</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Divisi</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Departemen</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">PIC Saat Ini</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">ID Karyawan</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Jabatan PIC</th>
                  <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Ganti PIC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f0ee]">
                {filtered.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-[#faf9f7] transition-colors">
                    <td className="px-4 py-3 text-[#a09b96]">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-[#231f20]">{d.name}</td>
                    <td className="px-4 py-3 text-[#6b6560]">
                      <span className="font-mono text-[11px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded mr-1">{d.department.code}</span>
                      {d.department.name}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#231f20]">{d.pic.nama}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[#6b6560]">{d.pic.idKaryawan}</td>
                    <td className="px-4 py-3 text-[#6b6560]">{d.pic.jabatan || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => openChangePic(d)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-[12px] font-semibold rounded-lg hover:bg-blue-100 transition-colors border border-blue-200">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                        Ganti PIC
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-[#f1f0ee] text-[12px] text-[#a09b96] bg-[#faf9f7]">
            {filtered.length} divisi terdaftar
          </div>
        )}
      </div>

      {/* Modal Ganti PIC */}
      {modal && (
        <Modal
          title="Ganti PIC Divisi"
          subtitle={modal.name}
          onClose={() => setModal(null)}
          footer={<>
            <button onClick={() => setModal(null)} disabled={saving}
              className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors">Batal</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
              {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
              {saving ? 'Menyimpan...' : 'Simpan PIC'}
            </button>
          </>}
        >
          {/* Info divisi saat ini */}
          <div className="p-3 bg-[#faf9f7] border border-[#e5e0db] rounded-xl text-[12px] space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#a09b96]">PIC Saat Ini</p>
            <p className="font-semibold text-[#231f20]">{modal.pic.nama}</p>
            <p className="text-[#6b6560] font-mono">{modal.pic.idKaryawan} · {modal.pic.jabatan || 'Jabatan tidak diisi'}</p>
          </div>
          <Field label="Pilih PIC Baru *">
            <select className={inputCls} value={picId} onChange={e => setPicId(e.target.value)}>
              <option value="">— Pilih User —</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.idKaryawan} — {u.nama}{u.jabatan ? ` (${u.jabatan})` : ''}
                </option>
              ))}
            </select>
          </Field>
          {picId && picId !== modal.picId && (() => {
            const u = users.find(x => x.id === picId);
            return u ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-[12px]">
                <p className="text-[10px] font-bold uppercase tracking-wide text-green-700 mb-1">PIC Baru</p>
                <p className="font-semibold text-green-800">{u.nama}</p>
                <p className="text-green-600 font-mono">{u.idKaryawan} · {u.jabatan || '—'}</p>
              </div>
            ) : null;
          })()}
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

type TabId = 'pusat' | 'departemen' | 'divisi' | 'pic';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'pusat',
    label: 'Pusat',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    id: 'departemen',
    label: 'Departemen',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  },
  {
    id: 'divisi',
    label: 'Divisi',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    id: 'pic',
    label: 'PIC Divisi',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
];

export default function OrgStructurePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('pusat');

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') router.push('/dashboard');
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f1f0ee] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#f15a22] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#f1f0ee]">
      {/* Header */}
      <div className="bg-[#231f20] px-6 md:px-10 py-8 border-b-[3px] border-b-[#f15a22]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-[11px] text-[#6b6560] mb-4 flex-wrap">
            <Link href="/admin" className="hover:text-[#f15a22] transition-colors">Admin Panel</Link>
            <span>/</span>
            <span className="text-[#f15a22]">Struktur Organisasi</span>
          </div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-2">Admin Panel</p>
          <h1 className="font-bold text-white text-[clamp(24px,4vw,38px)] leading-tight">
            Struktur Organisasi
          </h1>
          <p className="text-[#8a8580] text-[13px] mt-1.5">
            Kelola data Pusat, Departemen, Divisi, dan Person In Charge (PIC)
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-white border border-[#e5e0db] rounded-2xl p-1.5 shadow-sm w-fit flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#231f20] text-white shadow-sm'
                  : 'text-[#6b6560] hover:text-[#231f20] hover:bg-[#f1f0ee]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'pusat'      && <TabPusat />}
        {activeTab === 'departemen' && <TabDepartemen />}
        {activeTab === 'divisi'     && <TabDivisi />}
        {activeTab === 'pic'        && <TabPIC />}
      </div>
    </div>
  );
}
