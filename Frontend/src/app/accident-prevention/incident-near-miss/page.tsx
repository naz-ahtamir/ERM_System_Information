"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  investigationApi,
  type Investigation,
  type InvestigationStatus,
  type JenisKecelakaan,
} from "@/lib/api";

// ── Constants ─────────────────────────────────────────────────────────────────

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:3001";

const JENIS_LABELS: Record<JenisKecelakaan, string> = {
  LUKA_RINGAN: "Luka Ringan",
  LUKA_BERAT:  "Luka Berat",
  MENINGGAL:   "Meninggal",
  KERUSAKAN:   "Kerusakan Properti",
  NEAR_MISS:   "Near Miss",
};

const STATUS_LABELS: Record<InvestigationStatus, string> = {
  DRAFT:               "Draft",
  UNDER_INVESTIGATION: "Investigasi",
  PENDING_APPROVAL:    "Menunggu Approval",
  APPROVED:            "Disetujui",
  VICTIM_SIGNED:       "TTD Korban",
  COMPLETED:           "Selesai",
  REJECTED:            "Ditolak",
};

const JENIS_COLORS: Record<JenisKecelakaan, string> = {
  LUKA_RINGAN: "bg-yellow-100 text-yellow-700",
  LUKA_BERAT:  "bg-orange-100 text-orange-700",
  MENINGGAL:   "bg-red-100 text-red-700",
  KERUSAKAN:   "bg-purple-100 text-purple-700",
  NEAR_MISS:   "bg-blue-100 text-blue-700",
};

const STATUS_COLORS: Record<InvestigationStatus, string> = {
  DRAFT:               "bg-[#e5e0db] text-[#6b6560]",
  UNDER_INVESTIGATION: "bg-blue-100 text-blue-700",
  PENDING_APPROVAL:    "bg-amber-100 text-amber-700",
  APPROVED:            "bg-teal-100 text-teal-700",
  VICTIM_SIGNED:       "bg-purple-100 text-purple-700",
  COMPLETED:           "bg-green-100 text-green-700",
  REJECTED:            "bg-red-100 text-red-700",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function resolveFileUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: InvestigationStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {STATUS_LABELS[status]}
    </span>
  );
}

