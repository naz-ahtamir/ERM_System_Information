'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import {
  objekK3Api,
  ObjekK3,
  ObjekK3Filters,
  Perusahaan,
  KategoriObjek,
  StatusKelayakan,
  PERUSAHAAN_OPTIONS,
  KATEGORI_OPTIONS,
  STATUS_KELAYAKAN_LABELS,
  RiwayatRiksaUji,
  RiwayatMaintenance,
  resolveFileUrl,
  formatTanggal,
  sisaHariColor,
  kategoriLabel,
} from '@/lib/objekK3Api';
import {
  getRiksaUjiList,
  saveRiksaUji,
  updateRiksaUji,
  deleteRiksaUji,
  getMaintenanceList,
  saveMaintenance,
  updateMaintenance,
  updateMaintenanceStatus,
  deleteMaintenance,
  fileToBase64,
  openDocument,
  calculateSisaHari,
} from '@/lib/objekK3HistoryStorage';

// ── Types ─────────────────────────────────────────────────────────────────

interface Department {
  id: string;
  name: string;
  code: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchDepartments(): Promise<Department[]> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('smk3_token') : null;
  const res = await fetch(`${API_BASE}/departments`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) return [];
  return res.json();
}

function Badge({
  label,
  bg,
  text,
}: {
  label: string;
  bg: string;
  text: string;
}) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${bg} ${text} inline-flex items-center`}>
      {label}
    </span>
  );
}

// ── 1. FORM MODAL: REGISTRASI / EDIT MASTER OBJEK K3 ───────────────────────
// Murni hanya input data spesifikasi dan fisik objek K3. Tidak digabung riksa uji/maintenance.

interface MasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (obj: ObjekK3) => void;
  editing?: ObjekK3 | null;
  departments: Department[];
}

function MasterFormModal({ isOpen, onClose, onSaved, editing, departments }: MasterFormModalProps) {
  const isEdit = !!editing;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    perusahaan: '' as Perusahaan | '',
    kategori: '' as KategoriObjek | '',
    namaAlat: '',
    noSeri: '',
    jumlah: '1',
    departemenId: '',
    lokasi: '',
    kapasitas: '',
    satuan: '',
    tahunPemasangan: '',
    kondisiPemasangan: '',
    catatan: '',
    // Existing files
    pengesahanGambar: '',
    fotoAlat: '',
    fotoTagging: '',
  });

  const refs = {
    pengesahanGambar: useRef<HTMLInputElement>(null),
    fotoAlat: useRef<HTMLInputElement>(null),
    fotoTagging: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    if (editing) {
      setForm({
        perusahaan: editing.perusahaan ?? '',
        kategori: editing.kategori ?? '',
        namaAlat: editing.namaAlat ?? '',
        noSeri: editing.noSeri ?? '',
        jumlah: String(editing.jumlah ?? 1),
        departemenId: editing.departemenId ?? '',
        lokasi: editing.lokasi ?? '',
        kapasitas: editing.kapasitas != null ? String(editing.kapasitas) : '',
        satuan: editing.satuan ?? '',
        tahunPemasangan: editing.tahunPemasangan != null ? String(editing.tahunPemasangan) : '',
        kondisiPemasangan: editing.kondisiPemasangan ?? '',
        catatan: editing.catatan ?? '',
        pengesahanGambar: editing.pengesahanGambar ?? '',
        fotoAlat: editing.fotoAlat ?? '',
        fotoTagging: editing.fotoTagging ?? '',
      });
    } else {
      setForm({
        perusahaan: '',
        kategori: '',
        namaAlat: '',
        noSeri: '',
        jumlah: '1',
        departemenId: '',
        lokasi: '',
        kapasitas: '',
        satuan: '',
        tahunPemasangan: '',
        kondisiPemasangan: 'Baik',
        catatan: '',
        pengesahanGambar: '',
        fotoAlat: '',
        fotoTagging: '',
      });
    }
    setError('');
  }, [isOpen, editing]);

  if (!isOpen) return null;

  const set = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.perusahaan) { setError('Perusahaan wajib dipilih'); return; }
    if (!form.kategori) { setError('Kategori Objek K3 wajib dipilih'); return; }
    if (!form.namaAlat.trim()) { setError('Nama Alat wajib diisi'); return; }
    if (!form.noSeri.trim()) { setError('No. Seri / Tagging wajib diisi'); return; }
    if (!form.departemenId) { setError('Departemen wajib dipilih'); return; }
    if (!form.lokasi.trim()) { setError('Lokasi spesifik wajib diisi'); return; }

    setSaving(true);
    setError('');

    try {
      const fd = new FormData();
      const appendStr = (k: string, v: string) => { if (v) fd.append(k, v); };

      appendStr('perusahaan', form.perusahaan);
      appendStr('kategori', form.kategori);
      appendStr('namaAlat', form.namaAlat.trim());
      appendStr('noSeri', form.noSeri.trim());
      appendStr('jumlah', form.jumlah || '1');
      appendStr('departemenId', form.departemenId);
      appendStr('lokasi', form.lokasi.trim());
      appendStr('kapasitas', form.kapasitas);
      appendStr('satuan', form.satuan);
      appendStr('tahunPemasangan', form.tahunPemasangan);
      appendStr('kondisiPemasangan', form.kondisiPemasangan);
      appendStr('catatan', form.catatan);

      const appendFile = (k: keyof typeof refs) => {
        const f = refs[k].current?.files?.[0];
        if (f) fd.append(k, f);
        else if (form[k as keyof typeof form]) fd.append(k, form[k as keyof typeof form] as string);
      };

      appendFile('pengesahanGambar');
      appendFile('fotoAlat');
      appendFile('fotoTagging');

      const result = isEdit
        ? await objekK3Api.update(editing!.id, fd)
        : await objekK3Api.create(fd);

      onSaved(result);
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Gagal menyimpan objek K3');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 text-[13px] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 bg-white transition-colors';
  const labelCls = 'block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1';

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-[17px] text-[#1F2937]">
              {isEdit ? 'Edit Profil Objek K3' : 'Registrasi Objek K3 Baru'}
            </h2>
            <p className="text-[12px] text-[#6B7280]">
              Masukkan identitas & spesifikasi alat. Catatan riksa uji dan maintenance dapat ditambahkan setelahnya.
            </p>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#1F2937] p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-[13px] flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-red-500">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* ── BAGIAN 1: IDENTITAS ALAT ── */}
          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#FF6B1A] mb-3 border-b border-[#E5E7EB] pb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF6B1A]/10 text-[#FF6B1A] inline-flex items-center justify-center text-[11px] font-bold">1</span>
              Identitas Objek K3
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Perusahaan *</label>
                <select value={form.perusahaan} onChange={(e) => set('perusahaan', e.target.value as any)} className={inputCls} required>
                  <option value="">— Pilih Perusahaan —</option>
                  {PERUSAHAAN_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Kategori Objek K3 *</label>
                <select value={form.kategori} onChange={(e) => set('kategori', e.target.value as any)} className={inputCls} required>
                  <option value="">— Pilih Kategori —</option>
                  {KATEGORI_OPTIONS.map((k) => (
                    <option key={k.value} value={k.value}>{k.label}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Nama Alat / Objek K3 *</label>
                <input
                  type="text"
                  value={form.namaAlat}
                  onChange={(e) => set('namaAlat', e.target.value)}
                  placeholder="Contoh: Overhead Crane 15T, Boiler No. 1, Kompresor Angin"
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label className={labelCls}>No. Seri / No. Tagging *</label>
                <input
                  type="text"
                  value={form.noSeri}
                  onChange={(e) => set('noSeri', e.target.value)}
                  placeholder="Contoh: QMB-CRN-001 / SN: 984218"
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Jumlah (Unit) *</label>
                <input
                  type="number"
                  min="1"
                  value={form.jumlah}
                  onChange={(e) => set('jumlah', e.target.value)}
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Departemen *</label>
                <select value={form.departemenId} onChange={(e) => set('departemenId', e.target.value)} className={inputCls} required>
                  <option value="">— Pilih Departemen —</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Lokasi Spesifik *</label>
                <input
                  type="text"
                  value={form.lokasi}
                  onChange={(e) => set('lokasi', e.target.value)}
                  placeholder="Contoh: Workshop Mekanik Bay 3, Gudang Logistik B"
                  className={inputCls}
                  required
                />
              </div>
            </div>
          </section>

          {/* ── BAGIAN 2: SPESIFIKASI & KONDISI ── */}
          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#FF6B1A] mb-3 border-b border-[#E5E7EB] pb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF6B1A]/10 text-[#FF6B1A] inline-flex items-center justify-center text-[11px] font-bold">2</span>
              Spesifikasi Teknis & Kondisi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Kapasitas</label>
                <input
                  type="number"
                  step="any"
                  value={form.kapasitas}
                  onChange={(e) => set('kapasitas', e.target.value)}
                  placeholder="Contoh: 15, 500, 25"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Satuan Kapasitas</label>
                <input
                  type="text"
                  value={form.satuan}
                  onChange={(e) => set('satuan', e.target.value)}
                  placeholder="Contoh: Ton, Bar, kVA, Liter"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Tahun Pembuatan / Pemasangan</label>
                <input
                  type="number"
                  min="1970"
                  max="2035"
                  value={form.tahunPemasangan}
                  onChange={(e) => set('tahunPemasangan', e.target.value)}
                  placeholder="Contoh: 2022"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Kondisi Fisik Alat</label>
                <input
                  type="text"
                  value={form.kondisiPemasangan}
                  onChange={(e) => set('kondisiPemasangan', e.target.value)}
                  placeholder="Contoh: Baik / Beroperasi Normal"
                  className={inputCls}
                />
              </div>
            </div>
          </section>

          {/* ── BAGIAN 3: DOKUMEN & FOTO FISIK ALAT ── */}
          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#FF6B1A] mb-3 border-b border-[#E5E7EB] pb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF6B1A]/10 text-[#FF6B1A] inline-flex items-center justify-center text-[11px] font-bold">3</span>
              Dokumen Spesifikasi & Foto Fisik Alat
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Pengesahan Gambar Pabrikan / Manual Book (PDF/Gambar)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  ref={refs.pengesahanGambar}
                  className="w-full text-[13px] text-[#1F2937] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-[#FAFAFA] file:text-[#1F2937] hover:file:bg-[#E5E7EB] cursor-pointer"
                />
                {form.pengesahanGambar && (
                  <button
                    type="button"
                    onClick={() => openDocument(resolveFileUrl(form.pengesahanGambar))}
                    className="text-[11px] text-[#FF6B1A] hover:underline mt-1 block"
                  >
                    📎 Lihat file tersimpan
                  </button>
                )}
              </div>

              <div>
                <label className={labelCls}>Foto Alat Fisik</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  ref={refs.fotoAlat}
                  className="w-full text-[13px] text-[#1F2937] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-[#FAFAFA] file:text-[#1F2937] hover:file:bg-[#E5E7EB] cursor-pointer"
                />
                {form.fotoAlat && (
                  <button
                    type="button"
                    onClick={() => openDocument(resolveFileUrl(form.fotoAlat))}
                    className="text-[11px] text-[#FF6B1A] hover:underline mt-1 block"
                  >
                    🖼 Lihat foto alat tersimpan
                  </button>
                )}
              </div>

              <div>
                <label className={labelCls}>Foto Tagging / Nameplate Alat</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  ref={refs.fotoTagging}
                  className="w-full text-[13px] text-[#1F2937] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-[#FAFAFA] file:text-[#1F2937] hover:file:bg-[#E5E7EB] cursor-pointer"
                />
                {form.fotoTagging && (
                  <button
                    type="button"
                    onClick={() => openDocument(resolveFileUrl(form.fotoTagging))}
                    className="text-[11px] text-[#FF6B1A] hover:underline mt-1 block"
                  >
                    🖼 Lihat foto tagging tersimpan
                  </button>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Catatan Tambahan / Spesifikasi Khusus (Opsional)</label>
                <textarea
                  value={form.catatan}
                  onChange={(e) => set('catatan', e.target.value)}
                  rows={2}
                  placeholder="Catatan tambahan mengenai objek K3..."
                  className={inputCls + ' resize-none'}
                />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-[13px] font-semibold text-[#1F2937] bg-[#FAFAFA] rounded-xl hover:bg-[#E5E7EB] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-[#FF6B1A] rounded-xl hover:bg-[#E85D0F] transition-colors disabled:opacity-60"
            >
              {saving && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Daftarkan Objek K3'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 2. MODAL DETAIL: 3 TAB (PROFIL, CATATAN RIKSA UJI, CATATAN MAINTENANCE) ─

interface DetailModalProps {
  obj: ObjekK3;
  onClose: () => void;
  onEditMaster: () => void;
  isAdmin: boolean;
  canAdd: boolean;
}

function DetailModal({ obj, onClose, onEditMaster, isAdmin, canAdd }: DetailModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'riksaUji' | 'maintenance'>('profile');

  // Riksa Uji states
  const [riksaUjiList, setRiksaUjiList] = useState<RiwayatRiksaUji[]>([]);
  const [showRiksaUjiForm, setShowRiksaUjiForm] = useState(false);
  const [editingRiksaUjiId, setEditingRiksaUjiId] = useState<string | null>(null);
  const [riksaUjiSubmitting, setRiksaUjiSubmitting] = useState(false);
  const [riksaUjiError, setRiksaUjiError] = useState('');
  const [riksaUjiForm, setRiksaUjiForm] = useState({
    noLHU: '',
    tanggalTerbitLHU: '',
    noSILO: '',
    tanggalTerbitSILO: '',
    tanggalExpiredSILO: '',
    statusKelayakan: 'LAYAK' as StatusKelayakan,
    lembagaPenguji: 'PJK3 Kemnaker',
    catatan: '',
  });
  const fileLHURef = useRef<HTMLInputElement>(null);
  const fileSILORef = useRef<HTMLInputElement>(null);

  // Maintenance states
  const [maintenanceList, setMaintenanceList] = useState<RiwayatMaintenance[]>([]);
  const [showMaintForm, setShowMaintForm] = useState(false);
  const [editingMaintId, setEditingMaintId] = useState<string | null>(null);
  const [maintSubmitting, setMaintSubmitting] = useState(false);
  const [maintError, setMaintError] = useState('');
  const [maintForm, setMaintForm] = useState({
    tanggalRencana: '',
    tanggalAktual: '',
    status: 'RENCANA' as RiwayatMaintenance['status'],
    rincian: '',
    pelaksana: '',
    catatan: '',
  });
  const fileMaintRef = useRef<HTMLInputElement>(null);

  // Load sub-records on mount / change
  useEffect(() => {
    setRiksaUjiList(getRiksaUjiList(obj));
    setMaintenanceList(getMaintenanceList(obj));
  }, [obj]);

  const handleStartEditRiksaUji = (ru: RiwayatRiksaUji) => {
    setEditingRiksaUjiId(ru.id);
    setRiksaUjiForm({
      noLHU: ru.noLHU || '',
      tanggalTerbitLHU: ru.tanggalTerbitLHU || '',
      noSILO: ru.noSILO || '',
      tanggalTerbitSILO: ru.tanggalTerbitSILO || '',
      tanggalExpiredSILO: ru.tanggalExpiredSILO || '',
      statusKelayakan: ru.statusKelayakan,
      lembagaPenguji: ru.lembagaPenguji || '',
      catatan: ru.catatan || '',
    });
    setRiksaUjiError('');
    setShowRiksaUjiForm(true);
  };

  const handleCancelRiksaUjiForm = () => {
    setShowRiksaUjiForm(false);
    setEditingRiksaUjiId(null);
    setRiksaUjiForm({
      noLHU: '',
      tanggalTerbitLHU: '',
      noSILO: '',
      tanggalTerbitSILO: '',
      tanggalExpiredSILO: '',
      statusKelayakan: 'LAYAK',
      lembagaPenguji: 'PJK3 Kemnaker',
      catatan: '',
    });
    if (fileLHURef.current) fileLHURef.current.value = '';
    if (fileSILORef.current) fileSILORef.current.value = '';
  };

  // Riksa Uji Submit Handler (LHU & SILO sekarang opsional)
  const handleSaveRiksaUji = async (e: React.FormEvent) => {
    e.preventDefault();

    setRiksaUjiSubmitting(true);
    setRiksaUjiError('');

    try {
      let fileLHUData: string | null = null;
      let namaFileLHU: string | null = null;
      const lhuFile = fileLHURef.current?.files?.[0];
      if (lhuFile) {
        const res = await fileToBase64(lhuFile);
        fileLHUData = res.dataUrl;
        namaFileLHU = res.name;
      }

      let fileSILOData: string | null = null;
      let namaFileSILO: string | null = null;
      const siloFile = fileSILORef.current?.files?.[0];
      if (siloFile) {
        const res = await fileToBase64(siloFile);
        fileSILOData = res.dataUrl;
        namaFileSILO = res.name;
      }

      if (editingRiksaUjiId) {
        const existing = riksaUjiList.find((r) => r.id === editingRiksaUjiId);
        const updated = updateRiksaUji(obj.id, editingRiksaUjiId, {
          noLHU: riksaUjiForm.noLHU.trim() || null,
          tanggalTerbitLHU: riksaUjiForm.tanggalTerbitLHU || null,
          fileLHU: fileLHUData || existing?.fileLHU || null,
          namaFileLHU: namaFileLHU || existing?.namaFileLHU || null,
          noSILO: riksaUjiForm.noSILO.trim() || null,
          tanggalTerbitSILO: riksaUjiForm.tanggalTerbitSILO || null,
          tanggalExpiredSILO: riksaUjiForm.tanggalExpiredSILO || null,
          fileSILO: fileSILOData || existing?.fileSILO || null,
          namaFileSILO: namaFileSILO || existing?.namaFileSILO || null,
          statusKelayakan: riksaUjiForm.statusKelayakan,
          lembagaPenguji: riksaUjiForm.lembagaPenguji.trim() || 'PJK3 Kemnaker',
          catatan: riksaUjiForm.catatan.trim() || null,
        });
        if (updated) {
          setRiksaUjiList((prev) => prev.map((r) => (r.id === editingRiksaUjiId ? updated : r)));
        }
      } else {
        const saved = saveRiksaUji(obj.id, {
          noLHU: riksaUjiForm.noLHU.trim() || null,
          tanggalTerbitLHU: riksaUjiForm.tanggalTerbitLHU || null,
          fileLHU: fileLHUData,
          namaFileLHU,
          noSILO: riksaUjiForm.noSILO.trim() || null,
          tanggalTerbitSILO: riksaUjiForm.tanggalTerbitSILO || null,
          tanggalExpiredSILO: riksaUjiForm.tanggalExpiredSILO || null,
          fileSILO: fileSILOData,
          namaFileSILO,
          statusKelayakan: riksaUjiForm.statusKelayakan,
          lembagaPenguji: riksaUjiForm.lembagaPenguji.trim() || 'PJK3 Kemnaker',
          catatan: riksaUjiForm.catatan.trim() || null,
        });
        setRiksaUjiList((prev) => [saved, ...prev]);
      }

      handleCancelRiksaUjiForm();
    } catch (err: any) {
      setRiksaUjiError(err.message ?? 'Gagal menyimpan catatan riksa uji');
    } finally {
      setRiksaUjiSubmitting(false);
    }
  };

  const handleDeleteRiksaUji = (ruId: string) => {
    if (!confirm('Hapus catatan riksa uji ini?')) return;
    deleteRiksaUji(obj.id, ruId);
    setRiksaUjiList((prev) => prev.filter((r) => r.id !== ruId));
  };

  const handleStartEditMaintenance = (maint: RiwayatMaintenance) => {
    setEditingMaintId(maint.id);
    setMaintForm({
      tanggalRencana: maint.tanggalRencana || '',
      tanggalAktual: maint.tanggalAktual || '',
      status: maint.status,
      rincian: maint.rincian || '',
      pelaksana: maint.pelaksana || '',
      catatan: maint.catatan || '',
    });
    setMaintError('');
    setShowMaintForm(true);
  };

  const handleCancelMaintForm = () => {
    setShowMaintForm(false);
    setEditingMaintId(null);
    setMaintForm({
      tanggalRencana: '',
      tanggalAktual: '',
      status: 'RENCANA',
      rincian: '',
      pelaksana: '',
      catatan: '',
    });
    if (fileMaintRef.current) fileMaintRef.current.value = '';
  };

  // Maintenance Submit Handler
  const handleSaveMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintForm.tanggalRencana) {
      setMaintError('Tanggal Rencana Maintenance wajib diisi!');
      return;
    }
    if (!maintForm.rincian.trim()) {
      setMaintError('Rincian kegiatan maintenance wajib diisi!');
      return;
    }

    setMaintSubmitting(true);
    setMaintError('');

    try {
      let fileBuktiData: string | null = null;
      let namaFileBukti: string | null = null;
      const bFile = fileMaintRef.current?.files?.[0];
      if (bFile) {
        const res = await fileToBase64(bFile);
        fileBuktiData = res.dataUrl;
        namaFileBukti = res.name;
      }

      if (editingMaintId) {
        const existing = maintenanceList.find((m) => m.id === editingMaintId);
        const updated = updateMaintenance(obj.id, editingMaintId, {
          tanggalRencana: maintForm.tanggalRencana,
          tanggalAktual: maintForm.tanggalAktual || null,
          status: maintForm.status,
          rincian: maintForm.rincian.trim(),
          pelaksana: maintForm.pelaksana.trim() || null,
          fileBukti: fileBuktiData || existing?.fileBukti || null,
          namaFileBukti: namaFileBukti || existing?.namaFileBukti || null,
          catatan: maintForm.catatan.trim() || null,
        });
        if (updated) {
          setMaintenanceList((prev) => prev.map((m) => (m.id === editingMaintId ? updated : m)));
        }
      } else {
        const saved = saveMaintenance(obj.id, {
          tanggalRencana: maintForm.tanggalRencana,
          tanggalAktual: maintForm.tanggalAktual || null,
          status: maintForm.status,
          rincian: maintForm.rincian.trim(),
          pelaksana: maintForm.pelaksana.trim() || null,
          fileBukti: fileBuktiData,
          namaFileBukti,
          catatan: maintForm.catatan.trim() || null,
        });
        setMaintenanceList((prev) => [saved, ...prev]);
      }

      handleCancelMaintForm();
    } catch (err: any) {
      setMaintError(err.message ?? 'Gagal menyimpan catatan maintenance');
    } finally {
      setMaintSubmitting(false);
    }
  };

  const handleUpdateMaintStatus = (maintId: string, newStatus: RiwayatMaintenance['status']) => {
    updateMaintenanceStatus(obj.id, maintId, newStatus);
    setMaintenanceList(getMaintenanceList(obj));
  };

  const handleDeleteMaintenance = (maintId: string) => {
    if (!confirm('Hapus catatan maintenance ini?')) return;
    deleteMaintenance(obj.id, maintId);
    setMaintenanceList((prev) => prev.filter((m) => m.id !== maintId));
  };

  // Latest SILO & Expiry calculation
  const latestRiksaUji = riksaUjiList[0];
  const activeSILOSisaHari = latestRiksaUji?.tanggalExpiredSILO
    ? calculateSisaHari(latestRiksaUji.tanggalExpiredSILO)
    : obj.sisaHari;

  const inputCls =
    'w-full px-3 py-2 text-[13px] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 bg-white transition-colors';
  const labelCls = 'block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1';

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header Modal */}
        <div className="px-6 py-4 bg-white border-b border-[#E5E7EB] flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF6B1A]/10 text-[#FF6B1A] uppercase tracking-wide">
                {kategoriLabel(obj.kategori)}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-[#1F2937]">
                {obj.perusahaan}
              </span>
            </div>
            <h2 className="font-bold text-[18px] text-[#1F2937] leading-snug">{obj.namaAlat}</h2>
            <p className="text-[12px] text-[#6B7280]">
              No. Seri / Tag: <span className="font-mono font-medium text-[#1F2937]">{obj.noSeri}</span> · Lokasi: {obj.lokasi} ({obj.departemen?.name})
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={onEditMaster}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#1F2937] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Edit data master objek K3"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Master
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#9CA3AF] hover:text-[#1F2937] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── 3 TAB NAVIGATION ── */}
        <div className="px-6 bg-[#FAFAFA] border-b border-[#E5E7EB] flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 text-[13px] font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-[#FF6B1A] text-[#FF6B1A]'
                : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            1. Profil Objek K3
          </button>

          <button
            onClick={() => setActiveTab('riksaUji')}
            className={`py-3 px-3 text-[13px] font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'riksaUji'
                ? 'border-[#FF6B1A] text-[#FF6B1A]'
                : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            2. Catatan Riksa Uji (LHU & SILO)
            <span className={`px-2 py-0.5 rounded-full text-[11px] ${
              riksaUjiList.length > 0 ? 'bg-orange-100 text-[#FF6B1A]' : 'bg-gray-200 text-gray-700'
            }`}>
              {riksaUjiList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-3 px-3 text-[13px] font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'maintenance'
                ? 'border-[#FF6B1A] text-[#FF6B1A]'
                : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            3. Catatan Maintenance
            <span className={`px-2 py-0.5 rounded-full text-[11px] ${
              maintenanceList.length > 0 ? 'bg-orange-100 text-[#FF6B1A]' : 'bg-gray-200 text-gray-700'
            }`}>
              {maintenanceList.length}
            </span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* ══════════════════════════════════════════════════════════════════
              TAB 1: PROFIL OBJEK K3
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              
              {/* Status Ringkasan SILO & Kelaikan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#FFF8F4] border border-orange-200 rounded-xl">
                  <p className="text-[11px] font-bold uppercase text-[#FF6B1A] mb-1">Status Kelaikan Alat</p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[15px] text-[#1F2937]">
                      {latestRiksaUji?.statusKelayakan
                        ? STATUS_KELAYAKAN_LABELS[latestRiksaUji.statusKelayakan]?.label ?? latestRiksaUji.statusKelayakan
                        : obj.statusKelayakan
                        ? STATUS_KELAYAKAN_LABELS[obj.statusKelayakan]?.label ?? obj.statusKelayakan
                        : 'Belum Diuji'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-[11px] font-bold uppercase text-gray-600 mb-1">SILO Terkini</p>
                  <p className="font-mono font-bold text-[13px] text-[#1F2937]">
                    {latestRiksaUji?.noSILO || obj.noSuket || 'Belum Ada SILO'}
                  </p>
                  <p className="text-[11px] text-[#6B7280]">
                    Exp: {formatTanggal(latestRiksaUji?.tanggalExpiredSILO || obj.tanggalBerlaku)}
                  </p>
                </div>

                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-[11px] font-bold uppercase text-gray-600 mb-1">Masa Berlaku SILO</p>
                  {activeSILOSisaHari != null ? (
                    <p className={`font-bold text-[14px] ${sisaHariColor(activeSILOSisaHari)}`}>
                      {activeSILOSisaHari < 0
                        ? `Kadaluarsa ${Math.abs(activeSILOSisaHari)} hari lalu`
                        : `${activeSILOSisaHari} hari lagi`}
                    </p>
                  ) : (
                    <p className="text-[12px] text-[#9CA3AF]">—</p>
                  )}
                </div>
              </div>

              {/* Data Detail Teknis */}
              <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-5 space-y-3">
                <h4 className="font-bold text-[13px] uppercase text-[#1F2937] tracking-wider mb-2">
                  Spesifikasi Master Alat
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2.5 gap-x-6 text-[13px]">
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-[#6B7280]">Perusahaan:</span>
                    <span className="font-semibold text-[#1F2937]">{obj.perusahaan}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-[#6B7280]">Kategori:</span>
                    <span className="font-semibold text-[#1F2937]">{kategoriLabel(obj.kategori)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-[#6B7280]">Nama Alat:</span>
                    <span className="font-semibold text-[#1F2937]">{obj.namaAlat}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-[#6B7280]">No. Seri / Tag:</span>
                    <span className="font-mono font-semibold text-[#1F2937]">{obj.noSeri}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-[#6B7280]">Departemen:</span>
                    <span className="font-semibold text-[#1F2937]">{obj.departemen?.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-[#6B7280]">Lokasi Spesifik:</span>
                    <span className="font-semibold text-[#1F2937]">{obj.lokasi}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-[#6B7280]">Jumlah Unit:</span>
                    <span className="font-semibold text-[#1F2937]">{obj.jumlah} Unit</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-[#6B7280]">Kapasitas:</span>
                    <span className="font-semibold text-[#1F2937]">
                      {obj.kapasitas != null ? `${obj.kapasitas} ${obj.satuan || ''}` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-[#6B7280]">Tahun Pemasangan:</span>
                    <span className="font-semibold text-[#1F2937]">{obj.tahunPemasangan || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-[#6B7280]">Kondisi Pemasangan:</span>
                    <span className="font-semibold text-[#1F2937]">{obj.kondisiPemasangan || '—'}</span>
                  </div>
                </div>

                {obj.catatan && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-[11px] font-bold uppercase text-[#6B7280] block mb-1">Catatan Tambahan:</span>
                    <p className="text-[13px] text-[#1F2937] bg-white p-3 rounded-xl border border-gray-200">
                      {obj.catatan}
                    </p>
                  </div>
                )}
              </div>

              {/* Dokumen & Foto Master Alat */}
              <div>
                <h4 className="font-bold text-[13px] uppercase text-[#1F2937] tracking-wider mb-3">
                  Dokumen Spesifikasi & Foto Fisik
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Foto Alat */}
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 flex flex-col items-center text-center">
                    <p className="text-[11px] font-bold text-[#6B7280] uppercase mb-2">Foto Fisik Alat</p>
                    {obj.fotoAlat ? (
                      <div className="relative group cursor-pointer" onClick={() => openDocument(resolveFileUrl(obj.fotoAlat))}>
                        <img
                          src={resolveFileUrl(obj.fotoAlat)}
                          alt="Foto Alat"
                          className="w-36 h-36 object-cover rounded-xl border border-gray-200 group-hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-opacity">
                          Klik untuk Memperbesar
                        </div>
                      </div>
                    ) : (
                      <div className="w-36 h-36 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-[11px]">
                        Belum ada foto
                      </div>
                    )}
                  </div>

                  {/* Foto Tagging */}
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 flex flex-col items-center text-center">
                    <p className="text-[11px] font-bold text-[#6B7280] uppercase mb-2">Foto Tagging / Nameplate</p>
                    {obj.fotoTagging ? (
                      <div className="relative group cursor-pointer" onClick={() => openDocument(resolveFileUrl(obj.fotoTagging))}>
                        <img
                          src={resolveFileUrl(obj.fotoTagging)}
                          alt="Foto Tagging"
                          className="w-36 h-36 object-cover rounded-xl border border-gray-200 group-hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-opacity">
                          Klik untuk Memperbesar
                        </div>
                      </div>
                    ) : (
                      <div className="w-36 h-36 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-[11px]">
                        Belum ada foto
                      </div>
                    )}
                  </div>

                  {/* Pengesahan Gambar Pabrikan */}
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-[#6B7280] uppercase mb-1">Pengesahan Gambar / Manual</p>
                      <p className="text-[12px] text-[#9CA3AF] mb-4">Dokumen teknis pengesahan pabrikan dari Disnaker / Kemnaker.</p>
                    </div>
                    {obj.pengesahanGambar ? (
                      <button
                        type="button"
                        onClick={() => openDocument(resolveFileUrl(obj.pengesahanGambar), 'Pengesahan Gambar')}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 text-[12px] font-semibold text-[#FF6B1A] bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 transition-colors"
                      >
                        📄 Buka Pengesahan Gambar
                      </button>
                    ) : (
                      <span className="text-[12px] text-gray-400 italic">Belum diunggah</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tombol Aksi Edit Profil untuk Admin */}
              {isAdmin && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={onEditMaster}
                    className="flex items-center gap-2 px-4 py-2 text-[12px] font-semibold text-white bg-[#1F2937] hover:bg-[#374151] rounded-xl shadow-xs transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit Profil & Identitas Objek K3
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 2: CATATAN RIKSA UJI (LHU & SILO)
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'riksaUji' && (
            <div className="space-y-5">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#E5E7EB]">
                <div>
                  <h3 className="font-bold text-[15px] text-[#1F2937]">Histori Riksa Uji (LHU & SILO)</h3>
                  <p className="text-[12px] text-[#6B7280]">
                    Pencatatan riwayat berkala Laporan Hasil Uji (LHU) dan Surat Izin Layak Operasi (SILO)
                  </p>
                </div>
                {canAdd && (
                  <button
                    onClick={() => {
                      if (showRiksaUjiForm) {
                        handleCancelRiksaUjiForm();
                      } else {
                        setShowRiksaUjiForm(true);
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-white bg-[#FF6B1A] hover:bg-[#E85D0F] rounded-xl shadow-xs transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    {showRiksaUjiForm ? 'Tutup Formulir' : 'Tambah Catatan Riksa Uji'}
                  </button>
                )}
              </div>

              {/* Sub-Form Tambah / Edit Riksa Uji */}
              {showRiksaUjiForm && (
                <form onSubmit={handleSaveRiksaUji} className="bg-[#FFF8F4]/40 border-2 border-[#FF6B1A]/30 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-orange-200 pb-2">
                    <h4 className="font-bold text-[14px] text-[#FF6B1A]">
                      {editingRiksaUjiId ? 'Edit Catatan Riksa Uji' : 'Form Input Catatan Riksa Uji Baru'}
                    </h4>
                    <span className="text-[11px] text-gray-500 font-medium">LHU & SILO (Opsional)</span>
                  </div>

                  {riksaUjiError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[12px] rounded-xl">
                      {riksaUjiError}
                    </div>
                  )}

                  {/* Section A: LHU */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                    <h5 className="text-[12px] font-bold uppercase tracking-wider text-[#1F2937] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      1. Dokumen LHU (Laporan Hasil Riksa Uji)
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className={labelCls}>Nomor LHU (Opsional)</label>
                        <input
                          type="text"
                          value={riksaUjiForm.noLHU}
                          onChange={(e) => setRiksaUjiForm((p) => ({ ...p, noLHU: e.target.value }))}
                          placeholder="Contoh: LHU/PJK3/2026/089"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Tanggal Terbit LHU (Opsional)</label>
                        <input
                          type="date"
                          value={riksaUjiForm.tanggalTerbitLHU}
                          onChange={(e) => setRiksaUjiForm((p) => ({ ...p, tanggalTerbitLHU: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Upload File LHU (PDF)</label>
                        <input
                          type="file"
                          accept=".pdf"
                          ref={fileLHURef}
                          className="w-full text-[12px] text-[#1F2937] file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-gray-100 hover:file:bg-gray-200 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section B: SILO */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                    <h5 className="text-[12px] font-bold uppercase tracking-wider text-[#1F2937] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      2. Dokumen SILO (Surat Izin Layak Operasi / Suket)
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className={labelCls}>Nomor SILO / Suket (Opsional)</label>
                        <input
                          type="text"
                          value={riksaUjiForm.noSILO}
                          onChange={(e) => setRiksaUjiForm((p) => ({ ...p, noSILO: e.target.value }))}
                          placeholder="Contoh: 566/SKT-PAA/DISNAKER/2026"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Tanggal Terbit SILO (Opsional)</label>
                        <input
                          type="date"
                          value={riksaUjiForm.tanggalTerbitSILO}
                          onChange={(e) => setRiksaUjiForm((p) => ({ ...p, tanggalTerbitSILO: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Tanggal Expired SILO (Opsional)</label>
                        <input
                          type="date"
                          value={riksaUjiForm.tanggalExpiredSILO}
                          onChange={(e) => setRiksaUjiForm((p) => ({ ...p, tanggalExpiredSILO: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Upload File SILO (PDF)</label>
                        <input
                          type="file"
                          accept=".pdf"
                          ref={fileSILORef}
                          className="w-full text-[12px] text-[#1F2937] file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-gray-100 hover:file:bg-gray-200 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section C: Hasil & Catatan */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>Status Kelayakan Hasil Uji</label>
                      <select
                        value={riksaUjiForm.statusKelayakan}
                        onChange={(e) => setRiksaUjiForm((p) => ({ ...p, statusKelayakan: e.target.value as any }))}
                        className={inputCls}
                      >
                        <option value="LAYAK">Layak Beroperasi</option>
                        <option value="TIDAK_LAYAK">Tidak Layak</option>
                        <option value="PERLU_PERBAIKAN">Perlu Perbaikan</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Lembaga Penguji / PJK3</label>
                      <input
                        type="text"
                        value={riksaUjiForm.lembagaPenguji}
                        onChange={(e) => setRiksaUjiForm((p) => ({ ...p, lembagaPenguji: e.target.value }))}
                        placeholder="Contoh: PT Biro Klasifikasi / Disnaker"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Catatan / Rekomendasi</label>
                      <input
                        type="text"
                        value={riksaUjiForm.catatan}
                        onChange={(e) => setRiksaUjiForm((p) => ({ ...p, catatan: e.target.value }))}
                        placeholder="Catatan temuan riksa uji..."
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-orange-200">
                    <button
                      type="button"
                      onClick={handleCancelRiksaUjiForm}
                      className="px-3.5 py-1.5 text-[12px] font-semibold bg-gray-100 hover:bg-gray-200 text-[#1F2937] rounded-xl transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={riksaUjiSubmitting}
                      className="px-4 py-1.5 text-[12px] font-semibold text-white bg-[#FF6B1A] hover:bg-[#E85D0F] rounded-xl transition-colors disabled:opacity-60"
                    >
                      {riksaUjiSubmitting ? 'Menyimpan...' : editingRiksaUjiId ? 'Simpan Perubahan' : 'Simpan Catatan Riksa Uji'}
                    </button>
                  </div>
                </form>
              )}

              {/* Tabel Histori Riksa Uji */}
              {riksaUjiList.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-[#FF6B1A] mx-auto flex items-center justify-center mb-2">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <p className="font-semibold text-[14px] text-[#1F2937] mb-1">Belum ada catatan riksa uji</p>
                  <p className="text-[12px] text-[#6B7280] max-w-sm mx-auto mb-3">
                    Klik tombol "Tambah Catatan Riksa Uji" di atas untuk mendokumentasikan nomor & file LHU dan SILO.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {riksaUjiList.map((ru, idx) => {
                    const sisaHari = calculateSisaHari(ru.tanggalExpiredSILO);
                    const isLatest = idx === 0;

                    return (
                      <div
                        key={ru.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isLatest
                            ? 'bg-[#FFF8F4]/30 border-orange-200 shadow-xs'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[11px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                              #{riksaUjiList.length - idx}
                            </span>
                            {isLatest && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                                SILO Aktif Terkini
                              </span>
                            )}
                            <Badge
                              label={STATUS_KELAYAKAN_LABELS[ru.statusKelayakan]?.label || ru.statusKelayakan}
                              bg={STATUS_KELAYAKAN_LABELS[ru.statusKelayakan]?.bg || 'bg-gray-100'}
                              text={STATUS_KELAYAKAN_LABELS[ru.statusKelayakan]?.text || 'text-gray-700'}
                            />
                            {ru.lembagaPenguji && (
                              <span className="text-[12px] text-gray-500 font-medium">
                                Penguji: {ru.lembagaPenguji}
                              </span>
                            )}
                          </div>

                          {isAdmin && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleStartEditRiksaUji(ru)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                                title="Edit catatan riksa uji ini"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteRiksaUji(ru.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                title="Hapus catatan riksa uji"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Detail Perbandingan LHU & SILO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          
                          {/* Box LHU */}
                          <div className="p-3 bg-white border border-gray-200 rounded-xl">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                LHU (Laporan Hasil Uji)
                              </span>
                              {ru.fileLHU ? (
                                <button
                                  type="button"
                                  onClick={() => openDocument(ru.fileLHU, `LHU - ${ru.noLHU || 'Dokumen'}`)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                  📄 Buka File LHU
                                </button>
                              ) : (
                                <span className="text-[11px] text-gray-400 italic">Tanpa file</span>
                              )}
                            </div>
                            {ru.noLHU ? (
                              <p className="font-mono text-[13px] font-semibold text-[#1F2937]">{ru.noLHU}</p>
                            ) : (
                              <p className="font-mono text-[13px] text-gray-400 italic">Belum ada nomor LHU</p>
                            )}
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Terbit: <span className="text-gray-700 font-medium">{ru.tanggalTerbitLHU ? formatTanggal(ru.tanggalTerbitLHU) : '—'}</span>
                            </p>
                          </div>

                          {/* Box SILO */}
                          <div className="p-3 bg-white border border-gray-200 rounded-xl">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-green-600 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                SILO (Surat Izin Layak Operasi)
                              </span>
                              {ru.fileSILO ? (
                                <button
                                  type="button"
                                  onClick={() => openDocument(ru.fileSILO, `SILO - ${ru.noSILO || 'Dokumen'}`)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                >
                                  📄 Buka File SILO
                                </button>
                              ) : (
                                <span className="text-[11px] text-gray-400 italic">Tanpa file</span>
                              )}
                            </div>
                            {ru.noSILO ? (
                              <p className="font-mono text-[13px] font-semibold text-[#1F2937]">{ru.noSILO}</p>
                            ) : (
                              <p className="font-mono text-[13px] text-gray-400 italic">Belum ada nomor SILO</p>
                            )}
                            <div className="flex items-center justify-between text-[11px] text-gray-500 mt-0.5">
                              <span>
                                Berlaku: <span className="text-gray-700 font-medium">{ru.tanggalTerbitSILO ? formatTanggal(ru.tanggalTerbitSILO) : '—'}</span> s/d <span className="text-gray-700 font-medium">{ru.tanggalExpiredSILO ? formatTanggal(ru.tanggalExpiredSILO) : '—'}</span>
                              </span>
                              {sisaHari != null && (
                                <span className={`font-bold ${sisaHariColor(sisaHari)}`}>
                                  {sisaHari < 0 ? `Kadaluarsa` : `${sisaHari} hr lagi`}
                                </span>
                              )}
                            </div>
                          </div>

                        </div>

                        {ru.catatan && (
                          <div className="text-[12px] text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                            <span className="font-semibold text-gray-700">Catatan:</span> {ru.catatan}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 3: CATATAN MAINTENANCE
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'maintenance' && (
            <div className="space-y-5">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#E5E7EB]">
                <div>
                  <h3 className="font-bold text-[15px] text-[#1F2937]">Histori Maintenance & Servis</h3>
                  <p className="text-[12px] text-[#6B7280]">
                    Jadwal rencana vs tanggal aktual pelaksanaan pemeliharaan beserta rincian tindakannya
                  </p>
                </div>
                {canAdd && (
                  <button
                    onClick={() => {
                      if (showMaintForm) {
                        handleCancelMaintForm();
                      } else {
                        setShowMaintForm(true);
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-white bg-[#FF6B1A] hover:bg-[#E85D0F] rounded-xl shadow-xs transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    {showMaintForm ? 'Tutup Formulir' : 'Catat / Jadwalkan Maintenance'}
                  </button>
                )}
              </div>

              {/* Sub-Form Tambah / Edit Maintenance */}
              {showMaintForm && (
                <form onSubmit={handleSaveMaintenance} className="bg-[#FFF8F4]/40 border-2 border-[#FF6B1A]/30 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-orange-200 pb-2">
                    <h4 className="font-bold text-[14px] text-[#FF6B1A]">
                      {editingMaintId ? 'Edit Catatan Maintenance' : 'Form Catat / Jadwalkan Maintenance'}
                    </h4>
                    <span className="text-[11px] text-gray-500 font-medium">Pemeliharaan Rutin</span>
                  </div>

                  {maintError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[12px] rounded-xl">
                      {maintError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>Tanggal Rencana Maintenance *</label>
                      <input
                        type="date"
                        value={maintForm.tanggalRencana}
                        onChange={(e) => setMaintForm((p) => ({ ...p, tanggalRencana: e.target.value }))}
                        className={inputCls}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Tanggal Aktual Pelaksanaan</label>
                      <input
                        type="date"
                        value={maintForm.tanggalAktual}
                        onChange={(e) => setMaintForm((p) => ({ ...p, tanggalAktual: e.target.value }))}
                        className={inputCls}
                      />
                      <span className="text-[10px] text-gray-400">Kosongkan jika masih tahap rencana</span>
                    </div>
                    <div>
                      <label className={labelCls}>Status Maintenance</label>
                      <select
                        value={maintForm.status}
                        onChange={(e) => setMaintForm((p) => ({ ...p, status: e.target.value as any }))}
                        className={inputCls}
                      >
                        <option value="RENCANA">Rencana (Terjadwal)</option>
                        <option value="SEDANG_DIKERJAKAN">Sedang Dikerjakan</option>
                        <option value="SELESAI">Selesai Dikerjakan</option>
                        <option value="TERTUNDA">Tertunda</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Rincian Maintenance yang Dilakukan *</label>
                    <textarea
                      value={maintForm.rincian}
                      onChange={(e) => setMaintForm((p) => ({ ...p, rincian: e.target.value }))}
                      rows={3}
                      placeholder="Jelaskan secara rinci tindakan pemeliharaan yang dilakukan (misal: Penggantian oli mesin, pembersihan filter, kalibrasi limit switch, pengencangan baut pondasi)..."
                      className={inputCls + ' resize-none'}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Teknisi / Vendor Pelaksana</label>
                      <input
                        type="text"
                        value={maintForm.pelaksana}
                        onChange={(e) => setMaintForm((p) => ({ ...p, pelaksana: e.target.value }))}
                        placeholder="Contoh: Tim Maintenance Mekanik / Vendor PT Teknik..."
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Lampiran Bukti / Laporan (PDF/Foto)</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        ref={fileMaintRef}
                        className="w-full text-[12px] text-[#1F2937] file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-gray-100 hover:file:bg-gray-200 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-orange-200">
                    <button
                      type="button"
                      onClick={handleCancelMaintForm}
                      className="px-3.5 py-1.5 text-[12px] font-semibold bg-gray-100 hover:bg-gray-200 text-[#1F2937] rounded-xl transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={maintSubmitting}
                      className="px-4 py-1.5 text-[12px] font-semibold text-white bg-[#FF6B1A] hover:bg-[#E85D0F] rounded-xl transition-colors disabled:opacity-60"
                    >
                      {maintSubmitting ? 'Menyimpan...' : editingMaintId ? 'Simpan Perubahan' : 'Simpan Catatan Maintenance'}
                    </button>
                  </div>
                </form>
              )}

              {/* Tabel / Timeline Histori Maintenance */}
              {maintenanceList.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-[#FF6B1A] mx-auto flex items-center justify-center mb-2">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                    </svg>
                  </div>
                  <p className="font-semibold text-[14px] text-[#1F2937] mb-1">Belum ada catatan maintenance</p>
                  <p className="text-[12px] text-[#6B7280] max-w-sm mx-auto mb-3">
                    Jadwalkan atau catat pemeliharaan alat dengan mengklik tombol "Catat / Jadwalkan Maintenance".
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenanceList.map((maint, idx) => {
                    const statusConfig = {
                      SELESAI: { label: 'Selesai', bg: 'bg-green-100', text: 'text-green-700' },
                      SEDANG_DIKERJAKAN: { label: 'Sedang Dikerjakan', bg: 'bg-blue-100', text: 'text-blue-700' },
                      RENCANA: { label: 'Rencana', bg: 'bg-yellow-100', text: 'text-yellow-700' },
                      TERTUNDA: { label: 'Tertunda', bg: 'bg-red-100', text: 'text-red-700' },
                    }[maint.status] || { label: maint.status, bg: 'bg-gray-100', text: 'text-gray-700' };

                    return (
                      <div
                        key={maint.id}
                        className="p-4 bg-white border border-gray-200 hover:border-gray-300 rounded-2xl transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[11px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                              #{maintenanceList.length - idx}
                            </span>
                            <Badge {...statusConfig} />
                            {maint.pelaksana && (
                              <span className="text-[12px] text-gray-600 font-medium">
                                Teknisi: {maint.pelaksana}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isAdmin && maint.status !== 'SELESAI' && (
                              <button
                                onClick={() => handleUpdateMaintStatus(maint.id, 'SELESAI')}
                                className="px-2.5 py-1 text-[11px] font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                title="Tandai pekerjaan maintenance selesai"
                              >
                                ✓ Tandai Selesai
                              </button>
                            )}
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleStartEditMaintenance(maint)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                                  title="Edit catatan maintenance ini"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteMaintenance(maint.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  title="Hapus catatan maintenance"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Rincian Maintenance */}
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-3">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                            Rincian Pekerjaan Maintenance:
                          </p>
                          <p className="text-[13px] text-[#1F2937] whitespace-pre-line leading-relaxed">
                            {maint.rincian}
                          </p>
                        </div>

                        {/* Tanggal & Bukti Bar */}
                        <div className="flex items-center justify-between flex-wrap gap-2 text-[12px] text-gray-500 pt-1">
                          <div className="flex items-center gap-4 flex-wrap">
                            <span>
                              Rencana: <span className="font-semibold text-gray-800">{formatTanggal(maint.tanggalRencana)}</span>
                            </span>
                            <span>
                              Aktual:{' '}
                              {maint.tanggalAktual ? (
                                <span className="font-semibold text-green-700">{formatTanggal(maint.tanggalAktual)}</span>
                              ) : (
                                <span className="text-gray-400 italic">Belum terlaksana</span>
                              )}
                            </span>
                          </div>

                          {maint.fileBukti && (
                            <button
                              type="button"
                              onClick={() => openDocument(maint.fileBukti, `Bukti Maintenance - ${maint.id}`)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6B1A] hover:underline"
                            >
                              📎 Lihat Dokumen/Foto Bukti
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#FAFAFA] border-t border-[#E5E7EB] flex items-center justify-between shrink-0">
          <p className="text-[11px] text-[#6B7280]">
            ID Objek K3: <span className="font-mono text-[#1F2937]">{obj.id}</span>
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 text-[13px] font-semibold text-white bg-[#1F2937] rounded-xl hover:bg-[#374151] transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}

// ── 3. CARD & TABLE VIEWS FOR MAIN PAGE ───────────────────────────────────

function ObjekK3CardItem({
  obj,
  onDetail,
  onEdit,
  onDelete,
  isAdmin,
}: {
  obj: ObjekK3;
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isAdmin: boolean;
}) {
  const riksaList = getRiksaUjiList(obj);
  const maintList = getMaintenanceList(obj);
  const latestRiksa = riksaList[0];
  const sisaHari = latestRiksa?.tanggalExpiredSILO
    ? calculateSisaHari(latestRiksa.tanggalExpiredSILO)
    : obj.sisaHari;

  const currentKelayakan = latestRiksa?.statusKelayakan || obj.statusKelayakan;
  const sl = currentKelayakan ? STATUS_KELAYAKAN_LABELS[currentKelayakan] : null;

  const accentColor =
    currentKelayakan === 'LAYAK' ? 'bg-green-500' :
    currentKelayakan === 'TIDAK_LAYAK' ? 'bg-red-500' :
    currentKelayakan === 'PERLU_PERBAIKAN' ? 'bg-yellow-500' :
    'bg-[#E5E7EB]';

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      <div>
        <div className={`h-1.5 ${accentColor}`} />
        <div className="p-4">
          
          {/* Header */}
          <div className="mb-2.5">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold text-[#FF6B1A] uppercase tracking-wide truncate">
                {kategoriLabel(obj.kategori)}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                {obj.perusahaan}
              </span>
            </div>
            <button onClick={onDetail} className="text-left w-full group-hover:text-[#FF6B1A] transition-colors">
              <h3 className="font-bold text-[14px] text-[#1F2937] leading-snug truncate" title={obj.namaAlat}>
                {obj.namaAlat}
              </h3>
            </button>
            <p className="text-[11px] font-mono text-[#6B7280]">{obj.noSeri}</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {sl && <Badge {...sl} />}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
              {riksaList.length} Riksa Uji
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700">
              {maintList.length} Maint
            </span>
          </div>

          {/* Location & Dept */}
          <div className="space-y-1 text-[12px] text-[#6B7280] mb-3">
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-gray-400">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span className="truncate">{obj.lokasi}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-gray-400">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span className="truncate">{obj.departemen?.name}</span>
            </div>
          </div>

          {/* SILO Expiry Indicator */}
          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-2 flex items-center justify-between text-[11px]">
            <div>
              <span className="text-[#9CA3AF] block text-[10px] uppercase font-bold">SILO Expired:</span>
              <span className="font-semibold text-[#1F2937]">
                {formatTanggal(latestRiksa?.tanggalExpiredSILO || obj.tanggalBerlaku)}
              </span>
            </div>
            {sisaHari != null && (
              <span className={`font-bold ${sisaHariColor(sisaHari)}`}>
                {sisaHari < 0 ? `Kadaluarsa` : `${sisaHari} hr lagi`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-0">
        <div className="flex gap-2">
          <button
            onClick={onDetail}
            className="flex-1 py-2 text-[12px] font-semibold text-white bg-[#1F2937] hover:bg-[#374151] rounded-xl transition-colors text-center"
          >
            Lihat Histori & Detail
          </button>
          {isAdmin && (
            <>
              <button
                onClick={onEdit}
                className="px-2.5 py-2 text-[#1F2937] bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                title="Edit Master Objek K3"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button
                onClick={onDelete}
                className="px-2.5 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                title="Hapus Objek K3"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 4. MAIN PAGE COMPONENT ────────────────────────────────────────────────

export default function EquipmentSafetyPage() {
  return (
    <Suspense fallback={null}>
      <EquipmentSafetyPageInner />
    </Suspense>
  );
}

function EquipmentSafetyPageInner() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  const isAdmin = role === 'admin';
  const canAdd = !!user;
  const searchParams = useSearchParams();

  const [items, setItems] = useState<ObjekK3[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);

  // Filters
  const [filters, setFilters] = useState<ObjekK3Filters>({});
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Modals
  const [showMasterForm, setShowMasterForm] = useState(false);
  const [editingMaster, setEditingMaster] = useState<ObjekK3 | null>(null);
  const [detailTarget, setDetailTarget] = useState<ObjekK3 | null>(null);

  // Load items
  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setLoadError('');
    try {
      const [data, deps] = await Promise.all([
        objekK3Api.getAll({ ...filters, search: search.trim() || undefined }),
        fetchDepartments(),
      ]);
      setItems(data);
      setDepartments(deps);
    } catch (e: any) {
      setLoadError(e.message ?? 'Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  }, [user, filters, search]);

  useEffect(() => {
    load();
  }, [load]);

  // Open detail if URL has ?id=
  useEffect(() => {
    const targetId = searchParams.get('id');
    if (!targetId || items.length === 0) return;
    const found = items.find((o) => o.id === targetId);
    if (found) setDetailTarget(found);
  }, [searchParams, items]);

  const handleDelete = async (obj: ObjekK3) => {
    if (!confirm(`Hapus objek K3 "${obj.namaAlat}" (${obj.noSeri})?\n\nSeluruh catatan riksa uji dan catatan maintenance alat ini juga akan terhapus.`)) return;
    try {
      await objekK3Api.remove(obj.id);
      setItems((prev) => prev.filter((o) => o.id !== obj.id));
      if (detailTarget?.id === obj.id) setDetailTarget(null);
    } catch (e: any) {
      alert(`Gagal menghapus: ${e.message}`);
    }
  };

  const handleMasterSaved = (saved: ObjekK3) => {
    setItems((prev) => {
      const idx = prev.findIndex((o) => o.id === saved.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    // Immediately open detail view so user can add initial riksa uji / maintenance
    setDetailTarget(saved);
  };

  const setFilter = (k: keyof ObjekK3Filters, v: string) =>
    setFilters((p) => ({ ...p, [k]: v || undefined }));

  // Export CSV Handler
  const handleExportCSV = () => {
    if (items.length === 0) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    const headers = [
      'No',
      'Nama Alat / Objek K3',
      'No Seri / Tagging',
      'Kategori',
      'Perusahaan',
      'Departemen',
      'Lokasi',
      'Jumlah (Unit)',
      'Kapasitas',
      'Satuan',
      'Tahun Pemasangan',
      'Kondisi Pemasangan',
      'Status Kelaikan',
      'No SILO Terkini',
      'Tanggal Terbit SILO',
      'Tanggal Expired SILO',
      'Sisa Hari SILO',
      'No LHU Terkini',
      'Tanggal Terbit LHU',
      'Total Catatan Riksa Uji',
      'Total Catatan Maintenance',
      'Catatan',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = items.map((obj, idx) => {
      const riksaList = getRiksaUjiList(obj);
      const maintList = getMaintenanceList(obj);
      const latestRiksa = riksaList[0];
      const sisaHari = latestRiksa?.tanggalExpiredSILO
        ? calculateSisaHari(latestRiksa.tanggalExpiredSILO)
        : obj.sisaHari;
      const currentKelayakan = latestRiksa?.statusKelayakan || obj.statusKelayakan;

      return [
        idx + 1,
        escapeCsv(obj.namaAlat),
        escapeCsv(obj.noSeri),
        escapeCsv(kategoriLabel(obj.kategori)),
        escapeCsv(obj.perusahaan),
        escapeCsv(obj.departemen?.name || ''),
        escapeCsv(obj.lokasi),
        obj.jumlah ?? 1,
        obj.kapasitas != null ? obj.kapasitas : '',
        escapeCsv(obj.satuan || ''),
        escapeCsv(obj.tahunPemasangan || ''),
        escapeCsv(obj.kondisiPemasangan || ''),
        escapeCsv(currentKelayakan || 'Belum Diuji'),
        escapeCsv(latestRiksa?.noSILO || obj.noSuket || ''),
        escapeCsv(latestRiksa?.tanggalTerbitSILO || ''),
        escapeCsv(latestRiksa?.tanggalExpiredSILO || obj.tanggalBerlaku || ''),
        sisaHari != null ? sisaHari : '',
        escapeCsv(latestRiksa?.noLHU || obj.noLHU || ''),
        escapeCsv(latestRiksa?.tanggalTerbitLHU || ''),
        riksaList.length,
        maintList.length,
        escapeCsv(obj.catatan || ''),
      ].join(',');
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Data_Objek_K3_Equipment_Safety_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      
      {/* ── Page Header (Sesuai Standar Halaman Lain) ── */}
      <div className="bg-white px-6 md:px-10 py-7 border-b border-[#E5E7EB] shadow-xs">
        <div className="max-w-7xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#FF6B1A] mb-1.5">
            Accident Prevention
          </p>
          <h1 className="text-xl md:text-2xl font-bold text-[#1F2937]">
            Equipment Safety (Objek K3)
          </h1>
          <p className="text-[#6B7280] text-[13px] mt-1.5 max-w-3xl">
            Kelola daftar objek K3 (peralatan wajib sertifikasi), lengkap dengan catatan riksa uji berkala (LHU & SILO) dan riwayat pelaksanaan maintenance.
          </p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        
        {/* Search, Action Buttons & Filters */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Box */}
            <div className="relative flex-1 w-full">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama alat, no seri, tagging, lokasi..."
                className="w-full pl-10 pr-4 py-2.5 text-[13px] bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1F2937]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* View Mode Toggle (Pertahankan Kartu & Tabel) */}
            <div className="flex items-center gap-1 bg-[#FAFAFA] border border-[#E5E7EB] p-1 rounded-xl self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'card' ? 'bg-white shadow-xs text-[#FF6B1A]' : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
                title="Tampilan Kartu"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                <span className="hidden sm:inline">Kartu</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-[#FF6B1A]' : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
                title="Tampilan Tabel"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
                <span className="hidden sm:inline">Tabel</span>
              </button>
            </div>

            {/* Tombol Export Data */}
            <button
              type="button"
              onClick={handleExportCSV}
              title="Download data format CSV Excel"
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#E5E7EB] text-[#1F2937] text-[13px] font-semibold rounded-xl hover:border-emerald-500 hover:text-emerald-700 transition-colors shadow-xs whitespace-nowrap shrink-0"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export Data</span>
            </button>

            {/* Tombol Tambah Objek K3 (Cukup 1 tanda + dari icon) */}
            {canAdd && (
              <button
                type="button"
                onClick={() => { setEditingMaster(null); setShowMasterForm(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B1A] text-white text-[13px] font-semibold rounded-xl hover:bg-[#E85D0F] shadow-xs transition-colors whitespace-nowrap shrink-0"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Tambah Objek K3</span>
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[#E5E7EB]">
            <select
              value={filters.kategori ?? ''}
              onChange={(e) => setFilter('kategori', e.target.value)}
              className="py-2 px-3 text-[12px] bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] transition-colors"
            >
              <option value="">Semua Kategori Objek K3</option>
              {KATEGORI_OPTIONS.map((k) => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>

            <select
              value={filters.perusahaan ?? ''}
              onChange={(e) => setFilter('perusahaan', e.target.value)}
              className="py-2 px-3 text-[12px] bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] transition-colors"
            >
              <option value="">Semua Perusahaan</option>
              {PERUSAHAAN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <select
              value={filters.statusKelayakan ?? ''}
              onChange={(e) => setFilter('statusKelayakan', e.target.value)}
              className="py-2 px-3 text-[12px] bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] transition-colors"
            >
              <option value="">Semua Status Kelaikan</option>
              <option value="LAYAK">Layak</option>
              <option value="TIDAK_LAYAK">Tidak Layak</option>
              <option value="PERLU_PERBAIKAN">Perlu Perbaikan</option>
            </select>

            {(filters.kategori || filters.perusahaan || filters.statusKelayakan || search) && (
              <button
                type="button"
                onClick={() => {
                  setFilters({});
                  setSearch('');
                }}
                className="py-2 px-3 text-[12px] font-medium text-gray-500 hover:text-red-600 transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Content View */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E5E7EB] h-52 animate-pulse" />
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-[14px] font-semibold text-[#1F2937] mb-2">{loadError}</p>
            <button onClick={load} className="text-[13px] text-[#FF6B1A] hover:underline font-semibold">Coba lagi</button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-[#E5E7EB] rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#FAFAFA] flex items-center justify-center mb-4 text-[#FF6B1A]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
              </svg>
            </div>
            <p className="font-bold text-[#1F2937] text-[15px] mb-1">
              {search || Object.values(filters).some(Boolean) ? 'Tidak ada hasil yang cocok' : 'Belum ada objek K3 terdaftar'}
            </p>
            <p className="text-[#6B7280] text-[13px] max-w-sm mb-4">
              {search || Object.values(filters).some(Boolean)
                ? 'Silakan ubah filter atau kata kunci pencarian Anda'
                : 'Daftarkan objek K3 pertama untuk mulai mengelola riksa uji dan catatan maintenance.'}
            </p>
            {canAdd && !search && (
              <button
                onClick={() => { setEditingMaster(null); setShowMasterForm(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#FF6B1A] text-white text-[12px] font-semibold rounded-xl hover:bg-[#E85D0F] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Tambah Objek K3
              </button>
            )}
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((obj) => (
              <ObjekK3CardItem
                key={obj.id}
                obj={obj}
                isAdmin={isAdmin}
                onDetail={() => setDetailTarget(obj)}
                onEdit={() => { setEditingMaster(obj); setShowMasterForm(true); }}
                onDelete={() => handleDelete(obj)}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Nama Alat & Seri</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Perusahaan</th>
                    <th className="py-3 px-4">Lokasi & Dept</th>
                    <th className="py-3 px-4">Status Kelaikan</th>
                    <th className="py-3 px-4">Masa Berlaku SILO</th>
                    <th className="py-3 px-4 text-center">Riksa Uji / Maint</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-[13px]">
                  {items.map((obj, idx) => {
                    const riksaList = getRiksaUjiList(obj);
                    const maintList = getMaintenanceList(obj);
                    const latestRiksa = riksaList[0];
                    const sisaHari = latestRiksa?.tanggalExpiredSILO
                      ? calculateSisaHari(latestRiksa.tanggalExpiredSILO)
                      : obj.sisaHari;
                    const currentKelayakan = latestRiksa?.statusKelayakan || obj.statusKelayakan;
                    const sl = currentKelayakan ? STATUS_KELAYAKAN_LABELS[currentKelayakan] : null;

                    return (
                      <tr key={obj.id} className="hover:bg-[#FFF8F4]/40 transition-colors">
                        <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setDetailTarget(obj)}
                            className="text-left font-bold text-[#1F2937] hover:text-[#FF6B1A] transition-colors block"
                          >
                            {obj.namaAlat}
                          </button>
                          <span className="font-mono text-[11px] text-[#6B7280]">{obj.noSeri}</span>
                        </td>
                        <td className="py-3 px-4 text-[12px] text-gray-700">{kategoriLabel(obj.kategori)}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                            {obj.perusahaan}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[12px] text-gray-600">
                          <div className="font-medium text-[#1F2937]">{obj.lokasi}</div>
                          <div className="text-[11px] text-gray-400">{obj.departemen?.name}</div>
                        </td>
                        <td className="py-3 px-4">
                          {sl ? <Badge {...sl} /> : <span className="text-gray-400 text-[11px]">Belum diuji</span>}
                        </td>
                        <td className="py-3 px-4 text-[12px]">
                          <div className="font-medium text-[#1F2937]">
                            {formatTanggal(latestRiksa?.tanggalExpiredSILO || obj.tanggalBerlaku)}
                          </div>
                          {sisaHari != null && (
                            <span className={`text-[11px] font-bold ${sisaHariColor(sisaHari)}`}>
                              {sisaHari < 0 ? `Kadaluarsa` : `${sisaHari} hr lagi`}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700" title="Jumlah riksa uji">
                              📄 {riksaList.length}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700" title="Jumlah maintenance">
                              🔧 {maintList.length}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setDetailTarget(obj)}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#1F2937] hover:bg-[#374151] rounded-lg transition-colors"
                            >
                              Detail & Histori
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => { setEditingMaster(obj); setShowMasterForm(true); }}
                                  className="p-1.5 text-gray-600 hover:text-[#FF6B1A] hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Edit Master"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(obj)}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Hapus"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ── MODAL FORM MASTER OBJEK K3 ── */}
      <MasterFormModal
        isOpen={showMasterForm}
        onClose={() => setShowMasterForm(false)}
        onSaved={handleMasterSaved}
        editing={editingMaster}
        departments={departments}
      />

      {/* ── MODAL DETAIL DENGAN 3 TAB ── */}
      {detailTarget && (
        <DetailModal
          obj={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEditMaster={() => {
            const t = detailTarget;
            setDetailTarget(null);
            setEditingMaster(t);
            setShowMasterForm(true);
          }}
          isAdmin={isAdmin}
          canAdd={canAdd}
        />
      )}

    </div>
  );
}
