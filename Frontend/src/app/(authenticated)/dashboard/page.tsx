"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { findingsApi, getApiErrorMessage } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { RecentFindings } from "@/components/dashboard/RecentFindings";

interface Finding {
  id: string;
  subSubElementId: string;
  title: string;
  findingStatus: 'OPEN' | 'INPG' | 'CLSD';
  createdBy: string;
  createdAt: string;
  data?: Record<string, any>;
}

interface Statistics {
  total: number;
  open: number;
  closed: number;
}

function DashboardContent() {
  const { user } = useAuth();
  const { showError } = useNotifications();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    open: 0,
    closed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch findings data
  useEffect(() => {
    const fetchFindings = async () => {
      try {
        setIsLoading(true);
        const data = await findingsApi.getAll();
        setFindings(data);

        // Calculate statistics
        const stats: Statistics = {
          total: data.length,
          open: data.filter((f) => f.findingStatus === 'OPEN').length,
          closed: data.filter((f) => f.findingStatus === 'CLSD').length,
        };
        setStatistics(stats);
      } catch (error) {
        const errorMessage = getApiErrorMessage(error);
        showError(`Gagal mengambil data: ${errorMessage}`);
        console.error('Error fetching findings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFindings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Page Header */}
      <div className="bg-white border-b border-[#E5E7EB] py-8 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF1E8] border border-[#FF6B1A]/20 text-[11px] font-semibold text-[#FF6B1A] mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B1A]"></span>
                Executive Safety Overview
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#1F2937] tracking-tight">
                Safety <span className="text-[#FF6B1A]">KPI</span> Dashboard
              </h1>
              <p className="text-sm text-[#6B7280] mt-1">
                Indikator kinerja keselamatan, pemantauan insiden, dan ringkasan audit
              </p>
            </div>
            <div className="flex items-center gap-3.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-3 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="w-10 h-10 rounded-full bg-[#FFF1E8] border border-[#FF6B1A]/20 text-[#FF6B1A] font-bold text-base flex items-center justify-center flex-shrink-0">
                {(user?.name || user?.role || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Logged in as</p>
                <p className="text-sm font-bold text-[#1F2937] leading-tight">{user?.name || user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SMK3 Findings Statistics Section */}
      <section className="bg-[#FAFAFA] py-8 px-5 md:px-10 border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#1F2937] tracking-tight">
                Statistik Temuan K3
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Ringkasan akumulasi seluruh temuan keselamatan kerja di lapangan
              </p>
            </div>
            <Link
              href="/findings/new"
              className="inline-flex items-center gap-2 bg-[#FF6B1A] text-white font-semibold text-xs tracking-wider uppercase px-4 py-2.5 rounded-lg shadow-sm hover:bg-[#E85D0F] transition-colors self-start md:self-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tambah Temuan Baru
            </Link>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {/* Total Findings Card */}
                <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#FF6B1A]/40 transition-all">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Total Temuan</p>
                      <p className="text-3xl font-bold tracking-tight text-[#1F2937] mt-2 mb-1">{statistics.total}</p>
                      <p className="text-xs text-[#9CA3AF]">Jumlah total temuan K3</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                    </div>
                  </CardContent>
                </Card>

                {/* Open Findings Card */}
                <Card className="rounded-xl bg-white border border-[#FF6B1A]/30 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#FF6B1A] transition-all">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#FF6B1A]">Temuan Terbuka</p>
                      <p className="text-3xl font-bold tracking-tight text-[#FF6B1A] mt-2 mb-1">{statistics.open}</p>
                      <p className="text-xs text-[#9CA3AF]">Status OPEN (Memerlukan Tindakan)</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-[#FFF1E8] text-[#FF6B1A] flex items-center justify-center">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                  </CardContent>
                </Card>

                {/* Closed Findings Card */}
                <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-emerald-300 transition-all">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Temuan Selesai</p>
                      <p className="text-3xl font-bold tracking-tight text-emerald-600 mt-2 mb-1">{statistics.closed}</p>
                      <p className="text-xs text-[#9CA3AF]">Status CLSD (Sudah Diverifikasi)</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Findings Widget */}
              <RecentFindings findings={findings} isLoading={false} />
            </>
          )}
        </div>
      </section>

      {/* Primary KPI Cards */}
      <section className="bg-white py-12 px-5 md:px-10 border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FF6B1A] mb-1">
              Metrik Keselamatan Kunci
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-[#1F2937] tracking-tight">
              Key Safety Performance Indicators
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Pantauan indikator keselamatan dan jam kerja aman terakumulasi YTD 2024
            </p>
          </div>

          {/* Row 1: Primary metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#FF6B1A]/40 transition-all flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2">
                  Lost Time Injury Frequency Rate
                </p>
                <p className="text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight mb-2">
                  0.12
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  Down from 0.18 (Prior Year)
                </div>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-4 pt-3 border-t border-[#F3F4F6]">
                per million manhours — YTD 2024
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#FF6B1A]/40 transition-all flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2">
                  Total Recordable Incident Rate
                </p>
                <p className="text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight mb-2">
                  0.34
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  Down from 0.51 (Prior Year)
                </div>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-4 pt-3 border-t border-[#F3F4F6]">
                per million manhours — YTD 2024
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#FF6B1A]/40 transition-all flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2">
                  Safe Manhours YTD
                </p>
                <div className="text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight mb-2 flex items-baseline">
                  12.45
                  <span className="text-lg font-bold text-[#FF6B1A] ml-1">M</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFF1E8] text-[#FF6B1A] text-xs font-semibold">
                  Without Lost Time Injury
                </div>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-4 pt-3 border-t border-[#F3F4F6]">
                manhours worked safely
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#FF6B1A]/40 transition-all flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2">
                  Total Training Hours
                </p>
                <p className="text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight mb-2">
                  45,200
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F3F4F6] text-[#374151] text-xs font-semibold">
                  1,280 certifications issued
                </div>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-4 pt-3 border-t border-[#F3F4F6]">
                cumulative training hours YTD
              </p>
            </div>
          </div>

          {/* Row 2: Secondary metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-[#E5E7EB] border-l-4 border-l-[#FF6B1A] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                Zero Fatality Record
              </p>
              <p className="text-3xl font-extrabold text-[#FF6B1A] tracking-tight mb-1">
                1,247
              </p>
              <p className="text-xs text-[#6B7280]">
                consecutive days without fatality
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] border-l-4 border-l-[#E85D0F] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                Days Since Last LTI
              </p>
              <p className="text-3xl font-extrabold text-[#1F2937] tracking-tight mb-1">
                <span className="text-[#FF6B1A]">487</span> <span className="text-sm font-semibold text-[#6B7280]">Hari</span>
              </p>
              <p className="text-xs text-[#6B7280]">
                Lost Time Injury-free streak — ongoing
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] border-l-4 border-l-[#FF6B1A] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                PPE Compliance Rate
              </p>
              <p className="text-3xl font-extrabold text-[#1F2937] tracking-tight mb-1">
                <span className="text-[#FF6B1A]">98.6</span>%
              </p>
              <p className="text-xs text-[#6B7280]">
                based on Q2 2024 field audit observations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-12 md:py-16 px-5 md:px-10 bg-[#FAFAFA] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FF6B1A] mb-1">
              Performance Trend
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-[#1F2937] tracking-tight">
              5-Year Safety Performance
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Analisis komparatif tren penurunan tingkat insiden kecelakaan 2020 hingga 2024
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-[#1F2937]">
                  LTIFR Trend
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 bg-[#FFF1E8] text-[#E85D0F] border border-[#FF6B1A]/20 rounded-md">
                  85% Reduction
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mb-8">
                Lost Time Injury Frequency Rate — 2020 to 2024
              </p>
              <div className="h-[240px] flex items-end justify-between gap-4 pt-4 border-b border-[#E5E7EB] pb-2">
                {[1.42, 1.16, 0.85, 0.51, 0.12].map((value, index) => {
                  const max = 1.42;
                  const height = (value / max) * 100;
                  const years = ["2020", "2021", "2022", "2023", "2024"];
                  const isCurrent = index === 4;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <span className="text-xs font-bold text-[#1F2937] mb-2">{value}</span>
                      <div
                        className={`w-full max-w-[48px] rounded-t-lg transition-all ${
                          isCurrent ? "bg-[#FF6B1A] shadow-sm" : "bg-[#FED7AA] hover:bg-[#FDBA74]"
                        }`}
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className={`mt-3 text-xs ${isCurrent ? 'font-bold text-[#FF6B1A]' : 'font-medium text-[#6B7280]'}`}>
                        {years[index]}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 flex items-center justify-between text-xs text-[#6B7280]">
                <span>Tingkat insiden kerja menurun signifikan</span>
                <span className="font-semibold text-[#1F2937]">Target 2025: &lt; 0.10</span>
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-[#1F2937]">
                  TRIR by Year
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 bg-[#FFF1E8] text-[#E85D0F] border border-[#FF6B1A]/20 rounded-md">
                  76% Reduction
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mb-8">
                Total Recordable Incident Rate — 5-year comparison
              </p>
              <div className="space-y-4">
                {[
                  { year: "2020", value: 1.42, max: 1.42 },
                  { year: "2021", value: 1.16, max: 1.42 },
                  { year: "2022", value: 0.85, max: 1.42 },
                  { year: "2023", value: 0.51, max: 1.42 },
                  { year: "2024", value: 0.34, max: 1.42, current: true },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 text-xs"
                  >
                    <div className={`w-10 font-medium ${item.current ? "font-bold text-[#FF6B1A]" : "text-[#6B7280]"}`}>
                      {item.year}
                    </div>
                    <div className="flex-1 h-6 bg-[#F3F4F6] relative rounded-md overflow-hidden">
                      <div
                        className={`h-full rounded-md transition-all ${
                          item.current ? "bg-[#FF6B1A]" : "bg-[#FED7AA]"
                        }`}
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      ></div>
                    </div>
                    <div
                      className={`w-10 text-right font-bold ${
                        item.current ? "text-[#FF6B1A]" : "text-[#1F2937]"
                      }`}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-[#F3F4F6] flex items-center justify-between text-xs text-[#6B7280]">
                <span>Penurunan kumulatif konsisten</span>
                <span className="font-semibold text-[#1F2937]">Audit Rating: A (Excellent)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reports Archive */}
      <section className="py-12 md:py-16 px-5 md:px-10 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FF6B1A] mb-1">
              Public Reports Archive
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-[#1F2937] tracking-tight">
              Downloadable Documents
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Dokumen laporan publik, keselamatan kerja, dan pelaporan ESG terkini
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                type: "Annual Report",
                title: "Annual OHS Report 2024",
                meta: "Published: January 2025 • Format: PDF • Language: Indonesian / English",
              },
              {
                type: "ESG Report",
                title: "ESG Report 2024",
                meta: "Published: March 2025 • Format: PDF • Language: English",
              },
              {
                type: "Safety Alert",
                title: "Safety Alert Poster 2024",
                meta: "Published: June 2024 • Format: PDF • Language: Indonesian",
              },
            ].map((report, index) => (
              <div
                key={index}
                className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#FF6B1A]/40 transition-all flex flex-col justify-between gap-5"
              >
                <div>
                  <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-[#FFF1E8] text-[#FF6B1A] mb-3">
                    {report.type}
                  </span>
                  <h3 className="text-base font-bold text-[#1F2937] mb-2 leading-snug">
                    {report.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{report.meta}</p>
                </div>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 bg-white text-[#1F2937] hover:text-[#FF6B1A] border border-[#E5E7EB] hover:border-[#FF6B1A] font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors self-start shadow-xs"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download PDF
                </a>
              </div>
            ))}
          </div>

          {/* ESG Statement Banner */}
          <div className="mt-12 bg-gradient-to-r from-[#FF6B1A] to-[#E85D0F] rounded-2xl p-8 md:p-10 shadow-sm text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/80 mb-2">
                  ESG Social Pillar
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Environmental", "Social", "Governance"].map((pillar) => (
                    <span
                      key={pillar}
                      className="text-xs font-semibold text-white bg-white/15 border border-white/30 rounded-lg px-3 py-1 backdrop-blur-xs"
                    >
                      {pillar}
                    </span>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-base md:text-lg font-semibold text-white leading-relaxed">
                  "Strong OHS performance underpins our Social pillar in ESG,
                  building investor and community trust through transparent public
                  reporting."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to SMK3 */}
      <div className="py-8 px-5 md:px-10 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto text-center">
          <Link
            href="/smk3"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B7280] hover:text-[#FF6B1A] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Kembali ke SMK3 Overview
          </Link>
        </div>
      </div>
    </>
  );
}

export default function KPIDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
