'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  picaApi,
  formatTanggalPica,
  sisaHariDeadline,
  sisaHariColor,
  isTerlambat,
  hitungStatistikPica,
  formatFileSize,
  isImageFile,
} from '@/lib/picaApi';
import type { PicaRecord, StatusPerbaikan, KategoriTemuan, JenisTemuan, HiraruchiPengendalian } from '@/types/pica';
import {
  KATEGORI_TEMUAN_LABELS,
  STATUS_PERBAIKAN_LABELS,
  JENIS_TEMUAN_OPTIONS,
  HIRARKI_OPTIONS,
  KATEGORI_OPTIONS,
} from '@/types/pica';
import { KRITERIA_SMK3, DIVISI_LIST } from '@/data/picaData';
import toast from 'react-hot-toast';

// ── Input style constants ─────────────────────────────────────────────────────
const inputCls    = 'w-full border border-[#c5c0bb] rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 transition-colors bg-white';
const textareaCls = inputCls + ' resize-none';

// ── Shared form sub-components ────────────────────────────────────────────────

function FormSection({
  title, icon, badge, children,
}: {
  title: string; icon: React.ReactNode; badge?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#e5e0db] shadow-sm overflow-hidden">
      <div className="bg-[#faf9f7] border-b border-[#e5e0db] px-5 py-3 flex items-center gap-2.5">
        <span className="text-[#f15a22]">{icon}</span>
        <h2 className="text-[14px] font-semibold text-[#231f20]">{title}</h2>
        {badge}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label, required, optional, children, hint,
}: {
  label: string; required?: boolean; optional?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#231f20] mb-1.5">
        {label}
        {required && <span className="text-red-500 text-[12px]">*</span>}
        {optional && <span className="text-[#a09b96] text-[11px] font-normal">(opsional)</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[#a09b96] mt-1">{hint}</p>}
    </div>
  );
}

function FileUploadArea({
  files, onAdd, onRemove,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
  placeholder = 'Klik atau drag file ke sini',
  subtext = 'Foto, PDF, dokumen',
}: {
  files: File[]; onAdd: (f: File[]) => void; onRemove: (i: number) => void;
  accept?: string; placeholder?: string; subtext?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <div
        className="border-2 border-dashed border-[#c5c0bb] rounded-xl p-4 text-center hover:border-[#f15a22] transition-colors cursor-pointer"
        onClick={() => ref.current?.click()}
      >
        <svg className="w-6 h-6 text-[#c5c0bb] mx-auto mb-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <p className="text-[12px] text-[#6b6560]">{placeholder}</p>
        <p className="text-[11px] text-[#a09b96] mt-0.5">{subtext}</p>
        <input ref={ref} type="file" className="hidden" multiple accept={accept}
          onChange={(e) => { if (e.target.files) { onAdd(Array.from(e.target.files)); e.target.value = ''; } }} />
      </div>
      {files.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-2 bg-[#faf9f7] rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-[#a09b96] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <span className="text-[12px] text-[#231f20] flex-1 truncate">{file.name}</span>
              <span className="text-[11px] text-[#a09b96]">{(file.size / 1024).toFixed(0)} KB</span>
              <button type="button" onClick={() => onRemove(i)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── File Preview Lightbox ─────────────────────────────────────────────────

function FileLightbox({
  files,
  initialIndex,
  onClose,
}: {
  files: { fileName: string; fileUrl: string; fileSize: number }[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(initialIndex);
  const file = files[idx];
  const isImg = isImageFile(file.fileName);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx((i) => Math.min(i + 1, files.length - 1));
      if (e.key === 'ArrowLeft')  setIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [files.length, onClose]);

  return (
    <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative z-10 flex flex-col items-center w-full max-w-4xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="w-full flex items-center justify-between bg-black/60 rounded-t-2xl px-4 py-2.5 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {isImg
              ? <svg className="w-4 h-4 text-green-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              : <svg className="w-4 h-4 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            }
            <span className="text-white text-[13px] truncate">{file.fileName}</span>
            <span className="text-[#a09b96] text-[11px] flex-shrink-0">{formatFileSize(file.fileSize)}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {files.length > 1 && (
              <span className="text-[#a09b96] text-[12px]">{idx + 1} / {files.length}</span>
            )}
            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-[#a09b96] hover:text-white hover:bg-white/10 transition-colors"
              title="Buka di tab baru">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-[#a09b96] hover:text-white hover:bg-white/10 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="w-full bg-[#1a1a1a] rounded-b-2xl overflow-hidden flex items-center justify-center"
          style={{ maxHeight: 'calc(90vh - 48px)' }}>
          {isImg ? (
            <img
              src={file.fileUrl}
              alt={file.fileName}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: 'calc(90vh - 48px)' }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <p className="text-white font-semibold text-[15px] mb-1">{file.fileName}</p>
              <p className="text-[#a09b96] text-[13px] mb-5">Preview tidak tersedia untuk tipe file ini</p>
              <a href={file.fileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Buka File
              </a>
            </div>
          )}
        </div>

        {/* Arrow navigation */}
        {files.length > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => Math.max(i - 1, 0))}
              disabled={idx === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white disabled:opacity-30 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button
              onClick={() => setIdx((i) => Math.min(i + 1, files.length - 1))}
              disabled={idx === files.length - 1}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white disabled:opacity-30 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </>
        )}

        {/* Thumbnail strip */}
        {files.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 max-w-full">
            {files.map((f, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  i === idx ? 'border-[#f15a22]' : 'border-transparent opacity-60 hover:opacity-100'
                }`}>
                {isImageFile(f.fileName) ? (
                  <img src={f.fileUrl} alt={f.fileName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FileList({ files }: { files: { fileName: string; fileUrl: string; fileSize: number }[] }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!files?.length) return null;
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {files.map((f, i) => (
          <button key={i} onClick={() => setLightboxIdx(i)}
            className="flex items-center gap-2.5 bg-[#faf9f7] hover:bg-orange-50 border border-[#e5e0db] hover:border-orange-200 rounded-xl px-3 py-2 transition-colors group text-left w-full">
            {isImageFile(f.fileName)
              ? <svg className="w-4 h-4 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              : <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            }
            <span className="text-[12px] text-[#6b6560] group-hover:text-[#f15a22] truncate flex-1 transition-colors">{f.fileName}</span>
            <span className="text-[10px] text-[#a09b96] flex-shrink-0">{formatFileSize(f.fileSize)}</span>
            <svg className="w-3 h-3 text-[#c5c0bb] group-hover:text-[#f15a22] flex-shrink-0 transition-colors ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        ))}
      </div>

      {lightboxIdx !== null && (
        <FileLightbox
          files={files}
          initialIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}

function RiwayatTimeline({ riwayat }: { riwayat: PicaRecord['riwayatApproval'] }) {
  if (!riwayat?.length) return <p className="text-[12px] text-[#a09b96] italic">Belum ada riwayat</p>;
  return (
    <div className="space-y-3">
      {[...riwayat].reverse().map((r, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${r.action === 'ACC' ? 'bg-green-100' : 'bg-red-100'}`}>
            {r.action === 'ACC'
              ? <svg className="w-3 h-3 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
              : <svg className="w-3 h-3 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[12px] font-bold ${r.action === 'ACC' ? 'text-green-700' : 'text-red-700'}`}>
                {r.action === 'ACC' ? 'Disetujui (ACC)' : 'Ditolak (TACC)'}
              </span>
              <span className="text-[11px] text-[#a09b96]">— {r.oleh}</span>
            </div>
            <div className="text-[11px] text-[#a09b96]">{formatTanggalPica(r.tanggal)}</div>
            {r.keterangan && (
              <div className={`mt-1 text-[12px] rounded-lg px-2 py-1 ${r.action === 'TACC' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                {r.keterangan}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────

function StatusPill({ status, isTacc }: { status: StatusPerbaikan; isTacc?: boolean }) {
  if (isTacc) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-700">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      OPEN (TACC)
    </span>
  );
  const { label, bg, text } = STATUS_PERBAIKAN_LABELS[status] ?? { label: status, bg: 'bg-gray-100', text: 'text-gray-700' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${bg} ${text}`}>{label}</span>;
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, color, active, onClick }: {
  label: string; value: number; color: string; active?: boolean; onClick?: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`bg-white rounded-xl border px-4 py-3 flex flex-col gap-1 shadow-sm w-full text-left transition-all ${active ? 'border-[#f15a22] ring-1 ring-[#f15a22]' : 'border-[#e5e0db] hover:border-[#c5c0bb]'} ${onClick ? 'cursor-pointer' : 'cursor-default'}`}>
      <span className="text-[12px] text-[#6b6560]">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </button>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const iconInfo = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const iconPerbaikan = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const iconHistory = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL: Create / Edit Temuan (admin only)
// ═══════════════════════════════════════════════════════════════════════════════

interface CreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record?: PicaRecord | null; // null = create mode
  user: any;
}

function CreateEditModal({ isOpen, onClose, onSuccess, record, user }: CreateEditModalProps) {
  const isEdit = !!record;
  const [saving, setSaving] = useState(false);

  const [temuanMasalah,        setTemuanMasalah]        = useState('');
  const [kriteriaId,           setKriteriaId]           = useState('');
  const [kriteriaSearch,       setKriteriaSearch]       = useState('');
  const [showKriteria,         setShowKriteria]         = useState(false);
  const [kategori,             setKategori]             = useState<KategoriTemuan | ''>('');
  const [lokasiDivisiId,       setLokasiDivisiId]       = useState('');
  const [picNamaManual,        setPicNamaManual]        = useState('');
  const [picIdManual,          setPicIdManual]          = useState('');
  const [dokTeks,              setDokTeks]              = useState('');
  const [temuanFiles,          setTemuanFiles]          = useState<File[]>([]);
  const [tanggalTemuan,        setTanggalTemuan]        = useState(new Date().toISOString().split('T')[0]);
  const [jenisTemuan,          setJenisTemuan]          = useState<JenisTemuan | ''>('');
  const [batasAkhir,           setBatasAkhir]           = useState('');
  const [hirarki,              setHirarki]              = useState<HiraruchiPengendalian[]>([]);
  const [rekomendasi,          setRekomendasi]          = useState('');
  const [perbaikanFiles,       setPerbaikanFiles]       = useState<File[]>([]);

  // Populate on edit
  useEffect(() => {
    if (isOpen) {
      if (record) {
        setTemuanMasalah(record.temuanMasalah);
        setKriteriaId(record.kriteriaId);
        setKategori(record.kategori as KategoriTemuan);
        setLokasiDivisiId(record.lokasiDivisiId);
        setPicNamaManual(record.picNama);
        setPicIdManual(record.picId);
        setDokTeks(record.dokumentasiTemuanTeks || '');
        setTanggalTemuan(record.tanggalTemuan);
        setJenisTemuan(record.jenisTemuan as JenisTemuan);
        setBatasAkhir(record.batasAkhir);
        setHirarki(record.hierarkiPengendalian as HiraruchiPengendalian[]);
        setRekomendasi(record.rekomendasiPerbaikan || '');
      } else {
        setTemuanMasalah(''); setKriteriaId(''); setKriteriaSearch('');
        setKategori(''); setLokasiDivisiId(''); setPicNamaManual(''); setPicIdManual('');
        setDokTeks(''); setTemuanFiles([]);
        setTanggalTemuan(new Date().toISOString().split('T')[0]);
        setJenisTemuan(''); setBatasAkhir('');
        setHirarki([]); setRekomendasi(''); setPerbaikanFiles([]);
      }
    }
  }, [isOpen, record]);

  const selectedDivisi   = DIVISI_LIST.find((d) => d.id === lokasiDivisiId);
  const selectedKriteria = KRITERIA_SMK3.find((k) => k.id === kriteriaId);
  const filteredKriteria = kriteriaSearch.trim()
    ? KRITERIA_SMK3.filter((k) =>
        k.id.toLowerCase().includes(kriteriaSearch.toLowerCase()) ||
        k.deskripsi.toLowerCase().includes(kriteriaSearch.toLowerCase())
      ).slice(0, 20)
    : [];

  const toggleHirarki = (h: HiraruchiPengendalian) =>
    setHirarki((prev) => prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]);

  const handleSubmit = async () => {
    if (!temuanMasalah.trim()) { toast.error('Temuan masalah wajib diisi'); return; }
    setSaving(true);
    try {
      const picNama  = selectedDivisi?.namaPIC || picNamaManual || user?.nama || 'TBD';
      const picId    = selectedDivisi?.idPIC   || picIdManual   || user?.id   || 'TBD';
      const divisiId = lokasiDivisiId || user?.departemen || 'TBD';

      const fd = new FormData();
      fd.append('temuanMasalah',         temuanMasalah);
      fd.append('kriteriaId',            kriteriaId    || 'TBD');
      fd.append('kriteriaDeskripsi',     selectedKriteria?.deskripsi || '');
      fd.append('kategori',              kategori      || 'MINOR');
      fd.append('lokasiDivisiId',        lokasiDivisiId || divisiId);
      fd.append('lokasiDivisiNama',      selectedDivisi?.namaDivisi || '');
      fd.append('dokumentasiTemuanTeks', dokTeks);
      fd.append('tanggalTemuan',         tanggalTemuan);
      fd.append('jenisTemuan',           jenisTemuan || 'Kondisi Tidak Aman');
      fd.append('batasAkhir',            batasAkhir || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
      fd.append('picId',                 picId);
      fd.append('picNama',               picNama);
      fd.append('divisiId',              divisiId);
      fd.append('hierarkiPengendalian',  JSON.stringify(hirarki.length ? hirarki : ['Administrasi']));
      fd.append('rekomendasiPerbaikan',  rekomendasi || '-');

      if (!isEdit) {
        fd.append('createdBy',   user?.nama || user?.name || 'Admin');
        fd.append('createdById', user?.id   || '');
        temuanFiles.forEach((f) => fd.append('dokumentasiTemuan', f));
        const result = await picaApi.create(fd);
        const newId  = result.data.id;

        if (perbaikanFiles.length > 0 && newId) {
          const buktifd = new FormData();
          perbaikanFiles.forEach((f) => buktifd.append('dokumentasiPerbaikan', f));
          await picaApi.action({ id: newId, action: 'submit_perbaikan', formData: buktifd });
          toast.success('Temuan dibuat dan bukti perbaikan disubmit!');
        } else {
          toast.success('Temuan berhasil dibuat!');
        }
      } else {
        // Edit: id sudah ada di record
        temuanFiles.forEach((f) => fd.append('dokumentasiTemuan', f));
        await picaApi.update(record!.id, fd, true);

        if (perbaikanFiles.length > 0) {
          const buktifd = new FormData();
          perbaikanFiles.forEach((f) => buktifd.append('dokumentasiPerbaikan', f));
          await picaApi.action({
            id: record!.id, action: 'submit_perbaikan',
            formData: buktifd, oleh: user?.nama || 'Admin', keterangan: rekomendasi,
          });
          toast.success('Data tersimpan dan bukti perbaikan disubmit!');
        } else {
          toast.success('Data temuan berhasil disimpan');
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0db] flex-shrink-0">
          <h2 className="font-bold text-[15px] text-[#231f20]">
            {isEdit ? 'Edit Temuan PICA' : 'Tambah Record'}
          </h2>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* ── Bagian 1: Informasi Temuan ── */}
          <FormSection title="Informasi Temuan" icon={iconInfo}>
            <Field label="Temuan Masalah" required>
              <textarea className={textareaCls} rows={3}
                placeholder="Deskripsikan temuan masalah yang ditemukan saat audit..."
                value={temuanMasalah} onChange={(e) => setTemuanMasalah(e.target.value)} />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Tanggal Temuan" required>
                <input type="date" className={inputCls} value={tanggalTemuan}
                  onChange={(e) => setTanggalTemuan(e.target.value)} />
              </Field>
              <Field label="Jenis Temuan" required>
                <select className={inputCls} value={jenisTemuan}
                  onChange={(e) => setJenisTemuan(e.target.value as JenisTemuan)}>
                  <option value="">-- Pilih Jenis --</option>
                  {JENIS_TEMUAN_OPTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Tingkat Keparahan" required>
              <div className="flex gap-2 flex-wrap">
                {KATEGORI_OPTIONS.map((k) => {
                  const { label, bg, text, border } = KATEGORI_TEMUAN_LABELS[k];
                  return (
                    <button key={k} type="button" onClick={() => setKategori(k)}
                      className={`px-4 py-2 rounded-xl text-[13px] font-semibold border-2 transition-all ${
                        kategori === k ? `${bg} ${text} ${border} shadow-sm` : 'bg-white text-[#6b6560] border-[#e5e0db] hover:border-[#c5c0bb]'
                      }`}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Kriteria SMK3" optional hint="Cari berdasarkan kode (misal: 6.1.1) atau kata kunci">
              <div className="relative">
                <input type="text" className={inputCls}
                  placeholder="Cari kriteria..."
                  value={kriteriaSearch || (selectedKriteria ? `${selectedKriteria.id} — ${selectedKriteria.deskripsi.slice(0, 60)}…` : '')}
                  onChange={(e) => { setKriteriaSearch(e.target.value); setKriteriaId(''); setShowKriteria(true); }}
                  onFocus={() => { if (!kriteriaId) setShowKriteria(true); }} />
                {kriteriaId && (
                  <button type="button" onClick={() => { setKriteriaId(''); setKriteriaSearch(''); setShowKriteria(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09b96] hover:text-[#231f20]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
                {showKriteria && filteredKriteria.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 bg-white border border-[#e5e0db] rounded-xl shadow-lg mt-1 max-h-52 overflow-y-auto">
                    {filteredKriteria.map((k) => (
                      <button key={k.id} type="button"
                        className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors border-b border-[#f1f0ee] last:border-0"
                        onClick={() => { setKriteriaId(k.id); setKriteriaSearch(''); setShowKriteria(false); }}>
                        <div className="flex items-start gap-2">
                          <span className="inline-block bg-[#f15a22]/10 text-[#f15a22] text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0">{k.id}</span>
                          <span className="text-[12px] text-[#231f20] leading-snug">{k.deskripsi}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {kriteriaId && selectedKriteria && (
                  <div className="mt-2 p-3 bg-orange-50 rounded-xl border border-orange-100 text-[12px]">
                    <span className="inline-block bg-[#f15a22] text-white font-mono font-bold px-2 py-0.5 rounded mr-2">{selectedKriteria.id}</span>
                    {selectedKriteria.deskripsi}
                  </div>
                )}
              </div>
            </Field>

            <Field label="Lokasi Temuan (Divisi)" required hint="PIC akan otomatis terisi sesuai divisi">
              <select className={inputCls} value={lokasiDivisiId} onChange={(e) => setLokasiDivisiId(e.target.value)}>
                <option value="">-- Pilih Divisi --</option>
                {DIVISI_LIST.map((d) => <option key={d.id} value={d.id}>{d.namaDivisi}</option>)}
              </select>
              {selectedDivisi && (
                <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-100 text-[12px]">
                  <div className="font-semibold text-blue-800">{selectedDivisi.namaDivisi}</div>
                  <div className="text-blue-600 mt-0.5">PIC: <strong>{selectedDivisi.namaPIC}</strong><span className="ml-2 text-blue-400">ID: {selectedDivisi.idPIC}</span></div>
                </div>
              )}
              {!lokasiDivisiId && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Field label="Nama PIC" optional>
                    <input type="text" className={inputCls} placeholder="Nama PIC..." value={picNamaManual} onChange={(e) => setPicNamaManual(e.target.value)} />
                  </Field>
                  <Field label="ID PIC" optional>
                    <input type="text" className={inputCls} placeholder="ID PIC..." value={picIdManual} onChange={(e) => setPicIdManual(e.target.value)} />
                  </Field>
                </div>
              )}
            </Field>

            <Field label="Batas Akhir Perbaikan" required>
              <input type="date" className={inputCls} value={batasAkhir} min={tanggalTemuan}
                onChange={(e) => setBatasAkhir(e.target.value)} />
            </Field>

            <Field label="Dokumentasi Temuan" optional>
              <textarea className={`${textareaCls} mb-3`} rows={2}
                placeholder="Deskripsi singkat kondisi saat temuan (opsional)..."
                value={dokTeks} onChange={(e) => setDokTeks(e.target.value)} />
              <FileUploadArea files={temuanFiles}
                onAdd={(f) => setTemuanFiles((p) => [...p, ...f])}
                onRemove={(i) => setTemuanFiles((p) => p.filter((_, j) => j !== i))}
                placeholder="Upload foto / dokumen temuan" subtext="Foto, PDF, dokumen" />
              {isEdit && record && record.dokumentasiTemuanFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-[11px] text-[#a09b96] mb-1">File sudah ada ({record.dokumentasiTemuanFiles.length}):</p>
                  <FileList files={record.dokumentasiTemuanFiles} />
                </div>
              )}
            </Field>
          </FormSection>

          {/* ── Bagian 2: Tindakan Perbaikan ── */}
          <FormSection title="Tindakan Perbaikan" icon={iconPerbaikan}
            badge={<span className="ml-auto text-[11px] text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-medium">Dapat diisi semua pengguna</span>}>

            <Field label="Hirarki Pengendalian" required hint="Pilih satu atau lebih">
              <div className="flex flex-wrap gap-2">
                {HIRARKI_OPTIONS.map((h) => {
                  const selected = hirarki.includes(h);
                  return (
                    <button key={h} type="button" onClick={() => toggleHirarki(h)}
                      className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all ${
                        selected ? 'bg-[#f15a22] text-white border-[#f15a22] shadow-sm' : 'bg-white text-[#6b6560] border-[#e5e0db] hover:border-[#f15a22] hover:text-[#f15a22]'
                      }`}>
                      {selected && <span className="mr-1">✓</span>}{h}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Rekomendasi Tindakan Perbaikan" required>
              <textarea className={textareaCls} rows={3}
                placeholder="Tuliskan rekomendasi tindakan perbaikan..."
                value={rekomendasi} onChange={(e) => setRekomendasi(e.target.value)} />
            </Field>

            <Field label="Bukti Perbaikan" optional hint="Jika diupload, status temuan akan otomatis menjadi INPG">
              <FileUploadArea files={perbaikanFiles}
                onAdd={(f) => setPerbaikanFiles((p) => [...p, ...f])}
                onRemove={(i) => setPerbaikanFiles((p) => p.filter((_, j) => j !== i))}
                placeholder="Upload bukti perbaikan (opsional)"
                subtext="Foto, PDF, dokumen — jika diisi, status langsung INPG" />
              {perbaikanFiles.length > 0 && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-[12px] text-blue-700">
                    <strong>{perbaikanFiles.length} file bukti</strong> akan diupload. Status akan otomatis berubah ke <strong>INPG</strong>.
                  </p>
                </div>
              )}
            </Field>
          </FormSection>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e0db] flex-shrink-0">
          <button onClick={onClose} disabled={saving}
            className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors disabled:opacity-50">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors disabled:opacity-60">
            {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? 'Menyimpan...' : perbaikanFiles.length > 0 ? 'Simpan & Submit Perbaikan' : isEdit ? 'Simpan Perubahan' : 'Buat Temuan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL: Submit Perbaikan (user/PIC — status OPEN)
// ═══════════════════════════════════════════════════════════════════════════════

interface SubmitPerbaikanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record: PicaRecord;
  user: any;
}

function SubmitPerbaikanModal({ isOpen, onClose, onSuccess, record, user }: SubmitPerbaikanModalProps) {
  const [saving,    setSaving]    = useState(false);
  const [hirarki,   setHirarki]   = useState<HiraruchiPengendalian[]>([]);
  const [rekomendasi, setRekomendasi] = useState('');
  const [files,     setFiles]     = useState<File[]>([]);

  useEffect(() => {
    if (isOpen) {
      setHirarki(record.hierarkiPengendalian as HiraruchiPengendalian[]);
      setRekomendasi(record.rekomendasiPerbaikan || '');
      setFiles([]);
    }
  }, [isOpen, record]);

  const toggleHirarki = (h: HiraruchiPengendalian) =>
    setHirarki((prev) => prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]);

  const handleSubmit = async () => {
    if (hirarki.length === 0)   { toast.error('Pilih minimal 1 hirarki pengendalian'); return; }
    if (!rekomendasi.trim())     { toast.error('Keterangan perbaikan wajib diisi'); return; }
    if (files.length === 0)      { toast.error('Upload minimal 1 file bukti perbaikan'); return; }

    setSaving(true);
    try {
      // Update hirarki + rekomendasi
      const fd = new FormData();
      fd.append('temuanMasalah',        record.temuanMasalah);
      fd.append('hierarkiPengendalian', JSON.stringify(hirarki));
      fd.append('rekomendasiPerbaikan', rekomendasi);
      await picaApi.update(record.id, fd, false);

      // Submit bukti
      const buktifd = new FormData();
      files.forEach((f) => buktifd.append('dokumentasiPerbaikan', f));
      await picaApi.action({
        id: record.id, action: 'submit_perbaikan',
        formData: buktifd, oleh: user?.nama || 'User', keterangan: rekomendasi,
      });

      toast.success('Bukti perbaikan disubmit! Status berubah ke INPG.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal submit perbaikan');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0db] flex-shrink-0">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#f15a22] mb-0.5">PICA</p>
            <h2 className="font-bold text-[15px] text-[#231f20]">Submit Tindakan Perbaikan</h2>
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* TACC banner */}
        {record.catatanTACC && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <p className="text-[12px] font-bold text-red-700 mb-0.5">Perbaikan Ditolak (TACC) — Revisi Diperlukan</p>
              <p className="text-[12px] text-red-600">{record.catatanTACC}</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Info temuan (read-only) */}
          <div className="p-3 bg-white rounded-xl border border-[#e5e0db] text-[12px]">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#a09b96] mb-1">Temuan</p>
            <p className="text-[#231f20] font-medium">{record.temuanMasalah}</p>
            <div className="flex gap-3 mt-1.5 text-[#6b6560]">
              <span>PIC: <strong>{record.picNama}</strong></span>
              <span>Deadline: <strong className={sisaHariColor(sisaHariDeadline(record.batasAkhir))}>{record.batasAkhir}</strong></span>
            </div>
          </div>

          <Field label="Hirarki Pengendalian" required hint="Pilih satu atau lebih">
            <div className="flex flex-wrap gap-2">
              {HIRARKI_OPTIONS.map((h) => {
                const selected = hirarki.includes(h);
                return (
                  <button key={h} type="button" onClick={() => toggleHirarki(h)}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all ${
                      selected ? 'bg-[#f15a22] text-white border-[#f15a22]' : 'bg-white text-[#6b6560] border-[#e5e0db] hover:border-[#f15a22]'
                    }`}>
                    {selected && <span className="mr-1">✓</span>}{h}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Keterangan Tindakan Perbaikan" required>
            <textarea className={textareaCls} rows={3}
              placeholder="Tuliskan tindakan perbaikan yang sudah dilakukan..."
              value={rekomendasi} onChange={(e) => setRekomendasi(e.target.value)} />
          </Field>

          <Field label="Bukti Perbaikan" required hint="Upload minimal 1 file sebagai bukti">
            <FileUploadArea files={files}
              onAdd={(f) => setFiles((p) => [...p, ...f])}
              onRemove={(i) => setFiles((p) => p.filter((_, j) => j !== i))}
              placeholder="Upload foto, laporan, atau dokumen bukti"
              subtext="Foto, PDF, dokumen — tanpa batas ukuran" />
            {record.dokumentasiPerbaikanFiles.length > 0 && (
              <div className="mt-2">
                <p className="text-[11px] text-[#a09b96] mb-1">File sebelumnya ({record.dokumentasiPerbaikanFiles.length}):</p>
                <FileList files={record.dokumentasiPerbaikanFiles} />
              </div>
            )}
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e0db] flex-shrink-0">
          <button onClick={onClose} disabled={saving}
            className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors disabled:opacity-50">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors disabled:opacity-60">
            {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? 'Mengupload...' : 'Submit Perbaikan → INPG'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL: Approval / Review (admin — status INPG)
// ═══════════════════════════════════════════════════════════════════════════════

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record: PicaRecord;
  user: any;
}

function ApprovalModal({ isOpen, onClose, onSuccess, record, user }: ApprovalModalProps) {
  const [saving,         setSaving]         = useState(false);
  const [approvalAction, setApprovalAction] = useState<'ACC' | 'TACC' | null>(null);
  const [keterangan,     setKeterangan]     = useState('');

  useEffect(() => {
    if (isOpen) { setApprovalAction(null); setKeterangan(''); }
  }, [isOpen]);

  const handleApproval = async () => {
    if (!approvalAction) return;
    if (approvalAction === 'TACC' && !keterangan.trim()) {
      toast.error('Keterangan wajib diisi untuk TACC');
      return;
    }
    setSaving(true);
    try {
      await picaApi.action({
        id: record.id,
        action: approvalAction === 'ACC' ? 'approve' : 'reject',
        keterangan,
        oleh: user?.nama || 'Admin',
      });
      toast.success(approvalAction === 'ACC' ? 'Temuan ditutup (CLSD)!' : 'Perbaikan dikembalikan (TACC)');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memproses approval');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0db] flex-shrink-0">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#f15a22] mb-0.5">Approval Temuan</p>
            <h2 className="font-bold text-[15px] text-[#231f20]">Tutup Temuan (CLSD)</h2>
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Info temuan */}
          <div className="p-3 bg-white rounded-xl border border-[#e5e0db] text-[12px] space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#a09b96]">Temuan</p>
            <p className="text-[#231f20] font-medium">{record.temuanMasalah}</p>
            <p className="text-[#6b6560]">PIC: <strong>{record.picNama}</strong> · Lokasi: {record.lokasiDivisiNama || record.lokasiDivisiId}</p>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <span className="text-[11px] text-[#6b6560] bg-[#f1f0ee] px-2 py-0.5 rounded-full">Kriteria: {record.kriteriaId}</span>
              {record.hierarkiPengendalian.map((h) => (
                <span key={h} className="text-[11px] bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">{h}</span>
              ))}
            </div>
          </div>

          {/* Bukti perbaikan */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#a09b96] mb-2">Bukti Perbaikan yang Disubmit</p>
            {record.dokumentasiPerbaikanFiles.length > 0
              ? <FileList files={record.dokumentasiPerbaikanFiles} />
              : <p className="text-[12px] text-[#a09b96] italic">Tidak ada file bukti</p>
            }
            {record.rekomendasiPerbaikan && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-[#e5e0db]">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#a09b96] mb-1">Keterangan Perbaikan</p>
                <p className="text-[13px] text-[#231f20]">{record.rekomendasiPerbaikan}</p>
              </div>
            )}
          </div>

          {/* Riwayat */}
          {record.riwayatApproval.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#a09b96] mb-2">Riwayat</p>
              <RiwayatTimeline riwayat={record.riwayatApproval} />
            </div>
          )}

          {/* Keputusan */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-3">Keputusan Review <span className="text-red-500">*</span></p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setApprovalAction('ACC')}
                className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all ${
                  approvalAction === 'ACC' ? 'border-green-500 bg-green-50' : 'border-[#e5e0db] bg-white hover:border-green-300'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={approvalAction === 'ACC' ? '#16a34a' : '#a09b96'} strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className={`font-bold text-[13px] ${approvalAction === 'ACC' ? 'text-green-700' : 'text-[#6b6560]'}`}>ACC</span>
                <span className={`text-[11px] text-center ${approvalAction === 'ACC' ? 'text-green-600' : 'text-[#a09b96]'}`}>Setujui &amp; Tutup</span>
              </button>
              <button type="button" onClick={() => setApprovalAction('TACC')}
                className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all ${
                  approvalAction === 'TACC' ? 'border-red-500 bg-red-50' : 'border-[#e5e0db] bg-white hover:border-red-300'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={approvalAction === 'TACC' ? '#dc2626' : '#a09b96'} strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                <span className={`font-bold text-[13px] ${approvalAction === 'TACC' ? 'text-red-700' : 'text-[#6b6560]'}`}>TACC</span>
                <span className={`text-[11px] text-center ${approvalAction === 'TACC' ? 'text-red-600' : 'text-[#a09b96]'}`}>Tolak &amp; Kembalikan</span>
              </button>
            </div>

            {approvalAction === 'ACC' && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-[12px] text-green-700">
                Status akan berubah menjadi <strong>CLOSED</strong>. Temuan dianggap selesai.
              </div>
            )}

            {approvalAction === 'TACC' && (
              <div className="mt-3 space-y-2">
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[12px] text-red-700">
                  Status akan kembali ke <strong>OPEN</strong>. PIC diminta memperbaiki dan upload ulang bukti.
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#231f20] mb-1.5">
                    Alasan Penolakan <span className="text-red-500">*</span>
                  </label>
                  <textarea className={textareaCls} rows={3}
                    placeholder="Jelaskan apa yang perlu diperbaiki oleh PIC..."
                    value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
                </div>
              </div>
            )}

            {approvalAction && (
              <div className="mt-3">
                <label className="block text-[13px] font-semibold text-[#231f20] mb-1.5">
                  Catatan {approvalAction === 'TACC' ? '' : '(opsional)'}
                </label>
                {approvalAction === 'ACC' && (
                  <textarea className={textareaCls} rows={2}
                    placeholder="Catatan tambahan (opsional)..."
                    value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e0db] flex-shrink-0">
          <button onClick={onClose} disabled={saving}
            className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors disabled:opacity-50">
            Batal
          </button>
          <button onClick={handleApproval}
            disabled={saving || !approvalAction || (approvalAction === 'TACC' && !keterangan.trim())}
            className={`flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white rounded-xl transition-colors disabled:opacity-60 ${
              approvalAction === 'ACC' ? 'bg-green-600 hover:bg-green-700' : approvalAction === 'TACC' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#a09b96]'
            }`}>
            {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? 'Memproses...' : !approvalAction ? 'Pilih ACC / TACC' : approvalAction === 'ACC' ? 'Approve (ACC)' : 'Reject (TACC)'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

type FilterTab = 'ALL' | 'OPEN' | 'INPG' | 'CLSD' | 'TACC';

export default function PicaListPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'supervisor';

  const [records,    setRecords]    = useState<PicaRecord[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [activeTab,  setActiveTab]  = useState<FilterTab>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal state
  const [createOpen,        setCreateOpen]        = useState(false);
  const [editRecord,        setEditRecord]         = useState<PicaRecord | null>(null);
  const [submitRecord,      setSubmitRecord]       = useState<PicaRecord | null>(null);
  const [approvalRecord,    setApprovalRecord]     = useState<PicaRecord | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters = !isAdmin && user?.departemen ? { divisiId: user.departemen } : undefined;
      const data = await picaApi.getAll(filters);
      setRecords(data);
    } catch {
      toast.error('Gagal memuat data PICA');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user?.departemen]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Filter & search ──
  const filtered = records.filter((r) => {
    const isTaccRecord = r.statusPerbaikan === 'OPEN' && !!r.catatanTACC;
    const matchTab =
      activeTab === 'ALL' ||
      (activeTab === 'TACC' ? isTaccRecord : r.statusPerbaikan === activeTab);

    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      r.temuanMasalah.toLowerCase().includes(q) ||
      r.picNama.toLowerCase().includes(q) ||
      r.lokasiDivisiNama?.toLowerCase().includes(q) ||
      r.kriteriaId.toLowerCase().includes(q) ||
      r.rekomendasiPerbaikan.toLowerCase().includes(q);

    return matchTab && matchSearch;
  });

  const stats = hitungStatistikPica(records);
  const taccCount = records.filter((r) => r.statusPerbaikan === 'OPEN' && !!r.catatanTACC).length;

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus record PICA ini?')) return;
    setDeletingId(id);
    try {
      await picaApi.remove(id);
      toast.success('Record berhasil dihapus');
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus record');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Export helpers ──
  function exportToCSV() {
    const header = ['ID','Tanggal Temuan','Temuan Masalah','Kategori','Lokasi / Divisi','PIC','Batas Akhir','Status','Dibuat Oleh'];
    const rows = filtered.map((r) => [
      r.id, r.tanggalTemuan,
      `"${r.temuanMasalah.replace(/"/g, '""')}"`,
      KATEGORI_TEMUAN_LABELS[r.kategori]?.label ?? r.kategori,
      `"${(r.lokasiDivisiNama || r.lokasiDivisiId).replace(/"/g, '""')}"`,
      r.picNama, r.batasAkhir,
      STATUS_PERBAIKAN_LABELS[r.statusPerbaikan]?.label ?? r.statusPerbaikan,
      r.createdBy,
    ]);
    const csv = '\uFEFF' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `PICA_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Export berhasil');
  }

  const tabs: { key: FilterTab; label: string; count: number; color: string; activeColor: string }[] = [
    { key: 'ALL',  label: 'ALL',      count: stats.total,      color: 'border-[#e5e0db] text-[#6b6560] hover:border-[#c5c0bb]',   activeColor: 'bg-[#231f20] text-white border-[#231f20]' },
    { key: 'OPEN', label: '🔵 OPEN',    count: stats.open,       color: 'border-[#e5e0db] text-[#6b6560] hover:border-blue-300',     activeColor: 'bg-blue-600 text-white border-blue-600' },
    { key: 'TACC', label: '❌ TACC',    count: taccCount,        color: 'border-red-200 text-red-600 hover:border-red-400',          activeColor: 'bg-red-600 text-white border-red-600' },
    { key: 'INPG', label: '⏳ INPG',    count: stats.inProgress, color: 'border-[#e5e0db] text-[#6b6560] hover:border-amber-300',   activeColor: 'bg-amber-500 text-white border-amber-500' },
    { key: 'CLSD', label: '✅ CLSD',    count: stats.closed,     color: 'border-[#e5e0db] text-[#6b6560] hover:border-green-300',   activeColor: 'bg-green-600 text-white border-green-600' },
  ];

  return (
    <div className="min-h-screen bg-[#f1f0ee]">

      {/* ── Header (sesuai CrudPage) ── */}
      <div className="bg-[#231f20] px-6 md:px-10 py-8 border-b-[3px] border-b-[#f15a22]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-2">Internal Audit SMK3</p>
          <h1 className="font-bold text-white text-[clamp(22px,4vw,38px)] leading-tight">
            Problem Identification &amp; Corrective Action
          </h1>
          <p className="text-[#8a8580] text-[13px] mt-1.5">
            Manajemen temuan audit dan tindakan perbaikan SMK3
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">

        {/* ── Toolbar: Search + Export + Tambah (sesuai CrudPage) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a09b96] pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text"
              placeholder="Cari temuan, kriteria, PIC, lokasi..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-[14px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 transition-colors" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09b96] hover:text-[#231f20]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          {/* Export */}
          <button onClick={exportToCSV} disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#c5c0bb] text-[#231f20] text-[13px] font-semibold rounded-xl hover:border-green-400 hover:text-green-700 transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>

          {/* Tambah record (admin only) */}
          {isAdmin && (
            <button onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors whitespace-nowrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Tambah Record
            </button>
          )}
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors border ${
                activeTab === tab.key ? tab.activeColor : `bg-white ${tab.color}`
              }`}>
              {tab.label}
              {!loading && (
                <span className="ml-1.5 opacity-70">({tab.count})</span>
              )}
            </button>
          ))}
          <span className="ml-auto text-[12px] text-[#a09b96]">{filtered.length} record</span>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-[#e5e0db] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[1,2,3,4].map((i) => <div key={i} className="h-12 bg-[#f1f0ee] rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#f1f0ee] flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c5c0bb" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <p className="font-semibold text-[#231f20] text-[14px] mb-1">
                {search ? 'Tidak ada record yang sesuai' : 'Belum ada data PICA'}
              </p>
              <p className="text-[#6b6560] text-[13px]">
                {search ? `Tidak ditemukan untuk "${search}"` : 'Klik "+ Tambah Record" untuk menambahkan data pertama.'}
              </p>
              {isAdmin && !search && (
                <button onClick={() => setCreateOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-[#f15a22] hover:underline font-medium">
                  + Buat temuan pertama
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#e5e0db] bg-[#faf9f7]">
                    <th className="text-left px-4 py-3 font-semibold text-[#6b6560] text-[11px] uppercase tracking-wide whitespace-nowrap">ID / Tanggal</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#6b6560] text-[11px] uppercase tracking-wide">Temuan Masalah</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#6b6560] text-[11px] uppercase tracking-wide">Lokasi</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#6b6560] text-[11px] uppercase tracking-wide">PIC</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#6b6560] text-[11px] uppercase tracking-wide whitespace-nowrap">Deadline</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#6b6560] text-[11px] uppercase tracking-wide whitespace-nowrap">Status</th>
                    <th className="text-center px-4 py-3 font-semibold text-[#6b6560] text-[11px] uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f0ee]">
                  {filtered.map((record) => {
                    const sisa      = sisaHariDeadline(record.batasAkhir);
                    const terlambat = isTerlambat(record);
                    const isTacc    = record.statusPerbaikan === 'OPEN' && !!record.catatanTACC;
                    const canSubmit = !isAdmin && record.statusPerbaikan === 'OPEN';
                    const canApprove = isAdmin && record.statusPerbaikan === 'INPG';
                    return (
                      <tr key={record.id}
                        className={`hover:bg-[#faf9f7] transition-colors ${
                          isTacc ? 'bg-red-50/40 border-l-2 border-l-red-400' : terlambat ? 'bg-red-50/30' : ''
                        }`}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-mono text-[10px] text-[#a09b96]">{record.id.slice(0, 14)}…</div>
                          <div className="text-[11px] text-[#6b6560] mt-0.5">{formatTanggalPica(record.tanggalTemuan)}</div>
                        </td>
                        <td className="px-4 py-3 max-w-[260px]">
                          <div className="font-medium text-[#231f20] line-clamp-2 leading-snug">{record.temuanMasalah}</div>
                          {record.kriteriaDeskripsi && (
                            <div className="text-[11px] text-[#a09b96] mt-0.5 line-clamp-1">Kriteria {record.kriteriaId}</div>
                          )}
                          {isTacc && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-red-600">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                              <span className="line-clamp-1 italic">{record.catatanTACC}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 max-w-[140px]">
                          <div className="text-[#6b6560] text-[12px] leading-snug line-clamp-2">
                            {record.lokasiDivisiNama || record.lokasiDivisiId}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-[#6b6560] text-[12px]">{record.picNama}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-[#6b6560] text-[12px]">{formatTanggalPica(record.batasAkhir)}</div>
                          {record.statusPerbaikan !== 'CLSD' && sisa !== null && (
                            <div className={`text-[10px] mt-0.5 font-medium ${sisaHariColor(sisa)}`}>
                              {sisa < 0 ? `Terlambat ${Math.abs(sisa)} hr` : `Sisa ${sisa} hr`}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusPill status={record.statusPerbaikan} isTacc={isTacc} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">

                            {/* Submit perbaikan — user, status OPEN */}
                            {canSubmit && (
                              <button onClick={() => setSubmitRecord(record)}
                                className="p-1.5 rounded-lg text-[#6b6560] hover:text-[#f15a22] hover:bg-[#f1f0ee] transition-colors"
                                title="Submit Perbaikan">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M9 11l3 3L22 4"/>
                                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                </svg>
                              </button>
                            )}

                            {/* Approval — admin, status INPG */}
                            {canApprove && (
                              <button onClick={() => setApprovalRecord(record)}
                                className="p-1.5 rounded-lg text-purple-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                                title="Review / Approval">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                </svg>
                              </button>
                            )}

                            {/* Edit — admin, status OPEN */}
                            {isAdmin && record.statusPerbaikan === 'OPEN' && (
                              <button onClick={() => setEditRecord(record)}
                                className="p-1.5 rounded-lg text-[#6b6560] hover:text-[#f15a22] hover:bg-[#f1f0ee] transition-colors"
                                title="Edit Record">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                            )}

                            {/* Delete — admin only */}
                            {isAdmin && (
                              <button onClick={() => handleDelete(record.id)}
                                disabled={deletingId === record.id}
                                className="p-1.5 rounded-lg text-[#6b6560] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Hapus Record">
                                {deletingId === record.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="m19 6-.867 14.142A2 2 0 0 1 16.138 22H7.862a2 2 0 0 1-1.995-1.858L5 6"/>
                                    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                  </svg>
                                )}
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

          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-[#f1f0ee] flex items-center justify-between text-[12px] text-[#a09b96] bg-[#faf9f7]">
              <span>{filtered.length} dari {records.length} record</span>
              {(search || activeTab !== 'ALL') && (
                <button onClick={() => { setSearch(''); setActiveTab('ALL'); }}
                  className="text-[#f15a22] hover:underline text-[12px] font-medium">
                  Reset filter
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <CreateEditModal
        isOpen={createOpen || !!editRecord}
        onClose={() => { setCreateOpen(false); setEditRecord(null); }}
        onSuccess={fetchData}
        record={editRecord}
        user={user}
      />

      {submitRecord && (
        <SubmitPerbaikanModal
          isOpen={!!submitRecord}
          onClose={() => setSubmitRecord(null)}
          onSuccess={fetchData}
          record={submitRecord}
          user={user}
        />
      )}

      {approvalRecord && (
        <ApprovalModal
          isOpen={!!approvalRecord}
          onClose={() => setApprovalRecord(null)}
          onSuccess={fetchData}
          record={approvalRecord}
          user={user}
        />
      )}
    </div>
  );
}
