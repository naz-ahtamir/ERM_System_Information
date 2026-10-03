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
  StatusRiksaUji,
  StatusAman,
  PERUSAHAAN_OPTIONS,
  KATEGORI_OPTIONS,
  STATUS_KELAYAKAN_LABELS,
  STATUS_RIKSA_UJI_LABELS,
  STATUS_AMAN_LABELS,
  RiwayatPemeriksaan,
  resolveFileUrl,
  formatTanggal,
  sisaHariColor,
  kategoriLabel,
} from '@/lib/objekK3Api';

// ── Types ─────────────────────────────────────────────────────────────────

interface Department {
  id: string;
  name: string;
  code: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────

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
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${bg} ${text}`}>
      {label}
    </span>
  );
}

// ── Form Modal ────────────────────────────────────────────────────────────

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (obj: ObjekK3) => void;
  editing?: ObjekK3 | null;
  departments: Department[];
}

function FormModal({ isOpen, onClose, onSaved, editing, departments }: FormModalProps) {
  const isEdit = !!editing;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Text/select fields
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
    tanggalPengujianPertama: '',
    tanggalPengujianBerkala: '',
    statusKelayakan: '' as StatusKelayakan | '',
    statusRiksaUji: '' as StatusRiksaUji | '',
    noSuket: '',
    tanggalRiksaUjiTerakhir: '',
    tanggalBerlaku: '',
    statusAman: '' as StatusAman | '',
    jadwalRiksaUji: '',
    lhu: '' as 'ADA' | 'TIDAK_ADA' | '',
    lhuAda: '' as 'ADA' | 'TIDAK_ADA' | '',
    noLHU: '',
    catatan: '',
    // Existing file URLs (for edit — keep if no new upload)
    pengesahanGambar: '',
    fileLHU: '',
    fotoAlat: '',
    fotoTagging: '',
    sertifikat: '',
    laporanPemeriksaan: '',
  });

  // File refs
  const refs = {
    pengesahanGambar: useRef<HTMLInputElement>(null),
    fileLHU: useRef<HTMLInputElement>(null),
    fotoAlat: useRef<HTMLInputElement>(null),
    fotoTagging: useRef<HTMLInputElement>(null),
    sertifikat: useRef<HTMLInputElement>(null),
    laporanPemeriksaan: useRef<HTMLInputElement>(null),
  };

  // Populate when editing
  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      const isoDate = (v?: string | null) => (v ? v.slice(0, 10) : '');
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
        tanggalPengujianPertama: isoDate(editing.tanggalPengujianPertama),
        tanggalPengujianBerkala: isoDate(editing.tanggalPengujianBerkala),
        statusKelayakan: editing.statusKelayakan ?? '',
        statusRiksaUji: editing.statusRiksaUji ?? '',
        noSuket: editing.noSuket ?? '',
        tanggalRiksaUjiTerakhir: isoDate(editing.tanggalRiksaUjiTerakhir),
        tanggalBerlaku: isoDate(editing.tanggalBerlaku),
        statusAman: editing.statusAman ?? '',
        jadwalRiksaUji: isoDate(editing.jadwalRiksaUji),
        lhu: (editing.lhu as any) ?? '',
        lhuAda: (editing.lhuAda as any) ?? '',
        noLHU: editing.noLHU ?? '',
        catatan: editing.catatan ?? '',
        pengesahanGambar: editing.pengesahanGambar ?? '',
        fileLHU: editing.fileLHU ?? '',
        fotoAlat: editing.fotoAlat ?? '',
        fotoTagging: editing.fotoTagging ?? '',
        sertifikat: editing.sertifikat ?? '',
        laporanPemeriksaan: editing.laporanPemeriksaan ?? '',
      });
    } else {
      setForm({
        perusahaan: '', kategori: '', namaAlat: '', noSeri: '', jumlah: '1',
        departemenId: '', lokasi: '', kapasitas: '', satuan: '',
        tahunPemasangan: '', kondisiPemasangan: '',
        tanggalPengujianPertama: '', tanggalPengujianBerkala: '',
        statusKelayakan: '', statusRiksaUji: '', noSuket: '',
        tanggalRiksaUjiTerakhir: '', tanggalBerlaku: '',
        statusAman: '', jadwalRiksaUji: '',
        lhu: '', lhuAda: '', noLHU: '', catatan: '',
        pengesahanGambar: '', fileLHU: '', fotoAlat: '',
        fotoTagging: '', sertifikat: '', laporanPemeriksaan: '',
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
    if (!form.kategori) { setError('Kategori wajib dipilih'); return; }
    if (!form.namaAlat.trim()) { setError('Nama Alat wajib diisi'); return; }
    if (!form.noSeri.trim()) { setError('No. Seri wajib diisi'); return; }
    if (!form.departemenId) { setError('Departemen wajib dipilih'); return; }
    if (!form.lokasi.trim()) { setError('Lokasi wajib diisi'); return; }
    if (form.lhu === 'ADA' && !refs.fileLHU.current?.files?.[0] && !form.fileLHU) {
      setError('File LHU wajib diupload jika LHU = ADA');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const fd = new FormData();
      const appendStr = (k: string, v: string) => { if (v) fd.append(k, v); };
      const appendFile = (k: keyof typeof refs) => {
        const f = refs[k].current?.files?.[0];
        if (f) fd.append(k, f);
        // Pass existing URL so backend keeps it if no new upload
        else if (form[k as keyof typeof form]) fd.append(k, form[k as keyof typeof form] as string);
      };

      appendStr('perusahaan', form.perusahaan);
      appendStr('kategori', form.kategori);
      appendStr('namaAlat', form.namaAlat);
      appendStr('noSeri', form.noSeri);
      appendStr('jumlah', form.jumlah);
      appendStr('departemenId', form.departemenId);
      appendStr('lokasi', form.lokasi);
      appendStr('kapasitas', form.kapasitas);
      appendStr('satuan', form.satuan);
      appendStr('tahunPemasangan', form.tahunPemasangan);
      appendStr('kondisiPemasangan', form.kondisiPemasangan);
      appendStr('tanggalPengujianPertama', form.tanggalPengujianPertama);
      appendStr('tanggalPengujianBerkala', form.tanggalPengujianBerkala);
      appendStr('statusKelayakan', form.statusKelayakan);
      appendStr('statusRiksaUji', form.statusRiksaUji);
      appendStr('noSuket', form.noSuket);
      appendStr('tanggalRiksaUjiTerakhir', form.tanggalRiksaUjiTerakhir);
      appendStr('tanggalBerlaku', form.tanggalBerlaku);
      appendStr('statusAman', form.statusAman);
      appendStr('jadwalRiksaUji', form.jadwalRiksaUji);
      appendStr('lhu', form.lhu);
      appendStr('lhuAda', form.lhuAda);
      appendStr('noLHU', form.noLHU);
      appendStr('catatan', form.catatan);

      appendFile('pengesahanGambar');
      appendFile('fileLHU');
      appendFile('fotoAlat');
      appendFile('fotoTagging');
      appendFile('sertifikat');
      appendFile('laporanPemeriksaan');

      const result = isEdit
        ? await objekK3Api.update(editing!.id, fd)
        : await objekK3Api.create(fd);

      onSaved(result);
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 bg-white';
  const labelCls = 'block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5';

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-[#e5e0db] z-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#f15a22] mb-0.5">
              Manajemen Objek K3
            </p>
            <h2 className="font-bold text-[15px] text-[#231f20]">
              {isEdit ? 'Edit Objek K3' : 'Tambah Objek K3 Baru'}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700">
              {error}
            </div>
          )}

          {/* ── Identitas ── */}
          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#f15a22] mb-3 border-b border-[#e5e0db] pb-1">
              Identitas Alat
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Perusahaan *</label>
                <select value={form.perusahaan} onChange={(e) => set('perusahaan', e.target.value)} className={inputCls} required>
                  <option value="">— Pilih —</option>
                  {PERUSAHAAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Kategori *</label>
                <select value={form.kategori} onChange={(e) => set('kategori', e.target.value)} className={inputCls} required>
                  <option value="">— Pilih —</option>
                  {KATEGORI_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Nama Alat *</label>
                <input type="text" value={form.namaAlat} onChange={(e) => set('namaAlat', e.target.value)}
                  placeholder="cth: Boiler, Crane, Genset" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>No. Seri *</label>
                <input type="text" value={form.noSeri} onChange={(e) => set('noSeri', e.target.value)}
                  placeholder="Nomor seri / ID alat" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Jumlah *</label>
                <input type="number" min={1} value={form.jumlah} onChange={(e) => set('jumlah', e.target.value)}
                  className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Departemen *</label>
                <select value={form.departemenId} onChange={(e) => set('departemenId', e.target.value)} className={inputCls} required>
                  <option value="">— Pilih —</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Lokasi *</label>
                <input type="text" value={form.lokasi} onChange={(e) => set('lokasi', e.target.value)}
                  placeholder="Lokasi alat berada" className={inputCls} required />
              </div>
            </div>
          </section>

          {/* ── Spesifikasi ── */}
          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#f15a22] mb-3 border-b border-[#e5e0db] pb-1">
              Spesifikasi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Kapasitas</label>
                <input type="number" step="any" value={form.kapasitas} onChange={(e) => set('kapasitas', e.target.value)}
                  className={inputCls} placeholder="0" />
              </div>
              <div>
                <label className={labelCls}>Satuan</label>
                <input type="text" value={form.satuan} onChange={(e) => set('satuan', e.target.value)}
                  placeholder="ton / kg / kW / HP" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Tahun Pemasangan</label>
                <input type="number" value={form.tahunPemasangan} onChange={(e) => set('tahunPemasangan', e.target.value)}
                  placeholder="2020" className={inputCls} />
              </div>
              <div className="sm:col-span-3">
                <label className={labelCls}>Kondisi Pemasangan</label>
                <input type="text" value={form.kondisiPemasangan} onChange={(e) => set('kondisiPemasangan', e.target.value)}
                  className={inputCls} placeholder="Kondisi saat pertama dipasang" />
              </div>
            </div>
          </section>

          {/* ── Pengujian & Status ── */}
          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#f15a22] mb-3 border-b border-[#e5e0db] pb-1">
              Pengujian & Status Kelayakan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Tgl Pengujian Pertama</label>
                <input type="date" value={form.tanggalPengujianPertama} onChange={(e) => set('tanggalPengujianPertama', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Tgl Pengujian Berkala</label>
                <input type="date" value={form.tanggalPengujianBerkala} onChange={(e) => set('tanggalPengujianBerkala', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Status Kelayakan</label>
                <select value={form.statusKelayakan} onChange={(e) => set('statusKelayakan', e.target.value as any)} className={inputCls}>
                  <option value="">— Pilih —</option>
                  <option value="LAYAK">Layak</option>
                  <option value="TIDAK_LAYAK">Tidak Layak</option>
                  <option value="PERLU_PERBAIKAN">Perlu Perbaikan</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Status Riksa Uji</label>
                <select value={form.statusRiksaUji} onChange={(e) => set('statusRiksaUji', e.target.value as any)} className={inputCls}>
                  <option value="">— Pilih —</option>
                  <option value="SUDAH">Sudah</option>
                  <option value="BELUM">Belum</option>
                  <option value="DALAM_PROSES">Dalam Proses</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>No. Surat Keterangan (Suket)</label>
                <input type="text" value={form.noSuket} onChange={(e) => set('noSuket', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Tgl Riksa Uji Terakhir</label>
                <input type="date" value={form.tanggalRiksaUjiTerakhir} onChange={(e) => set('tanggalRiksaUjiTerakhir', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Tanggal Berlaku Sertifikat</label>
                <input type="date" value={form.tanggalBerlaku} onChange={(e) => set('tanggalBerlaku', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Jadwal Riksa Uji Berikutnya</label>
                <input type="date" value={form.jadwalRiksaUji} onChange={(e) => set('jadwalRiksaUji', e.target.value)} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Status Aman</label>
                <select value={form.statusAman} onChange={(e) => set('statusAman', e.target.value as any)} className={inputCls}>
                  <option value="">— Pilih —</option>
                  <option value="AMAN">Aman</option>
                  <option value="PROSES_RIKSA_UJI">Proses Riksa Uji</option>
                  <option value="PROSES_PERPANJANG">Proses Perpanjang</option>
                  <option value="BELUM_ADA_PLAN">Belum Ada Plan</option>
                </select>
              </div>
            </div>
          </section>

          {/* ── LHU ── */}
          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#f15a22] mb-3 border-b border-[#e5e0db] pb-1">
              LHU (Laporan Hasil Uji)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Status LHU</label>
                <select value={form.lhu} onChange={(e) => set('lhu', e.target.value as any)} className={inputCls}>
                  <option value="">— Pilih —</option>
                  <option value="ADA">Ada</option>
                  <option value="TIDAK_ADA">Tidak Ada</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>
                  File LHU (PDF) {form.lhu === 'ADA' && <span className="text-red-500">*</span>}
                </label>
                <input type="file" accept=".pdf" ref={refs.fileLHU} className="w-full text-[13px] text-[#231f20] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-[#f1f0ee] file:text-[#231f20] hover:file:bg-[#e5e0db]" />
                {form.fileLHU && (
                  <a href={resolveFileUrl(form.fileLHU)} target="_blank" rel="noreferrer" className="text-[11px] text-[#f15a22] hover:underline mt-1 block">
                    📎 File tersimpan
                  </a>
                )}
              </div>
              <div>
                <label className={labelCls}>Status LHU Ada</label>
                <select value={form.lhuAda} onChange={(e) => set('lhuAda', e.target.value as any)} className={inputCls}>
                  <option value="">— Pilih —</option>
                  <option value="ADA">Ada</option>
                  <option value="TIDAK_ADA">Tidak Ada</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>No. LHU</label>
                <input type="text" value={form.noLHU} onChange={(e) => set('noLHU', e.target.value)} className={inputCls} />
              </div>
            </div>
          </section>

          {/* ── Dokumen ── */}
          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#f15a22] mb-3 border-b border-[#e5e0db] pb-1">
              Dokumen & Foto
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Pengesahan Gambar (PDF)</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" ref={refs.pengesahanGambar} className="w-full text-[13px] text-[#231f20] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-[#f1f0ee] file:text-[#231f20] hover:file:bg-[#e5e0db]" />
                {form.pengesahanGambar && (
                  <a href={resolveFileUrl(form.pengesahanGambar)} target="_blank" rel="noreferrer" className="text-[11px] text-[#f15a22] hover:underline mt-1 block">📎 File tersimpan</a>
                )}
              </div>
              <div>
                <label className={labelCls}>Sertifikat (PDF, Opsional)</label>
                <input type="file" accept=".pdf" ref={refs.sertifikat} className="w-full text-[13px] text-[#231f20] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-[#f1f0ee] file:text-[#231f20] hover:file:bg-[#e5e0db]" />
                {form.sertifikat && (
                  <a href={resolveFileUrl(form.sertifikat)} target="_blank" rel="noreferrer" className="text-[11px] text-[#f15a22] hover:underline mt-1 block">📎 File tersimpan</a>
                )}
              </div>
              <div>
                <label className={labelCls}>Laporan Pemeriksaan (PDF, Opsional)</label>
                <input type="file" accept=".pdf" ref={refs.laporanPemeriksaan} className="w-full text-[13px] text-[#231f20] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-[#f1f0ee] file:text-[#231f20] hover:file:bg-[#e5e0db]" />
                {form.laporanPemeriksaan && (
                  <a href={resolveFileUrl(form.laporanPemeriksaan)} target="_blank" rel="noreferrer" className="text-[11px] text-[#f15a22] hover:underline mt-1 block">📎 File tersimpan</a>
                )}
              </div>
              <div>
                <label className={labelCls}>Foto Alat</label>
                <input type="file" accept=".jpg,.jpeg,.png,.webp" ref={refs.fotoAlat} className="w-full text-[13px] text-[#231f20] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-[#f1f0ee] file:text-[#231f20] hover:file:bg-[#e5e0db]" />
                {form.fotoAlat && (
                  <a href={resolveFileUrl(form.fotoAlat)} target="_blank" rel="noreferrer" className="text-[11px] text-[#f15a22] hover:underline mt-1 block">🖼 Foto tersimpan</a>
                )}
              </div>
              <div>
                <label className={labelCls}>Foto Tagging</label>
                <input type="file" accept=".jpg,.jpeg,.png,.webp" ref={refs.fotoTagging} className="w-full text-[13px] text-[#231f20] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-[#f1f0ee] file:text-[#231f20] hover:file:bg-[#e5e0db]" />
                {form.fotoTagging && (
                  <a href={resolveFileUrl(form.fotoTagging)} target="_blank" rel="noreferrer" className="text-[11px] text-[#f15a22] hover:underline mt-1 block">🖼 Foto tersimpan</a>
                )}
              </div>
            </div>
          </section>

          {/* ── Catatan ── */}
          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#f15a22] mb-3 border-b border-[#e5e0db] pb-1">
              Catatan
            </h3>
            <textarea
              value={form.catatan}
              onChange={(e) => set('catatan', e.target.value)}
              rows={3}
              placeholder="Catatan tambahan (opsional)"
              className={inputCls + ' resize-none'}
            />
          </section>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#e5e0db]">
            <button type="button" onClick={onClose} disabled={saving}
              className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors">
              Batal
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-[#f15a22] rounded-xl hover:bg-[#d44d1a] transition-colors disabled:opacity-60">
              {saving && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Objek'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Detail / Riwayat Modal ────────────────────────────────────────────────

function DetailModal({
  obj,
  onClose,
  onUpdated,
  isAdmin,
}: {
  obj: ObjekK3;
  onClose: () => void;
  onUpdated: (o: ObjekK3) => void;
  isAdmin: boolean;
}) {
  const [addingRiwayat, setAddingRiwayat] = useState(false);
  const [riwayatForm, setRiwayatForm] = useState({ tanggal: '', hasil: '', catatan: '' });
  const riwayatFileRef = useRef<HTMLInputElement>(null);
  const [savingRiwayat, setSavingRiwayat] = useState(false);
  const [riwayatError, setRiwayatError] = useState('');

  const handleAddRiwayat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riwayatForm.tanggal || !riwayatForm.hasil) {
      setRiwayatError('Tanggal dan hasil wajib diisi');
      return;
    }
    setSavingRiwayat(true);
    setRiwayatError('');
    try {
      const fd = new FormData();
      fd.append('tanggal', riwayatForm.tanggal);
      fd.append('hasil', riwayatForm.hasil);
      if (riwayatForm.catatan) fd.append('catatan', riwayatForm.catatan);
      const f = riwayatFileRef.current?.files?.[0];
      if (f) fd.append('fileLaporan', f);

      const riwayat = await objekK3Api.addRiwayat(obj.id, fd);
      // Refresh the whole object
      const updated = await objekK3Api.getOne(obj.id);
      onUpdated(updated);
      setAddingRiwayat(false);
      setRiwayatForm({ tanggal: '', hasil: '', catatan: '' });
    } catch (err: any) {
      setRiwayatError(err.message ?? 'Gagal menambah riwayat');
    } finally {
      setSavingRiwayat(false);
    }
  };

  const handleDeleteRiwayat = async (riwayatId: string) => {
    if (!confirm('Hapus riwayat ini?')) return;
    try {
      await objekK3Api.removeRiwayat(riwayatId);
      const updated = await objekK3Api.getOne(obj.id);
      onUpdated(updated);
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
    }
  };

  const sl = obj.statusKelayakan ? STATUS_KELAYAKAN_LABELS[obj.statusKelayakan] : null;
  const sr = obj.statusRiksaUji ? STATUS_RIKSA_UJI_LABELS[obj.statusRiksaUji] : null;
  const sa = obj.statusAman ? STATUS_AMAN_LABELS[obj.statusAman] : null;

  const Row = ({ label, value }: { label: string; value?: React.ReactNode }) => (
    <div className="flex gap-2 text-[13px]">
      <span className="text-[#a09b96] min-w-[160px] shrink-0">{label}</span>
      <span className="text-[#231f20] font-medium">{value || '—'}</span>
    </div>
  );

  const inputCls = 'w-full px-3 py-2 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 bg-white';

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#e5e0db] flex items-start justify-between z-10">
          <div>
            <p className="text-[11px] font-bold text-[#f15a22] uppercase tracking-wide mb-0.5">
              {kategoriLabel(obj.kategori)}
            </p>
            <h2 className="font-bold text-[16px] text-[#231f20]">{obj.namaAlat}</h2>
            <p className="text-[12px] text-[#6b6560]">{obj.noSeri} · {obj.perusahaan}</p>
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1 ml-3 shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {sl && <Badge {...sl} />}
            {sr && <Badge {...sr} />}
            {sa && <Badge {...sa} />}
          </div>

          {/* Info Grid */}
          <div className="bg-[#faf9f7] rounded-xl p-4 space-y-2.5 border border-[#e5e0db]">
            <Row label="Departemen" value={obj.departemen.name} />
            <Row label="Lokasi" value={obj.lokasi} />
            <Row label="Jumlah" value={`${obj.jumlah} unit`} />
            {(obj.kapasitas != null) && <Row label="Kapasitas" value={`${obj.kapasitas} ${obj.satuan ?? ''}`} />}
            {obj.tahunPemasangan && <Row label="Tahun Pemasangan" value={String(obj.tahunPemasangan)} />}
          </div>

          {/* Status Kelayakan Detail */}
          <div className="bg-[#faf9f7] rounded-xl p-4 space-y-2.5 border border-[#e5e0db]">
            <Row label="No. Suket" value={obj.noSuket} />
            <Row label="Tgl Riksa Uji Terakhir" value={formatTanggal(obj.tanggalRiksaUjiTerakhir)} />
            <Row label="Tanggal Berlaku" value={formatTanggal(obj.tanggalBerlaku)} />
            <Row
              label="Sisa Hari"
              value={
                obj.sisaHari != null ? (
                  <span className={`font-bold ${sisaHariColor(obj.sisaHari)}`}>
                    {obj.sisaHari < 0 ? `KADALUARSA ${Math.abs(obj.sisaHari)} hari` : `${obj.sisaHari} hari`}
                  </span>
                ) : undefined
              }
            />
            <Row label="Jadwal Riksa Uji" value={formatTanggal(obj.jadwalRiksaUji)} />
            <Row label="No. LHU" value={obj.noLHU} />
          </div>

          {/* Dokumen Links */}
          {(obj.pengesahanGambar || obj.fileLHU || obj.sertifikat || obj.laporanPemeriksaan) && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Dokumen</p>
              <div className="flex flex-wrap gap-2">
                {obj.pengesahanGambar && <a href={resolveFileUrl(obj.pengesahanGambar)} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-[12px] font-semibold bg-[#f1f0ee] text-[#231f20] rounded-lg hover:bg-[#e5e0db]">📄 Pengesahan Gambar</a>}
                {obj.fileLHU && <a href={resolveFileUrl(obj.fileLHU)} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-[12px] font-semibold bg-[#f1f0ee] text-[#231f20] rounded-lg hover:bg-[#e5e0db]">📄 LHU</a>}
                {obj.sertifikat && <a href={resolveFileUrl(obj.sertifikat)} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-[12px] font-semibold bg-[#f1f0ee] text-[#231f20] rounded-lg hover:bg-[#e5e0db]">📄 Sertifikat</a>}
                {obj.laporanPemeriksaan && <a href={resolveFileUrl(obj.laporanPemeriksaan)} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-[12px] font-semibold bg-[#f1f0ee] text-[#231f20] rounded-lg hover:bg-[#e5e0db]">📄 Laporan</a>}
              </div>
            </div>
          )}

          {/* Foto */}
          {(obj.fotoAlat || obj.fotoTagging) && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Foto</p>
              <div className="flex gap-3 flex-wrap">
                {obj.fotoAlat && (
                  <div>
                    <p className="text-[10px] text-[#a09b96] mb-1">Foto Alat</p>
                    <img src={resolveFileUrl(obj.fotoAlat)} alt="Foto Alat" className="w-28 h-28 object-cover rounded-xl border border-[#e5e0db]" />
                  </div>
                )}
                {obj.fotoTagging && (
                  <div>
                    <p className="text-[10px] text-[#a09b96] mb-1">Foto Tagging</p>
                    <img src={resolveFileUrl(obj.fotoTagging)} alt="Foto Tagging" className="w-28 h-28 object-cover rounded-xl border border-[#e5e0db]" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Catatan */}
          {obj.catatan && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p className="text-[11px] font-bold text-yellow-700 mb-1">Catatan</p>
              <p className="text-[13px] text-yellow-800">{obj.catatan}</p>
            </div>
          )}

          {/* ── Riwayat Pemeriksaan ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-bold uppercase tracking-wide text-[#231f20]">
                Riwayat Pemeriksaan ({obj.riwayatPemeriksaan.length})
              </p>
              {isAdmin && (
                <button
                  onClick={() => setAddingRiwayat((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-[#f15a22] rounded-lg hover:bg-[#d44d1a] transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Tambah
                </button>
              )}
            </div>

            {/* Add riwayat form */}
            {addingRiwayat && (
              <form onSubmit={handleAddRiwayat} className="bg-[#faf9f7] border border-[#e5e0db] rounded-xl p-4 mb-3 space-y-3">
                {riwayatError && <p className="text-[12px] text-red-600">{riwayatError}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1">Tanggal *</label>
                    <input type="date" value={riwayatForm.tanggal} onChange={(e) => setRiwayatForm((p) => ({ ...p, tanggal: e.target.value }))} className={inputCls} required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1">Hasil *</label>
                    <select value={riwayatForm.hasil} onChange={(e) => setRiwayatForm((p) => ({ ...p, hasil: e.target.value }))} className={inputCls} required>
                      <option value="">— Pilih —</option>
                      <option value="LAYAK">Layak</option>
                      <option value="TIDAK_LAYAK">Tidak Layak</option>
                      <option value="PERLU_PERBAIKAN">Perlu Perbaikan</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1">Catatan</label>
                  <input type="text" value={riwayatForm.catatan} onChange={(e) => setRiwayatForm((p) => ({ ...p, catatan: e.target.value }))} className={inputCls} placeholder="Opsional" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1">File Laporan (PDF)</label>
                  <input type="file" accept=".pdf" ref={riwayatFileRef} className="w-full text-[13px] text-[#231f20] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-[#e5e0db] file:text-[#231f20]" />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setAddingRiwayat(false)} className="px-3 py-1.5 text-[12px] font-semibold bg-[#f1f0ee] text-[#231f20] rounded-lg hover:bg-[#e5e0db]">Batal</button>
                  <button type="submit" disabled={savingRiwayat} className="px-3 py-1.5 text-[12px] font-semibold text-white bg-[#f15a22] rounded-lg hover:bg-[#d44d1a] disabled:opacity-60">
                    {savingRiwayat ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            )}

            {/* Riwayat list */}
            {obj.riwayatPemeriksaan.length === 0 ? (
              <p className="text-[13px] text-[#a09b96] text-center py-4">Belum ada riwayat pemeriksaan</p>
            ) : (
              <div className="space-y-2">
                {obj.riwayatPemeriksaan.map((r) => (
                  <div key={r.id} className="flex items-start justify-between gap-3 p-3 bg-[#faf9f7] border border-[#e5e0db] rounded-xl">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-bold text-[#231f20]">{formatTanggal(r.tanggal)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.hasil === 'LAYAK' ? 'bg-green-100 text-green-700' :
                          r.hasil === 'TIDAK_LAYAK' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {r.hasil.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {r.catatan && <p className="text-[12px] text-[#6b6560] truncate">{r.catatan}</p>}
                      {r.fileLaporan && (
                        <a href={resolveFileUrl(r.fileLaporan)} target="_blank" rel="noreferrer" className="text-[11px] text-[#f15a22] hover:underline">📎 Laporan</a>
                      )}
                    </div>
                    {isAdmin && (
                      <button onClick={() => handleDeleteRiwayat(r.id)} className="shrink-0 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ObjekK3 Card ──────────────────────────────────────────────────────────

function ObjekK3Card({
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
  const sl = obj.statusKelayakan ? STATUS_KELAYAKAN_LABELS[obj.statusKelayakan] : null;
  const sa = obj.statusAman ? STATUS_AMAN_LABELS[obj.statusAman] : null;

  const accentColor =
    obj.statusKelayakan === 'LAYAK' ? 'bg-green-500' :
    obj.statusKelayakan === 'TIDAK_LAYAK' ? 'bg-red-500' :
    obj.statusKelayakan === 'PERLU_PERBAIKAN' ? 'bg-yellow-500' :
    'bg-[#c5c0bb]';

  return (
    <div className="bg-white rounded-2xl border border-[#e5e0db] shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className={`h-1 ${accentColor}`} />
      <div className="p-4">
        {/* Header */}
        <div className="mb-2.5">
          <p className="text-[10px] font-bold text-[#f15a22] uppercase tracking-wide mb-0.5">
            {kategoriLabel(obj.kategori)}
          </p>
          <p className="font-bold text-[14px] text-[#231f20] leading-snug">{obj.namaAlat}</p>
          <p className="text-[12px] text-[#6b6560]">{obj.noSeri} · {obj.perusahaan}</p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {sl && <Badge {...sl} />}
          {sa && <Badge {...sa} />}
        </div>

        {/* Info */}
        <div className="space-y-1 text-[12px] text-[#6b6560] mb-3">
          <div className="flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="truncate">{obj.lokasi}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>{obj.departemen.name}</span>
          </div>
        </div>

        {/* Sisa Hari */}
        {obj.tanggalBerlaku && (
          <div className="bg-[#faf9f7] border border-[#e5e0db] rounded-xl px-3 py-2 mb-3 flex items-center justify-between">
            <span className="text-[11px] text-[#a09b96]">Berlaku s.d.</span>
            <div className="text-right">
              <p className="text-[12px] font-semibold text-[#231f20]">{formatTanggal(obj.tanggalBerlaku)}</p>
              {obj.sisaHari != null && (
                <p className={`text-[11px] font-bold ${sisaHariColor(obj.sisaHari)}`}>
                  {obj.sisaHari < 0 ? `Kadaluarsa ${Math.abs(obj.sisaHari)}h` : `${obj.sisaHari} hari lagi`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onDetail}
            className="flex-1 py-2 text-[12px] font-semibold text-white bg-[#231f20] rounded-xl hover:bg-[#3d3838] transition-colors">
            Detail
          </button>
          {isAdmin && (
            <>
              <button onClick={onEdit}
                className="px-2.5 py-2 text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors" title="Edit">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button onClick={onDelete}
                className="px-2.5 py-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors" title="Hapus">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function EquipmentSafetyPage() {
  return (
    <Suspense fallback={null}>
      <EquipmentSafetyPageInner />
    </Suspense>
  );
}

function EquipmentSafetyPageInner() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'supervisor';
  const searchParams = useSearchParams();

  const [items, setItems] = useState<ObjekK3[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);

  // Filters
  const [filters, setFilters] = useState<ObjekK3Filters>({});
  const [search, setSearch] = useState('');

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ObjekK3 | null>(null);
  const [detail, setDetail] = useState<ObjekK3 | null>(null);

  // Load
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

  // ── Auto-buka detail jika ada ?id= di URL (dari klik notifikasi) ──
  useEffect(() => {
    const targetId = searchParams.get('id');
    if (!targetId || items.length === 0) return;
    const found = items.find((o) => o.id === targetId);
    if (found) setDetail(found);
  }, [searchParams, items]);

  const handleDelete = async (obj: ObjekK3) => {
    if (!confirm(`Hapus objek K3 "${obj.namaAlat}" (${obj.noSeri})?\n\nSeluruh data termasuk riwayat pemeriksaan akan ikut terhapus.`)) return;
    try {
      await objekK3Api.remove(obj.id);
      setItems((prev) => prev.filter((o) => o.id !== obj.id));
    } catch (e: any) {
      alert(`Gagal menghapus: ${e.message}`);
    }
  };

  const handleSaved = (saved: ObjekK3) => {
    setItems((prev) => {
      const idx = prev.findIndex((o) => o.id === saved.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDetailUpdated = (updated: ObjekK3) => {
    setDetail(updated);
    handleSaved(updated);
  };

  // Category counts
  const counts = KATEGORI_OPTIONS.reduce(
    (acc, k) => {
      acc[k.value] = items.filter((i) => i.kategori === k.value).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  const setFilter = (k: keyof ObjekK3Filters, v: string) =>
    setFilters((p) => ({ ...p, [k]: v || undefined }));

  const handleExport = () => {
    const rows = items.map((o, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
        <td>${i + 1}</td>
        <td>${o.namaAlat}</td>
        <td>${o.noSeri}</td>
        <td>${o.kategori.replace(/_/g, ' ')}</td>
        <td>${o.perusahaan}</td>
        <td>${o.lokasi}</td>
        <td>${o.jumlah}</td>
        <td>${o.statusKelayakan ? o.statusKelayakan.replace(/_/g, ' ') : '—'}</td>
        <td>${o.statusRiksaUji ? o.statusRiksaUji.replace(/_/g, ' ') : '—'}</td>
        <td>${o.tanggalBerlaku ? new Date(o.tanggalBerlaku).toLocaleDateString('id-ID') : '—'}</td>
        <td>${o.sisaHari != null ? `${o.sisaHari} hari` : '—'}</td>
        <td>${o.noSuket ?? '—'}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Objek K3</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:11px;color:#1f2937;padding:16px}
      @media print{body{padding:4mm;font-size:10px}.no-print{display:none!important}@page{margin:8mm;size:A3 landscape}}
      .header{background:#231f20;color:white;padding:14px 18px;margin-bottom:12px;border-radius:6px;display:flex;justify-content:space-between;align-items:center}
      .header h1{font-size:16px;margin:0 0 3px}.header p{font-size:10px;color:#9ca3af;margin:0}
      .print-btn{background:#f15a22;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;margin-bottom:12px}
      table{border-collapse:collapse;width:100%;min-width:900px}
      th{background:#231f20;color:white;padding:8px 10px;text-align:left;font-size:11px;position:sticky;top:0}
      td{padding:7px 10px;border-bottom:1px solid #e5e7eb;vertical-align:middle}
    </style></head><body>
    <div class="header">
      <div><h1>Daftar Objek K3</h1><p>Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p></div>
      <div style="text-align:right"><p style="font-size:14px;font-weight:700;color:#f15a22">${items.length} Objek</p><p>SMK3 Safety System</p></div>
    </div>
    <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
    <table>
      <thead><tr>
        <th>#</th><th>Nama Alat</th><th>No Seri</th><th>Kategori</th><th>Perusahaan</th>
        <th>Lokasi</th><th>Jumlah</th><th>Status Kelayakan</th><th>Riksa Uji</th>
        <th>Berlaku s/d</th><th>Sisa Hari</th><th>No Suket</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  };

  return (
    <div className="min-h-screen bg-[#f1f0ee]">
      {/* ── Dark Header ── */}
      <div className="bg-[#231f20] px-6 md:px-10 py-8 border-b-[3px] border-b-[#f15a22]">
        <div className="max-w-7xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-2">
            Accident Prevention
          </p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-bold text-white text-[clamp(22px,4vw,38px)] leading-tight">
                Manajemen Objek K3
              </h1>
              <p className="text-[#8a8580] text-[13px] mt-1.5">
                Kelola aset K3 wajib sertifikasi: riksa uji berkala, dokumen kelayakan, dan riwayat pemeriksaan.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">

        {/* Toolbar Row 1: Search + Export + Tambah */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a09b96]" width="15" height="15"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama alat, no seri, lokasi..."
              className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09b96] hover:text-[#231f20]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#c5c0bb] text-[#231f20] text-[13px] font-semibold rounded-xl hover:border-green-400 hover:text-green-700 transition-colors whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>

          {/* Tambah */}
          {isAdmin && (
            <button
              onClick={() => { setEditing(null); setShowForm(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors whitespace-nowrap"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tambah Objek K3
            </button>
          )}
        </div>

        {/* Toolbar Row 2: Filter dropdowns */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filters.kategori ?? ''}
            onChange={(e) => setFilter('kategori', e.target.value)}
            className="py-2.5 px-3.5 text-[13px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] transition-colors"
          >
            <option value="">Semua Kategori</option>
            {KATEGORI_OPTIONS.map((k) => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>

          <select
            value={filters.perusahaan ?? ''}
            onChange={(e) => setFilter('perusahaan', e.target.value)}
            className="py-2.5 px-3.5 text-[13px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] transition-colors"
          >
            <option value="">Semua Perusahaan</option>
            {PERUSAHAAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select
            value={filters.statusKelayakan ?? ''}
            onChange={(e) => setFilter('statusKelayakan', e.target.value)}
            className="py-2.5 px-3.5 text-[13px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] transition-colors"
          >
            <option value="">Semua Status Kelayakan</option>
            <option value="LAYAK">Layak</option>
            <option value="TIDAK_LAYAK">Tidak Layak</option>
            <option value="PERLU_PERBAIKAN">Perlu Perbaikan</option>
          </select>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e5e0db] h-52 animate-pulse" />
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-[14px] font-semibold text-[#231f20] mb-2">{loadError}</p>
            <button onClick={load} className="text-[13px] text-[#f15a22] hover:underline">Coba lagi</button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#f1f0ee] flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c5c0bb" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                <line x1="12" y1="12" x2="12" y2="16"/>
                <line x1="10" y1="14" x2="14" y2="14"/>
              </svg>
            </div>
            <p className="font-semibold text-[#231f20] text-[14px] mb-1">
              {search || Object.values(filters).some(Boolean) ? 'Tidak ada hasil' : 'Belum ada objek K3'}
            </p>
            <p className="text-[#6b6560] text-[13px]">
              {search || Object.values(filters).some(Boolean) ? 'Coba ubah filter atau kata kunci' : 'Klik "Tambah Objek K3" untuk mulai'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((obj) => (
              <ObjekK3Card
                key={obj.id}
                obj={obj}
                isAdmin={isAdmin}
                onDetail={() => setDetail(obj)}
                onEdit={() => { setEditing(obj); setShowForm(true); }}
                onDelete={() => handleDelete(obj)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <FormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSaved={handleSaved}
        editing={editing}
        departments={departments}
      />

      {detail && (
        <DetailModal
          obj={detail}
          onClose={() => setDetail(null)}
          onUpdated={handleDetailUpdated}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
