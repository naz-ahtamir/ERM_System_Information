/**
 * Objek K3 API Client
 * Endpoint NestJS: /api/objek-k3 (JWT required)
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_BASE.replace(/\/api$/, '');

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('smk3_token');
}

async function authFetch<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (!(init.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (init.headers) Object.assign(headers, init.headers);

  const res = await fetch(`${API_BASE}${endpoint}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Enums & Constants ──────────────────────────────────────────────────────

export type Perusahaan = 'QMB' | 'ESG' | 'MEIMING' | 'GEN' | 'QINGMEI' | 'GNM';

export type KategoriObjek =
  | 'PESAWAT_UAP_DAN_BEJANA_TEKAN'
  | 'PESAWAT_ANGKAT_ANGKUT'
  | 'PESAWAT_TENAGA_PRODUKSI'
  | 'INSTALASI_LISTRIK'
  | 'INSTALASI_PENYALUR_PETIR'
  | 'INSTALASI_ELEVATOR'
  | 'INSTALASI_PROTEKSI_KEBAKARAN';

export type StatusKelayakan = 'LAYAK' | 'TIDAK_LAYAK' | 'PERLU_PERBAIKAN';
export type StatusRiksaUji = 'SUDAH' | 'BELUM' | 'DALAM_PROSES';
export type StatusAman = 'AMAN' | 'PROSES_RIKSA_UJI' | 'PROSES_PERPANJANG' | 'BELUM_ADA_PLAN';

export const PERUSAHAAN_OPTIONS: { label: string; value: Perusahaan }[] = [
  { label: 'QMB', value: 'QMB' },
  { label: 'ESG', value: 'ESG' },
  { label: 'MEIMING', value: 'MEIMING' },
  { label: 'GEN', value: 'GEN' },
  { label: 'QINGMEI', value: 'QINGMEI' },
  { label: 'GNM', value: 'GNM' },
];

export const KATEGORI_OPTIONS: { label: string; value: KategoriObjek }[] = [
  { label: 'Pesawat Uap dan Bejana Tekan', value: 'PESAWAT_UAP_DAN_BEJANA_TEKAN' },
  { label: 'Pesawat Angkat Angkut', value: 'PESAWAT_ANGKAT_ANGKUT' },
  { label: 'Pesawat Tenaga Produksi', value: 'PESAWAT_TENAGA_PRODUKSI' },
  { label: 'Instalasi Listrik', value: 'INSTALASI_LISTRIK' },
  { label: 'Instalasi Penyalur Petir', value: 'INSTALASI_PENYALUR_PETIR' },
  { label: 'Instalasi Elevator', value: 'INSTALASI_ELEVATOR' },
  { label: 'Instalasi Proteksi Kebakaran', value: 'INSTALASI_PROTEKSI_KEBAKARAN' },
];

export const STATUS_KELAYAKAN_LABELS: Record<StatusKelayakan, { label: string; bg: string; text: string }> = {
  LAYAK:           { label: 'Layak',           bg: 'bg-green-100', text: 'text-green-700' },
  TIDAK_LAYAK:     { label: 'Tidak Layak',     bg: 'bg-red-100',   text: 'text-red-700' },
  PERLU_PERBAIKAN: { label: 'Perlu Perbaikan', bg: 'bg-yellow-100',text: 'text-yellow-700' },
};

export const STATUS_RIKSA_UJI_LABELS: Record<StatusRiksaUji, { label: string; bg: string; text: string }> = {
  SUDAH:        { label: 'Sudah',        bg: 'bg-green-100',  text: 'text-green-700' },
  BELUM:        { label: 'Belum',        bg: 'bg-red-100',    text: 'text-red-700' },
  DALAM_PROSES: { label: 'Dalam Proses', bg: 'bg-blue-100',   text: 'text-blue-700' },
};

export const STATUS_AMAN_LABELS: Record<StatusAman, { label: string; bg: string; text: string }> = {
  AMAN:              { label: 'Aman',              bg: 'bg-green-100',  text: 'text-green-700' },
  PROSES_RIKSA_UJI:  { label: 'Proses Riksa Uji',  bg: 'bg-blue-100',   text: 'text-blue-700' },
  PROSES_PERPANJANG: { label: 'Proses Perpanjang',  bg: 'bg-orange-100', text: 'text-orange-700' },
  BELUM_ADA_PLAN:    { label: 'Belum Ada Plan',     bg: 'bg-gray-100',   text: 'text-gray-700' },
};

// ── Types ──────────────────────────────────────────────────────────────────

export interface ObjekK3Departemen {
  id: string;
  name: string;
  code: string;
}

export interface ObjekK3User {
  id: string;
  nama: string;
}

export interface RiwayatPemeriksaan {
  id: string;
  objekK3Id: string;
  tanggal: string;
  hasil: string;
  catatan?: string | null;
  fileLaporan?: string | null;
  createdAt: string;
}

export interface ObjekK3 {
  id: string;
  perusahaan: Perusahaan;
  kategori: KategoriObjek;
  namaAlat: string;
  noSeri: string;
  jumlah: number;
  departemenId: string;
  departemen: ObjekK3Departemen;
  lokasi: string;
  kapasitas?: number | null;
  satuan?: string | null;
  tahunPemasangan?: number | null;
  kondisiPemasangan?: string | null;
  pengesahanGambar?: string | null;
  tanggalPengujianPertama?: string | null;
  tanggalPengujianBerkala?: string | null;
  statusKelayakan?: StatusKelayakan | null;
  statusRiksaUji?: StatusRiksaUji | null;
  noSuket?: string | null;
  tanggalRiksaUjiTerakhir?: string | null;
  tanggalBerlaku?: string | null;
  sisaHari?: number | null;
  statusAman?: StatusAman | null;
  jadwalRiksaUji?: string | null;
  lhu?: string | null;
  fileLHU?: string | null;
  lhuAda?: string | null;
  noLHU?: string | null;
  fotoAlat?: string | null;
  fotoTagging?: string | null;
  sertifikat?: string | null;
  laporanPemeriksaan?: string | null;
  catatan?: string | null;
  createdBy: ObjekK3User;
  updatedBy?: ObjekK3User | null;
  createdAt: string;
  updatedAt: string;
  riwayatPemeriksaan: RiwayatPemeriksaan[];
}

export interface ObjekK3Filters {
  perusahaan?: Perusahaan | '';
  kategori?: KategoriObjek | '';
  statusKelayakan?: StatusKelayakan | '';
  statusRiksaUji?: StatusRiksaUji | '';
  statusAman?: StatusAman | '';
  search?: string;
}

// ── API Functions ──────────────────────────────────────────────────────────

export const objekK3Api = {
  // GET /objek-k3?perusahaan=...&kategori=...
  getAll: (filters?: ObjekK3Filters) => {
    const params = new URLSearchParams();
    if (filters?.perusahaan) params.set('perusahaan', filters.perusahaan);
    if (filters?.kategori) params.set('kategori', filters.kategori);
    if (filters?.statusKelayakan) params.set('statusKelayakan', filters.statusKelayakan);
    if (filters?.statusRiksaUji) params.set('statusRiksaUji', filters.statusRiksaUji);
    if (filters?.statusAman) params.set('statusAman', filters.statusAman);
    if (filters?.search) params.set('search', filters.search);
    const qs = params.toString();
    return authFetch<ObjekK3[]>(`/objek-k3${qs ? `?${qs}` : ''}`);
  },

  // GET /objek-k3/:id
  getOne: (id: string) => authFetch<ObjekK3>(`/objek-k3/${id}`),

  // POST /objek-k3 (multipart)
  create: (formData: FormData) =>
    authFetch<ObjekK3>('/objek-k3', { method: 'POST', body: formData }),

  // PUT /objek-k3/:id (multipart)
  update: (id: string, formData: FormData) =>
    authFetch<ObjekK3>(`/objek-k3/${id}`, { method: 'PUT', body: formData }),

  // DELETE /objek-k3/:id
  remove: (id: string) =>
    authFetch<{ message: string }>(`/objek-k3/${id}`, { method: 'DELETE' }),

  // POST /objek-k3/:id/riwayat (multipart)
  addRiwayat: (objekK3Id: string, formData: FormData) =>
    authFetch<RiwayatPemeriksaan>(`/objek-k3/${objekK3Id}/riwayat`, {
      method: 'POST',
      body: formData,
    }),

  // DELETE /objek-k3/riwayat/:riwayatId
  removeRiwayat: (riwayatId: string) =>
    authFetch<{ message: string }>(`/objek-k3/riwayat/${riwayatId}`, { method: 'DELETE' }),
};

// ── Helpers ────────────────────────────────────────────────────────────────

/** Resolve a stored file path to a full URL */
export function resolveFileUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Format ISO date to Indonesian locale string */
export function formatTanggal(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

/** Sisa hari colour indicator */
export function sisaHariColor(hari?: number | null): string {
  if (hari === null || hari === undefined) return 'text-[#a09b96]';
  if (hari < 0) return 'text-red-600';
  if (hari <= 30) return 'text-orange-500';
  if (hari <= 90) return 'text-yellow-600';
  return 'text-green-600';
}

/** Human-readable kategori label */
export function kategoriLabel(k: KategoriObjek): string {
  return KATEGORI_OPTIONS.find((o) => o.value === k)?.label ?? k;
}
