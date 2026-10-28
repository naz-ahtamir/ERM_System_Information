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
export const DEFAULT_PPE_HANDOVER_LIST: PpeHandoverRecord[] = [
  {
    id: 'trx-apd-1',
    nomorTransaksi: 'TRX-APD-202410-001',
    tanggal: '2024-10-15',
    pemberiNama: 'Ahmad Fauzi',
    pemberiIdKaryawan: 'ADM-001',
    pemberiDepartemen: 'HSE & Sustainability',
    pemberiDivisi: 'PERENCANAAN KEAMANAN & PELATIHAN SIMULASI',
    penerimaNama: 'Rudi Hermawan',
    penerimaIdKaryawan: 'OPR-1042',
    penerimaJabatan: 'Operator Hydrometallurgy',
    penerimaDepartemen: 'Smelter & Refining',
    penerimaDivisi: 'Leaching & Extraction',
    penerimaPerusahaan: 'PT. QMB New Energy Materials',
    items: [
      {
        namaApd: 'Helm Safety (Safety Helmet V-Gard)',
        kategori: 'Pelindung Kepala',
        jumlah: 1,
        satuan: 'Pcs',
        ukuran: 'All Size (Kuning)',
        kondisi: 'Baru',
        keterangan: 'Karyawan baru operasional',
      },
      {
        namaApd: 'Sepatu Safety (Steel Toe Shoes)',
        kategori: 'Pelindung Kaki',
        jumlah: 1,
        satuan: 'Pasang',
        ukuran: '42',
        kondisi: 'Baru',
        keterangan: 'Steel toe cap EN ISO 20345',
      },
      {
        namaApd: 'Kacamata Safety (Clear Safety Glasses)',
        kategori: 'Pelindung Mata & Wajah',
        jumlah: 1,
        satuan: 'Pcs',
        ukuran: 'Standard',
        kondisi: 'Baru',
        keterangan: 'Anti-fog lens',
      },
      {
        namaApd: 'Rompi Reflektif (Hi-Vis Safety Vest)',
        kategori: 'Pelindung Tubuh',
        jumlah: 1,
        satuan: 'Pcs',
        ukuran: 'XL',
        kondisi: 'Baru',
        keterangan: 'Warna Orange',
      },
    ],
    totalUnitApd: 4,
    keperluan: 'Paket APD Karyawan Baru',
    catatan: 'Telah diberikan pengarahan cara pemakaian & perawatan APD.',
    fotoBuktiUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80',
    fotoBuktiName: 'serah_terima_rudi.jpg',
    createdAt: '2024-10-15T09:30:00.000Z',
  },
  {
    id: 'trx-apd-2',
    nomorTransaksi: 'TRX-APD-202410-002',
    tanggal: '2024-10-18',
    pemberiNama: 'Bambang Sutejo',
    pemberiIdKaryawan: 'HSE-008',
    pemberiDepartemen: 'HSE & Sustainability',
    pemberiDivisi: 'INSPEKSI & PENGENDALIAN BAHAYA',
    penerimaNama: 'Indra Saputra',
    penerimaIdKaryawan: 'MTC-2015',
    penerimaJabatan: 'Teknisi Mekanik',
    penerimaDepartemen: 'Maintenance & Utility',
    penerimaDivisi: 'Mechanical Workshop',
    penerimaPerusahaan: 'PT. QMB New Energy Materials',
    items: [
      {
        namaApd: 'Sarung Tangan Kulit Las (Welding Leather Gloves)',
        kategori: 'Pelindung Tangan',
        jumlah: 2,
        satuan: 'Pasang',
        ukuran: '16 inch',
        kondisi: 'Penggantian',
        keterangan: 'Sarung tangan lama robek akibat panas',
      },
      {
        namaApd: 'Apron Kulit Dada (Leather Welding Apron)',
        kategori: 'Pelindung Tubuh',
        jumlah: 1,
        satuan: 'Pcs',
        ukuran: 'Free Size',
        kondisi: 'Penggantian',
        keterangan: 'Penggantian APD usang',
      },
      {
        namaApd: 'Kacamata Las / Chemical Splash Goggles',
        kategori: 'Pelindung Mata & Wajah',
        jumlah: 1,
        satuan: 'Pcs',
        ukuran: 'Standard',
        kondisi: 'Baru',
        keterangan: 'Untuk pekerjaan pemotongan oxy-acetylene',
      },
    ],
    totalUnitApd: 4,
    keperluan: 'Penggantian APD Rusak & Aus',
    catatan: 'APD lama ditarik untuk dimusnahkan/scrap.',
    fotoBuktiUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    fotoBuktiName: 'serah_terima_indra.jpg',
    createdAt: '2024-10-18T14:15:00.000Z',
  },
  {
    id: 'trx-apd-3',
    nomorTransaksi: 'TRX-APD-202410-020',
    tanggal: '2024-10-22',
    pemberiNama: 'Ahmad Fauzi',
    pemberiIdKaryawan: 'ADM-001',
    pemberiDepartemen: 'HSE & Sustainability',
    pemberiDivisi: 'PERENCANAAN KEAMANAN & PELATIHAN SIMULASI',
    penerimaNama: 'Siti Nurhaliza',
    penerimaIdKaryawan: 'LAB-3004',
    penerimaJabatan: 'Analis Laboratorium Kimia',
    penerimaDepartemen: 'Quality Assurance & Lab',
    penerimaDivisi: 'Analytical Chemistry',
    penerimaPerusahaan: 'PT. QMB New Energy Materials',
    items: [
      {
        namaApd: 'Sarung Tangan Kimia Nitrile (Chemical Resistant)',
        kategori: 'Pelindung Tangan',
        jumlah: 3,
        satuan: 'Pasang',
        ukuran: 'M',
        kondisi: 'Baru',
        keterangan: 'Tahan asam pekat titrasi',
      },
      {
        namaApd: 'Half Face Respirator (Double Cartridge)',
        kategori: 'Pelindung Pernapasan',
        jumlah: 1,
        satuan: 'Pcs',
        ukuran: 'M',
        kondisi: 'Baru',
        keterangan: 'Lengkap cartridge uap asam & organik',
      },
    ],
    totalUnitApd: 4,
    keperluan: 'Kebutuhan Rutin Uji Sampel Kimia',
    catatan: 'Diserahkan langsung di lab sentral.',
    fotoBuktiUrl: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=600&q=80',
    fotoBuktiName: 'serah_terima_siti.jpg',
    createdAt: '2024-10-22T11:00:00.000Z',
  },
  {
    id: 'trx-apd-4',
    nomorTransaksi: 'TRX-APD-202410-025',
    tanggal: '2024-10-25',
    pemberiNama: 'Dedi Kurniawan',
    pemberiIdKaryawan: 'LOG-004',
    pemberiDepartemen: 'Logistics & Warehouse',
    pemberiDivisi: 'Gudang APD & Material',
    penerimaNama: 'Faisal Akbar',
    penerimaIdKaryawan: 'PRJ-4011',
    penerimaJabatan: 'Rigger / Scaffolder',
    penerimaDepartemen: 'Project & Construction',
    penerimaDivisi: 'Civil & Structural',
    penerimaPerusahaan: 'PT. QMB New Energy Materials',
    items: [
      {
        namaApd: 'Full Body Harness (Double Lanyard Absorber)',
        kategori: 'Pelindung Jatuh',
        jumlah: 1,
        satuan: 'Set',
        ukuran: 'Universal',
        kondisi: 'Baru',
        keterangan: 'Pekerjaan konstruksi tangki ketinggian 18m',
      },
      {
        namaApd: 'Helm Safety (Safety Helmet V-Gard)',
        kategori: 'Pelindung Kepala',
        jumlah: 1,
        satuan: 'Pcs',
        ukuran: 'Putih (Chin Strap 4-Point)',
        kondisi: 'Baru',
        keterangan: 'Dilengkapi tali dagu elastis',
      },
    ],
    totalUnitApd: 2,
    keperluan: 'Pekerjaan Ketinggian (Working at Height)',
    catatan: 'Sudah diinspeksi oleh safety officer sebelum diserahkan.',
    fotoBuktiUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    fotoBuktiName: 'serah_terima_faisal.jpg',
    createdAt: '2024-10-25T15:45:00.000Z',
  },
];

function getLocalList(): PpeHandoverRecord[] {
  if (typeof window === 'undefined') return DEFAULT_PPE_HANDOVER_LIST;
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_PPE_HANDOVER_LIST));
    return DEFAULT_PPE_HANDOVER_LIST;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PPE_HANDOVER_LIST;
  } catch {
    return DEFAULT_PPE_HANDOVER_LIST;
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
