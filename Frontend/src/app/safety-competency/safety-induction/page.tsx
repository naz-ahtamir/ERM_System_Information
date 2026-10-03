'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  inductionApi,
  InductionSession,
  CreateSessionPayload,
  SESSION_STATUS_LABELS,
  SessionStatus,
  getQRCodeUrl,
  getScanPageUrl,
} from '@/lib/inductionApi';

// ── Helpers ───────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ── Create Session Modal ──────────────────────────────────────────────────

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (s: InductionSession) => void;
}

function CreateSessionModal({ isOpen, onClose, onCreated }: CreateModalProps) {
  const [form, setForm] = useState<CreateSessionPayload>({
    tanggal: new Date().toISOString().slice(0, 10),
    lokasi: '',
    topik: '',
    deskripsi: '',
    status: 'INPG',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const set = (k: keyof CreateSessionPayload, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lokasi.trim()) { setError('Lokasi wajib diisi'); return; }
    setSaving(true); setError('');
    try {
      const session = await inductionApi.createSession(form);
      onCreated(session);
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Gagal membuat sesi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0db]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#f15a22] mb-0.5">Safety Induction</p>
            <h2 className="font-bold text-[15px] text-[#231f20]">Buat Sesi Baru</h2>
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">Tanggal *</label>
              <input
                type="date" value={form.tanggal} onChange={(e) => set('tanggal', e.target.value)} required
                className="w-full px-3 py-2 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">Status</label>
              <select
                value={form.status} onChange={(e) => set('status', e.target.value as SessionStatus)}
                className="w-full appearance-none px-3 py-2 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 bg-white"
              >
                <option value="INPG">Berlangsung</option>
                <option value="CLSD">Selesai</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">Lokasi *</label>
            <input
              type="text" value={form.lokasi} onChange={(e) => set('lokasi', e.target.value)}
              placeholder="cth: Gedung A, Ruang Training" required
              className="w-full px-3 py-2 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">Topik / Judul</label>
            <input
              type="text" value={form.topik} onChange={(e) => set('topik', e.target.value)}
              placeholder="cth: Safety Induction Karyawan Baru Juli 2026"
              className="w-full px-3 py-2 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">Deskripsi</label>
            <textarea
              value={form.deskripsi} onChange={(e) => set('deskripsi', e.target.value)}
              rows={2} placeholder="Keterangan tambahan (opsional)"
              className="w-full px-3 py-2 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={saving}
              className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors">
              Batal
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-[#f15a22] rounded-xl hover:bg-[#d44d1a] transition-colors disabled:opacity-60">
              {saving ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
              {saving ? 'Membuat...' : 'Buat Sesi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── QR Preview Modal ───────────────────────────────────────────────────────

function QRModal({ session, onClose }: { session: InductionSession; onClose: () => void }) {
  const scanUrl = getScanPageUrl(session.kodeSesi);
  const qrUrl = getQRCodeUrl(scanUrl, 280);

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center">
        <div className="px-6 py-4 border-b border-[#e5e0db] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#f15a22] uppercase tracking-wide">QR Code</p>
            <p className="font-bold text-[15px] text-[#231f20]">{session.kodeSesi}</p>
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-6 space-y-4">
          {/* QR Image */}
          <div className="flex justify-center">
            <img src={qrUrl} alt="QR Code" className="w-56 h-56 rounded-xl border border-[#e5e0db]" />
          </div>
          <p className="text-[12px] text-[#6b6560]">Peserta scan QR ini untuk daftar hadir</p>
          <div className="px-3 py-2 bg-[#faf9f7] rounded-xl border border-[#e5e0db] text-left">
            <p className="text-[10px] text-[#a09b96] mb-0.5">URL Scan</p>
            <p className="text-[11px] text-[#231f20] break-all font-mono">{scanUrl}</p>
          </div>
          <a
            href={qrUrl} download={`QR-${session.kodeSesi}.png`} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download QR
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Session Card ──────────────────────────────────────────────────────────

function SessionCard({
  session,
  onQR,
  onDetail,
  onDelete,
}: {
  session: InductionSession;
  onQR: (s: InductionSession) => void;
  onDetail: (s: InductionSession) => void;
  onDelete: (s: InductionSession) => void;
}) {
  const sl = SESSION_STATUS_LABELS[session.status] ?? SESSION_STATUS_LABELS.INPG;
  const count = session._count?.participants ?? session.participants?.length ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-[#e5e0db] shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Top accent */}
      <div className={`h-1 ${session.status === 'INPG' ? 'bg-green-500' : session.status === 'CLSD' ? 'bg-blue-500' : 'bg-[#c5c0bb]'}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#f15a22] uppercase tracking-wide mb-0.5">{session.kodeSesi}</p>
            <p className="font-bold text-[15px] text-[#231f20] truncate">{session.topik || session.lokasi}</p>
          </div>
          <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${sl.bg} ${sl.text}`}>
            {sl.label}
          </span>
        </div>

        {/* Meta */}
        <div className="space-y-1.5 text-[12px] text-[#6b6560] mb-4">
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>{formatDate(session.tanggal)}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="truncate">{session.lokasi}</span>
          </div>
          {session.pic && (
            <div className="flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span>PIC: {session.pic.nama}</span>
            </div>
          )}
        </div>

        {/* Stat */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-[#faf9f7] rounded-xl p-2.5 text-center border border-[#e5e0db]">
            <p className="text-[20px] font-bold text-[#f15a22]">{count}</p>
            <p className="text-[10px] text-[#6b6560]">Peserta</p>
          </div>
          <div className="flex-1 bg-[#faf9f7] rounded-xl p-2.5 text-center border border-[#e5e0db]">
            <p className="text-[20px] font-bold text-[#231f20]">{session._count?.media ?? 0}</p>
            <p className="text-[10px] text-[#6b6560]">Dokumen</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onDetail(session)}
            className="flex-1 py-2 text-[13px] font-semibold text-white bg-[#231f20] rounded-xl hover:bg-[#3d3838] transition-colors"
          >
            Detail
          </button>
          <button
            onClick={() => onQR(session)}
            className="px-3 py-2 text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors"
            title="Lihat QR Code"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
              <path d="M17 14v3M14 17h3M20 17h1M17 20v1"/>
            </svg>
          </button>
          <button
            onClick={() => onDelete(session)}
            className="px-3 py-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            title="Hapus Sesi"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function SafetyInductionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === 'admin' || user?.role === 'supervisor';

  const [sessions, setSessions] = useState<InductionSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<SessionStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [qrSession, setQrSession] = useState<InductionSession | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    setIsLoading(true); setError('');
    try {
      const data = await inductionApi.getSessions();
      setSessions(data);
    } catch (e: any) {
      setError(e.message ?? 'Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleDeleteSession = async (session: InductionSession) => {
    const participantCount = session._count?.participants ?? session.participants?.length ?? 0;
    const confirmMsg = participantCount > 0
      ? `Hapus sesi "${session.kodeSesi}"?\n\nSesi ini memiliki ${participantCount} peserta. Semua data peserta dan dokumen akan ikut terhapus.`
      : `Hapus sesi "${session.kodeSesi}"?`;
    
    if (!confirm(confirmMsg)) return;
    
    try {
      await inductionApi.deleteSession(session.id);
      setSessions((prev) => prev.filter((s) => s.id !== session.id));
    } catch (e: any) {
      alert(`Gagal menghapus sesi: ${e.message}`);
    }
  };

  const filtered = sessions.filter((s) => {
    if (filterStatus !== 'ALL' && s.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.kodeSesi.toLowerCase().includes(q) ||
        s.lokasi.toLowerCase().includes(q) ||
        (s.topik ?? '').toLowerCase().includes(q) ||
        (s.pic?.nama ?? '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statusCounts = {
    ALL: sessions.length,
    INPG: sessions.filter((s) => s.status === 'INPG').length,
    CLSD: sessions.filter((s) => s.status === 'CLSD').length,
  };

  return (
    <div className="min-h-screen bg-[#f1f0ee]">
      {/* ── Dark Header ── */}
      <div className="bg-[#231f20] px-6 md:px-10 py-8 border-b-[3px] border-b-[#f15a22]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-2">
            Safety Competency
          </p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-bold text-white text-[clamp(22px,4vw,38px)] leading-tight">
                Safety Induction
              </h1>
              <p className="text-[#8a8580] text-[13px] mt-1.5">
                Manajemen sesi induksi K3 untuk karyawan baru, kontraktor, tamu, dan supplier.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">

        {/* Toolbar Row 1: Search + Export + Buat Sesi */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a09b96]" width="15" height="15"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode sesi, lokasi, topik, PIC..."
              className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09b96] hover:text-[#231f20]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Export */}
          <button
            onClick={() => {
              const rows = filtered.map((s, i) => {
                const count = s._count?.participants ?? s.participants?.length ?? 0;
                const status = s.status === 'INPG' ? 'Berlangsung' : 'Selesai';
                return `<tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
                  <td>${i + 1}</td>
                  <td>${s.kodeSesi}</td>
                  <td>${s.topik || '—'}</td>
                  <td>${s.lokasi}</td>
                  <td>${new Date(s.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>${count}</td>
                  <td>${status}</td>
                  <td>${s.pic?.nama || '—'}</td>
                </tr>`;
              }).join('');
              const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Safety Induction</title>
              <style>
                body{font-family:Arial,sans-serif;font-size:11px;color:#1f2937;padding:16px}
                @media print{body{padding:4mm}.no-print{display:none!important}@page{margin:8mm;size:A4 landscape}}
                .header{background:#231f20;color:white;padding:14px 18px;margin-bottom:12px;border-radius:6px;display:flex;justify-content:space-between;align-items:center}
                .header h1{font-size:16px;margin:0 0 3px}.header p{font-size:10px;color:#9ca3af;margin:0}
                .print-btn{background:#f15a22;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;margin-bottom:12px}
                table{border-collapse:collapse;width:100%}
                th{background:#231f20;color:white;padding:8px 10px;text-align:left;font-size:11px;position:sticky;top:0}
                td{padding:7px 10px;border-bottom:1px solid #e5e7eb;vertical-align:middle}
              </style></head><body>
              <div class="header">
                <div><h1>Safety Induction — Rekap Sesi</h1><p>Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p></div>
                <div style="text-align:right"><p style="font-size:14px;font-weight:700;color:#f15a22">${filtered.length} Sesi</p><p>SMK3 Safety System</p></div>
              </div>
              <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
              <table>
                <thead><tr><th>#</th><th>Kode Sesi</th><th>Topik</th><th>Lokasi</th><th>Tanggal</th><th>Peserta</th><th>Status</th><th>PIC</th></tr></thead>
                <tbody>${rows}</tbody>
              </table></body></html>`;
              const w = window.open('', '_blank');
              if (w) { w.document.write(html); w.document.close(); }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#c5c0bb] text-[#231f20] text-[13px] font-semibold rounded-xl hover:border-green-400 hover:text-green-700 transition-colors whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>

          {/* Buat Sesi */}
          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors whitespace-nowrap"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Buat Sesi
            </button>
          )}
        </div>

        {/* Toolbar Row 2: Status chip buttons */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {([
            { value: 'ALL',  label: 'Semua',          count: statusCounts.ALL,  cls: 'bg-[#231f20] text-white border-[#231f20]',  off: 'bg-white border-[#e5e0db] text-[#6b6560] hover:border-[#c5c0bb]' },
            { value: 'INPG', label: '🟢 Berlangsung',  count: statusCounts.INPG, cls: 'bg-green-600 text-white border-green-600',   off: 'bg-white border-[#e5e0db] text-[#6b6560] hover:border-green-300' },
            { value: 'CLSD', label: '🔵 Selesai',      count: statusCounts.CLSD, cls: 'bg-blue-600 text-white border-blue-600',     off: 'bg-white border-[#e5e0db] text-[#6b6560] hover:border-blue-300' },
          ] as const).map((tab) => (
            <button key={tab.value} onClick={() => setFilterStatus(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors border ${filterStatus === tab.value ? tab.cls : tab.off}`}>
              {tab.label}
              {!isLoading && <span className="ml-1.5 opacity-70">({tab.count})</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e5e0db] h-52 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-[14px] font-semibold text-[#231f20] mb-2">{error}</p>
            <button onClick={fetchSessions} className="text-[13px] text-[#f15a22] hover:underline">Coba lagi</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#f1f0ee] flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c5c0bb" strokeWidth="1.5">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-semibold text-[#231f20] text-[14px] mb-1">
              {search || filterStatus !== 'ALL' ? 'Tidak ada hasil' : 'Belum ada sesi induction'}
            </p>
            <p className="text-[#6b6560] text-[13px]">
              {search || filterStatus !== 'ALL' ? 'Coba ubah filter' : 'Klik "Buat Sesi" untuk mulai'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                onQR={(sess) => setQrSession(sess)}
                onDetail={(sess) => router.push(`/safety-competency/safety-induction/${sess.id}`)}
                onDelete={handleDeleteSession}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateSessionModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(s) => {
          setSessions((prev) => [s, ...prev]);
          router.push(`/safety-competency/safety-induction/${s.id}`);
        }}
      />

      {qrSession && (
        <QRModal session={qrSession} onClose={() => setQrSession(null)} />
      )}
    </div>
  );
}
