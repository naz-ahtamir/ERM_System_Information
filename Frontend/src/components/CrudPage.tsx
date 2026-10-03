'use client';

/**
 * CrudPage — template reusable untuk semua halaman CRUD
 *
 * Fitur:
 *  - Tabel dengan search realtime
 *  - Modal tambah / edit record
 *  - Auto-fill safetyOfficer dari user login
 *  - Filter by user: role 'user' hanya lihat record sendiri
 *  - Detail view dengan foto before/after
 *  - Filter: ALL | INPG | CLSD-ACC | CLSD-TACC
 *  - Approval ACC/TACC dari supervisor/admin
 *  - Judul auto-generate dari field data
 *  - Export Excel dengan filter rentang tanggal
 */

import React, { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { recordsApi, k3PolicyApi, findingsApi, SafetyRecord } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? 'http://localhost:3001';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CrudField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'select' | 'number' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  showInTable?: boolean;
  showInDetail?: boolean;
  accept?: string;
  /** Auto-fill nilai dari property user login: 'nama' | 'departemen' | 'idKaryawan' */
  autoFillFrom?: 'nama' | 'departemen' | 'idKaryawan';
  /** Readonly saat create (auto-fill) */
  readonlyOnCreate?: boolean;
  showWhen?: { field: string; value: string };
}

export interface CrudPageConfig {
  categoryId: string;
  title: string;
  description: string;
  parentLabel: string;
  fields: CrudField[];
  enableApproval?: boolean;
}

// Status filter tabs
type StatusFilter = '' | 'INPG' | 'CLSD' | 'CLSD-ACC' | 'CLSD-TACC';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fileUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Cari URL file dari record: cek record.files[] dulu, lalu record.data[key] */
function resolveFileUrl(record: SafetyRecord, fieldKey: string): string {
  const filesArr = (record as any).files as Array<{ fieldName: string; fileUrl: string }> | undefined;
  if (filesArr?.length) {
    const match = filesArr.find((f) => f.fieldName === fieldKey);
    if (match) return fileUrl(match.fileUrl);
  }
  const fromData = record.data?.[fieldKey];
  if (fromData) return fileUrl(String(fromData));
  return '';
}

function Badge({ value }: { value: string }) {
  const map: Record<string, string> = {
    memenuhi: 'bg-green-100 text-green-700',
    aktif: 'bg-green-100 text-green-700',
    selesai: 'bg-green-100 text-green-700',
    'tidak memenuhi': 'bg-red-100 text-red-700',
    kadaluarsa: 'bg-red-100 text-red-700',
    open: 'bg-red-100 text-red-700',
    'dalam proses': 'bg-amber-100 text-amber-700',
    'sebagian memenuhi': 'bg-amber-100 text-amber-700',
    'akan kadaluarsa': 'bg-amber-100 text-amber-700',
    ditutup: 'bg-[#e5e0db] text-[#6b6560]',
  };
  const cls = map[value?.toLowerCase()] ?? 'bg-[#e5e0db] text-[#6b6560]';
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>{value}</span>;
}

function ApprovalBadge({ status, approvalStatus }: { status: string; approvalStatus?: string }) {
  if (status === 'CLSD' && approvalStatus === 'ACC') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        CLSD — ACC ✓
      </span>
    );
  }
  if (status === 'CLSD' && approvalStatus === 'TACC') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        CLSD — TACC ✗
      </span>
    );
  }
  if (status === 'CLSD') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        CLSD — Closed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      INPG — Pending
    </span>
  );
}

// ── Auto-generate judul dari data record ──────────────────────────────────────

const TITLE_FIELD_PRIORITY = [
  'deskripsiKetidaksesuaian',
  'areaInspeksiSpesifik',
  'lokasiUtama',
  'judulKebijakan',
  'namaProgram',
  'judul',
  'nama',
  'deskripsi',
  'keterangan',
];

function autoGenerateTitle(data: Record<string, any>): string {
  for (const key of TITLE_FIELD_PRIORITY) {
    if (data[key] && String(data[key]).trim()) {
      return String(data[key]).trim().slice(0, 120);
    }
  }
  // Fallback: pakai value pertama yang ada
  const firstVal = Object.values(data).find((v) => v && String(v).trim());
  return firstVal ? String(firstVal).trim().slice(0, 120) : 'Record Baru';
}

// ── Form Modal ────────────────────────────────────────────────────────────────

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (v: { title: string; data: Record<string, string> }) => Promise<void>;
  onSubmitFormData: (formData: FormData) => Promise<void>;
  fields: CrudField[];
  modalTitle: string;
  initialValues?: { title: string; data: Record<string, any> } | null;
  isK3Policy?: boolean;
  enableApproval?: boolean;
  currentUserNama?: string;
  currentUserDepartemen?: string;
  currentUserIdKaryawan?: string;
}

