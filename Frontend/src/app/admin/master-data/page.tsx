'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  centersApi, divisionsApi, departmentsApi, getStoredToken,
  type Center, type Division,
} from '@/lib/api';
import toast from 'react-hot-toast';
import { trainingApi, MasterPelatihan, formatRupiah } from '@/lib/trainingApi';

// ── Types ──────────────────────────────────────────────────────────────────

interface DeptWithRelations {
  id: string; name: string; code: string;
  centerId?: string | null;
  center?: { id: string; name: string; code: string } | null;
  _count?: { divisions: number };
}

interface UserOption {
  id: string; idKaryawan: string; nama: string; jabatan?: string | null;
}

// ── UI primitives ──────────────────────────────────────────────────────────

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#FF6B1A] focus:ring-1 focus:ring-[#FF6B1A] transition-colors bg-white';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-[16px] font-bold text-[#1F2937]">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function ModalActions({ onCancel, onSave, saving }: { onCancel: () => void; onSave: () => void; saving: boolean }) {
  return (
    <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100">
      <button onClick={onCancel} className="px-4 py-2 text-[13px] text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
        Batal
      </button>
      <button onClick={onSave} disabled={saving}
        className="px-5 py-2 bg-[#FF6B1A] text-white text-[13px] font-semibold rounded-lg hover:bg-[#E85D0F] transition-colors shadow-xs disabled:opacity-60 flex items-center gap-2">
        {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {saving ? 'Menyimpan…' : 'Simpan'}
      </button>
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center py-16"><div className="w-7 h-7 border-2 border-[#FF6B1A] border-t-transparent rounded-full animate-spin" /></div>;
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-16">
      <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      </svg>
      <p className="text-[13px] text-gray-400">{text}</p>
    </div>
  );
}

const Th = ({ c = '', children }: { c?: string; children: React.ReactNode }) => (
  <th className={`text-left px-4 py-3 font-semibold text-gray-500 text-[11px] uppercase tracking-wide whitespace-nowrap bg-gray-50/80 border-b border-gray-100 ${c}`}>{children}</th>
);
const Td = ({ c = '', children }: { c?: string; children: React.ReactNode }) => (
  <td className={`px-4 py-3 border-b border-gray-50 ${c}`}>{children}</td>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="m19 6-.867 14.142A2 2 0 0 1 16.138 22H7.862a2 2 0 0 1-1.995-1.858L5 6"/>
    <path d="M10 11v6M14 11v6"/>
  </svg>
);
const AddIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1.5 bg-[#FF6B1A] text-white px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#E85D0F] transition-colors shadow-xs">
      <AddIcon />{label}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB PUSAT
// ═══════════════════════════════════════════════════════════════════

function TabPusat({ onCentersChange }: { onCentersChange: (c: Center[]) => void }) {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Center | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', code: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await centersApi.getAll();
      setCenters(data);
      onCentersChange(data);
    } catch { toast.error('Gagal memuat pusat'); }
    finally { setLoading(false); }
  }, [onCentersChange]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setEditing(null); setForm({ name: '', code: '' }); setModal(true); };
  const openEdit = (c: Center) => { setEditing(c); setForm({ name: c.name, code: c.code }); setModal(true); };
  const close    = () => { setModal(false); setEditing(null); };

  const save = async () => {
    if (!form.name.trim() || !form.code.trim()) { toast.error('Nama dan kode wajib diisi'); return; }
    setSaving(true);
    try {
      editing ? await centersApi.update(editing.id, form) : await centersApi.create(form);
      toast.success(editing ? 'Pusat diperbarui' : 'Pusat ditambahkan');
      close(); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  const del = async (c: Center) => {
    if (!confirm(`Hapus pusat "${c.name}"?`)) return;
    try { await centersApi.remove(c.id); toast.success('Pusat dihapus'); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Gagal menghapus'); }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] text-gray-400">{centers.length} pusat terdaftar</span>
        <AddButton onClick={openAdd} label="Tambah Pusat" />
      </div>

      {loading ? <Spinner /> : centers.length === 0 ? <EmptyState text="Belum ada data pusat" /> : (
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-[13px]">
            <thead><tr><Th>No</Th><Th>Kode</Th><Th>Nama</Th><Th>Jml Dept</Th><Th>Aksi</Th></tr></thead>
            <tbody>
              {centers.map((c, i) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <Td c="text-gray-400 text-[12px]">{i + 1}</Td>
                  <Td><span className="font-mono text-[12px] bg-gray-100 px-1.5 py-0.5 rounded">{c.code}</span></Td>
                  <Td><span className="font-medium text-gray-800">{c.name}</span></Td>
                  <Td><span className="text-gray-500">{c._count?.departments ?? 0}</span></Td>
                  <Td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} title="Edit" className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"><EditIcon /></button>
                      <button onClick={() => del(c)} title="Hapus" className="p-1.5 text-red-400 hover:bg-red-50 rounded-md"><TrashIcon /></button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={editing ? 'Edit Pusat' : 'Tambah Pusat'} onClose={close}>
          <Field label="Nama Pusat" required>
            <input className={inputCls} placeholder="cth: PUSAT MANAJEMEN TANGGAP DARURAT"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Kode" required>
            <input className={inputCls} placeholder="cth: PMT-01" maxLength={30}
              value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
          </Field>
          <ModalActions onCancel={close} onSave={save} saving={saving} />
        </Modal>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB DEPARTEMEN
// ═══════════════════════════════════════════════════════════════════

function TabDepartemen({ centers }: { centers: Center[] }) {
  const [depts, setDepts] = useState<DeptWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCenter, setFilterCenter] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<DeptWithRelations | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', centerId: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try { setDepts((await departmentsApi.getAll(filterCenter ? { centerId: filterCenter } : undefined)) as DeptWithRelations[]); }
    catch { toast.error('Gagal memuat departemen'); }
    finally { setLoading(false); }
  }, [filterCenter]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setEditing(null); setForm({ name: '', code: '', centerId: '' }); setModal(true); };
  const openEdit = (d: DeptWithRelations) => { setEditing(d); setForm({ name: d.name, code: d.code, centerId: d.centerId ?? '' }); setModal(true); };
  const close    = () => { setModal(false); setEditing(null); };

  const save = async () => {
    if (!form.name.trim() || !form.code.trim()) { toast.error('Nama dan kode wajib diisi'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, code: form.code, centerId: form.centerId || null };
      editing ? await departmentsApi.update(editing.id, payload) : await departmentsApi.create(payload);
      toast.success(editing ? 'Departemen diperbarui' : 'Departemen ditambahkan');
      close(); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  const del = async (d: DeptWithRelations) => {
    if (!confirm(`Hapus departemen "${d.name}"?`)) return;
    try { await departmentsApi.remove(d.id); toast.success('Departemen dihapus'); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Gagal menghapus'); }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <select value={filterCenter} onChange={e => setFilterCenter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#FF6B1A] focus:ring-1 focus:ring-[#FF6B1A] bg-white min-w-[180px] transition-colors">
            <option value="">Semua Pusat</option>
            {centers.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
          </select>
          <span className="text-[12px] text-gray-400">{depts.length} departemen</span>
        </div>
        <AddButton onClick={openAdd} label="Tambah Departemen" />
      </div>

      {loading ? <Spinner /> : depts.length === 0 ? <EmptyState text="Belum ada data departemen" /> : (
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-[13px]">
            <thead><tr><Th>No</Th><Th>Kode</Th><Th>Nama</Th><Th>Pusat</Th><Th>Divisi</Th><Th>Aksi</Th></tr></thead>
            <tbody>
              {depts.map((d, i) => (
                <tr key={d.id} className="hover:bg-gray-50/50">
                  <Td c="text-gray-400 text-[12px]">{i + 1}</Td>
                  <Td><span className="font-mono text-[12px] bg-gray-100 px-1.5 py-0.5 rounded">{d.code}</span></Td>
                  <Td><span className="font-medium text-gray-800">{d.name}</span></Td>
                  <Td>{d.center
                    ? <span className="text-[12px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">{d.center.code}</span>
                    : <span className="text-gray-300 text-[12px]">—</span>}
                  </Td>
                  <Td><span className="text-gray-500">{d._count?.divisions ?? 0}</span></Td>
                  <Td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(d)} title="Edit" className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"><EditIcon /></button>
                      <button onClick={() => del(d)} title="Hapus" className="p-1.5 text-red-400 hover:bg-red-50 rounded-md"><TrashIcon /></button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={editing ? 'Edit Departemen' : 'Tambah Departemen'} onClose={close}>
          <Field label="Nama Departemen" required>
            <input className={inputCls} placeholder="cth: DEPARTEMEN MANAJEMEN TANGGAP DARURAT"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Kode" required>
            <input className={inputCls} placeholder="cth: DEPT-001" maxLength={30}
              value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
          </Field>
          <Field label="Pusat">
            <select className={inputCls} value={form.centerId} onChange={e => setForm(f => ({ ...f, centerId: e.target.value }))}>
              <option value="">— Tidak ditetapkan —</option>
              {centers.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
          </Field>
          <ModalActions onCancel={close} onSave={save} saving={saving} />
        </Modal>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB DIVISI
// ═══════════════════════════════════════════════════════════════════

function TabDivisi({ centers }: { centers: Center[] }) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [allDepts, setAllDepts]   = useState<DeptWithRelations[]>([]);
  const [users, setUsers]         = useState<UserOption[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState<Division | null>(null);
  const [saving, setSaving]       = useState(false);
  const [centerFilter, setCenterFilter] = useState('');
  const [form, setForm]           = useState({ name: '', departmentId: '', picId: '' });
  const [picSearch, setPicSearch] = useState('');
  const [picOpen, setPicOpen]     = useState(false);

  const loadDivisions = useCallback(async () => {
    setLoading(true);
    try { setDivisions(await divisionsApi.getAll()); }
    catch { toast.error('Gagal memuat divisi'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadDivisions();
    departmentsApi.getAll().then(d => setAllDepts(d as DeptWithRelations[])).catch(() => {});
    const token = getStoredToken();
    const base  = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    fetch(`${base}/auth/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then((d: any[]) => setUsers(d.map(u => ({ id: u.id, idKaryawan: u.idKaryawan, nama: u.nama, jabatan: u.jabatan }))))
      .catch(() => {});
  }, [loadDivisions]);

  // Depts filtered by selected center in modal
  const modalDepts = centerFilter ? allDepts.filter(d => d.centerId === centerFilter) : allDepts;

  // PIC search results
  const picResults = picSearch.trim()
    ? users.filter(u =>
        u.idKaryawan.toLowerCase().includes(picSearch.toLowerCase()) ||
        u.nama.toLowerCase().includes(picSearch.toLowerCase())
      ).slice(0, 15)
    : [];

  const selectedPic = users.find(u => u.id === form.picId);

  const openAdd = () => {
    setEditing(null); setCenterFilter('');
    setForm({ name: '', departmentId: '', picId: '' });
    setPicSearch(''); setPicOpen(false); setModal(true);
  };
  const openEdit = (d: Division) => {
    setEditing(d);
    setCenterFilter(d.department.centerId ?? '');
    setForm({ name: d.name, departmentId: d.departmentId, picId: d.picId });
    setPicSearch(`${d.pic.idKaryawan} — ${d.pic.nama}`);
    setPicOpen(false); setModal(true);
  };
  const close = () => { setModal(false); setEditing(null); };

  const save = async () => {
    if (!form.name.trim())  { toast.error('Nama divisi wajib diisi'); return; }
    if (!form.departmentId) { toast.error('Departemen wajib dipilih'); return; }
    if (!form.picId)        { toast.error('PIC wajib dipilih'); return; }
    setSaving(true);
    try {
      editing ? await divisionsApi.update(editing.id, form) : await divisionsApi.create(form);
      toast.success(editing ? 'Divisi diperbarui' : 'Divisi ditambahkan');
      close(); loadDivisions();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  const del = async (d: Division) => {
    if (!confirm(`Hapus divisi "${d.name}"?`)) return;
    try { await divisionsApi.remove(d.id); toast.success('Divisi dihapus'); loadDivisions(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Gagal menghapus'); }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] text-gray-400">{divisions.length} divisi terdaftar</span>
        <AddButton onClick={openAdd} label="Tambah Divisi" />
      </div>

      {loading ? <Spinner /> : divisions.length === 0 ? <EmptyState text="Belum ada data divisi" /> : (
        <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-[13px]">
            <thead>
              <tr>
                <Th>No</Th><Th>Nama Divisi</Th><Th>Departemen</Th>
                <Th>Pusat</Th><Th>ID Karyawan PIC</Th><Th>Nama PIC</Th><Th>Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {divisions.map((d, i) => (
                <tr key={d.id} className="hover:bg-gray-50/50">
                  <Td c="text-gray-400 text-[12px]">{i + 1}</Td>
                  <Td><span className="font-medium text-gray-800">{d.name}</span></Td>
                  <Td><span className="text-[12px] text-gray-600 max-w-[200px] truncate block">{d.department.name}</span></Td>
                  <Td>{d.department.center
                    ? <span className="text-[12px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">{d.department.center.code}</span>
                    : <span className="text-gray-300 text-[12px]">—</span>}
                  </Td>
                  <Td>
                    <span className="font-mono text-[12px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      {d.pic.idKaryawan}
                    </span>
                  </Td>
                  <Td><span className="text-[12px] text-gray-700">{d.pic.nama}</span></Td>
                  <Td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(d)} title="Edit" className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"><EditIcon /></button>
                      <button onClick={() => del(d)} title="Hapus" className="p-1.5 text-red-400 hover:bg-red-50 rounded-md"><TrashIcon /></button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={editing ? 'Edit Divisi' : 'Tambah Divisi'} onClose={close}>
          {/* Step 1: pilih pusat untuk filter dept */}
          <Field label="Filter Pusat">
            <select className={inputCls} value={centerFilter}
              onChange={e => { setCenterFilter(e.target.value); setForm(f => ({ ...f, departmentId: '' })); }}>
              <option value="">Semua Pusat</option>
              {centers.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
          </Field>

          {/* Step 2: pilih departemen */}
          <Field label="Departemen" required>
            <select className={inputCls} value={form.departmentId}
              onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}>
              <option value="">— Pilih Departemen —</option>
              {modalDepts.map(d => <option key={d.id} value={d.id}>{d.code} — {d.name}</option>)}
            </select>
          </Field>

          {/* Step 3: nama divisi */}
          <Field label="Nama Divisi" required>
            <input className={inputCls} placeholder="cth: PEMERIKSAAN LAPANGAN & MANAJEMEN DARURAT"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </Field>

          {/* Step 4: pilih PIC */}
          <Field label="PIC Divisi" required>
            <div className="relative">
              <input className={inputCls} placeholder="Cari ID Karyawan atau nama PIC…"
                value={picSearch}
                onChange={e => { setPicSearch(e.target.value); setForm(f => ({ ...f, picId: '' })); setPicOpen(true); }}
                onFocus={() => setPicOpen(true)}
              />
              {picOpen && picResults.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-44 overflow-y-auto">
                  {picResults.map(u => (
                    <button key={u.id} type="button"
                      className="w-full text-left px-3 py-2.5 hover:bg-orange-50 border-b border-gray-50 last:border-0 transition-colors"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => { setForm(f => ({ ...f, picId: u.id })); setPicSearch(`${u.idKaryawan} — ${u.nama}`); setPicOpen(false); }}>
                      <span className="font-mono text-[12px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded mr-2">{u.idKaryawan}</span>
                      <span className="text-[13px] text-gray-700">{u.nama}</span>
                      {u.jabatan && <span className="text-[11px] text-gray-400 ml-2">{u.jabatan}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedPic && form.picId && (
              <div className="mt-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-[12px] text-blue-700 flex items-center gap-2">
                <span className="font-mono font-bold">{selectedPic.idKaryawan}</span>
                <span>—</span>
                <span>{selectedPic.nama}</span>
                {selectedPic.jabatan && <span className="text-blue-400">({selectedPic.jabatan})</span>}
              </div>
            )}
          </Field>

          <ModalActions onCancel={close} onSave={save} saving={saving} />
        </Modal>
      )}
    </>
  );
}


// ═══════════════════════════════════════════════════════════════════
// TAB DAFTAR PELATIHAN (MASTER SERTIFIKAT)
// ═══════════════════════════════════════════════════════════════════

function TabPelatihan() {
  const [list, setList] = useState<MasterPelatihan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLembaga, setFilterLembaga] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<MasterPelatihan | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [namaPelatihan, setNamaPelatihan] = useState('');
  const [lembagaType, setLembagaType] = useState<'KEMNAKER' | 'BNSP' | 'Lainnya'>('KEMNAKER');
  const [lembagaCustom, setLembagaCustom] = useState('');
  const [durasiHari, setDurasiHari] = useState<number | string>(1);
  const [harga, setHarga] = useState<number | string>(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await trainingApi.getAll();
      setList(data);
    } catch {
      toast.error('Gagal memuat daftar pelatihan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setNamaPelatihan('');
    setLembagaType('KEMNAKER');
    setLembagaCustom('');
    setDurasiHari(1);
    setHarga(0);
    setModal(true);
  };

  const openEdit = (item: MasterPelatihan) => {
    setEditing(item);
    setNamaPelatihan(item.namaPelatihan);
    if (item.lembaga === 'KEMNAKER' || item.lembaga === 'BNSP') {
      setLembagaType(item.lembaga);
      setLembagaCustom('');
    } else {
      setLembagaType('Lainnya');
      setLembagaCustom(item.lembaga);
    }
    setDurasiHari(item.durasiHari);
    setHarga(item.harga);
    setModal(true);
  };

  const close = () => {
    setModal(false);
    setEditing(null);
  };

  const save = async () => {
    if (!namaPelatihan.trim()) {
      toast.error('Nama pelatihan wajib diisi');
      return;
    }
    const finalLembaga = lembagaType === 'Lainnya' ? (lembagaCustom.trim() || 'Lainnya') : lembagaType;
    if (lembagaType === 'Lainnya' && !lembagaCustom.trim()) {
      toast.error('Ketikkan nama lembaga');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        namaPelatihan: namaPelatihan.trim(),
        lembaga: finalLembaga,
        durasiHari: Number(durasiHari) || 1,
        harga: Number(harga) || 0,
      };

      if (editing) {
        await trainingApi.update(editing.id, payload);
        toast.success('Pelatihan diperbarui');
      } else {
        await trainingApi.create(payload);
        toast.success('Pelatihan ditambahkan');
      }
      close();
      load();
    } catch (e: any) {
      toast.error(e?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const del = async (item: MasterPelatihan) => {
    if (!confirm(`Hapus pelatihan "${item.namaPelatihan}"?\n(Pelatihan ini tidak akan muncul lagi di opsi pendaftaran sertifikat baru)`)) return;
    try {
      await trainingApi.delete(item.id);
      toast.success('Pelatihan dihapus');
      load();
    } catch (e: any) {
      toast.error(e?.message || 'Gagal menghapus');
    }
  };

  const filtered = list.filter((p) => {
    const matchSearch =
      search === '' ||
      p.namaPelatihan.toLowerCase().includes(search.toLowerCase()) ||
      p.lembaga.toLowerCase().includes(search.toLowerCase());
    const matchLembaga = filterLembaga === '' || p.lembaga.toUpperCase() === filterLembaga.toUpperCase();
    return matchSearch && matchLembaga;
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pelatihan atau lembaga..."
            className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#FF6B1A] bg-white"
          />
          <select
            value={filterLembaga}
            onChange={(e) => setFilterLembaga(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#FF6B1A] bg-white"
          >
            <option value="">Semua Lembaga</option>
            <option value="KEMNAKER">Kemnaker</option>
            <option value="BNSP">BNSP</option>
          </select>
          <span className="text-[12px] text-gray-400">
            {filtered.length} dari {list.length} pelatihan
          </span>
        </div>
        <AddButton onClick={openAdd} label="Tambah Pelatihan" />
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState text={search ? 'Tidak ada pelatihan yang cocok' : 'Belum ada master pelatihan'} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-[13px]">
            <thead>
              <tr>
                <Th>No</Th>
                <Th>Nama Pelatihan (Sertifikat)</Th>
                <Th>Lembaga</Th>
                <Th>Durasi</Th>
                <Th>Perkiraan Biaya</Th>
                <Th c="text-right">Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                  <Td c="text-gray-400 font-mono text-[12px] w-12">{i + 1}</Td>
                  <Td>
                    <span className="font-semibold text-gray-900 block">{item.namaPelatihan}</span>
                  </Td>
                  <Td>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        item.lembaga.toUpperCase() === 'KEMNAKER'
                          ? 'bg-blue-100 text-blue-700'
                          : item.lembaga.toUpperCase() === 'BNSP'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {item.lembaga}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-gray-600 font-medium">{item.durasiHari} Hari</span>
                  </Td>
                  <Td>
                    <span className="text-gray-700 font-semibold">{formatRupiah(item.harga)}</span>
                  </Td>
                  <Td c="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 text-gray-500 hover:text-[#FF6B1A] hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit Pelatihan"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => del(item)}
                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Pelatihan"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal
          title={editing ? 'Edit Master Pelatihan' : 'Tambah Master Pelatihan'}
          onClose={close}
        >
          <Field label="Nama Pelatihan / Jenis Sertifikat" required>
            <input
              type="text"
              value={namaPelatihan}
              onChange={(e) => setNamaPelatihan(e.target.value)}
              placeholder="Contoh: SIO Forklift — Operator Forklift / Ahli K3 Umum"
              className={inputCls}
            />
            <p className="text-[11px] text-gray-400 mt-1">Nama ini yang akan muncul pada dropdown Jenis Sertifikat di menu License & Certification.</p>
          </Field>

          <Field label="Lembaga Sertifikasi" required>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {(['KEMNAKER', 'BNSP', 'Lainnya'] as const).map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setLembagaType(opt)}
                  className={`py-2 px-3 text-[12px] font-bold rounded-lg border text-center transition-all ${
                    lembagaType === opt
                      ? 'border-[#FF6B1A] bg-[#FFF1E8] text-[#FF6B1A]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {lembagaType === 'Lainnya' && (
              <input
                type="text"
                value={lembagaCustom}
                onChange={(e) => setLembagaCustom(e.target.value)}
                placeholder="Ketik nama lembaga (cth: Kemenkes, Disnaker, IRCA)..."
                className={`${inputCls} mt-1`}
              />
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Durasi Pelatihan (Hari)" required>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={durasiHari}
                  onChange={(e) => setDurasiHari(e.target.value)}
                  placeholder="3"
                  className={inputCls}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400">Hari</span>
              </div>
            </Field>

            <Field label="Perkiraan Biaya / Harga (Rp)" required>
              <input
                type="number"
                min="0"
                step="50000"
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                placeholder="3500000"
                className={inputCls}
              />
              <p className="text-[11px] text-gray-400 mt-1">{formatRupiah(Number(harga) || 0)}</p>
            </Field>
          </div>

          <ModalActions onCancel={close} onSave={save} saving={saving} />
        </Modal>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

type TabKey = 'pusat' | 'departemen' | 'divisi' | 'pelatihan';

export default function MasterDataPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('pusat');
  const [centers, setCenters] = useState<Center[]>([]);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'admin') router.push('/dashboard');
    if (!isLoading && !user) router.push('/login');
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('tab') as TabKey;
      if (p && ['pusat', 'departemen', 'divisi', 'pelatihan'].includes(p)) {
        setActiveTab(p);
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') return null;

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'pusat',      label: 'Pusat' },
    { key: 'departemen', label: 'Departemen' },
    { key: 'divisi',     label: 'Divisi' },
    { key: 'pelatihan',  label: 'Daftar Pelatihan (Sertifikat)' },
  ];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-1">
          <span>Admin</span>
          <span>/</span>
          <span className="text-[#FF6B1A] font-medium">Master Data</span>
        </div>
        <h1 className="text-xl font-bold text-[#1F2937]">Master Data Organisasi</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          Kelola hierarki Pusat &rarr; Departemen &rarr; Divisi beserta PIC
        </p>
      </div>

      {/* Tab panel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tab nav */}
        <div className="flex border-b border-gray-100">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-6 py-3.5 text-[13px] font-medium transition-all border-b-2 -mb-px ${
                activeTab === t.key
                  ? 'text-[#FF6B1A] border-[#FF6B1A] bg-[#FFF1E8]/50'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {activeTab === 'pusat'      && <TabPusat onCentersChange={setCenters} />}
          {activeTab === 'departemen' && <TabDepartemen centers={centers} />}
          {activeTab === 'divisi'     && <TabDivisi centers={centers} />}
          {activeTab === 'pelatihan'  && <TabPelatihan />}
        </div>
      </div>
    </div>
  );
}
