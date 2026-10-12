/**
 * TypeScript Types untuk modul PICA
 * (Problem Identification and Corrective Action)
 * Internal Audit SMK — HAAMI System
 */

// ── Enums ──────────────────────────────────────────────────────────────────

/** Tingkat keparahan temuan */
export type KategoriTemuan = 'KRITIKAL' | 'MINOR' | 'MAYOR';

/** Jenis temuan */
export type JenisTemuan = 'Kondisi Tidak Aman' | 'Tindakan Tidak Aman';

/** Hirarki pengendalian (bisa pilih lebih dari 1) */
export type HiraruchiPengendalian =
  | 'Eliminasi'
  | 'Substitusi'
  | 'Engineering Control'
  | 'Administrasi'
  | 'APD';

/** Status perbaikan PICA — flow: OPEN → INPG → CLSD (atau tetap INPG jika TACC) */
export type StatusPerbaikan = 'OPEN' | 'INPG' | 'CLSD';

// ── File attachment ────────────────────────────────────────────────────────

export interface PicaFile {
  id?: string;           // id di database (untuk hapus file individual)
  fieldName: string;     // nama field form (e.g. "dokumentasiTemuan", "dokumentasiPerbaikan")
  fileName: string;      // nama asli file
  fileUrl: string;       // URL file yang diupload (/uploads/pica/...)
  fileSize: number;      // ukuran dalam bytes
  uploadedAt: string;    // ISO timestamp
}

// ── Riwayat Approval ──────────────────────────────────────────────────────

export interface RiwayatApproval {
  tanggal: string;           // ISO timestamp
  oleh: string;              // nama reviewer
  action: 'ACC' | 'TACC';   // keputusan
  keterangan?: string;       // wajib jika TACC
}

// ── Data PICA utama ────────────────────────────────────────────────────────

export interface PicaRecord {
  id: string;

  // (1) Temuan masalah
  temuanMasalah: string;

  // (2) Kriteria — referensi ke id kriteria di KRITERIA_SMK3
  kriteriaId: string;
  kriteriaDeskripsi?: string; // denormalized untuk tampil cepat

  // (3) Kategori temuan
  kategori: KategoriTemuan;

  // (4) Lokasi temuan — referensi ke divisi
  lokasiDivisiId: string;
  lokasiDivisiNama?: string; // denormalized

  // (5) Dokumentasi temuan — bisa teks + banyak file
  dokumentasiTemuanTeks?: string;
  dokumentasiTemuanFiles: PicaFile[];

  // (6) Tanggal temuan
  tanggalTemuan: string; // ISO date

  // (7) Jenis temuan
  jenisTemuan: JenisTemuan;

  // (8) Hirarki pengendalian (multi-select)
  hierarkiPengendalian: HiraruchiPengendalian[];

  // (9) Rekomendasi tindakan perbaikan
  rekomendasiPerbaikan: string;

  // (10) Penanggung jawab (PIC dari divisi)
  picId: string;       // idPIC dari tabel divisi
  picNama: string;     // namaPIC
  divisiId: string;    // id divisi

  // (11) Batas akhir deadline
  batasAkhir: string; // ISO date

  // (12) Status perbaikan — otomatis oleh sistem
  statusPerbaikan: StatusPerbaikan;

  // (13) Dokumentasi perbaikan — bisa banyak file
  dokumentasiPerbaikanFiles: PicaFile[];

  // Tanggal perbaikan — otomatis saat status → CLSD
  tanggalPerbaikan?: string;

  // Riwayat approval
  riwayatApproval: RiwayatApproval[];

  // Catatan TACC terakhir (jika terakhir TACC)
  catatanTACC?: string;

  // Metadata
  createdBy: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Form types ─────────────────────────────────────────────────────────────

/** Form data saat admin membuat temuan baru */
export interface CreatePicaDto {
  temuanMasalah: string;
  kriteriaId: string;
  kategori: KategoriTemuan;
  lokasiDivisiId: string;
  dokumentasiTemuanTeks?: string;
  tanggalTemuan: string;
  jenisTemuan: JenisTemuan;
  hierarkiPengendalian: HiraruchiPengendalian[];
  rekomendasiPerbaikan: string;
  picId: string;
  picNama: string;
  divisiId: string;
  batasAkhir: string;
}

/** Form data saat PIC mengupload bukti perbaikan */
export interface SubmitPerbaikanDto {
  id: string;       // id record PICA
}

/** Form data saat admin melakukan approval */
export interface ApprovalPicaDto {
  id: string;
  action: 'ACC' | 'TACC';
  keterangan?: string; // wajib jika TACC
  oleh: string;        // nama admin
}

// ── Filter ──────────────────────────────────────────────────────────────────

export interface PicaFilters {
  divisiId?: string;
  picId?: string;       // filter PIC — hanya lihat record miliknya
  status?: StatusPerbaikan | '';
  kategori?: KategoriTemuan | '';
  search?: string;
  tanggalDari?: string;
  tanggalSampai?: string;
}

// ── Label helpers ─────────────────────────────────────────────────────────

export const KATEGORI_TEMUAN_LABELS: Record<KategoriTemuan, { label: string; bg: string; text: string; border: string }> = {
  KRITIKAL: { label: 'Kritikal', bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300' },
  MAYOR:    { label: 'Mayor',    bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  MINOR:    { label: 'Minor',    bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
};

export const STATUS_PERBAIKAN_LABELS: Record<StatusPerbaikan, { label: string; bg: string; text: string; border: string }> = {
  OPEN: { label: 'OPEN',        bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-300' },
  INPG: { label: 'INPG',        bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  CLSD: { label: 'CLSD',        bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-300' },
};

export const JENIS_TEMUAN_OPTIONS: JenisTemuan[] = [
  'Kondisi Tidak Aman',
  'Tindakan Tidak Aman',
];

export const HIRARKI_OPTIONS: HiraruchiPengendalian[] = [
  'Eliminasi',
  'Substitusi',
  'Engineering Control',
  'Administrasi',
  'APD',
];

export const KATEGORI_OPTIONS: KategoriTemuan[] = ['KRITIKAL', 'MAYOR', 'MINOR'];
