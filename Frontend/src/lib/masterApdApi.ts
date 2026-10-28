/**
 * Master Jenis APD (Personal Protective Equipment) API Client
 * Mengelola katalog data master jenis APD untuk keperluan serah terima di PT. QMB New Energy Materials.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface MasterApd {
  id: string;
  namaApd: string;
  kategori: string;
  satuan: string;
  stokAwal?: number;
  standar?: string;
  keterangan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMasterApdDto {
  namaApd: string;
  kategori: string;
  satuan: string;
  stokAwal?: number;
  standar?: string;
  keterangan?: string;
}

const LOCAL_STORAGE_KEY = 'erm_master_apd_list';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('smk3_token');
}

/**
 * Kategori Standar APD
 */
export const KATEGORI_APD_OPTIONS = [
  'Pelindung Kepala',
  'Pelindung Kaki',
  'Pelindung Tangan',
  'Pelindung Mata & Wajah',
  'Pelindung Pernapasan',
  'Pelindung Pendengaran',
  'Pelindung Tubuh',
  'Pelindung Jatuh',
  'Peralatan Keselamatan Khusus',
] as const;

/**
 * Satuan APD
 */
export const SATUAN_APD_OPTIONS = [
  'Pcs',
  'Pasang',
  'Set',
  'Box',
  'Roll',
  'Unit',
] as const;

/**
 * Data awal (seed) 16 jenis APD standar industri peleburan nikel / baterai & K3 pertambangan
 */
export const DEFAULT_MASTER_APD_LIST: MasterApd[] = [
  {
    id: 'apd-1',
    namaApd: 'Helm Safety (Safety Helmet V-Gard)',
    kategori: 'Pelindung Kepala',
    satuan: 'Pcs',
    stokAwal: 150,
    standar: 'SNI / ANSI Z89.1 Type 1 Class E',
    keterangan: 'Tersedia warna Putih, Kuning, Biru, Merah, Orange dengan chin strap.',
  },
  {
    id: 'apd-2',
    namaApd: 'Sepatu Safety (Steel Toe Shoes)',
    kategori: 'Pelindung Kaki',
    satuan: 'Pasang',
    stokAwal: 120,
    standar: 'SNI 7079 / EN ISO 20345 S3',
    keterangan: 'Dilengkapi pelindung ujung baja (toe cap) & sol anti-slip tahan minyak dan panas.',
  },
  {
    id: 'apd-3',
    namaApd: 'Kacamata Safety (Clear Safety Glasses)',
    kategori: 'Pelindung Mata & Wajah',
    satuan: 'Pcs',
    stokAwal: 200,
    standar: 'ANSI Z87.1+ / EN 166',
    keterangan: 'Anti-fog lens, anti-scratch, dan perlindungan radiasi UV.',
  },
  {
    id: 'apd-4',
    namaApd: 'Kacamata Las / Chemical Splash Goggles',
    kategori: 'Pelindung Mata & Wajah',
    satuan: 'Pcs',
    stokAwal: 60,
    standar: 'ANSI Z87.1 / EN 166',
    keterangan: 'Ventilasi indirect tahan percikan asam, alkali dan percikan las.',
  },
  {
    id: 'apd-5',
    namaApd: 'Sarung Tangan Bintik (Cotton Dotted Gloves)',
    kategori: 'Pelindung Tangan',
    satuan: 'Pasang',
    stokAwal: 300,
    standar: 'Standar Industri Pabrik',
    keterangan: 'Untuk pekerjaan umum non-kimia dan pemindahan material kering.',
  },
  {
    id: 'apd-6',
    namaApd: 'Sarung Tangan Kulit Las (Welding Leather Gloves)',
    kategori: 'Pelindung Tangan',
    satuan: 'Pasang',
    stokAwal: 80,
    standar: 'EN 388 / EN 407',
    keterangan: 'Panjang 14-16 inch, tahan panas radiasi dan percikan api las.',
  },
  {
    id: 'apd-7',
    namaApd: 'Sarung Tangan Kimia Nitrile (Chemical Resistant)',
    kategori: 'Pelindung Tangan',
    satuan: 'Pasang',
    stokAwal: 100,
    standar: 'EN 374-1 / EN 388',
    keterangan: 'Tahan asam sulfat, basa kuat, dan bahan kimia proses hydrometallurgy.',
  },
  {
    id: 'apd-8',
    namaApd: 'Rompi Reflektif (Hi-Vis Safety Vest)',
    kategori: 'Pelindung Tubuh',
    satuan: 'Pcs',
    stokAwal: 180,
    standar: 'ANSI/ISEA 107 Class 2',
    keterangan: 'Warna hijau stabilo / orange dengan pita reflektif 3M tingkat pantul tinggi.',
  },
  {
    id: 'apd-9',
    namaApd: 'Full Body Harness (Double Lanyard Absorber)',
    kategori: 'Pelindung Jatuh',
    satuan: 'Set',
    stokAwal: 45,
    standar: 'EN 361 / ANSI Z359.11',
    keterangan: 'Dilengkapi twin lanyard, energy absorber, dan snap big hook.',
  },
  {
    id: 'apd-10',
    namaApd: 'Masker Partikulat N95 / KN95',
    kategori: 'Pelindung Pernapasan',
    satuan: 'Box',
    stokAwal: 90,
    standar: 'NIOSH N95 / GB2626-2019',
    keterangan: '1 box isi 20 pcs, untuk area berdebu nikel, batu bara, atau semen.',
  },
  {
    id: 'apd-11',
    namaApd: 'Half Face Respirator (Double Cartridge)',
    kategori: 'Pelindung Pernapasan',
    satuan: 'Pcs',
    stokAwal: 50,
    standar: 'NIOSH Approved / EN 140',
    keterangan: 'Dapat dipasangi cartridge uap asam, gas organik, dan filter partikulat P100.',
  },
  {
    id: 'apd-12',
    namaApd: 'Earplug / Sumbat Telinga (Corded)',
    kategori: 'Pelindung Pendengaran',
    satuan: 'Pasang',
    stokAwal: 250,
    standar: 'ANSI S3.19 NRR 29-32 dB',
    keterangan: 'Busa polyurethane lembut dengan tali, sekali pakai/dapat dicuci.',
  },
  {
    id: 'apd-13',
    namaApd: 'Earmuff / Penutup Telinga (Headband)',
    kategori: 'Pelindung Pendengaran',
    satuan: 'Pcs',
    stokAwal: 40,
    standar: 'ANSI S3.19 NRR 27 dB',
    keterangan: 'Untuk area dengan kebisingan mesin tinggi (>85 dBA) seperti genset & crusher.',
  },
  {
    id: 'apd-14',
    namaApd: 'Face Shield (Visor Polycarbonate Clear)',
    kategori: 'Pelindung Mata & Wajah',
    satuan: 'Pcs',
    stokAwal: 35,
    standar: 'ANSI Z87.1',
    keterangan: 'Bracket helm / headgear untuk pekerjaan gerinda dan pemotongan logam.',
  },
  {
    id: 'apd-15',
    namaApd: 'Apron Kulit Dada (Leather Welding Apron)',
    kategori: 'Pelindung Tubuh',
    satuan: 'Pcs',
    stokAwal: 30,
    standar: 'Standar Bengkel K3',
    keterangan: 'Kulit sapi tahan percikan spatter las dan panas radiasi tempa.',
  },
  {
    id: 'apd-16',
    namaApd: 'Wearpack Coverall Flame Retardant (FR)',
    kategori: 'Pelindung Tubuh',
    satuan: 'Set',
    stokAwal: 75,
    standar: 'NFPA 2112 / EN ISO 11612',
    keterangan: 'Pakaian kerja lengan panjang tahan api dengan reflective tape.',
  },
];

