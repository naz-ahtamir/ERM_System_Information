/**
 * Serah Terima APD (PPE Handover & Distribution) API Client
 * Mengelola pencatatan transaksi serah terima APD lengkap dengan multi-item,
 * data pemberi otomatis, data penerima, bukti foto serah terima, serta ringkasan analitik.
 */

import { MasterApd } from './masterApdApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface PpeHandoverItem {
  id?: string;
  apdId?: string;
  namaApd: string;
  kategori: string;
  jumlah: number;
  satuan: string;
  ukuran?: string;
  kondisi: 'Baru' | 'Penggantian' | 'Tambahan';
  keterangan?: string;
}

export interface PpeHandoverRecord {
  id: string;
  nomorTransaksi: string;
  tanggal: string; // YYYY-MM-DD

  // Data Pemberi (Otomatis dari user login)
  pemberiId?: string;
  pemberiNama: string;
  pemberiIdKaryawan: string;
  pemberiDepartemen?: string;
  pemberiDivisi?: string;

  // Data Penerima
  penerimaNama: string;
  penerimaIdKaryawan: string;
  penerimaJabatan?: string;
  penerimaDepartemen: string;
  penerimaDivisi?: string;
  penerimaPerusahaan?: string;

  // Rincian APD yang Diserahkan (Multiple Items)
  items: PpeHandoverItem[];
  totalUnitApd: number;

  // Keperluan / Alasan
  keperluan: string;
  catatan?: string;

  // Foto Bukti Serah Terima (Wajib)
  fotoBuktiUrl: string;
  fotoBuktiName?: string;

  createdAt: string;
  updatedAt?: string;
}

export interface CreatePpeHandoverDto {
  tanggal: string;
  pemberiId?: string;
  pemberiNama: string;
  pemberiIdKaryawan: string;
  pemberiDepartemen?: string;
  pemberiDivisi?: string;

  penerimaNama: string;
  penerimaIdKaryawan: string;
  penerimaJabatan?: string;
  penerimaDepartemen: string;
  penerimaDivisi?: string;
  penerimaPerusahaan?: string;

  items: PpeHandoverItem[];
  keperluan: string;
  catatan?: string;

  fotoBuktiUrl: string;
  fotoBuktiName?: string;
}

const LOCAL_STORAGE_KEY = 'erm_ppe_handover_records';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('smk3_token');
}

/**
 * Data awal transaksi serah terima APD
 */
export const DEFAULT_PPE_HANDOVER_LIST: PpeHandoverRecord[] = [];

function getLocalList(): PpeHandoverRecord[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Bersihkan data dummy hardcode sampel jika tersimpan sebelumnya
    const cleanList = parsed.filter(
      (r) => !['trx-apd-1', 'trx-apd-2', 'trx-apd-3', 'trx-apd-4'].includes(r?.id)
    );
    if (cleanList.length !== parsed.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanList));
    }
    return cleanList;
  } catch {
    return [];
  }
}

function saveLocalList(list: PpeHandoverRecord[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
}

export const ppeHandoverApi = {
  /**
   * Mengambil semua catatan serah terima APD
   */
  getAll: async (): Promise<PpeHandoverRecord[]> => {
    const token = getStoredToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}/ppe-handover`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          saveLocalList(data);
          return data;
        }
      }
    } catch {
      // Backend belum siap -> fallback localStorage
    }

    return getLocalList();
  },

  /**
   * Mengambil detail berdasarkan ID
   */
  getById: async (id: string): Promise<PpeHandoverRecord | null> => {
    const all = await ppeHandoverApi.getAll();
    return all.find((r) => r.id === id) || null;
  },

  /**
   * Membuat transaksi serah terima APD baru
   */
  create: async (dto: CreatePpeHandoverDto): Promise<PpeHandoverRecord> => {
    const token = getStoredToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const totalUnit = dto.items.reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0);

    try {
      const res = await fetch(`${API_BASE_URL}/ppe-handover`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...dto, totalUnitApd: totalUnit }),
      });

      if (res.ok) {
        const created = await res.json();
        const current = getLocalList();
        saveLocalList([created, ...current]);
        return created;
      }
      if (res.status !== 404) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Gagal menyimpan: HTTP ${res.status}`);
      }
    } catch (e: any) {
      if (e.message && !e.message.includes('fetch')) throw e;
    }

    // Local fallback
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const nomorTransaksi = `TRX-APD-${dateStr}-${randomSuffix}`;

    const newRecord: PpeHandoverRecord = {
      id: `trx-apd-${Date.now()}`,
      nomorTransaksi,
      tanggal: dto.tanggal || now.toISOString().slice(0, 10),

      pemberiId: dto.pemberiId,
      pemberiNama: dto.pemberiNama.trim(),
      pemberiIdKaryawan: dto.pemberiIdKaryawan.trim(),
      pemberiDepartemen: dto.pemberiDepartemen?.trim() || '',
      pemberiDivisi: dto.pemberiDivisi?.trim() || '',

      penerimaNama: dto.penerimaNama.trim(),
      penerimaIdKaryawan: dto.penerimaIdKaryawan.trim(),
      penerimaJabatan: dto.penerimaJabatan?.trim() || '',
      penerimaDepartemen: dto.penerimaDepartemen.trim(),
      penerimaDivisi: dto.penerimaDivisi?.trim() || '',
      penerimaPerusahaan: dto.penerimaPerusahaan?.trim() || 'PT. QMB New Energy Materials',

      items: dto.items,
      totalUnitApd: totalUnit,

      keperluan: dto.keperluan.trim(),
      catatan: dto.catatan?.trim() || '',

      fotoBuktiUrl: dto.fotoBuktiUrl,
      fotoBuktiName: dto.fotoBuktiName || 'bukti_serah_terima.jpg',

      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const current = getLocalList();
    const updated = [newRecord, ...current];
    saveLocalList(updated);
    return newRecord;
  },

  /**
   * Update transaksi serah terima (Khusus Admin)
   */
  update: async (id: string, dto: Partial<CreatePpeHandoverDto>): Promise<PpeHandoverRecord> => {
    const token = getStoredToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}/ppe-handover/${id}`, {
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
        throw new Error('Hanya Admin yang berwenang mengubah catatan serah terima APD.');
      }
    } catch (e: any) {
      if (e.message?.includes('Admin')) throw e;
    }

    // Local fallback
    const current = getLocalList();
    const idx = current.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Data transaksi serah terima tidak ditemukan');

    const totalUnit = dto.items
      ? dto.items.reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0)
      : current[idx].totalUnitApd;

    const updatedRecord: PpeHandoverRecord = {
      ...current[idx],
      ...dto,
      totalUnitApd: totalUnit,
      updatedAt: new Date().toISOString(),
    };

    current[idx] = updatedRecord;
    saveLocalList(current);
    return updatedRecord;
  },

  /**
   * Hapus transaksi serah terima (Khusus Admin)
   */
  delete: async (id: string): Promise<void> => {
    const token = getStoredToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}/ppe-handover/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        const current = getLocalList().filter((p) => p.id !== id);
        saveLocalList(current);
        return;
      }
      if (res.status === 403) {
        throw new Error('Hanya Admin yang berwenang menghapus catatan serah terima APD.');
      }
    } catch (e: any) {
      if (e.message?.includes('Admin')) throw e;
    }

    // Local fallback
    const current = getLocalList().filter((p) => p.id !== id);
    saveLocalList(current);
  },
};
