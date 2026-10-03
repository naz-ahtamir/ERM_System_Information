"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SubSubElement711Page() {
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

  const inspectionTypes = [
    {
      id: "inspeksi-ketidaksesuaian",
      title: "Inspeksi Ketidaksesuaian",
      description: "Pemeriksaan untuk mengidentifikasi dan mendokumentasikan ketidaksesuaian terhadap standar K3 yang berlaku",
      icon: "fa-exclamation-triangle",
      color: "border-t-[#f7941d]",
    },
    {
      id: "inspeksi-sarana-prasarana",
      title: "Inspeksi Sarana Prasarana",
      description: "Pemeriksaan berkala terhadap fasilitas dan infrastruktur untuk memastikan keselamatan dan kenyamanan kerja",
      icon: "fa-building",
      color: "border-t-[#3a86ff]",
    },
    {
      id: "inspeksi-kotak-p3k",
      title: "Inspeksi Kotak P3K",
      description: "Pemeriksaan ketersediaan dan kondisi kotak pertolongan pertama pada kecelakaan (P3K)",
      icon: "fa-first-aid",
      color: "border-t-[#80b918]",
    },
    {
      id: "inspeksi-apd",
      title: "Inspeksi APD",
      description: "Pemeriksaan kelayakan dan kondisi Alat Pelindung Diri (APD) untuk memastikan efektivitasnya",
      icon: "fa-hard-hat",
      color: "border-t-[#e76f51]",
    },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="bg-[#231f20] py-8 px-5 md:px-10 border-b-[4px] border-b-[#f15a22]">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <Link href="/smk3" className="text-[#c5c0bb] hover:text-[#f15a22] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
            </Link>
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#c5c0bb]">SMK3</div>
            <div className="text-[#c5c0bb]">/</div>
            <Link href="/smk3/pemantauan" className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#c5c0bb] hover:text-[#f15a22] transition-colors">
              Elemen 7
            </Link>
            <div className="text-[#c5c0bb]">/</div>
            <Link href="/smk3/pemantauan/7-1" className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#c5c0bb] hover:text-[#f15a22] transition-colors">
              Sub-Elemen 7.1
            </Link>
            <div className="text-[#c5c0bb]">/</div>
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22]">7.1.1</div>
          </div>

          {/* Title Section */}
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-[#f15a22] px-4 py-2 flex items-center justify-center text-white font-barlow-condensed font-extrabold text-[18px]">
              7.1.1
            </div>
            <div className="flex-1">              
              <h1 className="font-barlow-condensed font-extrabold text-white uppercase leading-[0.95] tracking-[-0.01em] text-[clamp(24px,4vw,40px)]">
                Pelaksanaan Inspeksi K3
              </h1>
            </div>
          </div>
          <p className="text-[#c5c0bb] text-[14px] max-w-3xl">
            Kelola berbagai jenis inspeksi keselamatan dan kesehatan kerja secara terstruktur dan terorganisir
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 md:py-24 px-5 md:px-10 bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] flex items-center gap-3 mb-4">
              <span>{inspectionTypes.length} Jenis Inspeksi</span>
              <span className="w-10 h-0.5 bg-[#f15a22]"></span>
            </div>
            <h2 className="font-barlow-condensed font-extrabold text-[#231f20] uppercase leading-tight text-[clamp(28px,4vw,48px)]">
              Pilih Jenis Inspeksi
            </h2>
          </div>

          {/* Grid of Inspection Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {inspectionTypes.map((item) => (
              <Link
                key={item.id}
                href={`/smk3/pemantauan/7-1/7-1-1/${item.id}`}
                className="group bg-white p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-t-4 ${item.color}"
              >
                {/* Icon Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-[#f15a22]/10 w-14 h-14 rounded-full flex items-center justify-center text-[#f15a22] group-hover:bg-[#f15a22] group-hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {item.id === "inspeksi-ketidaksesuaian" && (
                        <>
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                          <path d="M12 9v4" />
                          <path d="M12 17h.01" />
                        </>
                      )}
                      {item.id === "inspeksi-sarana-prasarana" && (
                        <>
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <path d="M3 9h18" />
                          <path d="M9 21V9" />
                        </>
                      )}
                      {item.id === "inspeksi-kotak-p3k" && (
                        <>
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                          <path d="M10 11h4" />
                          <path d="M12 9v4" />
                        </>
                      )}
                      {item.id === "inspeksi-apd" && (
                        <>
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                          <line x1="9" y1="9" x2="9.01" y2="9" />
                          <line x1="15" y1="9" x2="15.01" y2="9" />
                        </>
                      )}
                    </svg>
                  </div>                  
                </div>

                {/* Title */}
                <h3 className="font-barlow-condensed font-extrabold text-[20px] uppercase text-[#231f20] leading-tight mb-3 group-hover:text-[#f15a22] transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-[#6b6560] text-[14px] leading-relaxed mb-6">
                  {item.description}
                </p>

                {/* Action Button */}
                <div className="w-full px-4 py-2.5 bg-[#f15a22] text-white font-barlow-condensed font-bold text-[12px] tracking-[0.08em] uppercase hover:bg-[#f7941d] transition-colors text-center">
                  Kelola Data
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
