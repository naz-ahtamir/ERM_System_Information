import {
  ObjekK3,
  RiwayatRiksaUji,
  RiwayatMaintenance,
  resolveFileUrl,
} from './objekK3Api';

const RIKSA_UJI_PREFIX = 'objek_k3_riksa_uji_';
const MAINTENANCE_PREFIX = 'objek_k3_maintenance_';

/** Convert a File object to Base64 string for offline/mock preview */
export function fileToBase64(file: File): Promise<{ dataUrl: string; name: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ dataUrl: reader.result as string, name: file.name });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Open any file (URL or DataURL) cleanly in a new browser tab */
export function openDocument(url?: string | null, title?: string) {
  if (!url) return;
  if (url.startsWith('data:')) {
    try {
      const parts = url.split(';base64,');
      const contentType = parts[0].split(':')[1] || 'application/pdf';
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      const w = window.open(blobUrl, '_blank', 'noopener,noreferrer');
      if (title && w) {
        setTimeout(() => {
          try { w.document.title = title; } catch (_) {}
        }, 300);
      }
      return;
    } catch (err) {
      console.error('Error opening base64 data:', err);
    }
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

/** Calculate remaining days to expiry date */
export function calculateSisaHari(expiredDate?: string | null): number | null {
  if (!expiredDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiredDate);
  exp.setHours(0, 0, 0, 0);
  const diffTime = exp.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ── RIKSA UJI STORAGE ────────────────────────────────────────────────────────

export function getRiksaUjiList(obj: ObjekK3): RiwayatRiksaUji[] {
  if (typeof window === 'undefined') return [];
  const key = `${RIKSA_UJI_PREFIX}${obj.id}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      const parsed: RiwayatRiksaUji[] = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort(
          (a, b) => new Date(b.tanggalExpiredSILO || b.createdAt).getTime() - new Date(a.tanggalExpiredSILO || a.createdAt).getTime(),
        );
      }
    } catch (_) {}
  }

  // Seed from legacy fields if any exists on the master object
  const seeds: RiwayatRiksaUji[] = [];
  if (obj.noLHU || obj.noSuket || obj.fileLHU || obj.tanggalBerlaku) {
    seeds.push({
      id: `legacy-${obj.id}`,
      objekK3Id: obj.id,
      noLHU: obj.noLHU || 'LHU-01/AWAL',
      tanggalTerbitLHU: (obj.tanggalPengujianPertama || obj.tanggalRiksaUjiTerakhir || obj.createdAt).slice(0, 10),
      fileLHU: obj.fileLHU ? resolveFileUrl(obj.fileLHU) : null,
      namaFileLHU: obj.fileLHU ? 'LHU-Dokumen.pdf' : null,
      noSILO: obj.noSuket || 'SILO-01/AWAL',
      tanggalTerbitSILO: (obj.tanggalRiksaUjiTerakhir || obj.createdAt).slice(0, 10),
      tanggalExpiredSILO: (obj.tanggalBerlaku || '').slice(0, 10),
      fileSILO: obj.sertifikat ? resolveFileUrl(obj.sertifikat) : null,
      namaFileSILO: obj.sertifikat ? 'SILO-Sertifikat.pdf' : null,
      statusKelayakan: obj.statusKelayakan || 'LAYAK',
      lembagaPenguji: 'PJK3 Kemnaker RI',
      catatan: obj.catatan || 'Data riksa uji awal tercatat',
      createdAt: obj.createdAt || new Date().toISOString(),
    });
  }

  if (seeds.length > 0) {
    localStorage.setItem(key, JSON.stringify(seeds));
  }
  return seeds;
}

export function saveRiksaUji(
  objekK3Id: string,
  entry: Omit<RiwayatRiksaUji, 'id' | 'objekK3Id' | 'createdAt'>,
): RiwayatRiksaUji {
  if (typeof window === 'undefined') throw new Error('No window');
  const key = `${RIKSA_UJI_PREFIX}${objekK3Id}`;
  let list: RiwayatRiksaUji[] = [];
  try {
    const raw = localStorage.getItem(key);
    if (raw) list = JSON.parse(raw);
  } catch (_) {}

  const newRecord: RiwayatRiksaUji = {
    ...entry,
    id: `ru-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    objekK3Id,
    createdAt: new Date().toISOString(),
  };

  list.unshift(newRecord);
  localStorage.setItem(key, JSON.stringify(list));
  return newRecord;
}

export function updateRiksaUji(
  objekK3Id: string,
  recordId: string,
  updates: Partial<Omit<RiwayatRiksaUji, 'id' | 'objekK3Id' | 'createdAt'>>,
): RiwayatRiksaUji | null {
  if (typeof window === 'undefined') return null;
  const key = `${RIKSA_UJI_PREFIX}${objekK3Id}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const list: RiwayatRiksaUji[] = JSON.parse(raw);
    const idx = list.findIndex((r) => r.id === recordId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem(key, JSON.stringify(list));
      return list[idx];
    }
  } catch (_) {}
  return null;
}

export function deleteRiksaUji(objekK3Id: string, recordId: string): void {
  if (typeof window === 'undefined') return;
  const key = `${RIKSA_UJI_PREFIX}${objekK3Id}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const list: RiwayatRiksaUji[] = JSON.parse(raw);
    const filtered = list.filter((r) => r.id !== recordId);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (_) {}
}

// ── MAINTENANCE STORAGE ──────────────────────────────────────────────────────

export function getMaintenanceList(obj: ObjekK3): RiwayatMaintenance[] {
  if (typeof window === 'undefined') return [];
  const key = `${MAINTENANCE_PREFIX}${obj.id}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      const parsed: RiwayatMaintenance[] = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort(
          (a, b) => new Date(b.tanggalRencana).getTime() - new Date(a.tanggalRencana).getTime(),
        );
      }
    } catch (_) {}
  }

  // Initial seed dummy if brand new to show realistic format
  const initialSeeds: RiwayatMaintenance[] = [];
  if (obj.jadwalRiksaUji) {
    initialSeeds.push({
      id: `maint-init-${obj.id}`,
      objekK3Id: obj.id,
      tanggalRencana: obj.jadwalRiksaUji.slice(0, 10),
      tanggalAktual: null,
      status: 'RENCANA',
      rincian: 'Pemeriksaan rutin berkala & inspeksi kelayakan fisik peralatan',
      pelaksana: 'Tim Maintenance Internal',
      fileBukti: null,
      namaFileBukti: null,
      catatan: 'Jadwal pemeliharaan preventif',
      createdAt: obj.createdAt || new Date().toISOString(),
    });
    localStorage.setItem(key, JSON.stringify(initialSeeds));
  }
  return initialSeeds;
}

export function saveMaintenance(
  objekK3Id: string,
  entry: Omit<RiwayatMaintenance, 'id' | 'objekK3Id' | 'createdAt'>,
): RiwayatMaintenance {
  if (typeof window === 'undefined') throw new Error('No window');
  const key = `${MAINTENANCE_PREFIX}${objekK3Id}`;
  let list: RiwayatMaintenance[] = [];
  try {
    const raw = localStorage.getItem(key);
    if (raw) list = JSON.parse(raw);
  } catch (_) {}

  const newRecord: RiwayatMaintenance = {
    ...entry,
    id: `maint-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    objekK3Id,
    createdAt: new Date().toISOString(),
  };

  list.unshift(newRecord);
  localStorage.setItem(key, JSON.stringify(list));
  return newRecord;
}

export function updateMaintenanceStatus(
  objekK3Id: string,
  recordId: string,
  status: RiwayatMaintenance['status'],
  tanggalAktual?: string,
): void {
  if (typeof window === 'undefined') return;
  const key = `${MAINTENANCE_PREFIX}${objekK3Id}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const list: RiwayatMaintenance[] = JSON.parse(raw);
    const idx = list.findIndex((m) => m.id === recordId);
    if (idx !== -1) {
      list[idx].status = status;
      if (tanggalAktual) list[idx].tanggalAktual = tanggalAktual;
      else if (status === 'SELESAI' && !list[idx].tanggalAktual) {
        list[idx].tanggalAktual = new Date().toISOString().slice(0, 10);
      }
      localStorage.setItem(key, JSON.stringify(list));
    }
  } catch (_) {}
}

export function updateMaintenance(
  objekK3Id: string,
  recordId: string,
  updates: Partial<Omit<RiwayatMaintenance, 'id' | 'objekK3Id' | 'createdAt'>>,
): RiwayatMaintenance | null {
  if (typeof window === 'undefined') return null;
  const key = `${MAINTENANCE_PREFIX}${objekK3Id}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const list: RiwayatMaintenance[] = JSON.parse(raw);
    const idx = list.findIndex((m) => m.id === recordId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem(key, JSON.stringify(list));
      return list[idx];
    }
  } catch (_) {}
  return null;
}

export function deleteMaintenance(objekK3Id: string, recordId: string): void {
  if (typeof window === 'undefined') return;
  const key = `${MAINTENANCE_PREFIX}${objekK3Id}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const list: RiwayatMaintenance[] = JSON.parse(raw);
    const filtered = list.filter((m) => m.id !== recordId);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (_) {}
}
