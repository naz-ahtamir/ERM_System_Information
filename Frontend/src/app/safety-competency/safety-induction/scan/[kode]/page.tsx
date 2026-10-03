'use client';

/**
 * Halaman publik — TIDAK membutuhkan login.
 * Diakses lewat scan QR Code sesi induction.
 * URL: /safety-competency/safety-induction/scan/[kode]
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  inductionPublicApi,
  InductionSession,
  InductionParticipant,
  AddParticipantPayload,
  TIPE_LABELS,
  getQRCodeUrl,
  getVerifyCardUrl,
} from '@/lib/inductionApi';

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Step types ─────────────────────────────────────────────────────────────

type Step = 'loading' | 'error' | 'form' | 'success' | 'inactive';

// ── Kartu Induksi Mini (tampil setelah register) ───────────────────────────

function InductionCardPreview({
  participant,
  session,
}: {
  participant: InductionParticipant;
  session: InductionSession;
}) {
  const verifyUrl = getVerifyCardUrl(participant.cardCode || '');
  const qrUrl = getQRCodeUrl(verifyUrl, 140);

  const handlePrint = () => window.print();

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Kartu */}
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#e5e0db] overflow-hidden shadow-lg print:shadow-none">
        {/* Header kartu */}
        <div className="bg-[#231f20] px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#f15a22] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <p className="text-white text-[13px] font-bold">SMK3 Safety System</p>
            <p className="text-[#8a8580] text-[10px]">Kartu Induksi K3</p>
          </div>
        </div>

        <div className="bg-[#f15a22] px-5 py-1.5">
          <p className="text-white text-[11px] font-bold uppercase tracking-wider">✓ Telah Mengikuti Safety Induction</p>
        </div>

        <div className="p-5">
          <p className="text-[20px] font-bold text-[#231f20] leading-tight">{participant.nama}</p>
          <p className="text-[12px] text-[#6b6560] mb-4">
            {participant.perusahaan ?? 'Tanpa Perusahaan'} · {TIPE_LABELS[participant.tipe] ?? participant.tipe}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4 text-[12px]">
            {[
              { l: 'Jabatan', v: participant.jabatan ?? '—' },
              { l: 'Tgl Induksi', v: formatDate(participant.scanTime ?? participant.cardIssuedAt) },
              { l: 'Lokasi', v: session.lokasi },
              { l: 'Topik', v: session.topik ?? '—' },
            ].map(({ l, v }) => (
              <div key={l}>
                <p className="text-[9px] font-bold uppercase tracking-wide text-[#a09b96] mb-0.5">{l}</p>
                <p className="font-semibold text-[#231f20]">{v}</p>
              </div>
            ))}
          </div>

          {/* Kode kartu */}
          <div className="flex items-center justify-between bg-[#faf9f7] rounded-xl border border-[#e5e0db] px-3 py-2.5 mb-4">
            <div>
              <p className="text-[9px] font-bold text-[#a09b96] uppercase tracking-wide mb-0.5">Kode Kartu</p>
              <p className="font-mono text-[#f15a22] font-bold text-[13px] tracking-wider">{participant.cardCode}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c5c0bb" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>

          {/* QR verifikasi */}
          <div className="flex flex-col items-center gap-2 pt-3 border-t border-[#e5e0db]">
            <img src={qrUrl} alt="QR Verifikasi" className="w-28 h-28 rounded-lg border border-[#e5e0db]" />
            <p className="text-[10px] text-[#a09b96] text-center">Scan untuk verifikasi kartu</p>
          </div>
        </div>

        <div className="bg-[#faf9f7] px-5 py-2.5 flex justify-between items-center">
          <p className="text-[10px] text-[#a09b96]">Sesi: {session.kodeSesi}</p>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">VALID</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 w-full max-w-sm no-print">
        <button onClick={handlePrint}
          className="flex items-center justify-center gap-2 py-3 text-[14px] font-semibold text-white bg-[#231f20] rounded-xl hover:bg-[#3d3838] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"/>
            <path d="M9 21h6a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1z"/>
          </svg>
          Cetak / Save PDF
        </button>
        <p className="text-center text-[11px] text-[#a09b96]">Simpan kartu ini sebagai bukti telah mengikuti safety induction</p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function ScanInductionPage() {
  const { kode } = useParams<{ kode: string }>();

  const [step, setStep] = useState<Step>('loading');
  const [session, setSession] = useState<InductionSession | null>(null);
  const [result, setResult] = useState<InductionParticipant | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState<AddParticipantPayload>({
    nama: '', perusahaan: '', identitas: '', noTelp: '', email: '',
    jabatan: '', jenisKelamin: '', tipe: 'KONTRAKTOR', scanMethod: 'QR',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Load session
  useEffect(() => {
    if (!kode) return;
    inductionPublicApi.getSession(kode)
      .then((s) => {
        setSession(s);
        if (s.status !== 'INPG') { setStep('inactive'); return; }
        setStep('form');
      })
      .catch((e) => {
        setErrorMsg(e.message ?? 'Sesi tidak ditemukan');
        setStep('error');
      });
  }, [kode]);

  const set = (k: keyof AddParticipantPayload, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim()) { setFormError('Nama wajib diisi'); return; }
    if (!kode) return;
    setSubmitting(true); setFormError('');
    try {
      const p = await inductionPublicApi.register(kode, form);
      setResult(p);
      setStep('success');
    } catch (err: any) {
      setFormError(err.message ?? 'Pendaftaran gagal');
    } finally { setSubmitting(false); }
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-[#f1f0ee] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#f15a22] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-[#f1f0ee] flex flex-col items-center justify-center p-6 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="#ef4444"/>
          </svg>
        </div>
        <p className="text-[16px] font-bold text-[#231f20]">Sesi Tidak Ditemukan</p>
        <p className="text-[13px] text-[#6b6560]">{errorMsg}</p>
        <p className="text-[11px] text-[#a09b96]">Kode: <span className="font-mono">{kode}</span></p>
      </div>
    );
  }

  // ── Inactive ─────────────────────────────────────────────────────────────

  if (step === 'inactive' && session) {
    return (
      <div className="min-h-screen bg-[#f1f0ee] flex flex-col items-center justify-center p-6 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="#d97706"/>
          </svg>
        </div>
        <p className="text-[16px] font-bold text-[#231f20]">Sesi Sudah Selesai</p>
        <p className="text-[13px] text-[#6b6560]">
          Sesi <strong>{session.kodeSesi}</strong> saat ini berstatus <strong>{session.status}</strong>.
        </p>
        <p className="text-[12px] text-[#a09b96]">Registrasi hanya bisa dilakukan saat sesi berstatus <strong>INPG (Berlangsung)</strong>.</p>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────

  if (step === 'success' && result && session) {
    return (
      <div className="min-h-screen bg-[#f1f0ee]">
        {/* Header */}
        <div className="bg-[#231f20] px-6 py-5 border-b-[3px] border-[#f15a22] print:hidden">
          <div className="max-w-lg mx-auto">
            <p className="text-[11px] font-bold tracking-widest uppercase text-[#f15a22] mb-1">Safety Induction</p>
            <h1 className="font-bold text-white text-[20px]">Registrasi Berhasil! 🎉</h1>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-6 py-8">
          {/* Success notice */}
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-start gap-3 mb-6 no-print">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" className="flex-shrink-0 mt-0.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div>
              <p className="text-[13px] font-semibold text-green-800">Kehadiran Anda berhasil tercatat!</p>
              <p className="text-[12px] text-green-700 mt-0.5">
                Sesi <strong>{session.kodeSesi}</strong> · {formatDate(session.tanggal)}
              </p>
            </div>
          </div>

          <InductionCardPreview participant={result} session={session} />
        </div>

        <style>{`@media print { .no-print { display: none !important; } }`}</style>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f1f0ee]">
      {/* Header */}
      <div className="bg-[#231f20] px-6 py-5 border-b-[3px] border-[#f15a22]">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-[#f15a22] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#f15a22]">Safety Competency</p>
              <p className="text-white font-bold text-[15px]">Safety Induction</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6">
        {/* Session info card */}
        {session && (
          <div className="bg-white rounded-2xl border border-[#e5e0db] p-4 mb-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold text-[#f15a22] uppercase tracking-wide mb-0.5">{session.kodeSesi}</p>
                <p className="font-bold text-[15px] text-[#231f20]">{session.topik || session.lokasi}</p>
                <p className="text-[12px] text-[#6b6560] mt-0.5">{formatDate(session.tanggal)} · 📍 {session.lokasi}</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 flex-shrink-0">Aktif</span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl border border-[#e5e0db] overflow-hidden">
          <div className="bg-[#231f20] px-5 py-3">
            <p className="text-white font-bold text-[14px]">📋 Daftar Kehadiran</p>
            <p className="text-[#8a8580] text-[11px]">Isi form berikut untuk mencatat kehadiran Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-3">
            {formError && (
              <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700">{formError}</div>
            )}

            {/* Nama */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">Nama Lengkap *</label>
              <input type="text" value={form.nama} onChange={(e) => set('nama', e.target.value)} required
                placeholder="Masukkan nama lengkap Anda"
                className="w-full px-4 py-3 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 transition-colors" />
            </div>

            {/* Jenis Peserta */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">Status / Kategori *</label>
              <select value={form.tipe} onChange={(e) => set('tipe', e.target.value)}
                className="w-full appearance-none px-4 py-3 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] bg-white transition-colors">
                {Object.entries(TIPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            {/* Identitas */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">No. KTP / NIK / Paspor</label>
              <input type="text" value={form.identitas} onChange={(e) => set('identitas', e.target.value)}
                placeholder="Nomor identitas Anda"
                className="w-full px-4 py-3 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Perusahaan */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">Perusahaan</label>
                <input type="text" value={form.perusahaan} onChange={(e) => set('perusahaan', e.target.value)}
                  placeholder="PT. Contoh"
                  className="w-full px-3 py-2.5 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22]" />
              </div>

              {/* Jabatan */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">Jabatan</label>
                <input type="text" value={form.jabatan} onChange={(e) => set('jabatan', e.target.value)}
                  placeholder="Posisi / Jabatan"
                  className="w-full px-3 py-2.5 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22]" />
              </div>

              {/* No Telp */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">No. Telepon</label>
                <input type="tel" value={form.noTelp} onChange={(e) => set('noTelp', e.target.value)}
                  placeholder="08xx"
                  className="w-full px-3 py-2.5 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22]" />
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">Jenis Kelamin</label>
                <select value={form.jenisKelamin} onChange={(e) => set('jenisKelamin', e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 text-[13px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] bg-white">
                  <option value="">— Pilih —</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b6560] mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                placeholder="email@contoh.com"
                className="w-full px-4 py-3 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] transition-colors" />
            </div>

            <button type="submit" disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-[15px] font-bold text-white bg-[#f15a22] rounded-xl hover:bg-[#d44d1a] transition-colors disabled:opacity-60 mt-2">
              {submitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Mendaftarkan...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                  </svg>
                  Daftar Hadir
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-[#a09b96] mt-4">
          Data yang Anda berikan hanya digunakan untuk keperluan safety induction.
        </p>
      </div>
    </div>
  );
}
