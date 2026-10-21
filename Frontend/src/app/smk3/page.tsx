"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const smk3Modules = [
  {
    id: 1,
    title: "Pembangunan & Pemeliharaan Komitmen",
    description: "Membangun dan memelihara komitmen manajemen terhadap K3",
    href: "/smk3/komitmen",
  },
  {
    id: 2,
    title: "Pembuatan & Pendokumentasian Rencana K3",
    description: "Perencanaan dan dokumentasi program K3",
    href: "/smk3/rencana-k3",
  },
  {
    id: 3,
    title: "Pengendalian Perancangan & Peninjauan Kontrak",
    description: "Kontrol desain dan review kontrak K3",
    href: "/smk3/perancangan-kontrak",
  },
  {
    id: 4,
    title: "Pengendalian Dokumen",
    description: "Manajemen dan kontrol dokumen K3",
    href: "/smk3/dokumen",
  },
  {
    id: 5,
    title: "Pembelian & Pengendalian Produk",
    description: "Kontrol pembelian dan produk terkait K3",
    href: "/smk3/pembelian",
  },
  {
    id: 6,
    title: "Keamanan Bekerja Berdasarkan SMK3",
    description: "Standar keamanan kerja sesuai SMK3",
    href: "/smk3/keamanan-kerja",
  },
  {
    id: 7,
    title: "Standar Pemantauan",
    description: "Standar monitoring dan pengawasan K3",
    href: "/smk3/pemantauan",
  },
  {
    id: 8,
    title: "Pelaporan & Perbaikan Kekurangan",
    description: "Sistem pelaporan dan tindakan perbaikan",
    href: "/smk3/pelaporan",
  },
  {
    id: 9,
    title: "Pengelolaan Material & Perpindahannya",
    description: "Manajemen material dan handling",
    href: "/smk3/material",
  },
  {
    id: 10,
    title: "Pengumpulan & Penggunaan Data",
    description: "Koleksi dan analisis data K3",
    href: "/smk3/data",
  },
  {
    id: 11,
    title: "Pemeriksaan SMK3",
    description: "Audit dan inspeksi sistem SMK3",
    href: "/smk3/pemeriksaan",
  },
  {
    id: 12,
    title: "Pengembangan Keterampilan & Kemampuan",
    description: "Program pelatihan dan pengembangan kompetensi",
    href: "/smk3/pelatihan",
  },
];

export default function SMK3Page() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* Page Header */}
      <div className="bg-white py-10 px-5 md:px-10 border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF6B1A] mb-3">
                Sistem Manajemen K3
              </div>
              <h1 className="font-bold text-[#1F2937] leading-tight text-[clamp(32px,5vw,56px)]">
                SMK3 <span className="text-[#FF6B1A]">Portal</span>
              </h1>
              <p className="text-[#6B7280] text-[14px] mt-2 max-w-2xl">
                Selamat datang, <span className="text-[#1F2937] font-semibold">{user?.nama || user?.name}</span>
              </p>
            </div>
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B1A] text-white font-semibold text-[13px] rounded-xl hover:bg-[#E85D0F] transition-colors shadow-xs"
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
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* SMK3 Modules Grid */}
      <section className="py-12 md:py-16 px-5 md:px-10 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF6B1A] flex items-center gap-2 mb-2">
              <span>12 Elemen Sistem</span>
              <span className="w-8 h-0.5 bg-[#FF6B1A]"></span>
            </div>
            <h2 className="font-bold text-[#1F2937] leading-tight text-[clamp(24px,3.5vw,36px)]">
              Pilih Elemen yang Anda Butuhkan
            </h2>
            <p className="text-[#6B7280] text-[14px] mt-2 max-w-2xl">
              12 Elemen SMK3 sesuai standar regulasi Permenaker No. 50 Tahun 2012
            </p>
          </div>

          {/* Grid of SMK3 Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {smk3Modules.map((module) => (
              <Link
                key={module.id}
                href={module.href}
                className="group bg-white border border-[#E5E7EB] hover:border-[#FF6B1A] p-7 rounded-2xl shadow-xs transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Module Number */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF1E8] border border-[#FF6B1A]/20 flex items-center justify-center text-[#FF6B1A] font-bold text-[18px]">
                      {module.id}
                    </div>
                  </div>

                  {/* Module Title */}
                  <h3 className="font-bold text-[16px] text-[#1F2937] leading-snug mb-2 group-hover:text-[#FF6B1A] transition-colors">
                    {module.title}
                  </h3>

                  {/* Module Description */}
                  <p className="text-[#6B7280] text-[13px] leading-relaxed mb-6">
                    {module.description}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="flex items-center gap-1.5 text-[#FF6B1A] font-semibold text-[13px] transition-all">
                  <span>Buka Elemen</span>
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
                    className="transition-transform group-hover:translate-x-1"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <section className="px-5 md:px-10 py-10 max-w-7xl mx-auto">
        <div className="bg-[#FF6B1A] rounded-2xl p-8 md:p-10 text-white shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div>
              <div className="text-[11px] font-semibold tracking-wider uppercase text-white/80 mb-1">
                Permenaker No. 50/2012
              </div>
              <div className="text-[22px] font-bold leading-tight">
                12 Elemen SMK3
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-[14px] text-white/95 leading-relaxed">
                Sistem Manajemen Keselamatan dan Kesehatan Kerja (SMK3) adalah bagian dari sistem manajemen 
                perusahaan secara keseluruhan dalam rangka pengendalian risiko yang berkaitan dengan kegiatan 
                kerja guna terciptanya tempat kerja yang aman, efisien dan produktif.
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
