/**
 * Safety Induction API Client
 * Konsumsi endpoint NestJS: /api/induction (JWT) + /api/induction-public (public)
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
// Base tanpa /api — untuk URL publik
const BASE_URL = API_BASE.replace(/\/api$/, '');

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('smk3_token');
}

async function authFetch<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (init.headers) Object.assign(headers, init.headers);

  const res = await fetch(`${API_BASE}${endpoint}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

async function publicFetch<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (init.headers) Object.assign(headers, init.headers);
  const res = await fetch(`${API_BASE}${endpoint}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Types ──────────────────────────────────────────────────────────────────

export type SessionStatus = 'INPG' | 'CLSD';
export type ParticipantTipe =
  | 'KARYAWAN_BARU'
  | 'KONTRAKTOR'
  | 'TAMU'
  | 'SUPPLIER'
  | 'MAGANG'
  | 'EXTERNAL';
export type StatusHadir = 'REGISTERED' | 'HADIR' | 'IZIN' | 'ALPHA';
export type MediaType = 'FOTO_ABSENSI' | 'FOTO_KEGIATAN' | 'MATERI' | 'DOKUMEN';

export interface InductionPIC {
  id: string;
  nama: string;
  jabatan?: string;
}

export interface InductionParticipant {
  id: string;
  sessionId: string;
  userId?: string | null;
  user?: { id: string; nama: string; jabatan?: string; departemen?: string } | null;
  nama: string;
  perusahaan?: string | null;
  identitas?: string | null;
  noTelp?: string | null;
  email?: string | null;
  jabatan?: string | null;
  jenisKelamin?: string | null;
  fotoUrl?: string | null;
  tipe: string;
  scanTime?: string | null;
  scanMethod?: string | null;
  statusHadir: StatusHadir;
  cardCode?: string | null;
  cardUrl?: string | null;
  cardIssuedAt?: string | null;
}

export interface InductionMedia {
  id: string;
  sessionId: string;
  type: MediaType | string;
  fileUrl: string;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  uploadedBy?: string | null;
  uploadedAt: string;
}

export interface InductionSession {
  id: string;
  kodeSesi: string;
  qrCode?: string | null;
  tanggal: string;
  lokasi: string;
  topik?: string | null;
  deskripsi?: string | null;
  picId?: string | null;
  pic?: InductionPIC | null;
  status: string;   // 'DRAFT' | 'ACTIVE' | 'COMPLETED'
  participants?: InductionParticipant[];
  media?: InductionMedia[];
  _count?: { participants: number; media: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionPayload {
  tanggal: string;       // ISO date string
  lokasi: string;
  topik?: string;
  deskripsi?: string;
  picId?: string;
  status?: SessionStatus;
}

export interface AddParticipantPayload {
  userId?: string;
  nama: string;
  perusahaan?: string;
  identitas?: string;
  noTelp?: string;
  email?: string;
  jabatan?: string;
  jenisKelamin?: string;
  tipe?: ParticipantTipe | string;
  scanMethod?: 'QR' | 'MANUAL';
}

// ── Session API ────────────────────────────────────────────────────────────

export const inductionApi = {
  // GET /induction?status=...
  getSessions: (status?: SessionStatus) => {
    const qs = status ? `?status=${status}` : '';
    return authFetch<InductionSession[]>(`/induction${qs}`);
  },

  // POST /induction
  createSession: (payload: CreateSessionPayload) =>
    authFetch<InductionSession>('/induction', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // GET /induction/:id
  getSession: (id: string) => authFetch<InductionSession>(`/induction/${id}`),

  // PUT /induction/:id
  updateSession: (id: string, payload: Partial<CreateSessionPayload> & { status?: string }) =>
    authFetch<InductionSession>(`/induction/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // DELETE /induction/:id
  deleteSession: (id: string) =>
    authFetch<{ message: string }>(`/induction/${id}`, { method: 'DELETE' }),

  // ── Participants ────────────────────────────────────────────────────────

  // GET /induction/check-duplicate?identitas=xxx
  checkDuplicate: (identitas: string) =>
    authFetch<(InductionParticipant & { session?: Pick<InductionSession, 'id' | 'kodeSesi' | 'tanggal' | 'lokasi'> }) | null>(`/induction/check-duplicate?identitas=${encodeURIComponent(identitas)}`),

  // POST /induction/:id/participants
  addParticipant: (sessionId: string, payload: AddParticipantPayload) =>
    authFetch<InductionParticipant>(`/induction/${sessionId}/participants`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // PATCH /induction/participants/:pid/status
  updateParticipantStatus: (pid: string, statusHadir: StatusHadir) =>
    authFetch<InductionParticipant>(`/induction/participants/${pid}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ statusHadir }),
    }),

  // DELETE /induction/participants/:pid
  removeParticipant: (pid: string) =>
    authFetch<{ message: string }>(`/induction/participants/${pid}`, { method: 'DELETE' }),

  // GET /induction/card/:cardCode
  getCard: (cardCode: string) =>
    authFetch<InductionParticipant & { session: Pick<InductionSession, 'id' | 'kodeSesi' | 'tanggal' | 'lokasi' | 'topik'> }>(`/induction/card/${cardCode}`),

  // ── Media ──────────────────────────────────────────────────────────────

  // POST /induction/:id/media  (multipart)
  uploadMedia: async (sessionId: string, file: File, type: MediaType | string): Promise<InductionMedia> => {
    const token = getToken();
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', type);

    const res = await fetch(`${API_BASE}/induction/${sessionId}/media`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message ?? `HTTP ${res.status}`);
    }
    return res.json();
  },

  // DELETE /induction/media/:mediaId
  removeMedia: (mediaId: string) =>
    authFetch<{ message: string }>(`/induction/media/${mediaId}`, { method: 'DELETE' }),
};

// ── Public API (no auth — for QR scan page) ───────────────────────────────

export const inductionPublicApi = {
  // GET /induction-public/session/:kodeSesi
  getSession: (kodeSesi: string) =>
    publicFetch<InductionSession>(`/induction-public/session/${kodeSesi}`),

  // POST /induction-public/session/:kodeSesi/register
  register: (kodeSesi: string, payload: AddParticipantPayload) =>
    publicFetch<InductionParticipant>(`/induction-public/session/${kodeSesi}/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // GET /induction-public/card/:cardCode
  verifyCard: (cardCode: string) =>
    publicFetch<InductionParticipant & { session: Pick<InductionSession, 'id' | 'kodeSesi' | 'tanggal' | 'lokasi' | 'topik'> }>(`/induction-public/card/${cardCode}`),
};

// ── Helpers ────────────────────────────────────────────────────────────────

/** URL QR Code menggunakan Google Charts API (tidak perlu lib) */
export function getQRCodeUrl(text: string, size = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(text)}&size=${size}x${size}&format=png`;
}

/** URL halaman scan frontend — digunakan sebagai data QR */
export function getScanPageUrl(kodeSesi: string): string {
  // Prioritas: 1. Browser origin, 2. Environment variable, 3. Fallback localhost
  let baseUrl: string;
  
  if (typeof window !== 'undefined') {
    baseUrl = window.location.origin;
  } else if (process.env.NEXT_PUBLIC_FRONTEND_URL) {
    baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
  } else {
    // Fallback untuk development
    baseUrl = 'http://localhost:3000';
  }
  
  return `${baseUrl}/safety-competency/safety-induction/scan/${kodeSesi}`;
}

/** URL halaman verifikasi kartu — digunakan untuk QR di kartu induksi */
export function getVerifyCardUrl(cardCode: string): string {
  let baseUrl: string;
  
  if (typeof window !== 'undefined') {
    baseUrl = window.location.origin;
  } else if (process.env.NEXT_PUBLIC_FRONTEND_URL) {
    baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
  } else {
    baseUrl = 'http://localhost:3000';
  }
  
  return `${baseUrl}/safety-competency/safety-induction/verify/${cardCode}`;
}

/** Resolve file URL ke full URL */
export function resolveFileUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Label tipe peserta */
export const TIPE_LABELS: Record<string, string> = {
  KARYAWAN_BARU: 'Karyawan Baru',
  KONTRAKTOR: 'Kontraktor',
  TAMU: 'Tamu / Visitor',
  SUPPLIER: 'Supplier',
  MAGANG: 'Magang / Trainee',
  EXTERNAL: 'External',
};

/** Label status hadir */
export const STATUS_HADIR_LABELS: Record<string, { label: string; color: string }> = {
  REGISTERED: { label: 'Terdaftar', color: 'text-blue-600' },
  HADIR:      { label: 'Hadir',     color: 'text-green-600' },
  IZIN:       { label: 'Izin',      color: 'text-yellow-600' },
  ALPHA:      { label: 'Alpha',     color: 'text-red-600' },
};

/** Label status sesi */
export const SESSION_STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  INPG: { label: 'Berlangsung', bg: 'bg-green-100', text: 'text-green-700' },
  CLSD: { label: 'Selesai', bg: 'bg-blue-100', text: 'text-blue-700' },
};
