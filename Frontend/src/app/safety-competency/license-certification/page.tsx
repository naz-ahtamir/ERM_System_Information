'use client';

/**
 * License & Certification — custom page
 *
 * Rules:
 *  - Admin  : lihat semua record, bisa hapus & edit
 *  - User   : hanya lihat record sendiri, bisa tambah, TIDAK bisa hapus/edit
 *  - Siapapun bisa tambah record baru
 *
 * Fields form:
 *  idKaryawan         → lookup ke backend; jika tidak ditemukan, blokir submit
 *  nama               → auto-fill dari lookup (readonly)
 *  jabatan            → auto-fill (readonly)
 *  departemen         → auto-fill (readonly)
 *  divisi             → auto-fill (readonly)
 *  perusahaan         → auto-fill (readonly)
 *  noSertifikat       → unik (validasi di frontend & backend)
 *  lembagaSertifikasi → enum: Kemnaker | BNSP
 *  jenisSertifikat    → pilihan panjang (lihat JENIS_SERTIFIKAT)
 *  tanggalPelatihan   → date
 *  akhirPelatihan     → date
 *  fileSertifikat     → PDF / gambar
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { recordsApi, getStoredToken } from '@/lib/api';
import type { SafetyRecord } from '@/lib/api';

// ── Constants ─────────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const BACKEND_BASE = API_BASE_URL.replace('/api', '');
const CATEGORY = 'scomp-license';

const LEMBAGA_OPTIONS = ['Kemnaker', 'BNSP'] as const;

const JENIS_SERTIFIKAT = [
  // Operator Alat Berat
  'SIO Crane — Operator Crane',
  'SIO Forklift — Operator Forklift',
  'SIO Rigger — Rigger / Juru Ikat',
  'SIO Excavator — Operator Excavator',
  'SIO Bulldozer — Operator Bulldozer',
  'SIO Wheel Loader — Operator Wheel Loader',
  'SIO Dump Truck — Operator Dump Truck',
  'SIO Man Lift — Operator Man Lift / Aerial Work Platform',
  // Ahli K3
  'AK3 Umum — Ahli K3 Umum',
  'AK3 Kebakaran Kelas A',
  'AK3 Kebakaran Kelas B',
  'AK3 Kebakaran Kelas C',
  'AK3 Listrik — Ahli K3 Bidang Listrik',
  'AK3 Kimia — Ahli K3 Kimia',
  'AK3 Konstruksi — Ahli K3 Konstruksi',
  'AK3 Pesawat Uap & Bejana Tekan',
  'AK3 Mekanik',
  'AK3 Lingkungan Kerja',
  // Pelatihan & Kompetensi
  'P3K K3 — Pelatihan Pertolongan Pertama',
  'Fire Warden — Warden Kebakaran',
  'Safety Officer — Petugas K3',
  'Emergency Response Team',
  'Confined Space Entry',
  'Working at Height',
  'Scaffolding — Inspector Perancah',
  'LOTO — Lock Out Tag Out',
  'Hazmat Handler — Penangan Bahan Berbahaya',
  'HIRAC / HIRARC — Identifikasi Bahaya',
  // Sertifikat Lainnya
  'ISO 45001 — Internal Auditor',
  'SMK3 — Auditor Internal',
  'Ergonomi Industri',
  'Higiene Industri',
  'Lainnya',
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserLookup {
  id: string;
  idKaryawan: string;
  nama: string;
  jabatan: string | null;
  departemen: string | null;
  divisi: string | null;
  perusahaan: string | null;
}

interface LicenseRecord extends SafetyRecord {
  data: {
    idKaryawan: string;
    nama: string;
    jabatan: string;
    departemen: string;
    divisi: string;
    perusahaan: string;
    noSertifikat: string;
    lembagaSertifikasi: string;
    jenisSertifikat: string;
    tanggalPelatihan: string;
    akhirPelatihan: string;
    /** Tanggal kedaluwarsa sertifikat / masa berlaku */
    masaBerlaku?: string;
  };
}

// ── Expiry Status ─────────────────────────────────────────────────────────────

type ExpiryStatus = 'expired' | 'soon' | 'active' | 'unknown';

const SOON_DAYS = 30;

function getExpiryStatus(masaBerlaku?: string): ExpiryStatus {
  if (!masaBerlaku) return 'unknown';
  const expiry = new Date(masaBerlaku);
  if (isNaN(expiry.getTime())) return 'unknown';
  const now = new Date();
  if (expiry < now) return 'expired';
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= SOON_DAYS) return 'soon';
  return 'active';
}