function getLocalList(): MasterApd[] {
  if (typeof window === 'undefined') return DEFAULT_MASTER_APD_LIST;
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_MASTER_APD_LIST));
    return DEFAULT_MASTER_APD_LIST;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MASTER_APD_LIST;
  } catch {
    return DEFAULT_MASTER_APD_LIST;
  }
}

function saveLocalList(list: MasterApd[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
}

export const masterApdApi = {
  /**
   * Mengambil semua master jenis APD
   */
  getAll: async (): Promise<MasterApd[]> => {
    const token = getStoredToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}/master-apd`, { headers });
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
   * Tambah master jenis APD baru
   */
  create: async (dto: CreateMasterApdDto): Promise<MasterApd> => {
    const token = getStoredToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}/master-apd`, {
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
        throw new Error('Hanya Admin yang berwenang menambahkan master jenis APD.');
      }
      if (res.status !== 404) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Gagal menyimpan: HTTP ${res.status}`);
      }
    } catch (e: any) {
      if (e.message?.includes('Admin')) throw e;
    }

    // Local fallback
    const newItem: MasterApd = {
      id: `apd-${Date.now()}`,
      namaApd: dto.namaApd.trim(),
      kategori: dto.kategori.trim(),
      satuan: dto.satuan.trim() || 'Pcs',
      stokAwal: Number(dto.stokAwal) || 0,
      standar: dto.standar?.trim() || '',
      keterangan: dto.keterangan?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const current = getLocalList();
    const updated = [...current, newItem];
    saveLocalList(updated);
    return newItem;
  },

  /**
   * Update master jenis APD
   */
  update: async (id: string, dto: Partial<CreateMasterApdDto>): Promise<MasterApd> => {
    const token = getStoredToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}/master-apd/${id}`, {
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
        throw new Error('Hanya Admin yang berwenang mengubah master jenis APD.');
      }
    } catch (e: any) {
      if (e.message?.includes('Admin')) throw e;
    }

    // Local fallback
    const current = getLocalList();
    const idx = current.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Data jenis APD tidak ditemukan');

    const updatedItem: MasterApd = {
      ...current[idx],
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    current[idx] = updatedItem;
    saveLocalList(current);
    return updatedItem;
  },

  /**
   * Hapus master jenis APD
   */
  delete: async (id: string): Promise<void> => {
    const token = getStoredToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}/master-apd/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        const current = getLocalList().filter((p) => p.id !== id);
        saveLocalList(current);
        return;
      }
      if (res.status === 403) {
        throw new Error('Hanya Admin yang berwenang menghapus master jenis APD.');
      }
    } catch (e: any) {
      if (e.message?.includes('Admin')) throw e;
    }

    // Local fallback
    const current = getLocalList().filter((p) => p.id !== id);
    saveLocalList(current);
  },
};
