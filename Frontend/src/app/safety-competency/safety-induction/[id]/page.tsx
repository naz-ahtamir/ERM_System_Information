'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  inductionApi,
  InductionSession,
  InductionParticipant,
  InductionMedia,
  AddParticipantPayload,
  StatusHadir,
  SessionStatus,
  SESSION_STATUS_LABELS,
  STATUS_HADIR_LABELS,
  TIPE_LABELS,
  getQRCodeUrl,
  getScanPageUrl,
  getVerifyCardUrl,
  resolveFileUrl,
  MediaType,
} from '@/lib/inductionApi';

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
function formatDateTime(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Add Participant Modal ──────────────────────────────────────────────────

interface AddParticipantModalProps {
  sessionId: string;
  kodeSesi: string;
  isOpen: boolean;
  onClose: () => void;
  onAdded: (p: InductionParticipant) => void;
}

function AddParticipantModal({ sessionId, kodeSesi, isOpen, onClose, onAdded }: AddParticipantModalProps) {
  const [form, setForm] = useState<AddParticipantPayload>({
    nama: '', perusahaan: '', identitas: '', noTelp: '', email: '', jabatan: '',
    jenisKelamin: '', tipe: 'KONTRAKTOR', scanMethod: 'MANUAL',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dupWarning, setDupWarning] = useState<(InductionParticipant & { session?: Pick<InductionSession, 'id' | 'kodeSesi' | 'tanggal' | 'lokasi'> }) | null>(null);
  const [checkingDup, setCheckingDup] = useState(false);

  if (!isOpen) return null;

  const set = (k: keyof AddParticipantPayload, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleIdentitasBlur = async () => {
    if (!form.identitas?.trim()) { setDupWarning(null); return; }
    setCheckingDup(true);
    try {
      const dup = await inductionApi.checkDuplicate(form.identitas.trim());
      setDupWarning(dup);
    } catch { /* ignore */ }
    finally { setCheckingDup(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim()) { setError('Nama wajib diisi'); return; }
    setSaving(true); setError('');
    try {
      const p = await inductionApi.addParticipant(sessionId, form);
      onAdded(p);
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Gagal menambahkan peserta');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0db] flex-shrink-0">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#f15a22] mb-0.5">Sesi {kodeSesi}</p>
            <h2 className="font-bold text-[15px] text-[#231f20]">Tambah Peserta</h2>
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-3 overflow-y-auto flex-1">
          {error && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700">{error}</div>}

          {/* Duplikat warning */}
          {dupWarning && (
            <div className="px-3 py-2.5 bg-yellow-50 border border-yellow-300 rounded-xl text-[12px] text-yellow-800">
              <p className="font-bold mb-1">⚠️ Peserta pernah induksi sebelumnya</p>
              <p>Sesi: <strong>{dupWarning.session?.kodeSesi}</strong> — {formatDate(dupWarning.session?.tanggal)}</p>
              <p>Status: <strong>{dupWarning.statusHadir}</strong> | Kartu: {dupWarning.cardCode ?? '—'}</p>
              <p className="mt-1 text-[11px] text-yellow-700">Data peserta akan diisi ulang dari awal untuk sesi ini.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">Nama Lengkap *</label>
              <input type="text" value={form.nama} onChange={(e) => set('nama', e.target.value)} required
                placeholder="Nama peserta"
                className="w-full px-3 py-2 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20" />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">Jenis Peserta</label>
              <select value={form.tipe} onChange={(e) => set('tipe', e.target.value)}
                className="w-full appearance-none px-3 py-2 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] bg-white">
                {Object.entries(TIPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">Jenis Kelamin</label>
              <select value={form.jenisKelamin} onChange={(e) => set('jenisKelamin', e.target.value)}
                className="w-full appearance-none px-3 py-2 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] bg-white">
                <option value="">— Pilih —</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">
                No. Identitas (NIK/KTP/Paspor)
                {checkingDup && <span className="ml-2 text-[10px] text-[#a09b96] font-normal">Memeriksa duplikat...</span>}
              </label>
              <input type="text" value={form.identitas} onChange={(e) => set('identitas', e.target.value)}
                onBlur={handleIdentitasBlur} placeholder="3271xxxxxxxxxxxx"
                className="w-full px-3 py-2 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20" />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">Perusahaan</label>
              <input type="text" value={form.perusahaan} onChange={(e) => set('perusahaan', e.target.value)}
                placeholder="PT. Contoh"
                className="w-full px-3 py-2 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22]" />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">Jabatan</label>
              <input type="text" value={form.jabatan} onChange={(e) => set('jabatan', e.target.value)}
                placeholder="Jabatan / Posisi"
                className="w-full px-3 py-2 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22]" />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">No. Telepon</label>
              <input type="text" value={form.noTelp} onChange={(e) => set('noTelp', e.target.value)}
                placeholder="08xx"
                className="w-full px-3 py-2 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22]" />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                placeholder="email@contoh.com"
                className="w-full px-3 py-2 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22]" />
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e0db] flex-shrink-0">
          <button type="button" onClick={onClose} disabled={saving}
            className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors">
            Batal
          </button>
          <button onClick={handleSubmit as any} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-[#f15a22] rounded-xl hover:bg-[#d44d1a] transition-colors disabled:opacity-60">
            {saving ? 'Menyimpan...' : 'Tambah Peserta'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Induction Card Generator ──────────────────────────────────────────────

function generateCardHTML(p: InductionParticipant, session: InductionSession): string {
  const scanUrl = getScanPageUrl(session.kodeSesi);
  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/safety-competency/safety-induction/verify/${p.cardCode}`;
  const qrUrl = getQRCodeUrl(verifyUrl, 120);

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<title>Kartu Induksi — ${p.nama}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; background: #f1f0ee; display: flex; justify-content: center; align-items: flex-start; padding: 24px; min-height: 100vh; }
  .card { width: 360px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.15); }
  .header { background: #231f20; padding: 16px 20px; display: flex; align-items: center; gap: 12px; }
  .logo-circle { width: 40px; height: 40px; border-radius: 50%; background: #f15a22; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .header-text h2 { color: white; font-size: 14px; font-weight: 700; }
  .header-text p { color: #8a8580; font-size: 10px; }
  .banner { background: #f15a22; padding: 8px 20px; }
  .banner p { color: white; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; }
  .body { padding: 20px; }
  .nama { font-size: 20px; font-weight: 800; color: #231f20; margin-bottom: 2px; }
  .perusahaan { font-size: 13px; color: #6b6560; margin-bottom: 14px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
  .field label { display: block; font-size: 9px; font-weight: 700; color: #a09b96; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 2px; }
  .field p { font-size: 12px; color: #231f20; font-weight: 600; }
  .code-box { background: #faf9f7; border: 1px solid #e5e0db; border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 14px; }
  .code-text { font-family: monospace; font-size: 13px; font-weight: 700; color: #f15a22; letter-spacing: .05em; }
  .qr-section { display: flex; flex-direction: column; align-items: center; gap: 6px; padding-top: 14px; border-top: 1px solid #e5e0db; }
  .qr-section img { width: 100px; height: 100px; border-radius: 6px; }
  .qr-section p { font-size: 10px; color: #a09b96; text-align: center; }
  .footer { background: #faf9f7; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; }
  .footer p { font-size: 10px; color: #a09b96; }
  .valid-badge { background: #dcfce7; color: #15803d; padding: 3px 10px; border-radius: 99px; font-size: 10px; font-weight: 700; }
  @media print { body { padding: 0; background: white; } .card { box-shadow: none; width: 100%; max-width: 360px; } }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="logo-circle">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    </div>
    <div class="header-text">
      <h2>SMK3 Safety System</h2>
      <p>Kartu Induksi K3</p>
    </div>
  </div>

  <div class="banner"><p>✓ Telah Mengikuti Safety Induction</p></div>

  <div class="body">
    <p class="nama">${p.nama}</p>
    <p class="perusahaan">${p.perusahaan ?? 'Tanpa Perusahaan'} · ${TIPE_LABELS[p.tipe] ?? p.tipe}</p>

    <div class="grid">
      <div class="field">
        <label>Jabatan</label>
        <p>${p.jabatan ?? '—'}</p>
      </div>
      <div class="field">
        <label>Tgl Induksi</label>
        <p>${formatDate(p.scanTime ?? p.cardIssuedAt)}</p>
      </div>
      <div class="field">
        <label>Lokasi</label>
        <p>${session.lokasi}</p>
      </div>
      <div class="field">
        <label>Topik</label>
        <p>${session.topik ?? '—'}</p>
      </div>
    </div>

    <div class="code-box">
      <div>
        <p style="font-size:9px;color:#a09b96;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px;">Kode Kartu</p>
        <p class="code-text">${p.cardCode ?? '—'}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c5c0bb" stroke-width="2">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    </div>

    <div class="qr-section">
      <img src="${qrUrl}" alt="QR Verifikasi" />
      <p>Scan untuk verifikasi kartu induksi ini</p>
    </div>
  </div>

  <div class="footer">
    <p>Sesi: ${session.kodeSesi}</p>
    <span class="valid-badge">VALID</span>
  </div>
</div>
</body>
</html>`;
}

function downloadCard(p: InductionParticipant, session: InductionSession) {
  const html = generateCardHTML(p, session);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Kartu_Induksi_${p.nama.replace(/\s+/g, '_')}_${session.kodeSesi}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Upload Media Modal ────────────────────────────────────────────────────

function UploadMediaModal({
  sessionId, isOpen, onClose, onUploaded,
}: {
  sessionId: string; isOpen: boolean; onClose: () => void;
  onUploaded: (m: InductionMedia) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<MediaType>('FOTO_KEGIATAN');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!file) { setError('Pilih file terlebih dahulu'); return; }
    setUploading(true); setError('');
    try {
      const m = await inductionApi.uploadMedia(sessionId, file, type);
      onUploaded(m); onClose();
    } catch (err: any) {
      setError(err.message ?? 'Upload gagal');
    } finally { setUploading(false); }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0db]">
          <h2 className="font-bold text-[15px] text-[#231f20]">Upload Dokumentasi</h2>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700">{error}</div>}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">Jenis Dokumen</label>
            <select value={type} onChange={(e) => setType(e.target.value as MediaType)}
              className="w-full appearance-none px-3 py-2 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] bg-white">
              <option value="FOTO_KEGIATAN">Foto Kegiatan</option>
              <option value="FOTO_ABSENSI">Foto Absensi</option>
              <option value="MATERI">Materi Induction</option>
              <option value="DOKUMEN">Dokumen Lainnya</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">File</label>
            <input type="file" accept="image/*,.pdf,.doc,.docx,.ppt,.pptx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-[13px] border border-[#c5c0bb] rounded-xl px-3 py-2 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-[#f1f0ee] file:text-[#231f20]" />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e5e0db]">
          <button onClick={onClose} disabled={uploading} className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db]">Batal</button>
          <button onClick={handleUpload} disabled={uploading}
            className="px-5 py-2 text-[13px] font-semibold text-white bg-[#f15a22] rounded-xl hover:bg-[#d44d1a] disabled:opacity-60">
            {uploading ? 'Mengupload...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Detail Page ──────────────────────────────────────────────────────

export default function InductionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'supervisor';

  const [session, setSession] = useState<InductionSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'peserta' | 'media' | 'info'>('peserta');
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showUploadMedia, setShowUploadMedia] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setIsLoading(true); setError('');
    try {
      const data = await inductionApi.getSession(id);
      setSession(data);
    } catch (e: any) {
      setError(e.message ?? 'Gagal memuat sesi');
    } finally { setIsLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleChangeStatus = async (newStatus: string) => {
    if (!session) return;
    setSavingStatus(true);
    try {
      await inductionApi.updateSession(session.id, { status: newStatus });
      // Re-fetch to get fresh data instead of manual state merge
      const refreshed = await inductionApi.getSession(session.id);
      setSession(refreshed);
    } catch (e: any) {
      setError(e.message ?? 'Gagal update status');
    } finally { setSavingStatus(false); }
  };

  const handleRemoveParticipant = async (pid: string) => {
    if (!confirm('Hapus peserta ini?')) return;
    await inductionApi.removeParticipant(pid);
    setSession((prev) => prev ? {
      ...prev,
      participants: prev.participants?.filter((p) => p.id !== pid),
    } : prev);
  };

  const handleRemoveMedia = async (mid: string) => {
    if (!confirm('Hapus dokumen ini?')) return;
    await inductionApi.removeMedia(mid);
    setSession((prev) => prev ? {
      ...prev, media: prev.media?.filter((m) => m.id !== mid),
    } : prev);
  };

  const handleUpdateStatus = async (pid: string, statusHadir: StatusHadir) => {
    const updated = await inductionApi.updateParticipantStatus(pid, statusHadir);
    setSession((prev) => prev ? {
      ...prev,
      participants: prev.participants?.map((p) => p.id === pid ? { ...p, statusHadir: updated.statusHadir } : p),
    } : prev);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f1f0ee] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#f15a22] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#f1f0ee] flex flex-col items-center justify-center gap-3">
        <p className="text-[14px] text-[#231f20] font-semibold">{error || 'Sesi tidak ditemukan'}</p>
        <button onClick={() => router.back()} className="text-[#f15a22] text-[13px] hover:underline">← Kembali</button>
      </div>
    );
  }

  const sl = SESSION_STATUS_LABELS[session.status];
  const participants = session.participants ?? [];
  const media = session.media ?? [];
  const scanUrl = getScanPageUrl(session.kodeSesi);
  const qrUrl = getQRCodeUrl(scanUrl, 160);

  const hadirCount = participants.filter((p) => p.statusHadir === 'HADIR').length;

  return (
    <div className="min-h-screen bg-[#f1f0ee]">
      {/* ── Dark Header ── */}
      <div className="bg-[#231f20] px-6 md:px-10 py-6 border-b-[3px] border-b-[#f15a22]">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => router.push('/safety-competency/safety-induction')}
            className="flex items-center gap-1.5 text-[#8a8580] hover:text-white text-[12px] mb-3 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Safety Induction
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-1">{session.kodeSesi}</p>
              <h1 className="font-bold text-white text-[clamp(18px,3vw,30px)] leading-tight">
                {session.topik || session.lokasi}
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${sl.bg} ${sl.text}`}>{sl.label}</span>
                <span className="text-[#8a8580] text-[12px]">{formatDate(session.tanggal)}</span>
                <span className="text-[#8a8580] text-[12px]">📍 {session.lokasi}</span>
              </div>
            </div>

            {/* Status changer + QR + Delete */}
            <div className="flex items-center gap-2 flex-wrap">
              {isAdmin && (
                <>
                  <select
                    value={session.status}
                    onChange={(e) => handleChangeStatus(e.target.value)}
                    disabled={savingStatus}
                    className="appearance-none px-3 py-2 text-[12px] font-semibold bg-white/10 text-white border border-white/20 rounded-xl focus:outline-none hover:bg-white/20 transition-colors"
                  >
                    <option value="INPG">Berlangsung</option>
                    <option value="CLSD">Selesai</option>
                  </select>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus sesi "${session.kodeSesi}"?\n\nSemua data peserta dan dokumen akan ikut terhapus.`)) {
                        inductionApi.deleteSession(session.id)
                          .then(() => router.push('/safety-competency/safety-induction'))
                          .catch((e) => alert(`Gagal menghapus: ${e.message}`));
                      }
                    }}
                    className="px-3 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-colors"
                    title="Hapus Sesi"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </>
              )}
              <a href={qrUrl} download={`QR-${session.kodeSesi}.png`}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-[12px] font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                QR Code
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="bg-white border-b border-[#e5e0db]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-4 flex items-center gap-6 overflow-x-auto">
          <div className="text-center flex-shrink-0">
            <p className="text-[22px] font-bold text-[#f15a22]">{participants.length}</p>
            <p className="text-[10px] text-[#6b6560] uppercase tracking-wide">Total Peserta</p>
          </div>
          <div className="w-px h-8 bg-[#e5e0db]" />
          <div className="text-center flex-shrink-0">
            <p className="text-[22px] font-bold text-green-600">{hadirCount}</p>
            <p className="text-[10px] text-[#6b6560] uppercase tracking-wide">Hadir</p>
          </div>
          <div className="w-px h-8 bg-[#e5e0db]" />
          <div className="text-center flex-shrink-0">
            <p className="text-[22px] font-bold text-[#231f20]">{media.length}</p>
            <p className="text-[10px] text-[#6b6560] uppercase tracking-wide">Dokumen</p>
          </div>
          {session.pic && (
            <>
              <div className="w-px h-8 bg-[#e5e0db]" />
              <div className="flex-shrink-0">
                <p className="text-[10px] text-[#a09b96] uppercase tracking-wide">PIC</p>
                <p className="text-[13px] font-semibold text-[#231f20]">{session.pic.nama}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-white rounded-xl border border-[#e5e0db] p-1 w-fit">
          {(['peserta', 'media', 'info'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-[13px] font-semibold rounded-lg transition-colors capitalize ${
                tab === t ? 'bg-[#231f20] text-white' : 'text-[#6b6560] hover:text-[#231f20]'
              }`}>
              {t === 'peserta' ? `Peserta (${participants.length})` : t === 'media' ? `Media (${media.length})` : 'Info Sesi'}
            </button>
          ))}
        </div>

        {/* ── Tab: Peserta ── */}
        {tab === 'peserta' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] text-[#6b6560]">{participants.length} peserta terdaftar</p>
              {isAdmin && (
                <button onClick={() => setShowAddParticipant(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Tambah Peserta
                </button>
              )}
            </div>

            {participants.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e5e0db] p-12 text-center">
                <p className="text-[#6b6560] text-[14px]">Belum ada peserta</p>
                <p className="text-[12px] text-[#a09b96] mt-1">
                  {session.status === 'ACTIVE' ? 'Peserta bisa scan QR untuk daftar' : 'Aktifkan sesi lalu bagikan QR Code'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#e5e0db] overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-[#faf9f7] border-b border-[#e5e0db]">
                      <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide w-8">#</th>
                      <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide">Nama</th>
                      <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide hidden md:table-cell">Perusahaan</th>
                      <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide hidden lg:table-cell">Tipe</th>
                      <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide">Status</th>
                      <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide hidden md:table-cell">Waktu Scan</th>
                      <th className="text-right py-3 px-4 text-[11px] font-semibold text-[#6b6560] uppercase tracking-wide">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f0ee]">
                    {participants.map((p, idx) => {
                      const sh = STATUS_HADIR_LABELS[p.statusHadir] ?? STATUS_HADIR_LABELS.REGISTERED;
                      return (
                        <tr key={p.id} className="hover:bg-[#faf9f7] transition-colors">
                          <td className="py-3 px-4 text-[#a09b96]">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-[#231f20]">{p.nama}</p>
                            {p.jabatan && <p className="text-[11px] text-[#a09b96]">{p.jabatan}</p>}
                            {p.cardCode && <p className="text-[10px] font-mono text-[#f15a22] mt-0.5">{p.cardCode}</p>}
                          </td>
                          <td className="py-3 px-4 text-[#6b6560] hidden md:table-cell">{p.perusahaan ?? '—'}</td>
                          <td className="py-3 px-4 hidden lg:table-cell">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f1f0ee] text-[#6b6560]">
                              {TIPE_LABELS[p.tipe] ?? p.tipe}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {isAdmin ? (
                              <select value={p.statusHadir}
                                onChange={(e) => handleUpdateStatus(p.id, e.target.value as StatusHadir)}
                                className={`appearance-none text-[11px] font-bold px-2 py-0.5 rounded-lg border-0 focus:outline-none cursor-pointer ${sh.color} bg-transparent`}>
                                {Object.entries(STATUS_HADIR_LABELS).map(([v, info]) => (
                                  <option key={v} value={v}>{info.label}</option>
                                ))}
                              </select>
                            ) : (
                              <span className={`text-[11px] font-semibold ${sh.color}`}>{sh.label}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-[#6b6560] text-[11px] hidden md:table-cell">
                            {formatDateTime(p.scanTime)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-1">
                              {/* Download Kartu */}
                              <button onClick={() => downloadCard(p, session)}
                                title="Download Kartu Induksi"
                                className="p-1.5 text-[#6b6560] hover:text-[#f15a22] hover:bg-[#f1f0ee] rounded-lg transition-colors">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                              </button>
                              {/* Hapus */}
                              {isAdmin && (
                                <button onClick={() => handleRemoveParticipant(p.id)}
                                  title="Hapus peserta"
                                  className="p-1.5 text-[#6b6560] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                    <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Media ── */}
        {tab === 'media' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] text-[#6b6560]">{media.length} dokumen</p>
              {isAdmin && (
                <button onClick={() => setShowUploadMedia(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Upload Dokumen
                </button>
              )}
            </div>

            {media.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e5e0db] p-12 text-center">
                <p className="text-[#6b6560] text-[14px]">Belum ada dokumen</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {media.map((m) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(m.fileName ?? m.fileUrl);
                  const fullUrl = resolveFileUrl(m.fileUrl);
                  return (
                    <div key={m.id} className="bg-white rounded-2xl border border-[#e5e0db] overflow-hidden">
                      {isImage ? (
                        <a href={fullUrl} target="_blank" rel="noreferrer">
                          <img src={fullUrl} alt={m.fileName ?? 'media'} className="w-full h-40 object-cover" />
                        </a>
                      ) : (
                        <div className="h-40 bg-[#faf9f7] flex items-center justify-center">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c5c0bb" strokeWidth="1.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </div>
                      )}
                      <div className="p-3 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-[#231f20] truncate">{m.fileName ?? 'File'}</p>
                          <p className="text-[10px] text-[#a09b96]">{m.type} · {formatDate(m.uploadedAt)}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <a href={fullUrl} target="_blank" rel="noreferrer"
                            className="p-1.5 text-[#6b6560] hover:text-[#f15a22] hover:bg-[#f1f0ee] rounded-lg transition-colors">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                          </a>
                          {isAdmin && (
                            <button onClick={() => handleRemoveMedia(m.id)}
                              className="p-1.5 text-[#6b6560] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Info ── */}
        {tab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Info Sesi */}
            <div className="bg-white rounded-2xl border border-[#e5e0db] p-5 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">Detail Sesi</p>
              {[
                { label: 'Kode Sesi', value: session.kodeSesi },
                { label: 'Tanggal', value: formatDate(session.tanggal) },
                { label: 'Lokasi', value: session.lokasi },
                { label: 'Topik', value: session.topik ?? '—' },
                { label: 'Deskripsi', value: session.deskripsi ?? '—' },
                { label: 'PIC', value: session.pic?.nama ?? '—' },
                { label: 'Status', value: sl.label },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-3 text-[13px]">
                  <span className="text-[#a09b96] flex-shrink-0">{label}</span>
                  <span className="font-semibold text-[#231f20] text-right">{value}</span>
                </div>
              ))}
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-2xl border border-[#e5e0db] p-5 flex flex-col items-center gap-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">QR Code Registrasi</p>
              <img src={qrUrl} alt="QR Code" className="w-44 h-44 rounded-xl border border-[#e5e0db]" />
              <p className="text-[11px] text-[#6b6560] text-center">Peserta scan QR ini untuk registrasi kehadiran</p>
              <div className="w-full px-3 py-2 bg-[#faf9f7] rounded-xl border border-[#e5e0db]">
                <p className="text-[10px] text-[#a09b96] mb-0.5">URL</p>
                <p className="text-[11px] font-mono text-[#231f20] break-all">{scanUrl}</p>
              </div>
              <a href={qrUrl} download={`QR-${session.kodeSesi}.png`}
                className="flex items-center gap-2 px-5 py-2 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors">
                Download QR
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddParticipantModal
        sessionId={session.id}
        kodeSesi={session.kodeSesi}
        isOpen={showAddParticipant}
        onClose={() => setShowAddParticipant(false)}
        onAdded={(p) => setSession((prev) => prev ? {
          ...prev, participants: [...(prev.participants ?? []), p],
        } : prev)}
      />

      <UploadMediaModal
        sessionId={session.id}
        isOpen={showUploadMedia}
        onClose={() => setShowUploadMedia(false)}
        onUploaded={(m) => setSession((prev) => prev ? {
          ...prev, media: [m, ...(prev.media ?? [])],
        } : prev)}
      />
    </div>
  );
}