function ExpiryBadge({ masaBerlaku }: { masaBerlaku?: string }) {
  const status = getExpiryStatus(masaBerlaku);
  if (status === 'unknown') return null;

  const cfg: Record<string, { label: string; className: string }> = {
    expired: { label: 'Kedaluwarsa', className: 'bg-red-100 text-red-700 border border-red-200' },
    soon:    { label: 'Segera Berakhir', className: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
    active:  { label: 'Aktif', className: 'bg-green-100 text-green-700 border border-green-200' },
  };
  const { label, className } = cfg[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'expired' ? 'bg-red-500' : status === 'soon' ? 'bg-yellow-500' : 'bg-green-500'
      }`} />
      {label}
    </span>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fileUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BACKEND_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function getToken() {
  return getStoredToken();
}

// ── ReadonlyField ─────────────────────────────────────────────────────────────

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
        {label}
        <span className="ml-1.5 text-[10px] font-normal text-[#f15a22] normal-case">(auto)</span>
      </label>
      <div className="w-full px-3.5 py-2.5 text-[14px] border border-[#e5e0db] rounded-xl bg-[#faf9f7] text-[#6b6560]">
        {value || <span className="italic text-[#b0a9a3]">—</span>}
      </div>
    </div>
  );
}

// ── Form Modal ────────────────────────────────────────────────────────────────

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  initialValues?: LicenseRecord | null;
  /** semua noSertifikat yang sudah ada (untuk validasi duplikat) */
  existingNoSertifikat: string[];
}

function FormModal({ isOpen, onClose, onSubmit, initialValues, existingNoSertifikat }: FormModalProps) {
  const isEdit = !!initialValues;

  // idKaryawan lookup state
  const [idKaryawanInput, setIdKaryawanInput] = useState('');
  const [lookupUser, setLookupUser] = useState<UserLookup | null>(null);
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not_found'>('idle');
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form fields
  const [noSertifikat, setNoSertifikat] = useState('');
  const [lembaga, setLembaga] = useState('');
  const [jenis, setJenis] = useState('');
  const [tanggalPelatihan, setTanggalPelatihan] = useState('');
  const [akhirPelatihan, setAkhirPelatihan] = useState('');
  const [masaBerlaku, setMasaBerlaku] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Reset & populate saat modal dibuka
  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setFile(null);
    setLookupStatus('idle');

    if (isEdit && initialValues) {
      const d = initialValues.data;
      setIdKaryawanInput(d.idKaryawan ?? '');
      setLookupUser({
        id: '',
        idKaryawan: d.idKaryawan ?? '',
        nama: d.nama ?? '',
        jabatan: d.jabatan ?? '',
        departemen: d.departemen ?? '',
        divisi: d.divisi ?? '',
        perusahaan: d.perusahaan ?? '',
      });
      setLookupStatus('found');
      setNoSertifikat(d.noSertifikat ?? '');
      setLembaga(d.lembagaSertifikasi ?? '');
      setJenis(d.jenisSertifikat ?? '');
      setTanggalPelatihan(d.tanggalPelatihan ?? '');
      setAkhirPelatihan(d.akhirPelatihan ?? '');
      setMasaBerlaku(d.masaBerlaku ?? '');
    } else {
      setIdKaryawanInput('');
      setLookupUser(null);
      setNoSertifikat('');
      setLembaga('');
      setJenis('');
      setTanggalPelatihan('');
      setAkhirPelatihan('');
      setMasaBerlaku('');
    }
  }, [isOpen, isEdit, initialValues]);

  // Debounced lookup saat idKaryawan berubah (hanya saat buat baru)
  useEffect(() => {
    if (isEdit) return;
    if (lookupTimer.current) clearTimeout(lookupTimer.current);

    const trimmed = idKaryawanInput.trim();
    if (!trimmed) {
      setLookupUser(null);
      setLookupStatus('idle');
      return;
    }

    setLookupStatus('loading');
    lookupTimer.current = setTimeout(async () => {
      try {
        const token = getToken();
        const res = await fetch(
          `${API_BASE_URL}/auth/users/by-id-karyawan/${encodeURIComponent(trimmed)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setLookupUser(data);
            setLookupStatus('found');
          } else {
            setLookupUser(null);
            setLookupStatus('not_found');
          }
        } else {
          setLookupUser(null);
          setLookupStatus('not_found');
        }
      } catch {
        setLookupUser(null);
        setLookupStatus('not_found');
      }
    }, 600);

    return () => { if (lookupTimer.current) clearTimeout(lookupTimer.current); };
  }, [idKaryawanInput, isEdit]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!isEdit && lookupStatus !== 'found') e.idKaryawan = 'ID Karyawan tidak ditemukan dalam sistem';
    if (!noSertifikat.trim()) e.noSertifikat = 'No. Sertifikat wajib diisi';
    if (!isEdit) {
      const dup = existingNoSertifikat.includes(noSertifikat.trim());
      if (dup) e.noSertifikat = 'No. Sertifikat sudah terdaftar';
    } else if (noSertifikat.trim() !== initialValues?.data.noSertifikat) {
      const dup = existingNoSertifikat.includes(noSertifikat.trim());
      if (dup) e.noSertifikat = 'No. Sertifikat sudah terdaftar';
    }
    if (!lembaga) e.lembaga = 'Lembaga Sertifikasi wajib dipilih';
    if (!jenis) e.jenis = 'Jenis Sertifikat wajib dipilih';
    if (!tanggalPelatihan) e.tanggalPelatihan = 'Tanggal Pelatihan wajib diisi';
    if (!akhirPelatihan) e.akhirPelatihan = 'Akhir Pelatihan wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      // title auto-generate
      fd.append('title', `${lookupUser?.nama ?? ''} — ${jenis}`);
      fd.append('subElementId', CATEGORY);
      const data = {
        idKaryawan: lookupUser?.idKaryawan ?? idKaryawanInput,
        nama: lookupUser?.nama ?? '',
        jabatan: lookupUser?.jabatan ?? '',
        departemen: lookupUser?.departemen ?? '',
        divisi: lookupUser?.divisi ?? '',
        perusahaan: lookupUser?.perusahaan ?? '',
        noSertifikat: noSertifikat.trim(),
        lembagaSertifikasi: lembaga,
        jenisSertifikat: jenis,
        tanggalPelatihan,
        akhirPelatihan,
        masaBerlaku: masaBerlaku || undefined,
      };
      fd.append('data', JSON.stringify(data));
      if (file) fd.append('fileSertifikat', file);
      await onSubmit(fd);
      onClose();
    } catch {
      // error dihandle parent
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0db] flex-shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#f15a22] mb-0.5">
              License & Certification
            </p>
            <h2 className="font-bold text-[15px] text-[#231f20]">
              {isEdit ? 'Edit Record' : 'Tambah Record Baru'}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* ── ID Karyawan lookup ── */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
              ID Karyawan <span className="text-red-500">*</span>
            </label>
            {isEdit ? (
              <div className="w-full px-3.5 py-2.5 text-[14px] border border-[#e5e0db] rounded-xl bg-[#faf9f7] text-[#6b6560]">
                {idKaryawanInput}
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={idKaryawanInput}
                  onChange={(e) => setIdKaryawanInput(e.target.value)}
                  placeholder="Masukkan ID Karyawan..."
                  className={`w-full px-3.5 py-2.5 pr-10 text-[14px] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22] transition-colors ${
                    errors.idKaryawan ? 'border-red-400 bg-red-50' :
                    lookupStatus === 'found' ? 'border-green-400 bg-green-50' :
                    lookupStatus === 'not_found' ? 'border-red-400 bg-red-50' :
                    'border-[#c5c0bb]'
                  }`}
                />
                {/* Status indicator */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {lookupStatus === 'loading' && (
                    <svg className="animate-spin w-4 h-4 text-[#f15a22]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {lookupStatus === 'found' && (
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {lookupStatus === 'not_found' && (
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )}
                </div>
              </div>
            )}
            {lookupStatus === 'not_found' && !isEdit && (
              <p className="text-red-500 text-[11px] mt-1">ID Karyawan tidak ditemukan dalam sistem</p>
            )}
            {errors.idKaryawan && <p className="text-red-500 text-[11px] mt-1">{errors.idKaryawan}</p>}
          </div>

          {/* ── Auto-fill fields ── */}
          <div className="grid grid-cols-2 gap-3">
            <ReadonlyField label="Nama" value={lookupUser?.nama ?? ''} />
            <ReadonlyField label="Jabatan" value={lookupUser?.jabatan ?? ''} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ReadonlyField label="Departemen" value={lookupUser?.departemen ?? ''} />
            <ReadonlyField label="Divisi" value={lookupUser?.divisi ?? ''} />
          </div>
          <ReadonlyField label="Perusahaan" value={lookupUser?.perusahaan ?? ''} />

          {/* ── Divider ── */}
          <div className="border-t border-[#e5e0db] pt-1" />

          {/* ── No. Sertifikat ── */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
              No. Sertifikat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={noSertifikat}
              onChange={(e) => setNoSertifikat(e.target.value)}
              placeholder="Nomor sertifikat resmi..."
              className={`w-full px-3.5 py-2.5 text-[14px] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22] transition-colors ${
                errors.noSertifikat ? 'border-red-400 bg-red-50' : 'border-[#c5c0bb]'
              }`}
            />
            {errors.noSertifikat && <p className="text-red-500 text-[11px] mt-1">{errors.noSertifikat}</p>}
          </div>

          {/* ── Lembaga Sertifikasi ── */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
              Lembaga Sertifikasi <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {LEMBAGA_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setLembaga(opt)}
                  className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-[13px] transition-all ${
                    lembaga === opt
                      ? 'border-[#f15a22] bg-[#fff4f0] text-[#f15a22]'
                      : 'border-[#e5e0db] bg-white text-[#6b6560] hover:border-[#f15a22]/40'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {errors.lembaga && <p className="text-red-500 text-[11px] mt-1">{errors.lembaga}</p>}
          </div>

          {/* ── Jenis Sertifikat ── */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
              Jenis Sertifikat <span className="text-red-500">*</span>
            </label>
            <select
              value={jenis}
              onChange={(e) => setJenis(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-[14px] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22] transition-colors ${
                errors.jenis ? 'border-red-400 bg-red-50' : 'border-[#c5c0bb]'
              }`}
            >
              <option value="">-- Pilih Jenis Sertifikat --</option>
              {JENIS_SERTIFIKAT.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
            {errors.jenis && <p className="text-red-500 text-[11px] mt-1">{errors.jenis}</p>}
          </div>

          {/* ── Tanggal ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
                Tanggal Pelatihan <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={tanggalPelatihan}
                onChange={(e) => setTanggalPelatihan(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-[14px] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22] transition-colors ${
                  errors.tanggalPelatihan ? 'border-red-400 bg-red-50' : 'border-[#c5c0bb]'
                }`}
              />
              {errors.tanggalPelatihan && <p className="text-red-500 text-[11px] mt-1">{errors.tanggalPelatihan}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
                Akhir Pelatihan <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={akhirPelatihan}
                onChange={(e) => setAkhirPelatihan(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-[14px] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22] transition-colors ${
                  errors.akhirPelatihan ? 'border-red-400 bg-red-50' : 'border-[#c5c0bb]'
                }`}
              />
              {errors.akhirPelatihan && <p className="text-red-500 text-[11px] mt-1">{errors.akhirPelatihan}</p>}
            </div>
          </div>

          {/* ── Masa Berlaku (tanggal kedaluwarsa) ── */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
              Masa Berlaku (Kedaluwarsa)
              <span className="ml-1 font-normal text-[#6b6560] normal-case text-[10px]">
                — untuk notifikasi otomatis
              </span>
            </label>
            <input
              type="date"
              value={masaBerlaku}
              onChange={(e) => setMasaBerlaku(e.target.value)}
              className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22] transition-colors"
            />
            <p className="text-[10px] text-[#a09b96] mt-1">
              Notifikasi akan dikirim ke pemilik, atasan, dan admin saat 30 hari sebelum & setelah kedaluwarsa.
            </p>
          </div>

          {/* ── Upload file ── */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
              File Sertifikat
              <span className="ml-1 font-normal text-[#6b6560] normal-case">(PDF / JPG / PNG)</span>
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#f15a22] file:text-white hover:file:bg-[#d44d1a] focus:outline-none"
            />
            {file && (
              <p className="text-[11px] text-green-600 mt-1">
                ✓ {file.name} ({(file.size / 1024).toFixed(0)} KB)
              </p>
            )}
            {/* Tampilkan file existing saat edit */}
            {isEdit && !file && (initialValues as any)?.files?.length > 0 && (
              <p className="text-[11px] text-[#6b6560] mt-1">
                File saat ini:{' '}
                <a
                  href={fileUrl((initialValues as any).files[0].fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f15a22] hover:underline"
                >
                  Lihat file
                </a>
              </p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e0db] flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving || (!isEdit && lookupStatus !== 'found')}
            className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-[#f15a22] rounded-xl hover:bg-[#d44d1a] transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menyimpan...
              </>
            ) : isEdit ? 'Simpan Perubahan' : 'Tambah Record'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function DetailModal({
  record,
  onClose,
  isAdmin,
  onEdit,
  onDelete,
}: {
  record: LicenseRecord | null;
  onClose: () => void;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!record) return null;
  const d = record.data;

  const files = (record as any).files as Array<{ fieldName: string; fileUrl: string; fileName: string }> | undefined;
  const certFile = files?.[0];

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0db] flex-shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#f15a22] mb-0.5">Detail Sertifikat</p>
            <h2 className="font-bold text-[15px] text-[#231f20] line-clamp-1">{record.title}</h2>
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Identitas karyawan */}
          <div className="bg-[#faf9f7] rounded-xl border border-[#e5e0db] p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#f15a22] mb-3">Identitas Karyawan</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
              <div><span className="text-[#a09b96]">ID Karyawan</span><p className="font-semibold text-[#231f20]">{d.idKaryawan || '—'}</p></div>
              <div><span className="text-[#a09b96]">Nama</span><p className="font-semibold text-[#231f20]">{d.nama || '—'}</p></div>
              <div><span className="text-[#a09b96]">Jabatan</span><p className="font-semibold text-[#231f20]">{d.jabatan || '—'}</p></div>
              <div><span className="text-[#a09b96]">Departemen</span><p className="font-semibold text-[#231f20]">{d.departemen || '—'}</p></div>
              <div><span className="text-[#a09b96]">Divisi</span><p className="font-semibold text-[#231f20]">{d.divisi || '—'}</p></div>
              <div><span className="text-[#a09b96]">Perusahaan</span><p className="font-semibold text-[#231f20]">{d.perusahaan || '—'}</p></div>
            </div>
          </div>

          {/* Info sertifikat */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#f15a22]">Informasi Sertifikat</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
              <div className="col-span-2">
                <span className="text-[#a09b96] text-[11px]">Jenis Sertifikat</span>
                <p className="font-semibold text-[#231f20]">{d.jenisSertifikat || '—'}</p>
              </div>
              <div>
                <span className="text-[#a09b96] text-[11px]">No. Sertifikat</span>
                <p className="font-semibold text-[#231f20] font-mono">{d.noSertifikat || '—'}</p>
              </div>
              <div>
                <span className="text-[#a09b96] text-[11px]">Lembaga Sertifikasi</span>
                <p className="font-semibold text-[#231f20]">{d.lembagaSertifikasi || '—'}</p>
              </div>
              <div>
                <span className="text-[#a09b96] text-[11px]">Tanggal Pelatihan</span>
                <p className="font-semibold text-[#231f20]">{formatDate(d.tanggalPelatihan)}</p>
              </div>
              <div>
                <span className="text-[#a09b96] text-[11px]">Akhir Pelatihan</span>
                <p className="font-semibold text-[#231f20]">{formatDate(d.akhirPelatihan)}</p>
              </div>
              {/* Masa Berlaku */}
              <div className="col-span-2">
                <span className="text-[#a09b96] text-[11px]">Masa Berlaku (Kedaluwarsa)</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="font-semibold text-[#231f20]">{d.masaBerlaku ? formatDate(d.masaBerlaku) : '—'}</p>
                  {d.masaBerlaku && <ExpiryBadge masaBerlaku={d.masaBerlaku} />}
                </div>
              </div>
            </div>
          </div>

          {/* Banner peringatan masa berlaku */}
          {d.masaBerlaku && getExpiryStatus(d.masaBerlaku) !== 'active' && getExpiryStatus(d.masaBerlaku) !== 'unknown' && (
            <div className={`rounded-xl p-3.5 flex items-start gap-3 ${
              getExpiryStatus(d.masaBerlaku) === 'expired'
                ? 'bg-red-50 border border-red-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <span className="text-lg leading-none mt-0.5">
                {getExpiryStatus(d.masaBerlaku) === 'expired' ? '🔴' : '🟡'}
              </span>
              <div>
                <p className={`text-[12px] font-bold ${
                  getExpiryStatus(d.masaBerlaku) === 'expired' ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {getExpiryStatus(d.masaBerlaku) === 'expired'
                    ? 'Sertifikat ini telah kedaluwarsa!'
                    : 'Masa berlaku sertifikat akan segera berakhir!'}
                </p>
                <p className={`text-[11px] mt-0.5 ${
                  getExpiryStatus(d.masaBerlaku) === 'expired' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {getExpiryStatus(d.masaBerlaku) === 'expired'
                    ? `Kedaluwarsa pada ${formatDate(d.masaBerlaku)}. Segera perbarui sertifikat ini.`
                    : `Akan kedaluwarsa pada ${formatDate(d.masaBerlaku)}. Siapkan pembaruan sesegera mungkin.`}
                </p>
              </div>
            </div>
          )}

          {/* File sertifikat */}
          {certFile && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#f15a22] mb-2">File Sertifikat</p>
              {/\.(jpg|jpeg|png)$/i.test(certFile.fileName) ? (
                <a href={fileUrl(certFile.fileUrl)} target="_blank" rel="noopener noreferrer">
                  <img
                    src={fileUrl(certFile.fileUrl)}
                    alt="Sertifikat"
                    className="max-h-48 rounded-xl border border-[#e5e0db] object-contain"
                  />
                </a>
              ) : (
                <a
                  href={fileUrl(certFile.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#faf9f7] border border-[#e5e0db] rounded-xl text-[13px] font-semibold text-[#f15a22] hover:bg-[#fff4f0] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Lihat / Unduh PDF
                </a>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="text-[11px] text-[#a09b96] border-t border-[#e5e0db] pt-3">
            Ditambahkan oleh {record.createdByName} · {formatDate(record.createdAt)}
          </div>
        </div>

        {/* Footer actions — admin only */}
        {isAdmin && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e0db] flex-shrink-0">
            <button
              onClick={onDelete}
              className="px-4 py-2 text-[13px] font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
              Hapus
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-[#f15a22] rounded-xl hover:bg-[#d44d1a] transition-colors"
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────

function ConfirmDeleteModal({
  isOpen,
  title,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="font-bold text-[15px] text-[#231f20] text-center mb-2">Hapus Record?</h3>
        <p className="text-[13px] text-[#6b6560] text-center mb-5 line-clamp-2">
          "{title}" akan dihapus permanen dan tidak bisa dikembalikan.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors">
            Batal
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 text-[13px] font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors">
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Export Modal ──────────────────────────────────────────────────────────────

interface LicenseExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: LicenseRecord[];
}

function LicenseExportModal({ isOpen, onClose, records }: LicenseExportModalProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exportFormat, setExportFormat] = useState<'html' | 'csv'>('html');
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const filterByDate = (recs: LicenseRecord[]) => {
    let f = [...recs];
    if (dateFrom) f = f.filter((r) => new Date(r.createdAt) >= new Date(dateFrom));
    if (dateTo) {
      const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
      f = f.filter((r) => new Date(r.createdAt) <= to);
    }
    return f;
  };

  const handleCSV = (filtered: LicenseRecord[]) => {
    const headers = ['No','Nama','ID Karyawan','Jabatan','Departemen','Divisi','Perusahaan','No. Sertifikat','Lembaga','Jenis Sertifikat','Tgl Pelatihan','Akhir Pelatihan','Masa Berlaku','Status Masa Berlaku','Dibuat Oleh','Tgl Dibuat'];
    const esc = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = filtered.map((rec, i) => {
      const d = rec.data;
      const status = getExpiryStatus(d.masaBerlaku);
      const statusLabel = { expired: 'Kedaluwarsa', soon: 'Segera Berakhir', active: 'Aktif', unknown: '—' }[status];
      return [
        i + 1, esc(d.nama), esc(d.idKaryawan), esc(d.jabatan), esc(d.departemen),
        esc(d.divisi), esc(d.perusahaan), esc(d.noSertifikat), esc(d.lembagaSertifikasi),
        esc(d.jenisSertifikat), esc(d.tanggalPelatihan), esc(d.akhirPelatihan),
        esc(d.masaBerlaku ?? ''), esc(statusLabel), esc(rec.createdByName ?? ''), esc(formatDate(rec.createdAt)),
      ].join(',');
    });
    const csv = '\uFEFF' + [headers.map(esc).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    const dl = dateFrom && dateTo ? `_${dateFrom}_sd_${dateTo}` : '';
    a.download = `License_Certification${dl}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const fetchImgBase64 = async (url: string): Promise<string | null> => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch { return null; }
  };

  const handleHTML = async (filtered: LicenseRecord[]) => {
    const BACKEND_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace('/api', '');
    const resolveUrl = (path: string) => {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return `${BACKEND_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const dateLabel = dateFrom && dateTo
      ? `Periode: ${formatDate(dateFrom)} — ${formatDate(dateTo)}`
      : `Dicetak: ${formatDate(new Date().toISOString())}`;

    // Pre-fetch semua foto sertifikat
    const base64Cache: Record<string, string> = {};
    for (const rec of filtered) {
      const filesArr = (rec as any).files as Array<{ fileUrl: string; fileName: string }> | undefined;
      if (filesArr?.length) {
        const f = filesArr[0];
        if (/\.(jpg|jpeg|png)$/i.test(f.fileName)) {
          const fullUrl = resolveUrl(f.fileUrl);
          if (fullUrl && !base64Cache[fullUrl]) {
            const b64 = await fetchImgBase64(fullUrl);
            if (b64) base64Cache[fullUrl] = b64;
          }
        }
      }
    }

    const expiryCounters = { active: 0, soon: 0, expired: 0, unknown: 0 };
    filtered.forEach((r) => { expiryCounters[getExpiryStatus(r.data.masaBerlaku)]++; });

    const statusBg = { expired: '#fee2e2', soon: '#fef9c3', active: '#dcfce7', unknown: '#f1f0ee' };
    const statusColor = { expired: '#b91c1c', soon: '#a16207', active: '#15803d', unknown: '#6b6560' };
    const statusLabel = { expired: 'Kedaluwarsa', soon: 'Segera Berakhir', active: 'Aktif', unknown: '—' };

    const rows = filtered.map((rec, i) => {
      const d = rec.data;
      const s = getExpiryStatus(d.masaBerlaku);
      const filesArr = (rec as any).files as Array<{ fileUrl: string; fileName: string }> | undefined;
      const certFile = filesArr?.[0];
      let imgHtml = '';
      if (certFile) {
        const fullUrl = resolveUrl(certFile.fileUrl);
        const src = base64Cache[fullUrl] ?? fullUrl;
        if (/\.(jpg|jpeg|png)$/i.test(certFile.fileName)) {
          imgHtml = `<img src="${src}" alt="Sertifikat" style="max-width:100px;max-height:70px;object-fit:contain;border-radius:4px;border:1px solid #e5e7eb;" />`;
        } else {
          imgHtml = `<a href="${fullUrl}" style="font-size:10px;color:#f15a22;">PDF</a>`;
        }
      }
      return `<tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'};">
        <td style="padding:7px 10px;text-align:center;color:#6b7280;">${i + 1}</td>
        <td style="padding:7px 10px;font-weight:600;">${d.nama || '—'}<br/><span style="font-size:10px;color:#9ca3af;">${d.idKaryawan || ''}</span></td>
        <td style="padding:7px 10px;">${d.jabatan || '—'}</td>
        <td style="padding:7px 10px;">${d.departemen || '—'}</td>
        <td style="padding:7px 10px;">${d.perusahaan || '—'}</td>
        <td style="padding:7px 10px;font-size:11px;">${d.jenisSertifikat || '—'}</td>
        <td style="padding:7px 10px;font-family:monospace;font-size:11px;">${d.noSertifikat || '—'}</td>
        <td style="padding:7px 10px;"><span style="background:${d.lembagaSertifikasi === 'Kemnaker' ? '#dbeafe' : '#f3e8ff'};color:${d.lembagaSertifikasi === 'Kemnaker' ? '#1d4ed8' : '#7c3aed'};padding:2px 7px;border-radius:99px;font-size:10px;font-weight:700;">${d.lembagaSertifikasi || '?'}</span></td>
        <td style="padding:7px 10px;font-size:11px;">${d.tanggalPelatihan ? formatDate(d.tanggalPelatihan) : '—'}</td>
        <td style="padding:7px 10px;font-size:11px;">${d.akhirPelatihan ? formatDate(d.akhirPelatihan) : '—'}</td>
        <td style="padding:7px 10px;font-size:11px;">${d.masaBerlaku ? formatDate(d.masaBerlaku) : '—'}</td>
        <td style="padding:7px 10px;"><span style="background:${statusBg[s]};color:${statusColor[s]};padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;">${statusLabel[s]}</span></td>
        <td style="padding:7px 10px;text-align:center;">${imgHtml || '—'}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>License &amp; Certification</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1f2937; padding: 16px; }
    @media print {
      body { padding: 4mm; font-size: 10px; }
      .no-print { display: none !important; }
      @page { margin: 8mm; size: A3 landscape; }
      tr { page-break-inside: avoid; }
      img { max-width: 80px !important; max-height: 60px !important; }
    }
    .header { background: #231f20; color: white; padding: 16px 20px; margin-bottom: 14px; border-radius: 6px; display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .header h1 { font-size: 18px; margin-bottom: 3px; }
    .header p { font-size: 11px; color: #9ca3af; }
    .stats { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
    .stat { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 14px; text-align: center; min-width: 90px; }
    .stat-num { font-size: 20px; font-weight: 700; color: #f15a22; }
    .stat-label { font-size: 10px; color: #6b7280; }
    .print-btn { background: #f15a22; color: white; border: none; padding: 9px 18px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; margin-bottom: 14px; }
    .table-wrap { overflow-x: auto; border-radius: 6px; border: 1px solid #d1d5db; }
    table { border-collapse: collapse; width: 100%; min-width: 1400px; }
    thead th { background: #1f2937; color: #9ca3af; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; padding: 9px 10px; text-align: left; position: sticky; top: 0; }
    td { border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
  </style>
</head>
<body>
  <div class="header">
    <div><h1>License &amp; Certification</h1><p>${dateLabel}</p></div>
    <div style="text-align:right;"><p style="font-size:13px;font-weight:700;color:#f15a22;">${filtered.length} Record</p><p style="font-size:10px;color:#9ca3af;">SMK3 Safety System</p></div>
  </div>
  <div class="stats no-print">
    <div class="stat"><div class="stat-num">${filtered.length}</div><div class="stat-label">Total</div></div>
    <div class="stat"><div class="stat-num" style="color:#15803d;">${expiryCounters.active}</div><div class="stat-label">Aktif</div></div>
    <div class="stat"><div class="stat-num" style="color:#a16207;">${expiryCounters.soon}</div><div class="stat-label">Segera Berakhir</div></div>
    <div class="stat"><div class="stat-num" style="color:#b91c1c;">${expiryCounters.expired}</div><div class="stat-label">Kedaluwarsa</div></div>
  </div>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF (A3 Landscape)</button>
  <div class="table-wrap">
    <table>
      <thead><tr>
        <th>#</th><th>Nama / ID</th><th>Jabatan</th><th>Departemen</th><th>Perusahaan</th>
        <th>Jenis Sertifikat</th><th>No. Sertifikat</th><th>Lembaga</th>
        <th>Tgl Pelatihan</th><th>Akhir Pelatihan</th><th>Masa Berlaku</th><th>Status</th><th>File</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const dl = dateFrom && dateTo ? `_${dateFrom}_sd_${dateTo}` : '';
    const a = document.createElement('a'); a.href = url; a.download = `License_Certification${dl}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const filtered = filterByDate(records);
      if (filtered.length === 0) { alert('Tidak ada record dalam rentang tanggal yang dipilih.'); return; }
      if (exportFormat === 'html') { await handleHTML(filtered); } else { handleCSV(filtered); }
      onClose();
    } finally { setExporting(false); }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0db]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#f15a22] mb-0.5">Export Data</p>
            <h2 className="font-bold text-[15px] text-[#231f20]">Download Rekap License</h2>
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-[13px] text-[#6b6560]">Kosongkan tanggal untuk export semua record.</p>
          {/* Format */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-2">Format Export</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setExportFormat('html')}
                className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 transition-all ${exportFormat === 'html' ? 'border-[#f15a22] bg-orange-50' : 'border-[#e5e0db] hover:border-[#f15a22]/40'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={exportFormat === 'html' ? '#f15a22' : '#a09b96'} strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <span className={`font-bold text-[12px] ${exportFormat === 'html' ? 'text-[#f15a22]' : 'text-[#6b6560]'}`}>HTML + Foto</span>
                <span className={`text-[10px] text-center ${exportFormat === 'html' ? 'text-[#f15a22]' : 'text-[#a09b96]'}`}>Print / Save PDF</span>
              </button>
              <button type="button" onClick={() => setExportFormat('csv')}
                className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 transition-all ${exportFormat === 'csv' ? 'border-green-500 bg-green-50' : 'border-[#e5e0db] hover:border-green-300'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={exportFormat === 'csv' ? '#16a34a' : '#a09b96'} strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
                </svg>
                <span className={`font-bold text-[12px] ${exportFormat === 'csv' ? 'text-green-700' : 'text-[#6b6560]'}`}>CSV / Excel</span>
                <span className={`text-[10px] text-center ${exportFormat === 'csv' ? 'text-green-600' : 'text-[#a09b96]'}`}>Data saja</span>
              </button>
            </div>
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
            <p className="text-[12px] text-[#6b6560]">Total record tersedia: <strong className="text-[#231f20]">{records.length}</strong></p>
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LicenseCertificationPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'supervisor';

  const [records, setRecords] = useState<LicenseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filterPerusahaan, setFilterPerusahaan] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterExpiry, setFilterExpiry] = useState<'all' | 'active' | 'soon' | 'expired'>('all');

  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState<LicenseRecord | null>(null);
  const [detailRecord, setDetailRecord] = useState<LicenseRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LicenseRecord | null>(null);
  const [showExport, setShowExport] = useState(false);

  // ── Fetch records ──────────────────────────────────────────────────────────
  const fetchRecords = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await recordsApi.getAll(
        CATEGORY,
        undefined,
        isAdmin ? undefined : user.id,
      ) as LicenseRecord[];
      setRecords(data);
    } catch (e: any) {
      setError(e?.message ?? 'Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // ── Derived filter options ────────────────────────────────────────────────
  const perusahaanOptions = Array.from(
    new Set(records.map((r) => r.data.perusahaan).filter(Boolean))
  ).sort();

  const jenisOptions = Array.from(
    new Set(records.map((r) => r.data.jenisSertifikat).filter(Boolean))
  ).sort();

  // ── Filter records ─────────────────────────────────────────────────────────
  const filtered = records.filter((r) => {
    const d = r.data;
    // text search
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        d.nama?.toLowerCase().includes(q) ||
        d.idKaryawan?.toLowerCase().includes(q) ||
        d.noSertifikat?.toLowerCase().includes(q) ||
        d.jenisSertifikat?.toLowerCase().includes(q) ||
        d.lembagaSertifikasi?.toLowerCase().includes(q) ||
        d.departemen?.toLowerCase().includes(q) ||
        d.perusahaan?.toLowerCase().includes(q);
      if (!match) return false;
    }
    // filter perusahaan
    if (filterPerusahaan && d.perusahaan !== filterPerusahaan) return false;
    // filter jenis sertifikat
    if (filterJenis && d.jenisSertifikat !== filterJenis) return false;
    // filter masa berlaku
    if (filterExpiry !== 'all') {
      const status = getExpiryStatus(d.masaBerlaku);
      if (filterExpiry === 'active' && status !== 'active') return false;
      if (filterExpiry === 'soon' && status !== 'soon') return false;
      if (filterExpiry === 'expired' && status !== 'expired') return false;
    }
    return true;
  });

  const activeFilterCount = [
    filterPerusahaan !== '',
    filterJenis !== '',
    filterExpiry !== 'all',
  ].filter(Boolean).length;

  // ── Existing noSertifikat for dupe check ──────────────────────────────────
  const existingNoSertifikat = records.map((r) => r.data.noSertifikat).filter(Boolean);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreate = async (fd: FormData) => {
    await recordsApi.createWithFile(CATEGORY, fd);
    await fetchRecords();
  };

  const handleUpdate = async (fd: FormData) => {
    if (!editRecord) return;
    await recordsApi.updateWithFile(editRecord.id, fd);
    await fetchRecords();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await recordsApi.delete(deleteTarget.id);
    setDeleteTarget(null);
    setDetailRecord(null);
    await fetchRecords();
  };

  const handleOpenEdit = () => {
    setDetailRecord(null);
    setEditRecord(detailRecord);
    setShowForm(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f1f0ee]">

      {/* ── Dark Page Header (CrudPage style) ── */}
      <div className="bg-[#231f20] px-6 md:px-10 py-8 border-b-[3px] border-b-[#f15a22]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-2">
            Safety Competency
          </p>
          <h1 className="font-bold text-white text-[clamp(22px,4vw,38px)] leading-tight">
            License & Certification
          </h1>
          <p className="text-[#8a8580] text-[13px] mt-1.5">
            Inventaris lisensi K3, sertifikat kompetensi operator, dan izin kerja khusus.
            {!isAdmin && ' Hanya menampilkan record milik Anda.'}
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">

        {/* Toolbar: search + export + tambah */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a09b96]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, ID, no. sertifikat, departemen..."
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
            onClick={() => setShowExport(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#c5c0bb] text-[#231f20] text-[13px] font-semibold rounded-xl hover:border-green-400 hover:text-green-700 transition-colors whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
          {/* Tambah Record */}
          <button
            onClick={() => { setEditRecord(null); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Record
          </button>
        </div>

        {/* ── Filter row ── */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filterPerusahaan}
            onChange={(e) => setFilterPerusahaan(e.target.value)}
            className="py-2.5 px-3.5 text-[13px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] transition-colors"
          >
            <option value="">Semua Perusahaan</option>
            {perusahaanOptions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="py-2.5 px-3.5 text-[13px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] transition-colors"
          >
            <option value="">Semua Jenis Sertifikat</option>
            {jenisOptions.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>

          <select
            value={filterExpiry}
            onChange={(e) => setFilterExpiry(e.target.value as 'all' | 'active' | 'soon' | 'expired')}
            className="py-2.5 px-3.5 text-[13px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] transition-colors"
          >
            <option value="all">Semua Status Kedaluwarsa</option>
            <option value="active">🟢 Aktif</option>
            <option value="soon">🟡 Segera Berakhir</option>
            <option value="expired">🔴 Kedaluwarsa</option>
          </select>

          {activeFilterCount > 0 && (
            <button
              onClick={() => { setFilterPerusahaan(''); setFilterJenis(''); setFilterExpiry('all'); }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-semibold text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors whitespace-nowrap"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Reset ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Info bar */}
        <div className="flex items-center justify-between mb-3 px-1 flex-wrap gap-2">
          <p className="text-[12px] text-[#6b6560]">
            {isLoading ? 'Memuat data...' : `Menampilkan ${filtered.length} record${search || activeFilterCount > 0 ? ` dari ${records.length}` : ''}`}
            {!isAdmin && !isLoading && <span className="ml-1.5 text-[#a09b96]">(hanya record Anda)</span>}
          </p>
          {isAdmin && !isLoading && (
            <span className="text-[11px] px-2.5 py-0.5 bg-[#f15a22]/10 text-[#f15a22] rounded-full font-semibold border border-[#f15a22]/20">Mode Admin</span>
          )}
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-[#e5e0db] shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-[#f1f0ee] rounded-xl animate-pulse" />)}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-[14px] font-semibold text-[#231f20]">{error}</p>
              <button onClick={fetchRecords} className="mt-3 text-[13px] text-[#f15a22] hover:underline">Coba lagi</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-[#f1f0ee] flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c5c0bb" strokeWidth="1.5">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-semibold text-[#231f20] text-[14px] mb-1">
                {search || activeFilterCount > 0 ? 'Tidak ada hasil' : 'Belum ada record'}
              </p>
              <p className="text-[#6b6560] text-[13px]">
                {search || activeFilterCount > 0 ? 'Coba ubah kata kunci atau filter' : 'Klik "Tambah Record" untuk mulai'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#e5e0db] bg-[#faf9f7]">
                    <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide w-10">#</th>
                    <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide">Nama / ID</th>
                    <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide hidden md:table-cell">Departemen</th>
                    <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide hidden lg:table-cell">Jenis Sertifikat</th>
                    <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide hidden md:table-cell">No. Sertifikat</th>
                    <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide hidden lg:table-cell">Masa Berlaku</th>
                    <th className="text-right py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f0ee]">
                  {filtered.map((rec, idx) => {
                    const d = rec.data;
                    const files = (rec as any).files as Array<{ fileUrl: string }> | undefined;
                    const hasFile = files && files.length > 0;
                    const expStatus = getExpiryStatus(d.masaBerlaku);

                    return (
                      <tr
                        key={rec.id}
                        className={`hover:bg-[#faf9f7] transition-colors ${
                          expStatus === 'expired' ? 'bg-red-50/40' : expStatus === 'soon' ? 'bg-yellow-50/40' : ''
                        }`}
                      >
                        {/* # */}
                        <td className="py-3 px-4 text-[#a09b96]">{idx + 1}</td>

                        {/* Nama / ID */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setDetailRecord(rec)}
                            className="text-left"
                          >
                            <p className="font-semibold text-[13px] text-[#231f20] hover:text-[#f15a22] transition-colors">{d.nama || '—'}</p>
                            <p className="text-[11px] text-[#a09b96]">{d.idKaryawan}</p>
                            {/* Lembaga badge inline */}
                            <span className={`mt-0.5 inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                              d.lembagaSertifikasi === 'Kemnaker' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                              {d.lembagaSertifikasi || '?'}
                            </span>
                          </button>
                        </td>

                        {/* Departemen */}
                        <td className="py-3 px-4 text-[#6b6560] hidden md:table-cell max-w-[140px]">
                          <span className="truncate block text-[12px]">{d.departemen || '—'}</span>
                          <span className="truncate block text-[11px] text-[#a09b96]">{d.perusahaan || ''}</span>
                        </td>

                        {/* Jenis Sertifikat */}
                        <td className="py-3 px-4 hidden lg:table-cell max-w-[200px]">
                          <span className="truncate block text-[12px] text-[#231f20]">{d.jenisSertifikat || '—'}</span>
                        </td>

                        {/* No. Sertifikat */}
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className="font-mono text-[12px] text-[#6b6560]">{d.noSertifikat || '—'}</span>
                          {hasFile && (
                            <span title="Ada file sertifikat" className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                          )}
                        </td>

                        {/* Masa Berlaku */}
                        <td className="py-3 px-4 hidden lg:table-cell">
                          {d.masaBerlaku ? (
                            <div className="space-y-1">
                              <p className={`text-[12px] font-medium ${
                                expStatus === 'expired' ? 'text-red-600' : expStatus === 'soon' ? 'text-yellow-600' : 'text-[#231f20]'
                              }`}>{formatDate(d.masaBerlaku)}</p>
                              <ExpiryBadge masaBerlaku={d.masaBerlaku} />
                            </div>
                          ) : (
                            <span className="text-[#c5c0bb] text-[12px]">—</span>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View detail */}
                            <button
                              onClick={() => setDetailRecord(rec)}
                              className="p-1.5 text-[#6b6560] hover:text-[#f15a22] hover:bg-[#f1f0ee] rounded-lg transition-colors"
                              title="Lihat detail"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => { setEditRecord(rec); setShowForm(true); }}
                                  className="p-1.5 text-[#6b6560] hover:text-[#f15a22] hover:bg-[#fff4f0] rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                  </svg>
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(rec)}
                                  className="p-1.5 text-[#6b6560] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Hapus"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                    <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
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
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <FormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditRecord(null); }}
        onSubmit={editRecord ? handleUpdate : handleCreate}
        initialValues={editRecord}
        existingNoSertifikat={
          editRecord
            ? existingNoSertifikat.filter((n) => n !== editRecord.data.noSertifikat)
            : existingNoSertifikat
        }
      />

      <DetailModal
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
        isAdmin={isAdmin}
        onEdit={handleOpenEdit}
        onDelete={() => { setDeleteTarget(detailRecord); }}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.title ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <LicenseExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        records={filtered}
      />
    </div>
  );
}