function JenisBadge({ jenis }: { jenis: JenisKecelakaan }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${JENIS_COLORS[jenis]}`}>
      {JENIS_LABELS[jenis]}
    </span>
  );
}

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[700] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-[14px] font-medium ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
      {type === "success" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
      )}
      {msg}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Input / Textarea helpers ──────────────────────────────────────────────────

const inputCls = "w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22]";
const selectCls = inputCls + " bg-white";
const labelCls = "block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5";

// ── Export Modal ──────────────────────────────────────────────────────────────

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: Investigation[];
}

function ExportModal({ isOpen, onClose, records }: ExportModalProps) {
  const [dateFrom, setDateFrom]     = useState('');
  const [dateTo, setDateTo]         = useState('');
  const [exportFormat, setExportFormat] = useState<'html' | 'csv'>('html');
  const [exporting, setExporting]   = useState(false);

  if (!isOpen) return null;

  const filterByDate = (recs: Investigation[]) => {
    let f = [...recs];
    if (dateFrom) f = f.filter((r) => new Date(r.tanggalKejadian) >= new Date(dateFrom));
    if (dateTo) {
      const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
      f = f.filter((r) => new Date(r.tanggalKejadian) <= to);
    }
    return f;
  };

  const handleCSV = (filtered: Investigation[]) => {
    const headers = ['No', 'Tanggal Kejadian', 'Waktu', 'Lokasi', 'Area',
      'Jenis Kecelakaan', 'Jumlah Korban', 'Saksi', 'Kerugian Material',
      'Deskripsi Kejadian', 'Root Cause', 'Temuan', 'Rekomendasi',
      'Investigator', 'Status', 'Pelapor', 'Tgl Laporan'];
    const esc = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = filtered.map((inv, i) => [
      i + 1,
      esc(fmtDate(inv.tanggalKejadian)),
      esc(inv.waktuKejadian),
      esc(inv.lokasi),
      esc(inv.area),
      esc(JENIS_LABELS[inv.jenisKecelakaan]),
      inv.jumlahKorban,
      esc(inv.saksi ?? ''),
      esc(inv.kerugianMaterial ?? ''),
      esc(inv.deskripsiKejadian),
      esc(inv.rootCause ?? ''),
      esc(inv.temuanInvestigasi ?? ''),
      esc(inv.rekomendasiPerbaikan ?? ''),
      esc(inv.investigator?.nama ?? ''),
      esc(STATUS_LABELS[inv.status]),
      esc(inv.pelapor.nama),
      esc(fmtDate(inv.createdAt)),
    ].join(','));
    const csv = '\uFEFF' + [headers.map(esc).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    const dl = dateFrom && dateTo ? `_${dateFrom}_sd_${dateTo}` : '';
    a.download = `Investigasi_Kecelakaan${dl}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleHTML = (filtered: Investigation[]) => {
    const dateLabel = dateFrom && dateTo
      ? `Periode: ${fmtDate(dateFrom)} — ${fmtDate(dateTo)}`
      : `Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`;

    const statusCounters: Record<string, number> = {};
    filtered.forEach((r) => { statusCounters[r.status] = (statusCounters[r.status] ?? 0) + 1; });

    const statusBg: Record<InvestigationStatus, string> = {
      DRAFT:               '#f1f0ee',
      UNDER_INVESTIGATION: '#dbeafe',
      PENDING_APPROVAL:    '#fef3c7',
      APPROVED:            '#ccfbf1',
      VICTIM_SIGNED:       '#f3e8ff',
      COMPLETED:           '#dcfce7',
      REJECTED:            '#fee2e2',
    };
    const statusColor: Record<InvestigationStatus, string> = {
      DRAFT:               '#6b7280',
      UNDER_INVESTIGATION: '#1d4ed8',
      PENDING_APPROVAL:    '#92400e',
      APPROVED:            '#0f766e',
      VICTIM_SIGNED:       '#7c3aed',
      COMPLETED:           '#15803d',
      REJECTED:            '#b91c1c',
    };
    const jenisBg: Record<JenisKecelakaan, string> = {
      LUKA_RINGAN: '#fef9c3', LUKA_BERAT: '#ffedd5',
      MENINGGAL: '#fee2e2', KERUSAKAN: '#f3e8ff', NEAR_MISS: '#dbeafe',
    };
    const jenisColor: Record<JenisKecelakaan, string> = {
      LUKA_RINGAN: '#a16207', LUKA_BERAT: '#c2410c',
      MENINGGAL: '#b91c1c', KERUSAKAN: '#7c3aed', NEAR_MISS: '#1d4ed8',
    };

    const rows = filtered.map((inv, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'};">
        <td style="padding:7px 10px;text-align:center;color:#6b7280;">${i + 1}</td>
        <td style="padding:7px 10px;white-space:nowrap;">${fmtDate(inv.tanggalKejadian)}<br/><span style="font-size:10px;color:#9ca3af;">${inv.waktuKejadian}</span></td>
        <td style="padding:7px 10px;font-weight:600;">${inv.lokasi}<br/><span style="font-size:10px;color:#9ca3af;">${inv.area}</span></td>
        <td style="padding:7px 10px;"><span style="background:${jenisBg[inv.jenisKecelakaan]};color:${jenisColor[inv.jenisKecelakaan]};padding:2px 7px;border-radius:99px;font-size:10px;font-weight:700;">${JENIS_LABELS[inv.jenisKecelakaan]}</span></td>
        <td style="padding:7px 10px;text-align:center;">${inv.jumlahKorban}</td>
        <td style="padding:7px 10px;font-size:11px;max-width:200px;">${inv.deskripsiKejadian}</td>
        <td style="padding:7px 10px;font-size:11px;">${inv.rootCause ?? '—'}</td>
        <td style="padding:7px 10px;font-size:11px;">${inv.rekomendasiPerbaikan ?? '—'}</td>
        <td style="padding:7px 10px;font-size:11px;">${inv.investigator?.nama ?? '—'}</td>
        <td style="padding:7px 10px;"><span style="background:${statusBg[inv.status]};color:${statusColor[inv.status]};padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;">${STATUS_LABELS[inv.status]}</span></td>
        <td style="padding:7px 10px;font-size:11px;">${inv.pelapor.nama}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>Rekap Investigasi Kecelakaan</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1f2937; padding: 16px; }
    @media print {
      body { padding: 4mm; font-size: 10px; }
      .no-print { display: none !important; }
      @page { margin: 8mm; size: A3 landscape; }
      tr { page-break-inside: avoid; }
    }
    .header { background: #231f20; color: white; padding: 16px 20px; margin-bottom: 14px; border-radius: 6px; border-bottom: 3px solid #f15a22; display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .header h1 { font-size: 18px; margin-bottom: 3px; }
    .header p { font-size: 11px; color: #9ca3af; }
    .stats { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
    .stat { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 14px; text-align: center; min-width: 90px; }
    .stat-num { font-size: 20px; font-weight: 700; color: #f15a22; }
    .stat-label { font-size: 10px; color: #6b7280; }
    .print-btn { background: #f15a22; color: white; border: none; padding: 9px 18px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; margin-bottom: 14px; }
    .table-wrap { overflow-x: auto; border-radius: 6px; border: 1px solid #d1d5db; }
    table { border-collapse: collapse; width: 100%; min-width: 1200px; }
    thead th { background: #1f2937; color: #9ca3af; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; padding: 9px 10px; text-align: left; position: sticky; top: 0; }
    td { border-bottom: 1px solid #f3f4f6; vertical-align: top; }
  </style>
</head>
<body>
  <div class="header">
    <div><h1>Investigasi Kecelakaan — SMK3</h1><p>${dateLabel}</p></div>
    <div style="text-align:right;"><p style="font-size:13px;font-weight:700;color:#f15a22;">${filtered.length} Record</p><p style="font-size:10px;color:#9ca3af;">Accident Prevention</p></div>
  </div>
  <div class="stats no-print">
    <div class="stat"><div class="stat-num">${filtered.length}</div><div class="stat-label">Total</div></div>
    <div class="stat"><div class="stat-num" style="color:#15803d;">${statusCounters['COMPLETED'] ?? 0}</div><div class="stat-label">Selesai</div></div>
    <div class="stat"><div class="stat-num" style="color:#1d4ed8;">${statusCounters['UNDER_INVESTIGATION'] ?? 0}</div><div class="stat-label">Investigasi</div></div>
    <div class="stat"><div class="stat-num" style="color:#92400e;">${statusCounters['PENDING_APPROVAL'] ?? 0}</div><div class="stat-label">Menunggu</div></div>
    <div class="stat"><div class="stat-num" style="color:#b91c1c;">${statusCounters['REJECTED'] ?? 0}</div><div class="stat-label">Ditolak</div></div>
  </div>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF (A3 Landscape)</button>
  <div class="table-wrap">
    <table>
      <thead><tr>
        <th>#</th><th>Tanggal / Waktu</th><th>Lokasi / Area</th><th>Jenis</th>
        <th>Korban</th><th>Deskripsi</th><th>Root Cause</th><th>Rekomendasi</th>
        <th>Investigator</th><th>Status</th><th>Pelapor</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const dl = dateFrom && dateTo ? `_${dateFrom}_sd_${dateTo}` : '';
    const a = document.createElement('a'); a.href = url;
    a.download = `Investigasi_Kecelakaan${dl}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const filtered = filterByDate(records);
      if (filtered.length === 0) { alert('Tidak ada record dalam rentang tanggal yang dipilih.'); return; }
      if (exportFormat === 'html') { handleHTML(filtered); } else { handleCSV(filtered); }
      onClose();
    } finally { setExporting(false); }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0db]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#f15a22] mb-0.5">Export Data</p>
            <h2 className="font-bold text-[15px] text-[#231f20]">Download Rekap Investigasi</h2>
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-[13px] text-[#6b6560]">Kosongkan tanggal untuk export semua record.</p>
          {/* Format */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-2">Format Export</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setExportFormat('html')}
                className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 transition-all ${exportFormat === 'html' ? 'border-[#f15a22] bg-orange-50' : 'border-[#e5e0db] hover:border-[#f15a22]/40'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={exportFormat === 'html' ? '#f15a22' : '#a09b96'} strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <span className={`font-bold text-[12px] ${exportFormat === 'html' ? 'text-[#f15a22]' : 'text-[#6b6560]'}`}>HTML / Print</span>
                <span className={`text-[10px] text-center ${exportFormat === 'html' ? 'text-[#f15a22]' : 'text-[#a09b96]'}`}>Print / Save PDF</span>
              </button>
              <button type="button" onClick={() => setExportFormat('csv')}
                className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 transition-all ${exportFormat === 'csv' ? 'border-green-500 bg-green-50' : 'border-[#e5e0db] hover:border-green-300'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={exportFormat === 'csv' ? '#16a34a' : '#a09b96'} strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
                </svg>
                <span className={`font-bold text-[12px] ${exportFormat === 'csv' ? 'text-green-700' : 'text-[#6b6560]'}`}>CSV / Excel</span>
                <span className={`text-[10px] text-center ${exportFormat === 'csv' ? 'text-green-600' : 'text-[#a09b96]'}`}>Data saja</span>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">Dari Tanggal</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22]" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">Sampai Tanggal</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22]" />
          </div>
          <div className="px-3 py-2 bg-[#faf9f7] rounded-xl border border-[#e5e0db]">
            <p className="text-[12px] text-[#6b6560]">Total record tersedia: <strong className="text-[#231f20]">{records.length}</strong></p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e0db]">
          <button onClick={onClose} disabled={exporting}
            className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors">
            Batal
          </button>
          <button onClick={handleExport} disabled={exporting}
            className={`flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white rounded-xl transition-colors disabled:opacity-60 ${exportFormat === 'html' ? 'bg-[#f15a22] hover:bg-[#d44d1a]' : 'bg-green-600 hover:bg-green-700'}`}>
            {exporting ? <Spinner /> : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            )}
            {exporting ? 'Memproses...' : `Export ${exportFormat === 'html' ? 'HTML' : 'CSV'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create / Edit Modal ───────────────────────────────────────────────────────

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (inv: Investigation) => void;
  editing?: Investigation | null;
}

function CreateModal({ isOpen, onClose, onSaved, editing }: CreateModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [fotoBuktiFile, setFotoBuktiFile] = useState<File | null>(null);
  const refFoto = useRef<HTMLInputElement>(null);

  const empty = {
    tanggalKejadian: "", waktuKejadian: "", lokasi: "", area: "",
    deskripsiKejadian: "", jenisKecelakaan: "" as JenisKecelakaan | "",
    jumlahKorban: "0", saksi: "", kerugianMaterial: "",
  };
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setForm({
        tanggalKejadian:   editing.tanggalKejadian.split("T")[0],
        waktuKejadian:     editing.waktuKejadian,
        lokasi:            editing.lokasi,
        area:              editing.area,
        deskripsiKejadian: editing.deskripsiKejadian,
        jenisKecelakaan:   editing.jenisKecelakaan,
        jumlahKorban:      String(editing.jumlahKorban),
        saksi:             editing.saksi ?? "",
        kerugianMaterial:  editing.kerugianMaterial ?? "",
      });
    } else {
      setForm(empty);
    }
    setFotoBuktiFile(null);
    setError("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const f = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.jenisKecelakaan) { setError("Pilih jenis kecelakaan"); return; }
    setError("");
    setSaving(true);
    try {
      const fd = new FormData();
      (Object.entries(form) as [string, string][]).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (fotoBuktiFile) fd.append("fotoBukti", fotoBuktiFile);
      const result = editing ? await investigationApi.update(editing.id, fd) : await investigationApi.create(fd);
      onSaved(result);
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0db] flex-shrink-0">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#f15a22] mb-0.5">
              Investigasi Kecelakaan
            </p>
            <h2 className="font-bold text-[15px] text-[#231f20]">
              {editing ? "Edit Laporan Kecelakaan" : "Laporan Kecelakaan Baru"}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form id="inv-create-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tanggal Kejadian <span className="text-red-500">*</span></label>
              <input type="date" required value={form.tanggalKejadian} onChange={(e) => f("tanggalKejadian")(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Waktu Kejadian <span className="text-red-500">*</span></label>
              <input type="time" required value={form.waktuKejadian} onChange={(e) => f("waktuKejadian")(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Lokasi <span className="text-red-500">*</span></label>
              <input type="text" required placeholder="Gedung A lantai 2" value={form.lokasi} onChange={(e) => f("lokasi")(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Area / Zona <span className="text-red-500">*</span></label>
              <input type="text" required placeholder="Area Produksi" value={form.area} onChange={(e) => f("area")(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Jenis Kecelakaan <span className="text-red-500">*</span></label>
            <select required value={form.jenisKecelakaan} onChange={(e) => f("jenisKecelakaan")(e.target.value)} className={selectCls}>
              <option value="">-- Pilih --</option>
              {(Object.entries(JENIS_LABELS) as [JenisKecelakaan, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Deskripsi Kejadian <span className="text-red-500">*</span></label>
            <textarea required rows={3} placeholder="Uraikan kronologi kejadian..." value={form.deskripsiKejadian} onChange={(e) => f("deskripsiKejadian")(e.target.value)}
              className={inputCls + " resize-none"} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Jumlah Korban</label>
              <input type="number" min="0" value={form.jumlahKorban} onChange={(e) => f("jumlahKorban")(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Saksi</label>
              <input type="text" placeholder="Nama saksi" value={form.saksi} onChange={(e) => f("saksi")(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Kerugian Material</label>
            <input type="text" placeholder="Estimasi kerugian" value={form.kerugianMaterial} onChange={(e) => f("kerugianMaterial")(e.target.value)} className={inputCls} />
          </div>

          {/* Upload foto */}
          <div>
            <label className={labelCls}>Foto Bukti</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => refFoto.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#c5c0bb] text-[12px] font-medium rounded-lg hover:border-[#f15a22] hover:text-[#f15a22] transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Upload
              </button>
              {fotoBuktiFile ? (
                <span className="text-[11px] text-green-600">✓ {fotoBuktiFile.name}</span>
              ) : editing?.fotoBukti ? (
                <a href={resolveFileUrl(editing.fotoBukti)} target="_blank" rel="noreferrer" className="text-[11px] text-[#f15a22] hover:underline">📎 Lihat file</a>
              ) : (
                <span className="text-[11px] text-[#a09a95]">Belum ada file</span>
              )}
              <input ref={refFoto} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" className="hidden" onChange={(e) => setFotoBuktiFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e0db] flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors">
            Batal
          </button>
          <button form="inv-create-form" type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-[#f15a22] rounded-xl hover:bg-[#d44d1a] transition-colors disabled:opacity-60">
            {saving && <Spinner />}
            {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Buat Laporan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Investigasi Form Modal ────────────────────────────────────────────────────

interface InvestigasiModalProps {
  isOpen: boolean;
  inv: Investigation | null;
  onClose: () => void;
  onSaved: (inv: Investigation) => void;
  currentUserId?: string;
  currentUserName?: string;
}

function InvestigasiModal({ isOpen, inv, onClose, onSaved, currentUserId, currentUserName }: InvestigasiModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [lampiranFile, setLampiranFile] = useState<File | null>(null);
  const refLampiran = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    tanggalInvestigasi:   "",
    rootCause:            "",
    temuanInvestigasi:    "",
    rekomendasiPerbaikan: "",
    catatanTambahan:      "",
  });

  useEffect(() => {
    if (!isOpen || !inv) return;
    setForm({
      tanggalInvestigasi:   inv.tanggalInvestigasi?.split("T")[0] ?? "",
      rootCause:            inv.rootCause ?? "",
      temuanInvestigasi:    inv.temuanInvestigasi ?? "",
      rekomendasiPerbaikan: inv.rekomendasiPerbaikan ?? "",
      catatanTambahan:      inv.catatanTambahan ?? "",
    });
    setLampiranFile(null);
    setError("");
  }, [isOpen, inv]);

  const f = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inv) return;
    setError("");
    setSaving(true);
    try {
      const fd = new FormData();
      (Object.entries(form) as [string, string][]).forEach(([k, v]) => { if (v) fd.append(k, v); });
      // Kirim investigatorId dari user yang sedang login
      if (currentUserId) fd.append("investigatorId", currentUserId);
      if (lampiranFile) fd.append("lampiranLaporan", lampiranFile);
      // Jangan kirim path lama sebagai string — biarkan kosong jika tidak ada file baru
      const updated = await investigationApi.update(inv.id, fd);
      onSaved(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen || !inv) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#e5e0db] flex-shrink-0">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#f15a22] mb-0.5">Isi Data Investigasi</p>
            <h2 className="font-bold text-[15px] text-[#231f20]">Form Investigasi</h2>
            <p className="text-[12px] text-[#6b6560] mt-0.5">{inv.lokasi} · {fmtDate(inv.tanggalKejadian)}</p>
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1 flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="inv-investigasi-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl">{error}</div>}

          {/* Info investigator otomatis */}
          {currentUserName && (
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <div>
                <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">Investigator</p>
                <p className="text-[13px] font-semibold text-blue-900">{currentUserName}</p>
              </div>
            </div>
          )}

          <div>
            <label className={labelCls}>Tanggal Investigasi</label>
            <input type="date" value={form.tanggalInvestigasi} onChange={(e) => f("tanggalInvestigasi")(e.target.value)} className={inputCls} />
          </div>

          {([
            ["rootCause",            "Root Cause (Akar Masalah)", true],
            ["temuanInvestigasi",    "Temuan Investigasi",        true],
            ["rekomendasiPerbaikan", "Rekomendasi Perbaikan",     true],
            ["catatanTambahan",      "Catatan Tambahan",          false],
          ] as [keyof typeof form, string, boolean][]).map(([k, lbl, req]) => (
            <div key={k}>
              <label className={labelCls}>{lbl}{req && <span className="text-red-500"> *</span>}</label>
              <textarea required={req} rows={3} value={form[k]} onChange={(e) => f(k)(e.target.value)}
                className={inputCls + " resize-none"} placeholder={`Isi ${lbl.toLowerCase()}...`} />
            </div>
          ))}

          {/* Lampiran */}
          <div>
            <label className={labelCls}>Lampiran Laporan (PDF)</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => refLampiran.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#c5c0bb] text-[12px] font-medium rounded-lg hover:border-[#f15a22] hover:text-[#f15a22] transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Upload
              </button>
              {lampiranFile ? (
                <span className="text-[11px] text-green-600">✓ {lampiranFile.name}</span>
              ) : inv.lampiranLaporan ? (
                <a href={resolveFileUrl(inv.lampiranLaporan)} target="_blank" rel="noreferrer" className="text-[11px] text-[#f15a22] hover:underline">📎 Lihat file</a>
              ) : (
                <span className="text-[11px] text-[#a09a95]">Belum ada file</span>
              )}
              <input ref={refLampiran} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setLampiranFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e0db] flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors">Batal</button>
          <button form="inv-investigasi-form" type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-[#f15a22] rounded-xl hover:bg-[#d44d1a] transition-colors disabled:opacity-60">
            {saving && <Spinner />}
            {saving ? "Menyimpan..." : "Simpan Investigasi"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Panel (slide-in kanan) ─────────────────────────────────────────────

interface DetailPanelProps {
  inv: Investigation | null;
  isAdmin: boolean;
  isSupervisor: boolean;
  currentUserId: string;
  onClose: () => void;
  onEditKecelakaan: () => void;
  onFillInvestigasi: () => void;
  onAction: (updated: Investigation) => void;
}

function DetailPanel({
  inv, isAdmin, isSupervisor, currentUserId,
  onClose, onEditKecelakaan, onFillInvestigasi, onAction,
}: DetailPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [supervisorNote, setSupervisorNote] = useState("");

  useEffect(() => {
    if (inv) {
      setRejectReason("");
      setSupervisorNote(inv.supervisorNote ?? "");
      setError("");
    }
  }, [inv]);

  if (!inv) return null;

  const isMyRecord = inv.pelaporId === currentUserId;

  async function doAction(action: () => Promise<Investigation>) {
    setError("");
    setLoading(true);
    try { onAction(await action()); }
    catch (e: any) { setError(e?.message ?? "Gagal"); }
    finally { setLoading(false); }
  }

  const steps: [string, boolean][] = [
    ["Laporan Dibuat",  true],
    ["Investigasi",     ["UNDER_INVESTIGATION","PENDING_APPROVAL","APPROVED","VICTIM_SIGNED","COMPLETED"].includes(inv.status)],
    ["Approval",        ["PENDING_APPROVAL","APPROVED","VICTIM_SIGNED","COMPLETED"].includes(inv.status)],
    ["Disetujui",       ["APPROVED","VICTIM_SIGNED","COMPLETED"].includes(inv.status)],
    ["TTD Korban",      ["VICTIM_SIGNED","COMPLETED"].includes(inv.status)],
    ["Selesai",         inv.status === "COMPLETED"],
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[450]" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[460] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#e5e0db] flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#f15a22] mb-1">Detail Investigasi Kecelakaan</p>
            <h3 className="font-bold text-[16px] text-[#231f20] leading-snug">{inv.lokasi}</h3>
            <p className="text-[12px] text-[#6b6560] mt-0.5">{fmtDate(inv.tanggalKejadian)} · {inv.waktuKejadian}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <StatusBadge status={inv.status} />
              <JenisBadge jenis={inv.jenisKecelakaan} />
            </div>
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] flex-shrink-0 p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Stepper */}
        {inv.status !== "REJECTED" && (
          <div className="px-6 py-3 border-b border-[#f1f0ee] flex gap-1 overflow-x-auto">
            {steps.map(([label, done], i) => (
              <div key={label} className="flex items-center gap-1 shrink-0">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${done ? "bg-[#f15a22] text-white" : "bg-[#e5e0db] text-[#a09a95]"}`}>
                  {done ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] ${done ? "text-[#f15a22] font-semibold" : "text-[#a09a95]"}`}>{label}</span>
                {i < steps.length - 1 && <span className="text-[#e5e0db] mx-0.5">—</span>}
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-[13px]">
          {error && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-[12px] rounded-xl">{error}</div>}

          {/* Data Kecelakaan */}
          <section>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#f15a22] mb-3">Data Kecelakaan</p>
            <div className="space-y-2.5">
              {([
                ["Tanggal", fmtDate(inv.tanggalKejadian)],
                ["Waktu", inv.waktuKejadian],
                ["Lokasi", inv.lokasi],
                ["Area", inv.area],
                ["Pelapor", inv.pelapor.nama],
                ["Jumlah Korban", String(inv.jumlahKorban)],
                ...(inv.saksi            ? [["Saksi", inv.saksi]] : []),
                ...(inv.kerugianMaterial ? [["Kerugian Material", inv.kerugianMaterial]] : []),
              ] as [string, string][]).map(([l, v]) => (
                <InfoRow key={l} label={l} value={v} />
              ))}
              <InfoRow label="Deskripsi" value={<p className="whitespace-pre-wrap">{inv.deskripsiKejadian}</p>} />
              {inv.fotoBukti && (
                <InfoRow label="Foto Bukti" value={
                  <a href={resolveFileUrl(inv.fotoBukti)} target="_blank" rel="noreferrer" className="text-[#f15a22] hover:underline flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download
                  </a>
                } />
              )}
            </div>
          </section>

          {/* Data Investigasi */}
          {inv.status !== "DRAFT" && (
            <section>
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3">Data Investigasi</p>
              {inv.rootCause ? (
                <div className="space-y-2.5">
                  {inv.investigator && <InfoRow label="Investigator" value={inv.investigator.nama} />}
                  {inv.tanggalInvestigasi && <InfoRow label="Tgl Investigasi" value={fmtDate(inv.tanggalInvestigasi)} />}
                  <InfoRow label="Root Cause" value={<p className="whitespace-pre-wrap">{inv.rootCause}</p>} />
                  <InfoRow label="Temuan" value={<p className="whitespace-pre-wrap">{inv.temuanInvestigasi ?? "—"}</p>} />
                  <InfoRow label="Rekomendasi" value={<p className="whitespace-pre-wrap">{inv.rekomendasiPerbaikan ?? "—"}</p>} />
                  {inv.catatanTambahan && <InfoRow label="Catatan" value={<p className="whitespace-pre-wrap">{inv.catatanTambahan}</p>} />}
                  {inv.lampiranLaporan && (
                    <InfoRow label="Lampiran" value={
                      <a href={resolveFileUrl(inv.lampiranLaporan)} target="_blank" rel="noreferrer" className="text-[#f15a22] hover:underline flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download
                      </a>
                    } />
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-[12px] text-amber-700">
                  <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Data investigasi belum diisi. Klik <strong>&nbsp;"Isi Investigasi"</strong> di bawah.
                </div>
              )}
            </section>
          )}

          {/* Approval & TTD */}
          {inv.approvedBy && (
            <section>
              <p className="text-[11px] font-bold uppercase tracking-widest text-green-600 mb-3">Approval & Tanda Tangan</p>
              <div className="space-y-2.5">
                <InfoRow label="Disetujui oleh" value={`${inv.approvedBy.nama} — ${fmtDate(inv.approvedAt)}`} />
                {inv.victimSignedAt && <InfoRow label="TTD Korban" value={fmtDate(inv.victimSignedAt)} />}
                {inv.supervisorSignedAt && (
                  <>
                    <InfoRow label="TTD Atasan" value={fmtDate(inv.supervisorSignedAt)} />
                    {inv.supervisorNote && <InfoRow label="Catatan Atasan" value={inv.supervisorNote} />}
                  </>
                )}
              </div>
            </section>
          )}

          {/* Finding link */}
          {inv.findingId && (
            <section>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#6b6560] mb-2">Finding Terkait</p>
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-[12px] text-amber-700">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                Finding #{inv.findingId.slice(-6)} otomatis dibuat
              </div>
            </section>
          )}

          {/* Riwayat */}
          {inv.logs.length > 0 && (
            <section>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#6b6560] mb-3">Riwayat Aktivitas</p>
              <div className="space-y-2">
                {inv.logs.map((log) => (
                  <div key={log.id} className="flex gap-2.5 text-[12px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f15a22] mt-1.5 shrink-0" />
                    <div>
                      <p className="text-[#231f20]">{log.description}</p>
                      <p className="text-[#a09a95]">{log.user.nama} · {new Date(log.timestamp).toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Audit */}
          <section className="text-[11px] text-[#a09a95] border-t border-[#f1f0ee] pt-4">
            <p>Dibuat oleh <span className="font-semibold">{inv.pelapor.nama}</span> · {new Date(inv.createdAt).toLocaleString("id-ID")}</p>
          </section>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col gap-2 px-6 py-4 border-t border-[#e5e0db] flex-shrink-0">
          {/* DRAFT: Edit + Mulai Investigasi */}
          {inv.status === "DRAFT" && (
            <div className="flex gap-2">
              <button onClick={onEditKecelakaan}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors">
                Edit Laporan
              </button>
              <button onClick={() => doAction(() => investigationApi.startInvestigation(inv.id, currentUserId))} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
                {loading ? <Spinner /> : null}
                Mulai Investigasi
              </button>
            </div>
          )}

          {/* UNDER_INVESTIGATION: Isi + Submit */}
          {inv.status === "UNDER_INVESTIGATION" && (
            <div className="flex gap-2">
              <button onClick={onFillInvestigasi}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-white bg-[#f15a22] rounded-xl hover:bg-[#d44d1a] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Isi Investigasi
              </button>
              <button onClick={() => doAction(() => investigationApi.submitForApproval(inv.id))} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-60">
                {loading ? <Spinner /> : null}
                Kirim Approval
              </button>
            </div>
          )}

          {/* PENDING_APPROVAL: Setujui / Tolak (supervisor/admin) */}
          {inv.status === "PENDING_APPROVAL" && isSupervisor && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <button onClick={() => doAction(() => investigationApi.approve(inv.id))} disabled={loading}
                  className="flex-1 py-2.5 text-[13px] font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60">
                  {loading ? <Spinner /> : null}
                  Setujui
                </button>
                <button onClick={() => doAction(() => investigationApi.reject(inv.id, rejectReason || "Tidak memenuhi syarat"))} disabled={loading}
                  className="flex-1 py-2.5 text-[13px] font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60">
                  Tolak
                </button>
              </div>
              <input type="text" placeholder="Alasan penolakan (jika ditolak)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                className={inputCls + " text-[12px]"} />
            </div>
          )}

          {/* APPROVED: TTD Korban */}
          {inv.status === "APPROVED" && (
            <button onClick={() => doAction(() => investigationApi.signByVictim(inv.id))} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-60">
              {loading ? <Spinner /> : null}
              Tanda Tangan sebagai Korban
            </button>
          )}

          {/* VICTIM_SIGNED: TTD Atasan Korban (supervisor/admin) */}
          {inv.status === "VICTIM_SIGNED" && isSupervisor && (
            <div className="space-y-2">
              <input type="text" placeholder="Catatan atasan korban (opsional)" value={supervisorNote} onChange={(e) => setSupervisorNote(e.target.value)}
                className={inputCls + " text-[12px]"} />
              <button onClick={() => doAction(() => investigationApi.signBySupervisor(inv.id, { supervisorNote }))} disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60">
                {loading ? <Spinner /> : null}
                Tanda Tangan & Selesaikan
              </button>
            </div>
          )}

          {/* Admin delete (hanya saat DRAFT) */}
          {(isMyRecord || isAdmin) && inv.status === "DRAFT" && (
            <button onClick={() => doAction(async () => { await investigationApi.delete(inv.id); onClose(); return inv; })} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 text-[12px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-60">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              Hapus Laporan
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="w-28 flex-shrink-0 font-semibold text-[#6b6560]">{label}</span>
      <span className="flex-1 text-[#231f20]">{value}</span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function InvestigasiKecelakaanPage() {
  const { user } = useAuth();
  const isAdmin      = user?.role === "admin";
  const isSupervisor = user?.role === "supervisor" || isAdmin;

  const [records, setRecords]     = useState<Investigation[]>([]);
  const [filtered, setFiltered]   = useState<Investigation[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState<InvestigationStatus | "">("");
  const [filterJenis, setFilterJenis]   = useState<JenisKecelakaan | "">("");

  const [detailInv, setDetailInv]           = useState<Investigation | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget]           = useState<Investigation | null>(null);
  const [investigasiTarget, setInvestigasiTarget] = useState<Investigation | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // ── Load ────────────────────────────────────────────────────────────────────

  useEffect(() => { loadAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); }
  }, [toast]);

  // ── Filter ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    let result = [...records];
    if (filterStatus) result = result.filter((r) => r.status === filterStatus);
    if (filterJenis)  result = result.filter((r) => r.jenisKecelakaan === filterJenis);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        r.lokasi.toLowerCase().includes(q) ||
        r.area.toLowerCase().includes(q) ||
        r.deskripsiKejadian.toLowerCase().includes(q) ||
        r.pelapor.nama.toLowerCase().includes(q) ||
        (r.saksi ?? "").toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, filterStatus, filterJenis, records]);

  async function loadAll() {
    setLoading(true);
    try { setRecords(await investigationApi.getAll()); }
    catch { setToast({ msg: "Gagal memuat data", type: "error" }); }
    finally { setLoading(false); }
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  function onSaved(inv: Investigation) {
    setRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === inv.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = inv; return next; }
      return [inv, ...prev];
    });
    if (detailInv?.id === inv.id) setDetailInv(inv);
    setToast({ msg: "Berhasil disimpan", type: "success" });
  }

  function onAction(updated: Investigation) {
    setRecords((prev) => prev.map((r) => r.id === updated.id ? updated : r));
    setDetailInv(updated);
    setToast({ msg: "Berhasil", type: "success" });
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f1f0ee]">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Page Header */}
      <div className="bg-[#231f20] px-6 md:px-10 py-8 border-b-[3px] border-b-[#f15a22]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-2">
            Accident Prevention
          </p>
          <h1 className="font-bold text-white text-[clamp(22px,4vw,38px)] leading-tight">
            Investigasi Kecelakaan
          </h1>
          <p className="text-[#8a8580] text-[13px] mt-1.5">
            Pelaporan, investigasi, dan penyelesaian kecelakaan kerja sesuai alur SMK3.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a09b96]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari lokasi, area, deskripsi..."
              className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 transition-colors" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09b96] hover:text-[#231f20]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3.5 py-2.5 text-[14px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 whitespace-nowrap">
            <option value="">Semua Status</option>
            {(Object.entries(STATUS_LABELS) as [InvestigationStatus, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>

          <select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value as any)}
            className="px-3.5 py-2.5 text-[14px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 whitespace-nowrap">
            <option value="">Semua Jenis</option>
            {(Object.entries(JENIS_LABELS) as [JenisKecelakaan, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>

          <button onClick={() => setExportModalOpen(true)} disabled={records.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#c5c0bb] text-[#231f20] text-[13px] font-semibold rounded-xl hover:border-[#f15a22] hover:text-[#f15a22] transition-colors whitespace-nowrap disabled:opacity-40">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>

          <button onClick={() => { setEditTarget(null); setCreateModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors whitespace-nowrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Laporan Baru
          </button>        </div>

        {/* Info bar */}
        <div className="flex items-center justify-between mb-3 px-1 flex-wrap gap-2">
          <p className="text-[12px] text-[#6b6560]">
            {loading ? "Memuat data..." : `Menampilkan ${filtered.length} record${search ? ` dari ${records.length}` : ""}`}
          </p>
          {isAdmin && !loading && (
            <span className="text-[11px] px-2.5 py-0.5 bg-[#f15a22]/10 text-[#f15a22] rounded-full font-semibold border border-[#f15a22]/20">
              Mode Admin
            </span>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#e5e0db] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[1,2,3,4].map((i) => <div key={i} className="h-12 bg-[#f1f0ee] rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#f1f0ee] flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c5c0bb" strokeWidth="1.5">
                  <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <p className="font-semibold text-[15px] text-[#231f20]">
                {search || filterStatus || filterJenis ? "Tidak ada record yang sesuai" : "Belum ada data investigasi"}
              </p>
              <p className="text-[13px] text-[#a09b96] mt-1">
                {search || filterStatus || filterJenis ? "Coba ubah filter pencarian" : `Klik "Laporan Baru" untuk membuat laporan kecelakaan`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5e0db] bg-[#faf9f7]">
                    {["Tanggal", "Lokasi / Area", "Jenis", "Korban", "Pelapor", "Status", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#6b6560] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv, idx) => (
                    <tr key={inv.id} onClick={() => setDetailInv(inv)}
                      className={`border-b border-[#f1f0ee] hover:bg-[#faf9f7] cursor-pointer transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}`}>
                      <td className="px-4 py-3 text-[13px] text-[#231f20] whitespace-nowrap">
                        {fmtDate(inv.tanggalKejadian)}
                        <br /><span className="text-[#a09a95] text-[11px]">{inv.waktuKejadian}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[13px] text-[#231f20]">{inv.lokasi}</p>
                        <p className="text-[11px] text-[#6b6560]">{inv.area}</p>
                      </td>
                      <td className="px-4 py-3"><JenisBadge jenis={inv.jenisKecelakaan} /></td>
                      <td className="px-4 py-3 text-center text-[13px] text-[#231f20] font-semibold">{inv.jumlahKorban}</td>
                      <td className="px-4 py-3 text-[12px] text-[#6b6560]">{inv.pelapor.nama}</td>
                      <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          {/* Isi investigasi */}
                          {inv.status === "UNDER_INVESTIGATION" && (
                            <button title="Isi Investigasi" onClick={() => setInvestigasiTarget(inv)}
                              className="p-1.5 text-[#f15a22] hover:bg-[#fff3ee] rounded transition-colors">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                          )}
                          {/* Edit (hanya DRAFT) */}
                          {inv.status === "DRAFT" && (
                            <button title="Edit" onClick={() => { setEditTarget(inv); setCreateModalOpen(true); }}
                              className="p-1.5 text-[#6b6560] hover:text-[#f15a22] hover:bg-[#fff3ee] rounded transition-colors">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals & Panel ── */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        records={records}
      />

      <CreateModal
        isOpen={createModalOpen || !!editTarget}
        onClose={() => { setCreateModalOpen(false); setEditTarget(null); }}
        onSaved={onSaved}
        editing={editTarget}
      />

      <InvestigasiModal
        isOpen={!!investigasiTarget}
        inv={investigasiTarget}
        onClose={() => setInvestigasiTarget(null)}
        onSaved={(updated) => { onSaved(updated); setInvestigasiTarget(null); }}
        currentUserId={user?.id}
        currentUserName={user?.nama}
      />

      {detailInv && user && (
        <DetailPanel
          inv={detailInv}
          isAdmin={isAdmin}
          isSupervisor={isSupervisor}
          currentUserId={user.id}
          onClose={() => setDetailInv(null)}
          onEditKecelakaan={() => { setEditTarget(detailInv); setDetailInv(null); setCreateModalOpen(true); }}
          onFillInvestigasi={() => { setInvestigasiTarget(detailInv); setDetailInv(null); }}
          onAction={onAction}
        />
      )}
    </div>
  );
}
