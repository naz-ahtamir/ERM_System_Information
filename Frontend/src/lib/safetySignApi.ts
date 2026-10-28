/**
 * Safety Sign API Client & Helper
 * Handles fetching, creating, updating, deleting safety signs, and image downloading.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface SafetySign {
  id: string;
  nama: string;
  ukuran: string;
  imageUrl: string;
  createdById?: string;
  createdBy?: { id: string; nama: string };
  createdAt?: string;
  updatedAt?: string;
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('smk3_token');
}

const LOCAL_STORAGE_KEY = 'erm_safety_signs_local_data';

// Helper SVG signs for default demo/initial state if DB is empty or backend pending
export const DEFAULT_SAMPLE_SIGNS: SafetySign[] = [
  {
    id: 'sign-default-1',
    nama: 'Dilarang Merokok / No Smoking',
    ukuran: '30 x 40 cm',
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sign-default-2',
    nama: 'Wajib Menggunakan Helm Keselamatan',
    ukuran: '30 x 40 cm',
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sign-default-3',
    nama: 'Wajib Menggunakan Sepatu Safety',
    ukuran: '30 x 40 cm',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sign-default-4',
    nama: 'Awas Bahaya Tegangan Tinggi (High Voltage)',
    ukuran: '40 x 60 cm',
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sign-default-5',
    nama: 'Jalur Evakuasi Darurat (Emergency Exit)',
    ukuran: '20 x 40 cm',
    imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sign-default-6',
    nama: 'Titik Kumpul Evakuasi (Assembly Point)',
    ukuran: '60 x 80 cm',
    imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sign-default-7',
    nama: 'Lokasi Alat Pemadam Api Ringan (APAR)',
    ukuran: '30 x 30 cm',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sign-default-8',
    nama: 'Wajib Menggunakan Kacamata Pelindung (Safety Glasses)',
    ukuran: '30 x 40 cm',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
];

function getLocalSigns(): SafetySign[] {
  if (typeof window === 'undefined') return DEFAULT_SAMPLE_SIGNS;
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_SIGNS));
    return DEFAULT_SAMPLE_SIGNS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SAMPLE_SIGNS;
  }
}

function saveLocalSigns(signs: SafetySign[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(signs));
}

export const safetySignApi = {
  /**
   * Mengambil semua safety sign
   */
  getAll: async (): Promise<SafetySign[]> => {
    const token = getStoredToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}/safety-signs`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          saveLocalSigns(data);
          return data;
        }
      }
    } catch {
      // Backend not yet deployed / offline — fallback to local cache
    }

    return getLocalSigns();
  },

  /**
   * Tambah safety sign (Multipart dengan file gambar, nama, dan ukuran)
   */
  create: async (formData: FormData): Promise<SafetySign> => {
    const token = getStoredToken();
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}/safety-signs`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (res.ok) {
        return res.json();
      }
      if (res.status === 403) {
        throw new Error('Anda tidak memiliki wewenang (khusus Admin) untuk menambah safety sign.');
      }
      if (res.status === 401) {
        throw new Error('Sesi login telah habis. Silakan login kembali.');
      }
      // If endpoint doesn't exist yet (404), throw clear message or fallback
      if (res.status !== 404) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Gagal menyimpan: HTTP ${res.status}`);
      }
    } catch (e: any) {
      if (e.message?.includes('wewenang') || e.message?.includes('Sesi login')) {
        throw e;
      }
    }

    // Local fallback if backend endpoint is still pending
    const nama = (formData.get('nama') as string) || 'Safety Sign Baru';
    const ukuran = (formData.get('ukuran') as string) || '30 x 40 cm';
    const file = formData.get('file') as File | null;

    let imageUrl = '';
    if (file) {
      imageUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const newSign: SafetySign = {
      id: `sign-${Date.now()}`,
      nama,
      ukuran,
      imageUrl: imageUrl || DEFAULT_SAMPLE_SIGNS[0].imageUrl,
      createdAt: new Date().toISOString(),
    };

    const current = getLocalSigns();
    const updated = [newSign, ...current];
    saveLocalSigns(updated);
    return newSign;
  },

  /**
   * Update safety sign
   */
  update: async (id: string, formData: FormData): Promise<SafetySign> => {
    const token = getStoredToken();
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}/safety-signs/${id}`, {
        method: 'PUT',
        headers,
        body: formData,
      });

      if (res.ok) {
        return res.json();
      }
      if (res.status === 403) {
        throw new Error('Hanya Admin yang dapat mengubah safety sign.');
      }
      if (res.status !== 404) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Gagal update: HTTP ${res.status}`);
      }
    } catch (e: any) {
      if (e.message?.includes('Admin') || e.message?.includes('Sesi')) {
        throw e;
      }
    }

    // Local fallback
    const current = getLocalSigns();
    const idx = current.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Data sign tidak ditemukan');

    const nama = (formData.get('nama') as string) || current[idx].nama;
    const ukuran = (formData.get('ukuran') as string) || current[idx].ukuran;
    const file = formData.get('file') as File | null;

    let imageUrl = current[idx].imageUrl;
    if (file && file.size > 0) {
      imageUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const updatedSign: SafetySign = {
      ...current[idx],
      nama,
      ukuran,
      imageUrl,
      updatedAt: new Date().toISOString(),
    };

    current[idx] = updatedSign;
    saveLocalSigns(current);
    return updatedSign;
  },

  /**
   * Hapus safety sign
   */
  delete: async (id: string): Promise<void> => {
    const token = getStoredToken();
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}/safety-signs/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        const current = getLocalSigns().filter((s) => s.id !== id);
        saveLocalSigns(current);
        return;
      }
      if (res.status === 403) {
        throw new Error('Hanya Admin yang dapat menghapus safety sign.');
      }
    } catch (e: any) {
      if (e.message?.includes('Admin')) throw e;
    }

    const current = getLocalSigns().filter((s) => s.id !== id);
    saveLocalSigns(current);
  },
};

/**
 * Download sign image helper (mendukung cross-origin blob download)
 */
export async function downloadSignImage(imageUrl: string, nama: string, ukuran: string) {
  const cleanName = `${nama.replace(/[^a-zA-Z0-9_-]/g, '_')}_${ukuran.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;

  try {
    if (imageUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const res = await fetch(imageUrl, { mode: 'cors' });
    if (!res.ok) throw new Error('Fetch failed');
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = cleanName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    // Direct link fallback
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = cleanName;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
