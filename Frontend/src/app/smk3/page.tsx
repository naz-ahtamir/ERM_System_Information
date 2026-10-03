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
    color: "bg-[#f15a22]",
    href: "/smk3/komitmen",
  },
  {
    id: 2,
    title: "Pembuatan & Pendokumentasian Rencana K3",
    description: "Perencanaan dan dokumentasi program K3",
    color: "bg-[#f7941d]",
    href: "/smk3/rencana-k3",
  },
  {
    id: 3,
    title: "Pengendalian Perancangan & Peninjauan Kontrak",
    description: "Kontrol desain dan review kontrak K3",
    color: "bg-[#f15a22]",
    href: "/smk3/perancangan-kontrak",
  },
  {
    id: 4,
    title: "Pengendalian Dokumen",
    description: "Manajemen dan kontrol dokumen K3",
    color: "bg-[#f7941d]",
    href: "/smk3/dokumen",
  },
  {
    id: 5,
    title: "Pembelian & Pengendalian Produk",
    description: "Kontrol pembelian dan produk terkait K3",
    color: "bg-[#f15a22]",
    href: "/smk3/pembelian",
  },
  {
    id: 6,
    title: "Keamanan Bekerja Berdasarkan SMK3",
    description: "Standar keamanan kerja sesuai SMK3",
    color: "bg-[#f7941d]",
    href: "/smk3/keamanan-kerja",
  },
  {
    id: 7,
    title: "Standar Pemantauan",
    description: "Standar monitoring dan pengawasan K3",
    color: "bg-[#f15a22]",
    href: "/smk3/pemantauan",
  },
  {
    id: 8,
    title: "Pelaporan & Perbaikan Kekurangan",
    description: "Sistem pelaporan dan tindakan perbaikan",
    color: "bg-[#f7941d]",
    href: "/smk3/pelaporan",
  },
  {
    id: 9,
    title: "Pengelolaan Material & Perpindahannya",
    description: "Manajemen material dan handling",
    color: "bg-[#f15a22]",
    href: "/smk3/material",
  },
  {
    id: 10,
    title: "Pengumpulan & Penggunaan Data",
    description: "Koleksi dan analisis data K3",
    color: "bg-[#f7941d]",
    href: "/smk3/data",
  },
  {
    id: 11,
    title: "Pemeriksaan SMK3",
    description: "Audit dan inspeksi sistem SMK3",
    color: "bg-[#f15a22]",
    href: "/smk3/pemeriksaan",
  },
  {
    id: 12,
    title: "Pengembangan Keterampilan & Kemampuan",
    description: "Program pelatihan dan pengembangan kompetensi",
    color: "bg-[#f7941d]",
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
  }, [status, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* Page Header */}
      <div className="bg-[#231f20] py-10 px-5 md:px-10 border-b-[4px] border-b-[#f15a22]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-4">
                Sistem Manajemen K3
              </div>
              <h1 className="font-barlow-condensed font-extrabold text-white uppercase leading-[0.95] tracking-[-0.01em] text-[clamp(42px,6vw,80px)]">
                SMK3 <span className="text-[#f7941d]">Portal</span>
              </h1>
              <p className="text-[#c5c0bb] text-[14px] mt-4 max-w-2xl">
                Selamat datang, <span className="text-[#f7941d] font-bold">{user?.name}</span>
              </p>
            </div>
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#f15a22] text-white font-barlow-condensed font-bold text-[12px] tracking-[0.12em] uppercase border-2 border-[#f15a22] hover:bg-transparent hover:text-[#f15a22] transition-colors"
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
      <section className="py-16 md:py-24 px-5 md:px-10 bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] flex items-center gap-3 mb-4">
              <span>12 Elemen Sistem</span>
              <span className="w-10 h-0.5 bg-[#f15a22]"></span>
            </div>
            <h2 className="font-barlow-condensed font-extrabold text-[#231f20] uppercase leading-tight text-[clamp(32px,4vw,56px)]">
              Pilih Elemen<br />yang Anda Butuhkan
            </h2>
            <p className="text-[#6b6560] text-[14px] mt-4 max-w-2xl">
              12 Elemen SMK3 sesuai Permenaker No. 50 Tahun 2012
            </p>
          </div>

          {/* Grid of SMK3 Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {smk3Modules.map((module) => (
              <Link
                key={module.id}
                href={module.href}
                className="group bg-white border-t-4 border-t-transparent hover:border-t-[#f15a22] p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Module Number */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`${module.color} w-14 h-14 flex items-center justify-center text-white font-barlow-condensed font-extrabold text-[20px] transition-transform group-hover:scale-110`}>
                    {module.id}
                  </div>
                </div>

                {/* Module Title */}
                <h3 className="font-barlow-condensed font-bold text-[18px] uppercase text-[#231f20] leading-tight mb-3 group-hover:text-[#f15a22] transition-colors">
                  {module.title}
                </h3>

                {/* Module Description */}
                <p className="text-[#6b6560] text-[13px] leading-relaxed mb-4">
                  {module.description}
                </p>

                {/* Arrow Icon */}
                <div className="flex items-center gap-2 text-[#f15a22] font-barlow-condensed font-bold text-[12px] tracking-[0.08em] uppercase opacity-0 group-hover:opacity-100 transition-opacity">
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
      <div className="bg-[#f15a22] py-12 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div>
              <div className="font-barlow-condensed text-[10px] font-bold tracking-[0.2em] uppercase text-white/65 mb-2">
                Permenaker No. 50/2012
              </div>
              <div className="font-barlow-condensed text-[24px] font-bold text-white leading-tight">
                12 Elemen SMK3
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="font-barlow text-[14px] text-white/90 leading-relaxed">
                Sistem Manajemen Keselamatan dan Kesehatan Kerja (SMK3) adalah bagian dari sistem manajemen 
                perusahaan secara keseluruhan dalam rangka pengendalian risiko yang berkaitan dengan kegiatan 
                kerja guna terciptanya tempat kerja yang aman, efisien dan produktif.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
