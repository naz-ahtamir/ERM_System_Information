/**
 * PICA API Client
 * Calls Next.js API routes at /api/pica/*
 * Internal Audit SMK — HAAMI System
 */

import type {
  PicaRecord,
  PicaFilters,
  StatusPerbaikan,
} from '@/types/pica';

// ── Auth helpers ──────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('smk3_token');
}

async function authFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};

  // Jangan set Content-Type jika FormData (biar browser set boundary otomatis)
  if (!(init.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (init.headers) Object.assign(headers, init.headers as Record<string, string>);

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? err.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── API functions ─────────────────────────────────────────────────────────

export const picaApi = {
  /**
   * GET /api/pica — ambil semua record.
   * Jika divisiId dikirim, backend/API route akan filter otomatis.
   */
  getAll: (filters?: PicaFilters): Promise<PicaRecord[]> => {
    const params = new URLSearchParams();
    if (filters?.divisiId)      params.set('divisiId', filters.divisiId);
    if (filters?.status)        params.set('status', filters.status);
    if (filters?.kategori)      params.set('kategori', filters.kategori);
    if (filters?.search)        params.set('search', filters.search);
    if (filters?.tanggalDari)   params.set('tanggalDari', filters.tanggalDari);
    if (filters?.tanggalSampai) params.set('tanggalSampai', filters.tanggalSampai);
    const qs = params.toString();
    return authFetch<PicaRecord[]>(`/api/pica${qs ? `?${qs}` : ''}`);
  },

  /**
   * GET /api/pica/:id — ambil satu record
   */
  getOne: (id: string): Promise<PicaRecord> =>
    authFetch<PicaRecord>(`/api/pica/${id}`),

  /**
   * POST /api/pica — buat temuan baru (admin)
   * Mengirim FormData karena bisa ada file dokumentasi temuan
   */
  create: (formData: FormData): Promise<{ message: string; data: PicaRecord }> =>
    authFetch<{ message: string; data: PicaRecord }>('/api/pica', {
      method: 'POST',
      body: formData,
    }),

  /**
   * PUT /api/pica — update record
   *   - Admin (isAdminEdit=true): hanya boleh saat status OPEN
   *   - User/PIC (isAdminEdit=false): boleh saat OPEN atau INPG (setelah TACC)
   */
  update: (id: string, formData: FormData, isAdminEdit = false): Promise<{ message: string; data: PicaRecord }> => {
    formData.set('id', id);
    formData.set('isAdminEdit', isAdminEdit ? 'true' : 'false');
    return authFetch<{ message: string; data: PicaRecord }>('/api/pica', {
      method: 'PUT',
      body: formData,
    });
  },

  /**
   * PATCH /api/pica/:id/action — lakukan aksi pada record
   *
   * Actions:
   *   submit_perbaikan — PIC upload bukti perbaikan → status: OPEN → INPG
   *   approve          — Admin ACC → status: INPG → CLSD
   *   reject           — Admin TACC → status: INPG → OPEN + catatan TACC
   *   set_in_progress  — Admin set manual ke INPG
   */
  action: (payload: {
    id: string;
    action: 'submit_perbaikan' | 'approve' | 'reject' | 'set_in_progress';
    keterangan?: string;
    oleh?: string;
    formData?: FormData;
  }): Promise<{ message: string; data: PicaRecord }> => {
    const url = `/api/pica/${payload.id}/action`;

    // submit_perbaikan pakai FormData (ada file bukti)
    if (payload.action === 'submit_perbaikan' && payload.formData) {
      payload.formData.set('action', payload.action);
      if (payload.keterangan) payload.formData.set('keterangan', payload.keterangan);
      if (payload.oleh)       payload.formData.set('oleh', payload.oleh);
      return authFetch<{ message: string; data: PicaRecord }>(url, {
        method: 'PATCH',
        body: payload.formData,
      });
    }

    // Approve / reject / set_in_progress — JSON
    return authFetch<{ message: string; data: PicaRecord }>(url, {
      method: 'PATCH',
      body: JSON.stringify({
        action: payload.action,
        keterangan: payload.keterangan,
        oleh: payload.oleh,
      }),
    });
  },

  /**
   * PATCH /api/pica/:id/status — admin ubah status langsung (OPEN / INPG / CLSD)
   */
  updateStatus: (
    id: string,
    status: StatusPerbaikan,
    keterangan?: string,
  ): Promise<{ message: string; data: PicaRecord }> =>
    authFetch<{ message: string; data: PicaRecord }>(`/api/pica/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, keterangan }),
    }),

  /**
   * DELETE /api/pica?id=... — hapus record (admin)
   */
  remove: (id: string): Promise<{ message: string }> =>
    authFetch<{ message: string }>(`/api/pica?id=${id}`, { method: 'DELETE' }),
};

// ── Helpers ────────────────────────────────────────────────────────────────

/** Format tanggal ISO ke format Indonesia */
export function formatTanggalPica(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Hitung sisa hari sampai deadline */
export function sisaHariDeadline(batasAkhir?: string | null): number | null {
  if (!batasAkhir) return null;
  const deadline = new Date(batasAkhir);
  const now = new Date();
  const diff = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

/** Warna indikator sisa hari */
export function sisaHariColor(hari: number | null): string {
  if (hari === null) return 'text-[#a09b96]';
  if (hari < 0) return 'text-red-600';
  if (hari <= 3) return 'text-red-500';
  if (hari <= 7) return 'text-orange-500';
  if (hari <= 14) return 'text-yellow-600';
  return 'text-green-600';
}

/** Format ukuran file ke string human-readable */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Cek apakah file adalah gambar berdasarkan nama */
export function isImageFile(fileName: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName);
}

/** Cek apakah record terlambat */
export function isTerlambat(record: PicaRecord): boolean {
  if (record.statusPerbaikan === 'CLSD') return false;
  const sisa = sisaHariDeadline(record.batasAkhir);
  return sisa !== null && sisa < 0;
}

/** Hitung statistik PICA */
export function hitungStatistikPica(records: PicaRecord[]) {
  return {
    total: records.length,
    open: records.filter((r) => r.statusPerbaikan === 'OPEN').length,
    inProgress: records.filter((r) => r.statusPerbaikan === 'INPG').length,
    closed: records.filter((r) => r.statusPerbaikan === 'CLSD').length,
    terlambat: records.filter(isTerlambat).length,
    kritikal: records.filter((r) => r.kategori === 'KRITIKAL').length,
    mayor: records.filter((r) => r.kategori === 'MAYOR').length,
    minor: records.filter((r) => r.kategori === 'MINOR').length,
  };
}
