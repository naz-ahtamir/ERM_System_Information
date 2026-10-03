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
      <div className="bg-[#231f20] py-10 px-5 md:px-10 border-b-[4px] border-b-[#f15a22]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-4">
                Welcome, {user?.role}
              </div>
              <h1 className="font-barlow-condensed font-extrabold text-white uppercase leading-[0.95] tracking-[-0.01em] text-[clamp(42px,6vw,80px)]">
                Safety <span className="text-[#f7941d]">KPI</span><br />Dashboard
              </h1>
            </div>
            <div className="text-right">
              <div className="font-barlow-condensed text-[10px] font-bold tracking-[0.2em] uppercase text-[#6b6560] mb-2">
                Logged in as
              </div>
              <div className="font-barlow-condensed text-[18px] font-bold text-[#f7941d]">
                {user?.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SMK3 Findings Statistics Section */}
      <section className="bg-white py-10 px-5 md:px-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] flex items-center gap-3 mb-4">
              <span>Temuan K3</span>
              <span className="w-10 h-0.5 bg-[#f15a22]"></span>
            </div>
            <h2 className="font-barlow-condensed font-extrabold text-[#231f20] uppercase leading-tight text-[clamp(24px,3vw,40px)]">
              Statistik Temuan K3
            </h2>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Total Findings Card */}
                <Card className="rounded-none bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-l-blue-500">
                  <CardContent className="flex flex-col items-start">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Total Temuan</p>
                    <p className="text-4xl font-bold text-blue-600 mb-1">{statistics.total}</p>
                    <p className="text-xs text-gray-500">Jumlah total temuan K3</p>
                  </CardContent>
                </Card>

                {/* Open Findings Card */}
                <Card className="rounded-none bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-l-[#f15a22]">
                  <CardContent className="flex flex-col items-start">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Temuan Terbuka</p>
                    <p className="text-4xl font-bold text-[#f15a22] mb-1">{statistics.open}</p>
                    <p className="text-xs text-gray-500">Temuan dengan status OPEN</p>
                  </CardContent>
                </Card>

                {/* Closed Findings Card */}
                <Card className="rounded-none bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-l-green-500">
                  <CardContent className="flex flex-col items-start">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Temuan Tertutup</p>
                    <p className="text-4xl font-bold text-green-600 mb-1">{statistics.closed}</p>
                    <p className="text-xs text-gray-500">Temuan dengan status CLSD</p>
                  </CardContent>
                </Card>
              </div>

              {/* Add Finding Button */}
              <div className="mb-8">
                <Link
                  href="/findings/new"
                  className="inline-flex items-center gap-2 bg-[#f15a22] text-white font-barlow-condensed font-bold text-sm tracking-[0.08em] uppercase px-6 py-3 hover:bg-[#e04a10] transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Tambah Temuan Baru
                </Link>
              </div>

              {/* Recent Findings Widget */}
              <RecentFindings findings={findings} isLoading={false} />
            </>
          )}
        </div>
      </section>

      {/* Primary KPI Cards */}
      <section className="bg-[#231f20] py-10 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          {/* Row 1: Primary metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[2px] mb-[2px]">
            <div className="bg-[#f15a22] p-[44px_32px] relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-black/8 clip-path-polygon"></div>
              <div className="font-barlow-condensed text-[10px] font-bold tracking-[0.2em] uppercase text-white/65 mb-5">
                Lost Time Injury Frequency Rate
              </div>
              <div className="font-barlow-condensed font-extrabold text-white text-[clamp(38px,4.5vw,60px)] leading-none mb-3">
                0.12
              </div>
              <div className="flex items-center gap-2 font-barlow-condensed text-[12px] font-bold tracking-[0.08em] uppercase text-[#7CFC00]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                Down from 0.18 (Prior Year)
              </div>
              <div className="text-[12px] text-white/50 mt-1">
                per million manhours — YTD 2024
              </div>
            </div>
            <div className="bg-[#f7941d] p-[44px_32px] relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-black/8 clip-path-polygon"></div>
              <div className="font-barlow-condensed text-[10px] font-bold tracking-[0.2em] uppercase text-white/65 mb-5">
                Total Recordable Incident Rate
              </div>
              <div className="font-barlow-condensed font-extrabold text-white text-[clamp(38px,4.5vw,60px)] leading-none mb-3">
                0.34
              </div>
              <div className="flex items-center gap-2 font-barlow-condensed text-[12px] font-bold tracking-[0.08em] uppercase text-[#7CFC00]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                Down from 0.51 (Prior Year)
              </div>
              <div className="text-[12px] text-white/50 mt-1">
                per million manhours — YTD 2024
              </div>
            </div>
            <div className="bg-[#231f20] p-[44px_32px] relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-black/8 clip-path-polygon"></div>
              <div className="font-barlow-condensed text-[10px] font-bold tracking-[0.2em] uppercase text-white/65 mb-5">
                Safe Manhours YTD
              </div>
              <div className="font-barlow-condensed font-extrabold text-white text-[clamp(38px,4.5vw,60px)] leading-none mb-3">
                12.45
                <sup className="font-size-0.4em vertical-align-super font-extrabold">
                  M
                </sup>
              </div>
              <div className="font-barlow-condensed text-[12px] font-bold tracking-[0.08em] uppercase text-white/50">
                Without Lost Time Injury
              </div>
              <div className="text-[12px] text-white/50 mt-1">
                manhours worked safely
              </div>
            </div>
            <div className="bg-[#2d2929] p-[44px_32px] relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-black/8 clip-path-polygon"></div>
              <div className="font-barlow-condensed text-[10px] font-bold tracking-[0.2em] uppercase text-white/65 mb-5">
                Total Training Hours
              </div>
              <div className="font-barlow-condensed font-extrabold text-white text-[clamp(38px,4.5vw,60px)] leading-none mb-3">
                45,200
              </div>
              <div className="font-barlow-condensed text-[12px] font-bold tracking-[0.08em] uppercase text-white/50">
                1,280 certifications issued
              </div>
              <div className="text-[12px] text-white/50 mt-1">
                cumulative training hours YTD
              </div>
            </div>
          </div>

          {/* Row 2: Secondary metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] mt-[2px]">
            <div className="bg-[#ffffff] border-t-4 border-t-[#f15a22] p-[36px_30px]">
              <div className="font-barlow-condensed text-[10px] font-bold tracking-[0.2em] uppercase text-[#6b6560] mb-4">
                Zero Fatality Record
              </div>
              <div className="font-barlow-condensed font-extrabold text-[#f15a22] text-[clamp(28px,3vw,44px)] leading-none mb-2">
                1,247
              </div>
              <div className="text-[13px] text-[#6b6560]">
                consecutive days without fatality
              </div>
            </div>
            <div className="bg-[#ffffff] border-t-4 border-t-[#f7941d] p-[36px_30px]">
              <div className="font-barlow-condensed text-[10px] font-bold tracking-[0.2em] uppercase text-[#6b6560] mb-4">
                Days Since Last LTI
              </div>
              <div className="font-barlow-condensed font-extrabold text-[#231f20] text-[clamp(28px,3vw,44px)] leading-none mb-2">
                <span className="text-[#f15a22]">487</span>
              </div>
              <div className="text-[13px] text-[#6b6560]">
                Lost Time Injury-free streak — ongoing
              </div>
            </div>
            <div className="bg-[#ffffff] border-t-4 border-t-[#f7941d] p-[36px_30px]">
              <div className="font-barlow-condensed text-[10px] font-bold tracking-[0.2em] uppercase text-[#6b6560] mb-4">
                PPE Compliance Rate
              </div>
              <div className="font-barlow-condensed font-extrabold text-[#231f20] text-[clamp(28px,3vw,44px)] leading-none mb-2">
                <span className="text-[#f15a22]">98.6</span>%
              </div>
              <div className="text-[13px] text-[#6b6560]">
                based on Q2 2024 field audit observations
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-16 md:py-24 px-5 md:px-10 bg-[#ffffff]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] flex items-center gap-3 mb-4">
              <span>Performance Trend</span>
              <span className="w-10 h-0.5 bg-[#f15a22]"></span>
            </div>
            <h2 className="font-barlow-condensed font-extrabold text-[#231f20] uppercase leading-tight text-[clamp(32px,4vw,56px)]">
              5-Year Safety<br />Performance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-[#faf9f7] p-9 border-l-4 border-l-[#f15a22]">
              <div className="font-barlow-condensed text-[18px] font-bold uppercase text-[#231f20] mb-2">
                LTIFR Trend
              </div>
              <div className="text-[13px] text-[#6b6560] mb-7">
                Lost Time Injury Frequency Rate — 2020 to 2024
              </div>
              <div className="h-[280px] flex items-end justify-between gap-4">
                {[1.42, 1.16, 0.85, 0.51, 0.12].map((value, index) => {
                  const max = 1.42;
                  const height = (value / max) * 100;
                  const years = ["2020", "2021", "2022", "2023", "2024"];
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-full rounded-t-lg ${
                          index === 4 ? "bg-[#231f20]" : "bg-[#f15a22]"
                        }`}
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="mt-3 font-barlow-condensed text-[14px] font-bold text-[#231f20]">
                        {years[index]}
                      </div>
                      <div className="font-barlow-condensed text-[14px] font-bold text-[#231f20]">
                        {value}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 inline-flex items-center gap-2 bg-[#f15a22] text-white font-barlow-condensed text-[12px] font-bold tracking-[0.08em] uppercase px-4 py-2">
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
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                85% reduction over 5 years
              </div>
            </div>

            <div className="bg-[#faf9f7] p-9 border-l-4 border-l-[#f15a22]">
              <div className="font-barlow-condensed text-[18px] font-bold uppercase text-[#231f20] mb-2">
                TRIR by Year
              </div>
              <div className="text-[13px] text-[#6b6560] mb-7">
                Total Recordable Incident Rate — 5-year comparison
              </div>
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
                    className={`flex items-center gap-4 ${
                      item.current ? "font-bold" : ""
                    }`}
                  >
                    <div className="font-barlow-condensed text-[14px] font-bold text-[#231f20] w-10">
                      {item.year}
                    </div>
                    <div className="flex-1 h-7 bg-[#f2f0ee] relative rounded">
                      <div
                        className={`h-full rounded ${
                          item.current ? "bg-[#231f20]" : "bg-[#f15a22]"
                        }`}
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      ></div>
                    </div>
                    <div
                      className={`font-barlow-condensed text-[14px] font-bold w-10 text-right ${
                        item.current ? "text-[#f15a22]" : "text-[#231f20]"
                      }`}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 inline-flex items-center gap-2 bg-[#231f20] text-white font-barlow-condensed text-[12px] font-bold tracking-[0.08em] uppercase px-4 py-2">
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
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                76% reduction since 2020
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reports Archive */}
      <section className="py-16 md:py-24 px-5 md:px-10 bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] flex items-center gap-3 mb-4">
              <span>Public Reports Archive</span>
              <span className="w-10 h-0.5 bg-[#f15a22]"></span>
            </div>
            <h2 className="font-barlow-condensed font-extrabold text-[#231f20] uppercase leading-tight text-[clamp(32px,4vw,56px)]">
              Downloadable<br />Documents
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px]">
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
                className="bg-[#ffffff] border-t-4 border-t-[#f15a22] p-[36px_30px] flex flex-col gap-4"
              >
                <div className="font-barlow-condensed text-[10px] font-bold tracking-[0.2em] uppercase text-[#f15a22]">
                  {report.type}
                </div>
                <div className="font-barlow-condensed text-[20px] font-bold uppercase text-[#231f20]">
                  {report.title}
                </div>
                <div className="text-[13px] text-[#6b6560]">{report.meta}</div>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 bg-[#231f20] text-white border-2 border-[#231f20] font-barlow-condensed font-bold text-[12px] tracking-[0.12em] uppercase px-5 py-3 hover:bg-[#f15a22] hover:border-[#f15a22] transition-colors self-start"
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download PDF
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ESG Statement */}
      <div className="bg-[#f15a22] py-15 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 items-center">
            <div>
              <div className="font-barlow-condensed text-[10px] font-bold tracking-[0.2em] uppercase text-white/65 mb-2">
                ESG Social Pillar
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {["Environmental", "Social", "Governance"].map((pillar) => (
                  <span
                    key={pillar}
                    className="font-barlow-condensed text-[14px] font-bold tracking-[0.1em] uppercase text-white border-2 border-white/40 px-4 py-2"
                  >
                    {pillar}
                  </span>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="font-barlow-condensed text-[clamp(20px,2.5vw,32px)] font-bold text-white leading-[1.3]">
                Strong OHS performance underpins our Social pillar in ESG,
                building investor and community trust through transparent public
                reporting.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to SMK3 */}
      <div className="py-8 px-5 md:px-10 bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto text-center">
          <Link
            href="/smk3"
            className="inline-flex items-center gap-2 text-[14px] text-[#6b6560] hover:text-[#231f20] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
            Kembali ke SMK3
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
