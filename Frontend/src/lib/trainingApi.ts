/**
 * Master Pelatihan / Sertifikat API Client
 * Mengelola daftar pelatihan yang menjadi opsi Jenis Sertifikat di License & Certification.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface MasterPelatihan {
  id: string;
  namaPelatihan: string;
  lembaga: string; // 'KEMNAKER' | 'BNSP' | custom string (cth: 'Kemenkes', 'Disnaker', 'IRCA')
  durasiHari: number;
  harga: number;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMasterPelatihanDto {
  namaPelatihan: string;
  lembaga: string;
  durasiHari: number;
  harga: number;
}

const LOCAL_STORAGE_KEY = 'erm_master_pelatihan_list';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('smk3_token');
}

/**
 * Data awal (seed) daftar pelatihan K3 standar
 */
export const DEFAULT_PELATIHAN_LIST: MasterPelatihan[] = [
  // Operator Alat Berat
  { id: 'plt-1',  namaPelatihan: 'SIO Crane — Operator Crane',                     lembaga: 'KEMNAKER', durasiHari: 4,  harga: 4500000 },
  { id: 'plt-2',  namaPelatihan: 'SIO Forklift — Operator Forklift',               lembaga: 'KEMNAKER', durasiHari: 3,  harga: 3500000 },
  { id: 'plt-3',  namaPelatihan: 'SIO Rigger — Rigger / Juru Ikat',                lembaga: 'KEMNAKER', durasiHari: 3,  harga: 3000000 },
  { id: 'plt-4',  namaPelatihan: 'SIO Excavator — Operator Excavator',             lembaga: 'KEMNAKER', durasiHari: 4,  harga: 4500000 },
  { id: 'plt-5',  namaPelatihan: 'SIO Bulldozer — Operator Bulldozer',             lembaga: 'KEMNAKER', durasiHari: 4,  harga: 4500000 },
  { id: 'plt-6',  namaPelatihan: 'SIO Wheel Loader — Operator Wheel Loader',       lembaga: 'KEMNAKER', durasiHari: 4,  harga: 4500000 },
  { id: 'plt-7',  namaPelatihan: 'SIO Dump Truck — Operator Dump Truck',           lembaga: 'KEMNAKER', durasiHari: 3,  harga: 3500000 },
  { id: 'plt-8',  namaPelatihan: 'SIO Man Lift — Aerial Work Platform',            lembaga: 'KEMNAKER', durasiHari: 3,  harga: 3800000 },
  // Ahli K3
  { id: 'plt-9',  namaPelatihan: 'AK3 Umum — Ahli K3 Umum',                        lembaga: 'KEMNAKER', durasiHari: 12, harga: 7500000 },
  { id: 'plt-10', namaPelatihan: 'AK3 Kebakaran Kelas A',                          lembaga: 'KEMNAKER', durasiHari: 6,  harga: 5500000 },
  { id: 'plt-11', namaPelatihan: 'AK3 Kebakaran Kelas B',                          lembaga: 'KEMNAKER', durasiHari: 6,  harga: 5000000 },
  { id: 'plt-12', namaPelatihan: 'AK3 Kebakaran Kelas C',                          lembaga: 'KEMNAKER', durasiHari: 6,  harga: 4500000 },
  { id: 'plt-13', namaPelatihan: 'AK3 Listrik — Ahli K3 Bidang Listrik',           lembaga: 'KEMNAKER', durasiHari: 15, harga: 9000000 },
  { id: 'plt-14', namaPelatihan: 'AK3 Kimia — Ahli K3 Kimia',                      lembaga: 'KEMNAKER', durasiHari: 12, harga: 8000000 },
  { id: 'plt-15', namaPelatihan: 'AK3 Konstruksi — Ahli K3 Konstruksi',            lembaga: 'KEMNAKER', durasiHari: 12, harga: 8000000 },
  { id: 'plt-16', namaPelatihan: 'AK3 Pesawat Uap & Bejana Tekan',                 lembaga: 'KEMNAKER', durasiHari: 14, harga: 8500000 },
  { id: 'plt-17', namaPelatihan: 'AK3 Mekanik',                                    lembaga: 'KEMNAKER', durasiHari: 12, harga: 7500000 },
  { id: 'plt-18', namaPelatihan: 'AK3 Lingkungan Kerja',                           lembaga: 'KEMNAKER', durasiHari: 10, harga: 7000000 },
  // Pelatihan & Kompetensi
  { id: 'plt-19', namaPelatihan: 'P3K K3 — Pelatihan Pertolongan Pertama',         lembaga: 'KEMNAKER', durasiHari: 3,  harga: 3000000 },
  { id: 'plt-20', namaPelatihan: 'Fire Warden — Warden Kebakaran',                 lembaga: 'BNSP',     durasiHari: 2,  harga: 2500000 },
  { id: 'plt-21', namaPelatihan: 'Safety Officer — Petugas K3',                    lembaga: 'BNSP',     durasiHari: 4,  harga: 4000000 },
  { id: 'plt-22', namaPelatihan: 'Emergency Response Team',                        lembaga: 'BNSP',     durasiHari: 3,  harga: 3500000 },
  { id: 'plt-23', namaPelatihan: 'Confined Space Entry — Ruang Terbatas',          lembaga: 'KEMNAKER', durasiHari: 3,  harga: 3800000 },
  { id: 'plt-24', namaPelatihan: 'Working at Height — Bekerja di Ketinggian',      lembaga: 'KEMNAKER', durasiHari: 3,  harga: 3500000 },
  { id: 'plt-25', namaPelatihan: 'Scaffolding — Inspector Perancah',               lembaga: 'KEMNAKER', durasiHari: 4,  harga: 4500000 },
  { id: 'plt-26', namaPelatihan: 'LOTO — Lock Out Tag Out',                        lembaga: 'BNSP',     durasiHari: 2,  harga: 2000000 },
  { id: 'plt-27', namaPelatihan: 'Hazmat Handler — Penangan B3',                   lembaga: 'BNSP',     durasiHari: 3,  harga: 3500000 },
  { id: 'plt-28', namaPelatihan: 'HIRAC / HIRARC — Identifikasi Bahaya',           lembaga: 'BNSP',     durasiHari: 2,  harga: 2200000 },
  // Sertifikat Lainnya
  { id: 'plt-29', namaPelatihan: 'ISO 45001 — Internal Auditor',                   lembaga: 'IRCA',     durasiHari: 2,  harga: 2500000 },
  { id: 'plt-30', namaPelatihan: 'SMK3 — Auditor Internal',                        lembaga: 'KEMNAKER', durasiHari: 4,  harga: 4500000 },
  { id: 'plt-31', namaPelatihan: 'Ergonomi Industri',                              lembaga: 'BNSP',     durasiHari: 2,  harga: 2500000 },
  { id: 'plt-32', namaPelatihan: 'Higiene Industri',                               lembaga: 'BNSP',     durasiHari: 3,  harga: 3000000 },
];

