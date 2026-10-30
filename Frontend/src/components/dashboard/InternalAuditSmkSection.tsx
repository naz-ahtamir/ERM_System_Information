'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { picaApi } from '@/lib/picaApi';
import type { PicaRecord } from '@/types/pica';
import { DIVISI_LIST, getDivisiById } from '@/data/picaData';
import { Spinner } from '@/components/ui/Spinner';

interface PieSlice {
  label: string;
  value: number;
  color: string;
  percentage: number;
  subLabel?: string;
}

// ── Lightweight, Interactive SVG Donut Chart ──────────────────────────────────
function SvgDonutChart({
  slices,
  total,
  centerTitle,
  centerSubtitle,
  size = 210,
  strokeWidth = 30,
}: {
  slices: PieSlice[];
  total: number;
  centerTitle: string;
  centerSubtitle?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          <text
            x={size / 2}
            y={size / 2 - 4}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-lg font-bold fill-gray-400"
          >
            0
          </text>
          <text
            x={size / 2}
            y={size / 2 + 14}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-[11px] font-medium fill-gray-400"
          >
            Tidak Ada Data
          </text>
        </svg>
      </div>
    );
  }

  let accumulatedOffset = 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {slices.map((slice, i) => {
            if (slice.value <= 0) return null;
            const strokeDash = (slice.value / total) * circumference;
            const currentOffset = accumulatedOffset;
            accumulatedOffset += strokeDash;

            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${strokeDash} ${circumference}`}
                strokeDashoffset={-currentOffset}
                strokeLinecap="butt"
                className="transition-all duration-500 hover:opacity-80 cursor-pointer"
              >
                <title>{`${slice.label}: ${slice.value} (${slice.percentage.toFixed(1)}%)`}</title>
              </circle>
            );
          })}
        </g>
        <text
          x={size / 2}
          y={size / 2 - (centerSubtitle ? 8 : 0)}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-extrabold fill-[#1F2937] text-2xl tracking-tight"
        >
          {centerTitle}
        </text>
        {centerSubtitle && (
          <text
            x={size / 2}
            y={size / 2 + 14}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-[11px] font-semibold fill-[#6B7280]"
          >
            {centerSubtitle}
          </text>
        )}
      </svg>
    </div>
  );
}

// ── Helper Extract Year ───────────────────────────────────────────────────────
function extractYear(isoDate?: string | null): string | null {
  if (!isoDate) return null;
  const match = String(isoDate).match(/^(\d{4})/);
  if (match) return match[1];
  const d = new Date(isoDate);
  return isNaN(d.getFullYear()) ? null : String(d.getFullYear());
}

export function InternalAuditSmkSection() {
  const [records, setRecords] = useState<PicaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [showAllDivisions, setShowAllDivisions] = useState(false);

  // Fetch PICA data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    picaApi
      .getAll()
      .then((data) => {
        if (isMounted) {
          setRecords(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        console.error('[InternalAuditSmkSection] Gagal mengambil record PICA:', err);
        if (isMounted) setRecords([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Distinct available years
  const availableYears = useMemo(() => {
    const yearSet = new Set<string>();
    const currentYear = new Date().getFullYear().toString();
    yearSet.add(currentYear);

    records.forEach((r) => {
      const y = extractYear(r.tanggalTemuan);
      if (y) yearSet.add(y);
    });

    return Array.from(yearSet).sort((a, b) => b.localeCompare(a));
  }, [records]);

  // Filter records by selected year
  const filteredRecords = useMemo(() => {
    if (selectedYear === 'ALL') return records;
    return records.filter((r) => extractYear(r.tanggalTemuan) === selectedYear);
  }, [records, selectedYear]);

  // ───────────────────────────────────────────────────────────────────────────
  // (1) HITUNG PIE CHART 1: STATUS TEMUAN (CLSD, INPG, OPEN)
  // ───────────────────────────────────────────────────────────────────────────
  const totalFindings = filteredRecords.length;
  const countOpen = filteredRecords.filter((r) => r.statusPerbaikan === 'OPEN').length;
  const countInpg = filteredRecords.filter((r) => r.statusPerbaikan === 'INPG').length;
  const countClsd = filteredRecords.filter((r) => r.statusPerbaikan === 'CLSD').length;

  const pctOpen = totalFindings > 0 ? (countOpen / totalFindings) * 100 : 0;
  const pctInpg = totalFindings > 0 ? (countInpg / totalFindings) * 100 : 0;
  const pctClsd = totalFindings > 0 ? (countClsd / totalFindings) * 100 : 0;

  const statusSlices: PieSlice[] = [
    {
      label: 'CLSD (Closed)',
      subLabel: 'Temuan Selesai & Diverifikasi',
      value: countClsd,
      color: '#10B981', // Emerald green
      percentage: pctClsd,
    },
    {
      label: 'INPG (In Progress)',
      subLabel: 'Perbaikan Sedang Berjalan',
      value: countInpg,
      color: '#3B82F6', // Blue
      percentage: pctInpg,
    },
    {
      label: 'OPEN (Open)',
      subLabel: 'Menunggu Tindak Lanjut',
      value: countOpen,
      color: '#EF4444', // Red
      percentage: pctOpen,
    },
  ];

  // ───────────────────────────────────────────────────────────────────────────
  // (2) HITUNG PIE CHART 2: PEMENUHAN SMK3 (SESUAI, MAYOR, MINOR)
  // Aturan:
  // - Total Kriteria SMK3 = 166
  // - JUMLAH MAYOR = jumlah kategori MAYOR unik berdasarkan kriteriaId (misal: 10 temuan 6.4.4 dan 5 temuan 9.3.2 -> 2)
  // - JUMLAH MINOR = jumlah kategori MINOR unik berdasarkan kriteriaId
  // - SESUAI = 166 - JUMLAH MAYOR - JUMLAH MINOR
  // ───────────────────────────────────────────────────────────────────────────
  const { jumlahMayor, jumlahMinor, jumlahSesuai, pctMayor, pctMinor, pctSesuai } = useMemo(() => {
    const mayorCriteriaSet = new Set<string>();
    const minorCriteriaSet = new Set<string>();

    filteredRecords.forEach((r) => {
      const kat = (r.kategori || '').trim().toUpperCase();
      let critKey = (r.kriteriaId || '').trim();
      if (!critKey && r.kriteriaDeskripsi) {
        const match = r.kriteriaDeskripsi.match(/^(\d+\.\d+\.\d+)/);
        critKey = match ? match[1] : r.kriteriaDeskripsi.trim();
      }

      if (critKey) {
        if (kat === 'MAYOR') {
          mayorCriteriaSet.add(critKey);
        } else if (kat === 'MINOR') {
          minorCriteriaSet.add(critKey);
        }
      }
    });

    // Jika satu kriteria tercatat di mayor, jangan dobel hitung di minor
    minorCriteriaSet.forEach((c) => {
      if (mayorCriteriaSet.has(c)) {
        minorCriteriaSet.delete(c);
      }
    });

    const cMayor = mayorCriteriaSet.size;
    const cMinor = minorCriteriaSet.size;
    const totalKriteria = 166;
    const cSesuai = Math.max(0, totalKriteria - cMayor - cMinor);

    return {
      jumlahMayor: cMayor,
      jumlahMinor: cMinor,
      jumlahSesuai: cSesuai,
      pctMayor: (cMayor / totalKriteria) * 100,
      pctMinor: (cMinor / totalKriteria) * 100,
      pctSesuai: (cSesuai / totalKriteria) * 100,
    };
  }, [filteredRecords]);

  const pemenuhanSlices: PieSlice[] = [
    {
      label: 'SESUAI',
      subLabel: 'Kriteria Terpenuhi',
      value: jumlahSesuai,
      color: '#10B981', // Green
      percentage: pctSesuai,
    },
    {
      label: 'MAYOR',
      subLabel: 'Ketidaksesuaian Mayor',
      value: jumlahMayor,
      color: '#EF4444', // Red
      percentage: pctMayor,
    },
    {
      label: 'MINOR',
      subLabel: 'Ketidaksesuaian Minor',
      value: jumlahMinor,
      color: '#F59E0B', // Amber
      percentage: pctMinor,
    },
  ];

  // ───────────────────────────────────────────────────────────────────────────
  // (3) HITUNG BAR CHART HORISONTAL: TEMUAN PER DIVISI (OPEN, INPG, CLSD)
  // ───────────────────────────────────────────────────────────────────────────
  const divisionStats = useMemo(() => {
    const map = new Map<
      string,
      {
        divisionName: string;
        open: number;
        inpg: number;
        clsd: number;
        total: number;
      }
    >();

    // Jika opsi tampilkan semua divisi aktif, inisialisasi semua master divisi
    if (showAllDivisions) {
      DIVISI_LIST.forEach((d) => {
        map.set(d.namaDivisi, {
          divisionName: d.namaDivisi,
          open: 0,
          inpg: 0,
          clsd: 0,
          total: 0,
        });
      });
    }

    filteredRecords.forEach((r) => {
      let divName = (r.lokasiDivisiNama || '').trim();
      if (!divName && r.lokasiDivisiId) {
        divName = getDivisiById(r.lokasiDivisiId)?.namaDivisi || '';
      }
      if (!divName && r.divisiId) {
        divName = getDivisiById(r.divisiId)?.namaDivisi || '';
      }
      if (!divName) divName = 'Divisi Lainnya';

      if (!map.has(divName)) {
        map.set(divName, {
          divisionName: divName,
          open: 0,
          inpg: 0,
          clsd: 0,
          total: 0,
        });
      }

      const item = map.get(divName)!;
      item.total += 1;
      if (r.statusPerbaikan === 'OPEN') item.open += 1;
      else if (r.statusPerbaikan === 'INPG') item.inpg += 1;
      else if (r.statusPerbaikan === 'CLSD') item.clsd += 1;
    });

    const list = Array.from(map.values());

    // Sort by total findings descending, then name
    list.sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return a.divisionName.localeCompare(b.divisionName);
    });

    return list;
  }, [filteredRecords, showAllDivisions]);

  // Max total for relative bar scaling
  const maxDivisionCount = useMemo(() => {
    const max = Math.max(...divisionStats.map((d) => d.total), 0);
    return max > 0 ? max : 5;
  }, [divisionStats]);

  return (
    <section className="py-12 md:py-16 px-5 md:px-10 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto">
        {/* ── Section Header & Filter Toolbar ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF1E8] border border-[#FF6B1A]/20 text-[11px] font-semibold text-[#FF6B1A] mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B1A]"></span>
              INTERNAL AUDIT • PP NO. 50/2012
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1F2937] tracking-tight">
              Audit Internal SMK3 (PICA)
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5 max-w-2xl">
              Monitoring status tindak lanjut perbaikan temuan PICA, tingkat pemenuhan 166 kriteria SMK3, dan persebaran temuan per divisi kerja
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Year Filter Buttons */}
            <div className="flex items-center bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-1 text-xs">
              <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider px-2.5 hidden sm:inline">
                Tahun Temuan:
              </span>
              <button
                type="button"
                onClick={() => setSelectedYear('ALL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedYear === 'ALL'
                    ? 'bg-[#FF6B1A] text-white shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                Semua Tahun
              </button>
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    selectedYear === yr
                      ? 'bg-[#FF6B1A] text-white shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1F2937]'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            {/* Link directly to PICA Module */}
            <Link
              href="/internal-audit-smk/pica"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6B1A] hover:bg-[#E85D0F] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              Buka Modul PICA →
            </Link>
          </div>
        </div>

        {/* ── Loading Spinner ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#FAFAFA] rounded-2xl border border-[#E5E7EB]">
            <Spinner size="lg" />
            <p className="text-xs text-gray-500 font-medium mt-3">Memuat analitik data PICA SMK3...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── Row 1: KPI Stat Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-5 border-l-4 border-l-[#FF6B1A] shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Total Temuan PICA</p>
                <p className="text-3xl font-extrabold text-[#1F2937] mt-1">
                  {totalFindings} <span className="text-xs font-normal text-gray-500">Temuan</span>
                </p>
                <p className="text-[11px] text-[#FF6B1A] font-semibold mt-1">
                  {selectedYear === 'ALL' ? 'Akumulasi Semua Tahun' : `Tahun Temuan ${selectedYear}`}
                </p>
              </div>

              <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-5 border-l-4 border-l-emerald-600 shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Temuan Selesai (CLSD)</p>
                <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                  {countClsd} <span className="text-xs font-normal text-gray-500">({pctClsd.toFixed(1)}%)</span>
                </p>
                <p className="text-[11px] text-gray-500 mt-1">Perbaikan diverifikasi ACC</p>
              </div>

              <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-5 border-l-4 border-l-amber-500 shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Temuan Aktif (OPEN / INPG)</p>
                <p className="text-3xl font-extrabold text-amber-600 mt-1">
                  {countOpen + countInpg} <span className="text-xs font-normal text-gray-500">Temuan</span>
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  {countOpen} OPEN • {countInpg} INPG
                </p>
              </div>

              <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-5 border-l-4 border-l-blue-600 shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Pemenuhan Kriteria SMK3</p>
                <p className="text-3xl font-extrabold text-blue-700 mt-1">
                  {pctSesuai.toFixed(1)}%
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  {jumlahSesuai} dari 166 Kriteria Sesuai
                </p>
              </div>
            </div>

            {/* ── Row 2: 2 Pie Charts Side-by-Side ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* (1) PIE CHART: STATUS TEMUAN (CLSD, INPG, OPEN) */}
              <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-bold text-[#1F2937]">Status Temuan Audit (PICA)</h3>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Status Flow
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mb-6">
                    Proporsi temuan yang berstatus CLSD (Closed), INPG (In Progress), dan OPEN
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
                    {/* SVG Chart */}
                    <div className="shrink-0">
                      <SvgDonutChart
                        slices={statusSlices}
                        total={totalFindings}
                        centerTitle={String(totalFindings)}
                        centerSubtitle="Total Temuan"
                        size={190}
                        strokeWidth={28}
                      />
                    </div>

                    {/* Breakdown List */}
                    <div className="w-full sm:w-auto flex-1 space-y-3">
                      {statusSlices.map((slice, i) => (
                        <div
                          key={i}
                          className="bg-white border border-[#E5E7EB] rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs hover:border-[#FF6B1A]/40 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-3.5 h-3.5 rounded-md shrink-0 shadow-2xs"
                              style={{ backgroundColor: slice.color }}
                            />
                            <div>
                              <p className="text-xs font-bold text-[#1F2937]">{slice.label}</p>
                              <p className="text-[10px] text-[#6B7280]">{slice.subLabel}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-bold text-[#1F2937]">
                              {slice.value} Temuan
                            </span>
                            <span className="block text-[11px] font-semibold text-gray-500 font-mono">
                              ({slice.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3.5 border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#6B7280]">
                  <span>Target Penyelesaian: 100% CLSD</span>
                  <span className="font-semibold text-emerald-600">
                    Selesai: {pctClsd.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* (2) PIE CHART: PEMENUHAN SMK3 (SESUAI, MAYOR, MINOR) */}
              <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-bold text-[#1F2937]">Pemenuhan Kriteria SMK3 (PP 50/2012)</h3>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      166 Kriteria
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mb-6">
                    Kategori SESUAI (166 - Mayor - Minor), Kategori MAYOR &amp; MINOR dihitung unik
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
                    {/* SVG Chart */}
                    <div className="shrink-0">
                      <SvgDonutChart
                        slices={pemenuhanSlices}
                        total={166}
                        centerTitle={`${pctSesuai.toFixed(1)}%`}
                        centerSubtitle="Pemenuhan"
                        size={190}
                        strokeWidth={28}
                      />
                    </div>

                    {/* Breakdown List */}
                    <div className="w-full sm:w-auto flex-1 space-y-3">
                      {pemenuhanSlices.map((slice, i) => (
                        <div
                          key={i}
                          className="bg-white border border-[#E5E7EB] rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs hover:border-[#FF6B1A]/40 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-3.5 h-3.5 rounded-md shrink-0 shadow-2xs"
                              style={{ backgroundColor: slice.color }}
                            />
                            <div>
                              <p className="text-xs font-bold text-[#1F2937]">{slice.label}</p>
                              <p className="text-[10px] text-[#6B7280]">{slice.subLabel}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-bold text-[#1F2937]">
                              {slice.value} Kriteria
                            </span>
                            <span className="block text-[11px] font-semibold text-gray-500 font-mono">
                              ({slice.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3.5 border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#6B7280]">
                  <span>Total Master Kriteria: 166</span>
                  <span className="font-semibold text-[#1F2937]">
                    Kesesuaian: {jumlahSesuai}/166 Kriteria
                  </span>
                </div>
              </div>
            </div>

            {/* ── Row 3: Bar Chart Temuan masing-masing Divisi ── */}
            <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-[#1F2937]">
                    Distribusi Temuan per Divisi
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Jumlah temuan per divisi (vertikal) dengan rincian status OPEN, INPG, dan CLSD (horisontal)
                  </p>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  {/* Legend */}
                  <div className="flex items-center gap-3 text-xs bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#EF4444]" />
                      <span className="text-[#1F2937] font-semibold text-[11px]">OPEN</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#3B82F6]" />
                      <span className="text-[#1F2937] font-semibold text-[11px]">INPG</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981]" />
                      <span className="text-[#1F2937] font-semibold text-[11px]">CLSD</span>
                    </div>
                  </div>

                  {/* Toggle All vs Active Divisions */}
                  <button
                    type="button"
                    onClick={() => setShowAllDivisions((prev) => !prev)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 text-[#6B7280] hover:text-[#1F2937] transition-colors shadow-2xs"
                  >
                    {showAllDivisions ? 'Tampilkan Divisi Aktif Saja' : 'Tampilkan Semua Divisi (20)'}
                  </button>
                </div>
              </div>

              {/* Bar List */}
              {divisionStats.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-500 bg-white rounded-xl border border-[#E5E7EB]">
                  <p className="font-semibold text-gray-600">Belum Ada Data Temuan untuk Divisi</p>
                  <p className="text-gray-400 mt-1">
                    {selectedYear === 'ALL'
                      ? 'Belum ada record PICA yang tercatat di sistem.'
                      : `Tidak ada temuan yang tercatat untuk tahun ${selectedYear}.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {divisionStats.map((item, idx) => {
                    const total = item.total;
                    // Width of the overall stacked bar relative to the maximum division count
                    const barWidthPct = total > 0 ? Math.max(6, (total / maxDivisionCount) * 100) : 0;

                    // Proportions within the division's total
                    const pctOpenDiv = total > 0 ? (item.open / total) * 100 : 0;
                    const pctInpgDiv = total > 0 ? (item.inpg / total) * 100 : 0;
                    const pctClsdDiv = total > 0 ? (item.clsd / total) * 100 : 0;

                    return (
                      <div
                        key={idx}
                        className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 hover:border-[#FF6B1A]/40 transition-colors shadow-2xs flex flex-col md:flex-row md:items-center gap-2 md:gap-4"
                      >
                        {/* Vertical Left Axis: Nama Divisi */}
                        <div className="w-full md:w-64 shrink-0 flex items-center justify-between md:justify-start gap-2">
                          <span className="font-semibold text-xs text-[#1F2937] truncate" title={item.divisionName}>
                            {idx + 1}. {item.divisionName}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-gray-400 md:hidden">
                            {total} temuan
                          </span>
                        </div>

                        {/* Horizontal Bar: Stacked OPEN, INPG, CLSD */}
                        <div className="flex-1 flex items-center gap-3">
                          <div className="flex-1 bg-[#F3F4F6] h-7 rounded-lg overflow-hidden flex relative">
                            {total === 0 ? (
                              <div className="w-full h-full flex items-center px-3 text-[11px] text-gray-400 italic">
                                0 temuan
                              </div>
                            ) : (
                              <div
                                className="h-full flex rounded-lg overflow-hidden transition-all duration-700 ease-out"
                                style={{ width: `${barWidthPct}%` }}
                              >
                                {item.open > 0 && (
                                  <div
                                    className="bg-[#EF4444] h-full flex items-center justify-center text-white text-[10px] font-bold transition-all hover:brightness-110"
                                    style={{ width: `${pctOpenDiv}%` }}
                                    title={`OPEN: ${item.open} temuan`}
                                  >
                                    {item.open >= 1 && pctOpenDiv > 12 ? item.open : ''}
                                  </div>
                                )}
                                {item.inpg > 0 && (
                                  <div
                                    className="bg-[#3B82F6] h-full flex items-center justify-center text-white text-[10px] font-bold transition-all hover:brightness-110"
                                    style={{ width: `${pctInpgDiv}%` }}
                                    title={`INPG: ${item.inpg} temuan`}
                                  >
                                    {item.inpg >= 1 && pctInpgDiv > 12 ? item.inpg : ''}
                                  </div>
                                )}
                                {item.clsd > 0 && (
                                  <div
                                    className="bg-[#10B981] h-full flex items-center justify-center text-white text-[10px] font-bold transition-all hover:brightness-110"
                                    style={{ width: `${pctClsdDiv}%` }}
                                    title={`CLSD: ${item.clsd} temuan`}
                                  >
                                    {item.clsd >= 1 && pctClsdDiv > 12 ? item.clsd : ''}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Detail Indicators Pill (OPEN, INPG, CLSD, Total) */}
                          <div className="shrink-0 flex items-center gap-1.5 text-xs font-mono">
                            <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded-md font-bold text-[11px]" title="OPEN">
                              O: {item.open}
                            </span>
                            <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold text-[11px]" title="INPG">
                              I: {item.inpg}
                            </span>
                            <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-bold text-[11px]" title="CLSD">
                              C: {item.clsd}
                            </span>
                            <span className="px-2.5 py-0.5 bg-[#FFF1E8] text-[#FF6B1A] font-bold rounded-md text-[11px]">
                              {total} Temuan
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