function FormModal({
  isOpen, onClose, onSubmit, onSubmitFormData,
  fields, modalTitle, initialValues,
  isK3Policy = false, enableApproval = false,
  currentUserNama, currentUserDepartemen, currentUserIdKaryawan,
}: FormModalProps) {
  const [title, setTitle] = useState('');
  const [data, setData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [file, setFile] = useState<File | null>(null);

  const isNewRecord = !initialValues;

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initialValues?.title ?? '');
    const d: Record<string, string> = {};
    fields.forEach((f) => {
      if (isK3Policy && f.type === 'file') {
        d[f.key] = String((initialValues?.data as any)?.fileUrl ?? '');
      } else {
        d[f.key] = String(initialValues?.data?.[f.key] ?? '');
      }

      // Auto-fill untuk record baru
      if (isNewRecord && f.autoFillFrom) {
        if (f.autoFillFrom === 'nama' && currentUserNama) d[f.key] = currentUserNama;
        if (f.autoFillFrom === 'departemen' && currentUserDepartemen) d[f.key] = currentUserDepartemen;
        if (f.autoFillFrom === 'idKaryawan' && currentUserIdKaryawan) d[f.key] = currentUserIdKaryawan;
      }
    });
    setData(d);
    setErrors({});
    setFile(null);
    setFiles({});
  }, [isOpen, initialValues, fields, isK3Policy, isNewRecord, currentUserNama, currentUserDepartemen, currentUserIdKaryawan]);

  const isFieldVisible = (f: CrudField): boolean => {
    if (!f.showWhen) return true;
    return data[f.showWhen.field] === f.showWhen.value;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!isK3Policy && !enableApproval && !title.trim()) e.title = 'Judul tidak boleh kosong';
    fields.forEach((f) => {
      if (!isFieldVisible(f)) return;
      if (f.key === 'dokumentasiPerbaikan' && data['findingStatus'] === 'CLSD' && !files[f.key]) {
        // Saat edit: cek apakah file existing sudah ada (dari record sebelumnya)
        // Bisa berupa string path di data[key] ATAU di initialValues?.data?.files[]
        const hasExistingFile =
          !!data[f.key] ||
          !!(initialValues?.data as any)?.files?.some(
            (file: { fieldName: string }) => file.fieldName === 'dokumentasiPerbaikan'
          );
        if (!hasExistingFile) {
          e[f.key] = 'Wajib upload foto perbaikan untuk status CLSD';
        }
      }
      if (f.required && f.type !== 'file' && !data[f.key]?.trim()) {
        e[f.key] = `${f.label} wajib diisi`;
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (isK3Policy) {
        const formData = new FormData();
        fields.forEach((f) => {
          if (f.type === 'file') return;
          if (data[f.key] !== undefined && data[f.key] !== '') formData.append(f.key, data[f.key]);
        });
        if (file) formData.append('file', file);
        await onSubmitFormData(formData);

      } else if (enableApproval) {
        const formData = new FormData();
        const visibleData = Object.fromEntries(
          Object.entries(data).filter(([k]) => {
            // findingStatus dikirim sebagai field terpisah, bukan di dalam JSON data
            if (k === 'findingStatus') return false;
            const field = fields.find((f) => f.key === k);
            return field ? isFieldVisible(field) : true;
          })
        );
        // Auto-generate title dari field data
        formData.append('title', autoGenerateTitle(visibleData));
        formData.append('data', JSON.stringify(visibleData));
        Object.entries(files).forEach(([fieldKey, fileObj]) => formData.append(fieldKey, fileObj));
        formData.append('findingStatus', data['findingStatus'] || 'INPG');
        await onSubmitFormData(formData);

      } else if (Object.keys(files).length > 0 || file) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('data', JSON.stringify(data));
        if (file) formData.append('file', file);
        Object.entries(files).forEach(([k, f]) => formData.append(k, f));
        await onSubmitFormData(formData);

      } else {
        await onSubmit({ title: title.trim(), data });
      }
      onClose();
    } catch (err: any) {
      // Error sudah ditampilkan sebagai toast oleh parent (handleSubmit/handleSubmitFormData)
      // Jangan tutup modal supaya user bisa coba lagi
      console.error('Submit error:', err?.message);
    } finally {
      setSaving(false);
    }
  };

  // Compress gambar menggunakan canvas sebelum upload.
  // Target: max 200 KB dengan max dimensi 1600px, JPEG quality 0.82.
  // Kalau file bukan gambar atau sudah kecil (<= 200 KB), dikembalikan as-is.
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const MAX_SIZE_BYTES = 200 * 1024; // 200 KB
      const MAX_DIMENSION = 1600;        // px — sisi terpanjang
      const QUALITY = 0.82;

      // Bukan gambar atau sudah <= 200 KB → langsung pakai
      if (!file.type.startsWith('image/') || file.size <= MAX_SIZE_BYTES) {
        return resolve(file);
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        let { width, height } = img;

        // Scale down proporsional jika melebihi MAX_DIMENSION
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width >= height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        // Coba dengan quality yang makin turun sampai di bawah MAX_SIZE_BYTES
        const tryCompress = (quality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(file); // fallback
              if (blob.size <= MAX_SIZE_BYTES || quality <= 0.5) {
                // Sudah cukup kecil atau sudah di batas bawah quality
                const compressed = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressed);
              } else {
                // Coba lagi dengan quality lebih rendah (-0.08 per iterasi)
                tryCompress(Math.round((quality - 0.08) * 100) / 100);
              }
            },
            'image/jpeg',
            quality
          );
        };

        tryCompress(QUALITY);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file); // fallback ke file asli jika gagal load
      };

      img.src = objectUrl;
    });
  };

  const handleFileChange = (fieldKey: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const compressed = await compressImage(selected);
    setFiles((prev) => ({ ...prev, [fieldKey]: compressed }));
    setFile(compressed);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0db] flex-shrink-0">
          <h2 className="font-bold text-[15px] text-[#231f20]">{modalTitle}</h2>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Approval mode notice */}
        {enableApproval && (
          <div className="mx-6 mt-4 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[12px] text-amber-700 flex items-start gap-2 flex-shrink-0">
            <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>Record baru masuk status <strong>INPG</strong>. Supervisor/admin melakukan approval ACC/TACC.</span>
          </div>
        )}

        {/* body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Finding Status dropdown */}
          {enableApproval && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
                Status Temuan <span className="text-red-500">*</span>
              </label>
              <select
                value={data['findingStatus'] ?? 'INPG'}
                onChange={(e) => setData((p) => ({ ...p, findingStatus: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22]"
              >
                <option value="INPG">INPG — Perbaikan Belum Selesai</option>
                <option value="CLSD">CLSD — Perbaikan Selesai (wajib foto)</option>
              </select>
            </div>
          )}

          {/* Judul Record — hanya generic pages */}
          {!isK3Policy && !enableApproval && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
                Judul Record <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul singkat yang mendeskripsikan record ini"
                className={`w-full px-3.5 py-2.5 text-[14px] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22] transition-colors ${errors.title ? 'border-red-400 bg-red-50' : 'border-[#c5c0bb]'}`}
              />
              {errors.title && <p className="text-red-500 text-[11px] mt-1">{errors.title}</p>}
            </div>
          )}

          {/* Dynamic fields */}
          {fields.map((f) => {
            if (!isFieldVisible(f)) return null;
            const isAutoFilled = isNewRecord && !!f.autoFillFrom;
            const isReadonly = isAutoFilled && f.readonlyOnCreate;

            return (
              <div key={f.key}>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
                  {f.label}
                  {f.required && <span className="text-red-500 ml-0.5">*</span>}
                  {isAutoFilled && (
                    <span className="ml-1.5 text-[10px] font-normal text-[#f15a22] normal-case">
                      (auto-fill)
                    </span>
                  )}
                </label>

                {f.type === 'textarea' && (
                  <textarea rows={3} value={data[f.key] ?? ''} placeholder={f.placeholder}
                    readOnly={isReadonly}
                    onChange={(e) => !isReadonly && setData((p) => ({ ...p, [f.key]: e.target.value }))}
                    className={`w-full px-3.5 py-2.5 text-[14px] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22] transition-colors resize-none ${errors[f.key] ? 'border-red-400 bg-red-50' : isReadonly ? 'border-[#e5e0db] bg-[#faf9f7] text-[#6b6560]' : 'border-[#c5c0bb]'}`}
                  />
                )}

                {f.type === 'select' && (
                  <select value={data[f.key] ?? ''}
                    onChange={(e) => setData((p) => ({ ...p, [f.key]: e.target.value }))}
                    className={`w-full px-3.5 py-2.5 text-[14px] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22] transition-colors ${errors[f.key] ? 'border-red-400 bg-red-50' : 'border-[#c5c0bb]'}`}
                  >
                    <option value="">-- Select {f.label} --</option>
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                )}

                {f.type === 'file' && (
                  <div>
                    <input type="file" accept={f.accept || '.pdf,.doc,.docx,.jpg,.jpeg,.png'}
                      onChange={handleFileChange(f.key)}
                      className={`w-full px-3.5 py-2.5 text-[14px] border rounded-xl file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#f15a22] file:text-white hover:file:bg-[#d44d1a] focus:outline-none ${errors[f.key] ? 'border-red-400 bg-red-50' : 'border-[#c5c0bb]'}`}
                    />
                    {files[f.key] && files[f.key].type.startsWith('image/') && (
                      <img src={URL.createObjectURL(files[f.key])} alt="Preview"
                        className="mt-2 max-h-24 rounded-lg border border-[#e5e0db] object-cover" />
                    )}
                    {data[f.key] && !files[f.key] && (
                      <p className="text-[11px] text-[#6b6560] mt-1">
                        File saat ini:{' '}
                        <a href={fileUrl(data[f.key])} target="_blank" rel="noopener noreferrer" className="text-[#f15a22] hover:underline">Lihat file</a>
                      </p>
                    )}
                  </div>
                )}

                {f.type !== 'textarea' && f.type !== 'select' && f.type !== 'file' && (
                  <input type={f.type} value={data[f.key] ?? ''} placeholder={f.placeholder}
                    readOnly={isReadonly}
                    onChange={(e) => !isReadonly && setData((p) => ({ ...p, [f.key]: e.target.value }))}
                    className={`w-full px-3.5 py-2.5 text-[14px] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22] transition-colors ${errors[f.key] ? 'border-red-400 bg-red-50' : isReadonly ? 'border-[#e5e0db] bg-[#faf9f7] text-[#6b6560]' : 'border-[#c5c0bb]'}`}
                  />
                )}

                {errors[f.key] && <p className="text-red-500 text-[11px] mt-1">{errors[f.key]}</p>}
              </div>
            );
          })}
        </form>

        {/* footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e0db] flex-shrink-0">
          <button onClick={onClose} disabled={saving}
            className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors disabled:opacity-50">
            Batal
          </button>
          <button onClick={(e) => handleSubmit(e as any)} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-[#f15a22] rounded-xl hover:bg-[#d44d1a] transition-colors disabled:opacity-60">
            {saving ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>Menyimpan...</>
            ) : initialValues ? 'Simpan Perubahan' : 'Tambah Record'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Approval Modal (supervisor/admin) ─────────────────────────────────────────

interface ApprovalModalProps {
  isOpen: boolean;
  record: SafetyRecord | null;
  onClose: () => void;
  onApprove: (id: string, status: 'ACC' | 'TACC', note: string) => Promise<void>;
}

function ApprovalModal({ isOpen, record, onClose, onApprove }: ApprovalModalProps) {
  const [approvalStatus, setApprovalStatus] = useState<'ACC' | 'TACC'>('ACC');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) { setApprovalStatus('ACC'); setNote(''); }
  }, [isOpen]);

  if (!isOpen || !record) return null;

  const handleSubmit = async () => {
    if (approvalStatus === 'TACC' && !note.trim()) return;
    setSaving(true);
    try {
      await onApprove(record.id, approvalStatus, note.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0db]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#f15a22] mb-0.5">Approval Temuan</p>
            <h2 className="font-bold text-[15px] text-[#231f20]">Tutup Temuan (CLSD)</h2>
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Record info */}
          <div className="px-4 py-3 bg-[#faf9f7] rounded-xl border border-[#e5e0db]">
            <p className="text-[11px] text-[#a09b96] mb-0.5">Temuan</p>
            <p className="font-semibold text-[13px] text-[#231f20]">{record.title}</p>
          </div>

          {/* Pilihan ACC / TACC */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-2">
              Keputusan Approval <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button"
                onClick={() => setApprovalStatus('ACC')}
                className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all ${
                  approvalStatus === 'ACC'
                    ? 'border-green-500 bg-green-50'
                    : 'border-[#e5e0db] bg-white hover:border-green-300'
                }`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={approvalStatus === 'ACC' ? '#16a34a' : '#a09b96'} strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className={`font-bold text-[13px] ${approvalStatus === 'ACC' ? 'text-green-700' : 'text-[#6b6560]'}`}>ACC</span>
                <span className={`text-[11px] text-center ${approvalStatus === 'ACC' ? 'text-green-600' : 'text-[#a09b96]'}`}>Disetujui / Accepted</span>
              </button>
              <button type="button"
                onClick={() => setApprovalStatus('TACC')}
                className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all ${
                  approvalStatus === 'TACC'
                    ? 'border-red-500 bg-red-50'
                    : 'border-[#e5e0db] bg-white hover:border-red-300'
                }`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={approvalStatus === 'TACC' ? '#dc2626' : '#a09b96'} strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span className={`font-bold text-[13px] ${approvalStatus === 'TACC' ? 'text-red-700' : 'text-[#6b6560]'}`}>TACC</span>
                <span className={`text-[11px] text-center ${approvalStatus === 'TACC' ? 'text-red-600' : 'text-[#a09b96]'}`}>Tidak Disetujui / Rejected</span>
              </button>
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
              Catatan {approvalStatus === 'TACC' && <span className="text-red-500">* (wajib untuk TACC)</span>}
            </label>
            <textarea rows={3} value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={approvalStatus === 'ACC' ? 'Catatan tambahan (opsional)...' : 'Tuliskan alasan penolakan (wajib)...'}
              className={`w-full px-3.5 py-2.5 text-[14px] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22] resize-none transition-colors ${
                approvalStatus === 'TACC' && !note.trim() ? 'border-red-300' : 'border-[#c5c0bb]'
              }`}
            />
            {approvalStatus === 'TACC' && !note.trim() && (
              <p className="text-red-500 text-[11px] mt-1">Catatan wajib diisi untuk TACC</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e0db]">
          <button onClick={onClose} disabled={saving}
            className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors disabled:opacity-50">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={saving || (approvalStatus === 'TACC' && !note.trim())}
            className={`flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white rounded-xl transition-colors disabled:opacity-60 ${
              approvalStatus === 'ACC' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}>
            {saving ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : approvalStatus === 'ACC' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
            {saving ? 'Menyimpan...' : approvalStatus === 'ACC' ? 'Approve (ACC)' : 'Reject (TACC)'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Export Excel Modal ────────────────────────────────────────────────────────

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SafetyRecord[];
  fields: CrudField[];
  title: string;
}

function ExportModal({ isOpen, onClose, records, fields, title }: ExportModalProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exportFormat, setExportFormat] = useState<'html' | 'csv'>('html');
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const filterByDate = (recs: SafetyRecord[]) => {
    let filtered = [...recs];
    if (dateFrom) filtered = filtered.filter((r) => new Date(r.createdAt) >= new Date(dateFrom));
    if (dateTo) {
      const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((r) => new Date(r.createdAt) <= to);
    }
    return filtered;
  };

  const handleExportCSV = (filtered: SafetyRecord[]) => {
    const tableCols = fields.filter((f) => f.type !== 'file');
    const headers = ['No', 'Judul', ...tableCols.map((f) => f.label), 'Status', 'Dibuat Oleh', 'Tanggal Dibuat'];
    const esc = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = filtered.map((rec, idx) => {
      const fStatus = (rec as any).findingStatus ?? '';
      const aStatus = (rec as any).approvalStatus ?? '';
      const statusLabel = aStatus ? `${fStatus}-${aStatus}` : fStatus || '—';
      return [idx + 1, esc(rec.title), ...tableCols.map((f) => esc(rec.data?.[f.key] ?? '')),
        esc(statusLabel), esc(rec.createdByName ?? ''), esc(formatDate(rec.createdAt))].join(',');
    });
    const csv = '\uFEFF' + [headers.map(esc).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateLabel = dateFrom && dateTo ? `_${dateFrom}_sd_${dateTo}` : '';
    a.href = url; a.download = `${title.replace(/\s+/g, '_')}${dateLabel}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // Fetch gambar dari URL dan kembalikan sebagai data:base64 string
  // Ini diperlukan agar gambar ter-embed langsung dalam file HTML (menghindari masalah CORS)
  const fetchImageAsBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const blob = await response.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const handleExportHTML = async (filtered: SafetyRecord[]) => {
    // Semua kolom non-file untuk header tabel
    const tableCols = fields.filter((f) => f.type !== 'file');
    const dateLabel = dateFrom && dateTo
      ? `Periode: ${formatDate(dateFrom)} — ${formatDate(dateTo)}`
      : `Dicetak: ${formatDate(new Date().toISOString())}`;

    // ── Pre-fetch semua foto ke base64 ────────────────────────────────────────
    // Kumpulkan semua URL foto unik dari semua record
    type PhotoEntry = { fieldName: string; fileUrl: string; fileName: string };
    const allPhotoUrls = new Set<string>();
    filtered.forEach((rec) => {
      const filesArr = (rec as any).files as PhotoEntry[] | undefined;
      filesArr?.forEach((f) => {
        if (/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f.fileName)) {
          allPhotoUrls.add(fileUrl(f.fileUrl));
        }
      });
    });

    // Fetch semua foto secara paralel
    const base64Cache = new Map<string, string | null>();
    await Promise.all(
      Array.from(allPhotoUrls).map(async (url) => {
        const b64 = await fetchImageAsBase64(url);
        base64Cache.set(url, b64);
      })
    );

    // ── Header tabel ──────────────────────────────────────────────────────────
    const thStyle = `padding:8px 10px;border:1px solid #d1d5db;background:#231f20;color:#fff;font-size:11px;font-weight:700;text-align:left;white-space:nowrap;`;
    const thPhotoStyle = `padding:8px 10px;border:1px solid #d1d5db;background:#f15a22;color:#fff;font-size:11px;font-weight:700;text-align:center;white-space:nowrap;min-width:150px;`;

    const headerCols = [
      `<th style="${thStyle}width:32px;">#</th>`,
      `<th style="${thStyle}min-width:180px;">Judul / Deskripsi</th>`,
      ...tableCols.map((f) => `<th style="${thStyle}min-width:110px;">${f.label}</th>`),
      `<th style="${thStyle}min-width:110px;">Status</th>`,
      `<th style="${thStyle}min-width:110px;">Dilaporkan Oleh</th>`,
      `<th style="${thStyle}min-width:100px;">Tgl Dibuat</th>`,
      `<th style="${thStyle}min-width:110px;">Disetujui Oleh</th>`,
      `<th style="${thPhotoStyle}min-width:160px;">📸 Foto Before<br/>(Hazard)</th>`,
      `<th style="${thPhotoStyle}min-width:160px;">✅ Foto After<br/>(Perbaikan)</th>`,
      `<th style="${thStyle}min-width:160px;">Catatan Approval</th>`,
    ].join('');

    // ── Helper render foto di cell (pakai base64 dari cache) ─────────────────
    const renderPhotoCell = (photo: PhotoEntry | undefined, label: string) => {
      const tdBase = `padding:8px;border:1px solid #e5e7eb;text-align:center;vertical-align:middle;background:#fafafa;`;
      if (!photo) {
        return `<td style="${tdBase}color:#9ca3af;font-size:10px;">${label}<br/>—</td>`;
      }
      const href = fileUrl(photo.fileUrl);
      const isImg = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(photo.fileName);
      if (isImg) {
        const b64 = base64Cache.get(href);
        if (b64) {
          // Embed base64 langsung — tidak ada permintaan jaringan saat dibuka
          return `<td style="${tdBase}">
            <img src="${b64}" alt="${label}"
              style="max-width:140px;max-height:110px;object-fit:cover;border-radius:5px;border:1px solid #d1d5db;display:block;margin:0 auto;" />
          </td>`;
        }
        // Fallback: pakai URL asli (mungkin gagal jika CORS, tapi tetap coba)
        return `<td style="${tdBase}">
          <img src="${href}" alt="${label}"
            style="max-width:140px;max-height:110px;object-fit:cover;border-radius:5px;border:1px solid #d1d5db;display:block;margin:0 auto;" />
        </td>`;
      }
      return `<td style="${tdBase}font-size:11px;">
        <a href="${href}" target="_blank" style="color:#f15a22;">Lihat File</a>
      </td>`;
    };

    // ── Baris data ────────────────────────────────────────────────────────────
    const tdBase = `padding:7px 10px;border:1px solid #e5e7eb;font-size:11px;vertical-align:top;`;
    const rowsHtml = filtered.map((rec, idx) => {
      const fStatus = (rec as any).findingStatus ?? '';
      const aStatus = (rec as any).approvalStatus ?? '';
      const statusLabel = aStatus ? `${fStatus}-${aStatus}` : fStatus || '—';
      const statusBg = aStatus === 'ACC' ? '#dcfce7' : aStatus === 'TACC' ? '#fee2e2' : fStatus === 'INPG' ? '#fef9c3' : '#f3f4f6';
      const statusColor = aStatus === 'ACC' ? '#15803d' : aStatus === 'TACC' ? '#b91c1c' : fStatus === 'INPG' ? '#92400e' : '#6b7280';

      const filesArr = (rec as any).files as PhotoEntry[] | undefined;
      const hazardPhoto = filesArr?.find((f) => f.fieldName === 'dokumentasiHazard');
      const fixPhoto = filesArr?.find((f) => f.fieldName === 'dokumentasiPerbaikan');

      const rowBg = idx % 2 === 0 ? '#ffffff' : '#f9fafb';

      const dataCells = tableCols.map((f) => {
        const val = rec.data?.[f.key];
        const display = f.type === 'select'
          ? (f.options?.find((o) => o.value === val)?.label ?? val ?? '—')
          : f.type === 'date' ? (val ? formatDate(String(val)) : '—') : (val ?? '—');
        return `<td style="${tdBase}background:${rowBg};">${String(display)}</td>`;
      }).join('');

      return `<tr style="background:${rowBg};">
        <td style="${tdBase}text-align:center;color:#9ca3af;">${idx + 1}</td>
        <td style="${tdBase}font-weight:600;max-width:220px;">${rec.title}</td>
        ${dataCells}
        <td style="${tdBase}text-align:center;">
          <span style="display:inline-block;padding:2px 8px;border-radius:12px;background:${statusBg};color:${statusColor};font-weight:700;font-size:10px;white-space:nowrap;">${statusLabel}</span>
        </td>
        <td style="${tdBase}">${rec.createdByName ?? '—'}</td>
        <td style="${tdBase}white-space:nowrap;">${formatDate(rec.createdAt)}</td>
        <td style="${tdBase}">${(rec as any).approvedByName ?? '—'}</td>
        ${renderPhotoCell(hazardPhoto, 'Before')}
        ${renderPhotoCell(fixPhoto, 'After')}
        <td style="${tdBase}color:#374151;max-width:180px;">${(rec as any).approvalNote ?? '—'}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1f2937; padding: 16px; }
    @media print {
      body { padding: 4mm; font-size: 10px; }
      .no-print { display: none !important; }
      @page { margin: 8mm; size: A3 landscape; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      img { max-width: 120px !important; max-height: 90px !important; }
    }
    .header { background: #231f20; color: white; padding: 16px 20px; margin-bottom: 14px; border-radius: 6px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; }
    .header h1 { font-size: 18px; margin-bottom: 3px; }
    .header p { font-size: 11px; color: #9ca3af; }
    .stats { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
    .stat { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 14px; text-align: center; min-width: 90px; }
    .stat-num { font-size: 20px; font-weight: 700; color: #f15a22; }
    .stat-label { font-size: 10px; color: #6b7280; }
    .print-btn { background: #f15a22; color: white; border: none; padding: 9px 18px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; margin-bottom: 14px; }
    .print-btn:hover { background: #d44d1a; }
    .table-wrap { overflow-x: auto; border-radius: 6px; border: 1px solid #d1d5db; }
    table { border-collapse: collapse; width: 100%; min-width: 1200px; }
    thead th { position: sticky; top: 0; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${title}</h1>
      <p>${dateLabel}</p>
    </div>
    <div style="text-align:right;">
      <p style="font-size:13px;font-weight:700;color:#f15a22;">${filtered.length} Record</p>
      <p style="font-size:10px;color:#9ca3af;">SMK3 Safety System</p>
    </div>
  </div>
  <div class="stats no-print">
    <div class="stat"><div class="stat-num">${filtered.length}</div><div class="stat-label">Total</div></div>
    <div class="stat"><div class="stat-num">${filtered.filter((r) => (r as any).findingStatus === 'INPG').length}</div><div class="stat-label">INPG</div></div>
    <div class="stat"><div class="stat-num">${filtered.filter((r) => (r as any).approvalStatus === 'ACC').length}</div><div class="stat-label">CLSD-ACC</div></div>
    <div class="stat"><div class="stat-num">${filtered.filter((r) => (r as any).approvalStatus === 'TACC').length}</div><div class="stat-label">CLSD-TACC</div></div>
  </div>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF (A3 Landscape)</button>
  <div class="table-wrap">
    <table>
      <thead><tr>${headerCols}</tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </div>
  <script>
    document.querySelectorAll('img').forEach(img => {
      img.onerror = function() {
        this.style.display = 'none';
        const p = document.createElement('p');
        p.style.cssText = 'font-size:9px;color:#9ca3af;text-align:center;margin-top:2px;';
        p.textContent = 'Foto tidak dapat dimuat';
        if (this.parentNode) this.parentNode.appendChild(p);
      };
    });
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const dateStr = dateFrom && dateTo ? `_${dateFrom}_sd_${dateTo}` : '';
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}${dateStr}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const filtered = filterByDate(records);
      if (filtered.length === 0) {
        alert('Tidak ada record dalam rentang tanggal yang dipilih.');
        return;
      }
      if (exportFormat === 'html') {
        await handleExportHTML(filtered);
      } else {
        handleExportCSV(filtered);
      }
      onClose();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0db]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#f15a22] mb-0.5">Export Data</p>
            <h2 className="font-bold text-[15px] text-[#231f20]">Download Excel / CSV</h2>
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-[13px] text-[#6b6560]">
            Kosongkan tanggal untuk export semua record.
          </p>

          {/* Format pilihan */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-2">Format Export</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setExportFormat('html')}
                className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 transition-all ${exportFormat === 'html' ? 'border-[#f15a22] bg-orange-50' : 'border-[#e5e0db] hover:border-[#f15a22]/40'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={exportFormat === 'html' ? '#f15a22' : '#a09b96'} strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>
                </svg>
                <span className={`font-bold text-[12px] ${exportFormat === 'html' ? 'text-[#f15a22]' : 'text-[#6b6560]'}`}>HTML + Foto</span>
                <span className={`text-[10px] text-center ${exportFormat === 'html' ? 'text-[#f15a22]' : 'text-[#a09b96]'}`}>Print / Save PDF</span>
              </button>
              <button type="button" onClick={() => setExportFormat('csv')}
                className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 transition-all ${exportFormat === 'csv' ? 'border-green-500 bg-green-50' : 'border-[#e5e0db] hover:border-green-300'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={exportFormat === 'csv' ? '#16a34a' : '#a09b96'} strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
                </svg>
                <span className={`font-bold text-[12px] ${exportFormat === 'csv' ? 'text-green-700' : 'text-[#6b6560]'}`}>CSV / Excel</span>
                <span className={`text-[10px] text-center ${exportFormat === 'csv' ? 'text-green-600' : 'text-[#a09b96]'}`}>Data saja, tanpa foto</span>
              </button>
            </div>
            {exportFormat === 'html' && (
              <p className="text-[11px] text-[#a09b96] mt-1.5">
                File .html berisi foto temuan before/after. Buka di browser → klik "Print / Save PDF" untuk menyimpan.
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">Dari Tanggal</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22]" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">Sampai Tanggal</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22]" />
          </div>
          <div className="px-3 py-2 bg-[#faf9f7] rounded-xl border border-[#e5e0db]">
            <p className="text-[12px] text-[#6b6560]">
              Total record tersedia: <strong className="text-[#231f20]">{records.length}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e0db]">
          <button onClick={onClose} disabled={exporting}
            className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors">
            Batal
          </button>
          <button onClick={handleExport} disabled={exporting}
            className={`flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white rounded-xl transition-colors disabled:opacity-60 ${exportFormat === 'html' ? 'bg-[#f15a22] hover:bg-[#d44d1a]' : 'bg-green-600 hover:bg-green-700'}`}>
            {exporting ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : exportFormat === 'html' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"/>
                <path d="M9 21h6a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1z"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            )}
            {exporting ? 'Mengekspor...' : exportFormat === 'html' ? 'Export HTML + Foto' : 'Download CSV'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

interface DetailPanelProps {
  record: SafetyRecord | null;
  fields: CrudField[];
  onClose: () => void;
  onEdit: () => void;
  isAdmin: boolean;
  isSupervisor: boolean;
  onDelete: () => void;
  isK3Policy?: boolean;
  enableApproval?: boolean;
  onOpenApproval?: () => void;
}

function DetailPanel({
  record, fields, onClose, onEdit, isAdmin, isSupervisor, onDelete,
  isK3Policy = false, enableApproval = false, onOpenApproval,
}: DetailPanelProps) {
  const [imgErrors, setImgErrors] = React.useState<Record<string, boolean>>({});

  if (!record) return null;

  const findingStatus = (record as any).findingStatus as string | undefined;
  const approvalStatus = (record as any).approvalStatus as string | undefined;
  const isInpg = findingStatus === 'INPG';
  const isClosed = findingStatus === 'CLSD';
  const needsApproval = isClosed && !approvalStatus;
  const canApprove = enableApproval && isSupervisor && needsApproval && !!onOpenApproval;

  const filesArr = (record as any).files as Array<{ fieldName: string; fileUrl: string; fileName: string }> | undefined;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[450]" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[460] flex flex-col">
        {/* header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#e5e0db] flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#f15a22] mb-1">Detail Record</p>
            <h3 className="font-bold text-[16px] text-[#231f20] leading-snug">
              {isK3Policy ? (record as any).judulKebijakan : record.title}
            </h3>
            {enableApproval && findingStatus && (
              <div className="mt-2">
                <ApprovalBadge status={findingStatus} approvalStatus={approvalStatus} />
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] flex-shrink-0 p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#a09b96] mb-0.5">Dibuat Oleh</p>
              <p className="text-[#231f20] font-medium">
                {isK3Policy ? (record as any).createdBy?.nama : record.createdByName || '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#a09b96] mb-0.5">Tanggal Dibuat</p>
              <p className="text-[#231f20] font-medium">{formatDate(record.createdAt)}</p>
            </div>
            {enableApproval && findingStatus === 'CLSD' && (record as any).approvedByName && (
              <>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#a09b96] mb-0.5">Disetujui Oleh</p>
                  <p className={`font-semibold ${approvalStatus === 'TACC' ? 'text-red-700' : 'text-green-700'}`}>
                    {(record as any).approvedByName}
                  </p>
                </div>
                {(record as any).approvedAt && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#a09b96] mb-0.5">Tanggal Approval</p>
                    <p className="text-[#231f20] font-medium">{formatDate((record as any).approvedAt)}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <hr className="border-[#e5e0db]" />

          {/* Approval note */}
          {enableApproval && (record as any).approvalNote && (
            <div className={`px-4 py-3 rounded-xl border ${approvalStatus === 'TACC' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <p className={`text-[11px] font-bold uppercase tracking-wide mb-1 ${approvalStatus === 'TACC' ? 'text-red-700' : 'text-green-700'}`}>
                Catatan Approval ({approvalStatus})
              </p>
              <p className={`text-[13px] ${approvalStatus === 'TACC' ? 'text-red-800' : 'text-green-800'}`}>
                {(record as any).approvalNote}
              </p>
            </div>
          )}

          {/* Files section */}
          {filesArr && filesArr.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#a09b96]">File / Foto</p>
              {filesArr.map((f, i) => {
                const href = fileUrl(f.fileUrl);
                const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f.fileName);
                const fieldLabel = fields.find((fd) => fd.key === f.fieldName)?.label ?? f.fieldName;
                const imgFailed = imgErrors[f.fileUrl];
                return (
                  <div key={i} className="border border-[#e5e0db] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-[#faf9f7] border-b border-[#e5e0db]">
                      <p className="text-[11px] font-bold text-[#6b6560] uppercase tracking-wide">{fieldLabel}</p>
                      <a href={href} target="_blank" rel="noopener noreferrer"
                        className="text-[11px] text-[#f15a22] hover:underline font-medium flex items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        Buka
                      </a>
                    </div>
                    {isImage && !imgFailed ? (
                      <div className="bg-[#f1f0ee]">
                        <img
                          src={href}
                          alt={fieldLabel}
                          crossOrigin="anonymous"
                          className="w-full max-h-64 object-contain"
                          onError={() => setImgErrors((prev) => ({ ...prev, [f.fileUrl]: true }))}
                        />
                      </div>
                    ) : isImage && imgFailed ? (
                      <div className="px-3 py-4 flex flex-col items-center gap-2 bg-[#faf9f7]">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c5c0bb" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <p className="text-[11px] text-[#a09b96] text-center">
                          Gambar tidak dapat ditampilkan.<br />
                          <a href={href} target="_blank" rel="noopener noreferrer"
                            className="text-[#f15a22] hover:underline font-medium">Klik untuk buka di tab baru</a>
                        </p>
                      </div>
                    ) : (
                      <div className="px-3 py-2.5">
                        <a href={href} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#f15a22] hover:underline text-[13px] font-medium">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          {f.fileName}
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Fields */}
          <div className="space-y-4">
            {fields
              .filter((f) => f.showInDetail !== false && f.type !== 'file')
              .map((f) => {
                const val = isK3Policy ? (record as any)[f.key] : record.data?.[f.key];
                if (!val) return null;
                const isStatusField = f.key.toLowerCase().includes('status');
                return (
                  <div key={f.key}>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#a09b96] mb-0.5">{f.label}</p>
                    {isStatusField ? (
                      <Badge value={String(val)} />
                    ) : f.type === 'textarea' ? (
                      <p className="text-[#231f20] text-[13px] leading-relaxed whitespace-pre-wrap">{String(val)}</p>
                    ) : f.type === 'date' ? (
                      <p className="text-[#231f20] font-medium text-[13px]">{formatDate(String(val))}</p>
                    ) : f.type === 'select' ? (
                      <p className="text-[#231f20] font-medium text-[13px]">
                        {f.options?.find((o) => o.value === val)?.label ?? String(val)}
                      </p>
                    ) : (
                      <p className="text-[#231f20] font-medium text-[13px]">{String(val)}</p>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* footer */}
        <div className="flex flex-col gap-2 px-6 py-4 border-t border-[#e5e0db] flex-shrink-0">
          {/* Info: INPG belum bisa approve */}
          {enableApproval && isInpg && isSupervisor && (
            <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-[12px] text-amber-700 flex items-center gap-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Temuan masih <strong className="ml-0.5">INPG</strong>. Approval setelah pelapor ubah status ke CLSD.
            </div>
          )}
          {/* Info: sudah di-approve */}
          {enableApproval && isClosed && approvalStatus && (
            <div className={`px-3 py-2 rounded-xl text-[12px] flex items-center gap-2 border ${
              approvalStatus === 'ACC'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {approvalStatus === 'ACC' ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              )}
              Disetujui oleh <strong className="ml-0.5">{(record as any).approvedByName}</strong>&nbsp;({approvalStatus})
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {canApprove && (
              <button onClick={onOpenApproval}
                className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Approval ACC/TACC
              </button>
            )}
            {(!enableApproval || isInpg || isAdmin) && (
              <button onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-white bg-[#f15a22] rounded-xl hover:bg-[#d44d1a] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </button>
            )}
            {isAdmin && (
              <button onClick={onDelete}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                Hapus
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[700] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-[14px] font-medium ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
      )}
      {msg}
    </div>
  );
}

// ── Main CrudPage ─────────────────────────────────────────────────────────────

export function CrudPage({ config }: { config: CrudPageConfig }) {
  return (
    <Suspense fallback={null}>
      <CrudPageInner config={config} />
    </Suspense>
  );
}

function CrudPageInner({ config }: { config: CrudPageConfig }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isSupervisor = user?.role === 'supervisor' || isAdmin;
  const isRegularUser = user?.role === 'user';
  const enableApproval = !!config.enableApproval;
  const searchParams = useSearchParams();

  const [records, setRecords] = useState<SafetyRecord[]>([]);
  const [filtered, setFiltered] = useState<SafetyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SafetyRecord | null>(null);
  const [detailRecord, setDetailRecord] = useState<SafetyRecord | null>(null);
  const [approvalRecord, setApprovalRecord] = useState<SafetyRecord | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch ──
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      if (config.categoryId === 'sc-k3-policy') {
        const data = await k3PolicyApi.getAll();
        setRecords(data);
      } else {
        // Role 'user' hanya lihat record milik sendiri — filter di backend
        const createdById = isRegularUser && user?.id ? user.id : undefined;
        const data = await recordsApi.getAll(config.categoryId as any, undefined, createdById);
        setRecords(data);
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  }, [config.categoryId, isRegularUser, user?.id]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // ── Auto-buka detail jika ada ?id= di URL (dari klik notifikasi) ──
  useEffect(() => {
    const targetId = searchParams.get('id');
    if (!targetId || records.length === 0) return;
    const found = records.find((r) => r.id === targetId);
    if (found) setDetailRecord(found);
  }, [searchParams, records]);

  // ── Filter client-side ──
  useEffect(() => {
    let result = [...records];

    // Status filter: '' | 'INPG' | 'CLSD-ACC' | 'CLSD-TACC'
    if (enableApproval && statusFilter) {
      if (statusFilter === 'INPG') {
        result = result.filter((r) => (r as any).findingStatus === 'INPG');
      } else if (statusFilter === 'CLSD') {
        result = result.filter((r) => (r as any).findingStatus === 'CLSD' && !(r as any).approvalStatus);
      } else if (statusFilter === 'CLSD-ACC') {
        result = result.filter((r) => (r as any).findingStatus === 'CLSD' && (r as any).approvalStatus === 'ACC');
      } else if (statusFilter === 'CLSD-TACC') {
        result = result.filter((r) => (r as any).findingStatus === 'CLSD' && (r as any).approvalStatus === 'TACC');
      }
    }

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) => {
        if (config.categoryId === 'sc-k3-policy') {
          const k3 = r as any;
          return k3.judulKebijakan?.toLowerCase().includes(q) || k3.jenisKebijakan?.toLowerCase().includes(q);
        }
        return (
          r.title?.toLowerCase().includes(q) ||
          Object.values(r.data ?? {}).some((v) => String(v).toLowerCase().includes(q))
        );
      });
    }

    setFiltered(result);
  }, [search, statusFilter, records, config.categoryId, enableApproval]);

  // ── Count per status ──
  const countStatus = (s: StatusFilter) => {
    if (s === '') return records.length;
    if (s === 'INPG') return records.filter((r) => (r as any).findingStatus === 'INPG').length;
    if (s === 'CLSD') return records.filter((r) => (r as any).findingStatus === 'CLSD' && !(r as any).approvalStatus).length;
    if (s === 'CLSD-ACC') return records.filter((r) => (r as any).findingStatus === 'CLSD' && (r as any).approvalStatus === 'ACC').length;
    if (s === 'CLSD-TACC') return records.filter((r) => (r as any).findingStatus === 'CLSD' && (r as any).approvalStatus === 'TACC').length;
    return 0;
  };

  // ── Submit ──
  const handleSubmit = async (values: { title: string; data: Record<string, string> }) => {
    try {
      if (editTarget) {
        await recordsApi.update(editTarget.id, values);
        showToast('Record berhasil diperbarui', 'success');
      } else {
        await recordsApi.create(config.categoryId as any, values);
        showToast('Record berhasil ditambahkan', 'success');
      }
      await fetchRecords();
    } catch (err: any) {
      const msg = err.message || 'Gagal menyimpan record';
      showToast(msg, 'error');
      throw err; // re-throw agar FormModal tahu ada error (tidak menutup modal)
    }
  };

  const handleSubmitFormData = async (formData: FormData) => {
    try {
      if (editTarget) {
        if (config.categoryId === 'sc-k3-policy') await k3PolicyApi.updateWithFile(editTarget.id, formData);
        else await recordsApi.updateWithFile(editTarget.id, formData);
        showToast('Record berhasil diperbarui', 'success');
      } else {
        if (config.categoryId === 'sc-k3-policy') await k3PolicyApi.createWithFile(formData);
        else await recordsApi.createWithFile(config.categoryId as any, formData);
        showToast('Record berhasil ditambahkan', 'success');
      }
      await fetchRecords();
    } catch (err: any) {
      const msg = err.message || 'Gagal menyimpan record';
      showToast(msg, 'error');
      throw err; // re-throw agar FormModal tahu ada error (tidak menutup modal)
    }
  };

  // ── Delete ──
  const handleDelete = async (record: SafetyRecord) => {
    const displayTitle = config.categoryId === 'sc-k3-policy' ? (record as any).judulKebijakan : record.title;
    if (!confirm(`Hapus record "${displayTitle}"?`)) return;
    try {
      if (config.categoryId === 'sc-k3-policy') await k3PolicyApi.delete(record.id);
      else await recordsApi.delete(record.id);
      showToast('Record berhasil dihapus', 'success');
      if (detailRecord?.id === record.id) setDetailRecord(null);
      await fetchRecords();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus', 'error');
    }
  };

  // ── Approval ACC/TACC ──
  const handleApprove = async (id: string, approvalStatus: 'ACC' | 'TACC', note: string) => {
    try {
      await findingsApi.updateStatus(id, 'CLSD', { approvalStatus, approvalNote: note });
      showToast(`Temuan ${approvalStatus === 'ACC' ? 'disetujui (ACC)' : 'ditolak (TACC)'}`, 'success');
      setApprovalRecord(null);
      setDetailRecord(null);
      await fetchRecords();
    } catch (err: any) {
      showToast(err.message || 'Gagal melakukan approval', 'error');
      throw err;
    }
  };

  const tableCols = config.fields.filter((f) => f.showInTable !== false && f.type !== 'file').slice(0, 3);

  const STATUS_TABS: { value: StatusFilter; label: string; color: string; activeColor: string }[] = [
    { value: '', label: 'ALL', color: 'border-[#e5e0db] text-[#6b6560] hover:border-[#c5c0bb]', activeColor: 'bg-[#231f20] text-white border-[#231f20]' },
    { value: 'INPG', label: '⏳ INPG', color: 'border-[#e5e0db] text-[#6b6560] hover:border-amber-300', activeColor: 'bg-amber-500 text-white border-amber-500' },
    { value: 'CLSD', label: '🔒 CLSD (Pending)', color: 'border-[#e5e0db] text-[#6b6560] hover:border-blue-300', activeColor: 'bg-blue-600 text-white border-blue-600' },
    { value: 'CLSD-ACC', label: '✅ CLSD-ACC', color: 'border-[#e5e0db] text-[#6b6560] hover:border-green-300', activeColor: 'bg-green-600 text-white border-green-600' },
    { value: 'CLSD-TACC', label: '❌ CLSD-TACC', color: 'border-[#e5e0db] text-[#6b6560] hover:border-red-300', activeColor: 'bg-red-600 text-white border-red-600' },
  ];

  return (
    <div className="min-h-screen bg-[#f1f0ee]">
      {/* Page Header */}
      <div className="bg-[#231f20] px-6 md:px-10 py-8 border-b-[3px] border-b-[#f15a22]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-2">{config.parentLabel}</p>
          <h1 className="font-bold text-white text-[clamp(22px,4vw,38px)] leading-tight">{config.title}</h1>
          <p className="text-[#8a8580] text-[13px] mt-1.5">{config.description}</p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a09b96]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={`Cari ${config.title}...`}
              className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 transition-colors" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09b96] hover:text-[#231f20]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          {/* Export button */}
          <button onClick={() => setExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#c5c0bb] text-[#231f20] text-[13px] font-semibold rounded-xl hover:border-green-400 hover:text-green-700 transition-colors whitespace-nowrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
          {/* Add button */}
          <button onClick={() => { setEditTarget(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors whitespace-nowrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Record
          </button>
        </div>

        {/* Status filter tabs */}
        {enableApproval && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors border ${
                  statusFilter === tab.value ? tab.activeColor : `bg-white ${tab.color}`
                }`}>
                {tab.label}
                {!loading && (
                  <span className="ml-1.5 opacity-70">({countStatus(tab.value)})</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Info bar */}
        <div className="flex items-center justify-between mb-3 px-1 flex-wrap gap-2">
          <p className="text-[12px] text-[#6b6560]">
            {loading ? 'Memuat data...' : `Menampilkan ${filtered.length} record${search ? ` dari ${records.length}` : ''}`}
            {isRegularUser && !loading && (
              <span className="ml-1.5 text-[#a09b96]">(hanya record Anda)</span>
            )}
          </p>
          {isAdmin && !loading && (
            <span className="text-[11px] px-2.5 py-0.5 bg-[#f15a22]/10 text-[#f15a22] rounded-full font-semibold border border-[#f15a22]/20">Mode Admin</span>
          )}
          {isSupervisor && !isAdmin && !loading && (
            <span className="text-[11px] px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full font-semibold border border-blue-200">Mode Supervisor</span>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#e5e0db] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[1,2,3,4].map((i) => <div key={i} className="h-12 bg-[#f1f0ee] rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#f1f0ee] flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c5c0bb" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <p className="font-semibold text-[#231f20] text-[14px] mb-1">
                {search ? 'Tidak ada hasil pencarian' : 'Belum ada record'}
              </p>
              <p className="text-[#6b6560] text-[13px]">
                {search ? `Tidak ditemukan record untuk "${search}"` : 'Klik "Tambah Record" untuk menambahkan data pertama.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#e5e0db] bg-[#faf9f7]">
                    <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide w-10">#</th>
                    <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide">Judul</th>
                    {tableCols.map((f) => (
                      <th key={f.key} className="text-left py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide hidden md:table-cell">{f.label}</th>
                    ))}
                    {enableApproval && (
                      <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide hidden md:table-cell">Status</th>
                    )}
                    <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide hidden lg:table-cell">Dibuat Oleh</th>
                    <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide hidden lg:table-cell">Tanggal</th>
                    <th className="text-right py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f0ee]">
                  {filtered.map((rec, idx) => {
                    const isK3 = config.categoryId === 'sc-k3-policy';
                    const displayTitle = isK3 ? (rec as any).judulKebijakan : rec.title;
                    const fStatus = (rec as any).findingStatus as string | undefined;
                    const aStatus = (rec as any).approvalStatus as string | undefined;
                    return (
                      <tr key={rec.id} className="hover:bg-[#faf9f7] transition-colors">
                        <td className="py-3 px-4 text-[#a09b96]">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <button onClick={() => setDetailRecord(rec)}
                            className="font-medium text-[#231f20] hover:text-[#f15a22] text-left transition-colors leading-snug">
                            {displayTitle}
                          </button>
                        </td>
                        {tableCols.map((f) => {
                          const val = isK3 ? (rec as any)[f.key] : rec.data?.[f.key];
                          const isStatus = f.key.toLowerCase().includes('status');
                          return (
                            <td key={f.key} className="py-3 px-4 hidden md:table-cell max-w-[160px]">
                              {val ? (
                                isStatus ? <Badge value={String(val)} /> : (
                                  <span className="text-[#6b6560] truncate block">{
                                    f.type === 'select'
                                      ? (f.options?.find((o) => o.value === val)?.label ?? String(val))
                                      : String(val)
                                  }</span>
                                )
                              ) : <span className="text-[#c5c0bb]">—</span>}
                            </td>
                          );
                        })}
                        {enableApproval && (
                          <td className="py-3 px-4 hidden md:table-cell">
                            {fStatus ? <ApprovalBadge status={fStatus} approvalStatus={aStatus} /> : <span className="text-[#c5c0bb]">—</span>}
                          </td>
                        )}
                        <td className="py-3 px-4 text-[#6b6560] hidden lg:table-cell">
                          {isK3 ? (rec as any).createdBy?.nama : rec.createdByName || '—'}
                        </td>
                        <td className="py-3 px-4 text-[#6b6560] hidden lg:table-cell whitespace-nowrap">
                          {formatDate(rec.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => setDetailRecord(rec)} className="p-1.5 text-[#6b6560] hover:text-[#f15a22] hover:bg-[#f1f0ee] rounded-lg" title="Lihat detail">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                            <button onClick={() => { setEditTarget(rec); setModalOpen(true); }} className="p-1.5 text-[#6b6560] hover:text-[#f15a22] hover:bg-[#f1f0ee] rounded-lg" title="Edit">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            {isAdmin && (
                              <button onClick={() => handleDelete(rec)} className="p-1.5 text-[#6b6560] hover:text-red-500 hover:bg-red-50 rounded-lg" title="Hapus">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                  <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSubmit={handleSubmit}
        onSubmitFormData={handleSubmitFormData}
        fields={config.fields}
        modalTitle={editTarget ? `Edit — ${config.title}` : `Tambah Record — ${config.title}`}
        isK3Policy={config.categoryId === 'sc-k3-policy'}
        enableApproval={enableApproval}
        currentUserNama={user?.nama}
        currentUserDepartemen={user?.departemen}
        currentUserIdKaryawan={user?.idKaryawan}
        initialValues={
          editTarget
            ? config.categoryId === 'sc-k3-policy'
              ? { title: (editTarget as any).judulKebijakan ?? '', data: editTarget as any }
              : {
                  title: editTarget.title,
                  data: {
                    ...editTarget.data,
                    // findingStatus ada di level record, bukan di dalam data — ikutkan agar FormModal
                    // bisa me-load nilai yang sudah ada saat edit
                    findingStatus: (editTarget as any).findingStatus ?? 'INPG',
                  },
                }
            : null
        }
      />

      {/* Detail Panel */}
      <DetailPanel
        record={detailRecord}
        fields={config.fields}
        isK3Policy={config.categoryId === 'sc-k3-policy'}
        enableApproval={enableApproval}
        isSupervisor={isSupervisor}
        onOpenApproval={() => { setApprovalRecord(detailRecord); }}
        onClose={() => setDetailRecord(null)}
        onEdit={() => { setEditTarget(detailRecord); setDetailRecord(null); setModalOpen(true); }}
        isAdmin={isAdmin}
        onDelete={() => { if (detailRecord) handleDelete(detailRecord); }}
      />

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={!!approvalRecord}
        record={approvalRecord}
        onClose={() => setApprovalRecord(null)}
        onApprove={handleApprove}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        records={records}
        fields={config.fields}
        title={config.title}
      />

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