function getLocalList(): MasterPelatihan[] {
  if (typeof window === 'undefined') return DEFAULT_PELATIHAN_LIST;
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_PELATIHAN_LIST));
    return DEFAULT_PELATIHAN_LIST;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PELATIHAN_LIST;
  } catch {
    return DEFAULT_PELATIHAN_LIST;
  }
}

function saveLocalList(list: MasterPelatihan[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
}

export const trainingApi = {
  /**
   * Mengambil semua master pelatihan
   */
  getAll: async (): Promise<MasterPelatihan[]> => {
    const token = getStoredToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}/master-pelatihan`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          saveLocalList(data);
          return data;
        }
      }
    } catch {
      // Backend not yet ready -> fallback to localStorage
    }

    return getLocalList();
  },

  /**
   * Tambah master pelatihan baru
   */
  create: async (dto: CreateMasterPelatihanDto): Promise<MasterPelatihan> => {
    const token = getStoredToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}/master-pelatihan`, {
        method: 'POST',
        headers,
        body: JSON.stringify(dto),
      });

      if (res.ok) {
        const created = await res.json();
        const current = getLocalList();
        saveLocalList([...current, created]);
        return created;
      }
      if (res.status === 403) {
        throw new Error('Hanya Admin yang berwenang menambahkan master pelatihan.');
      }
      if (res.status !== 404) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Gagal menyimpan: HTTP ${res.status}`);
      }
    } catch (e: any) {
      if (e.message?.includes('Admin')) throw e;
    }

    // Local fallback
    const newItem: MasterPelatihan = {
      id: `plt-${Date.now()}`,
      namaPelatihan: dto.namaPelatihan.trim(),
      lembaga: dto.lembaga.trim(),
      durasiHari: Number(dto.durasiHari) || 1,
      harga: Number(dto.harga) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const current = getLocalList();
    const updated = [...current, newItem];
    saveLocalList(updated);
    return newItem;
  },

  /**
   * Update master pelatihan
   */
  update: async (id: string, dto: Partial<CreateMasterPelatihanDto>): Promise<MasterPelatihan> => {
    const token = getStoredToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}/master-pelatihan/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(dto),
      });

      if (res.ok) {
        const updated = await res.json();
        const current = getLocalList();
        const idx = current.findIndex((p) => p.id === id);
        if (idx !== -1) {
          current[idx] = updated;
          saveLocalList(current);
        }
        return updated;
      }
      if (res.status === 403) {
        throw new Error('Hanya Admin yang berwenang mengubah master pelatihan.');
      }
    } catch (e: any) {
      if (e.message?.includes('Admin')) throw e;
    }

    // Local fallback
    const current = getLocalList();
    const idx = current.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Data pelatihan tidak ditemukan');

    const updatedItem: MasterPelatihan = {
      ...current[idx],
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    current[idx] = updatedItem;
    saveLocalList(current);
    return updatedItem;
  },

  /**
   * Hapus master pelatihan
   */
  delete: async (id: string): Promise<void> => {
    const token = getStoredToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}/master-pelatihan/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        const current = getLocalList().filter((p) => p.id !== id);
        saveLocalList(current);
        return;
      }
      if (res.status === 403) {
        throw new Error('Hanya Admin yang berwenang menghapus master pelatihan.');
      }
    } catch (e: any) {
      if (e.message?.includes('Admin')) throw e;
    }

    // Local fallback
    const current = getLocalList().filter((p) => p.id !== id);
    saveLocalList(current);
  },
};

/**
 * Format rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}
