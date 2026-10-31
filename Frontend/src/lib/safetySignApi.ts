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

// Default kosong (tanpa hardcoded mock)
export const DEFAULT_SAMPLE_SIGNS: SafetySign[] = [];

function getLocalSigns(): SafetySign[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed: SafetySign[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Bersihkan record hardcoded demo lama jika masih tersimpan di cache browser
    const cleaned = parsed.filter((s) => !s.id.startsWith('sign-default-'));
    if (cleaned.length !== parsed.length) {
      saveLocalSigns(cleaned);
    }
    return cleaned;
  } catch {
    return [];
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
        if (Array.isArray(data)) {
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
      imageUrl: imageUrl || '',
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
