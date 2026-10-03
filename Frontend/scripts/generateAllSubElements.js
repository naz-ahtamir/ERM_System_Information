import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping SEMUA sub-elements dengan judul dan deskripsi
const subElementsData = {
  "1.2": { title: "Tanggung Jawab dan Wewenang untuk Bertindak", description: "Penetapan tanggung jawab dan wewenang K3 di seluruh tingkat organisasi", element: "komitmen", elementNum: "1" },
  "1.3": { title: "Tinjauan Ulang & Evaluasi SMK3", description: "Management review dan evaluasi berkala terhadap efektivitas sistem K3", element: "komitmen", elementNum: "1" },
  "1.4": { title: "Keterlibatan dan Konsultasi Tenaga Kerja (P2K3)", description: "Pembentukan dan aktivitas P2K3 serta keterlibatan tenaga kerja", element: "komitmen", elementNum: "1" },
  "2.1": { title: "Rencana Strategi K3 (HIRADC)", description: "Penyusunan rencana strategi K3 berdasarkan hasil HIRADC", element: "rencana-k3", elementNum: "2" },
  "2.2": { title: "Manual SMK3", description: "Penyusunan dan pengelolaan manual sistem manajemen K3", element: "rencana-k3", elementNum: "2" },
  "2.3": { title: "Peraturan & Persyaratan Lain K3", description: "Identifikasi dan pengelolaan peraturan K3 yang berlaku", element: "rencana-k3", elementNum: "2" },
  "2.4": { title: "Informasi K3", description: "Sistem distribusi dan pengelolaan informasi K3", element: "rencana-k3", elementNum: "2" },
  "3.1": { title: "Pengendalian Perancangan", description: "Pengendalian perancangan produk, mesin, dan proses", element: "perancangan-kontrak", elementNum: "3" },
  "3.2": { title: "Peninjauan Ulang Kontrak", description: "Peninjauan kontrak vendor dan subkontraktor", element: "perancangan-kontrak", elementNum: "3" },
  "4.1": { title: "Persetujuan & Pengeluaran Dokumen", description: "Sistem persetujuan dan pengeluaran dokumen K3", element: "dokumen", elementNum: "4" },
  "4.2": { title: "Perubahan & Modifikasi Dokumen", description: "Pengendalian perubahan dan modifikasi dokumen K3", element: "dokumen", elementNum: "4" },
  "5.1": { title: "Spesifikasi Pembelian Barang/Jasa", description: "Spesifikasi pembelian dengan mempertimbangkan K3", element: "pembelian", elementNum: "5" },
  "5.2": { title: "Verifikasi Barang/Jasa yang Dibeli", description: "Verifikasi barang dan jasa dari aspek K3", element: "pembelian", elementNum: "5" },
  "5.3": { title: "Pengendalian Barang/Jasa dari Pelanggan", description: "Pengendalian barang dan jasa dari pelanggan", element: "pembelian", elementNum: "5" },
  "5.4": { title: "Kemampuan Telusur Produk", description: "Sistem penelusuran produk untuk K3", element: "pembelian", elementNum: "5" },
  "6.1": { title: "Sistem Kerja", description: "Prosedur kerja, izin kerja, dan APD", element: "keamanan-kerja", elementNum: "6" },
  "6.2": { title: "Pengawasan", description: "Sistem pengawasan pelaksanaan pekerjaan", element: "keamanan-kerja", elementNum: "6" },
  "6.3": { title: "Seleksi & Penempatan Personil", description: "Seleksi dan penempatan personil berdasarkan kompetensi", element: "keamanan-kerja", elementNum: "6" },
  "6.4": { title: "Area Terbatas", description: "Pengendalian area terbatas (LOTO, rambu K3)", element: "keamanan-kerja", elementNum: "6" },
  "6.5": { title: "Pemeliharaan, Perbaikan & Perubahan Sarana Produksi", description: "Pemeliharaan dan perbaikan sarana produksi", element: "keamanan-kerja", elementNum: "6" },
  "6.6": { title: "Pelayanan (Kontrak Jasa K3)", description: "Pengendalian kontrak jasa K3", element: "keamanan-kerja", elementNum: "6" },
  "6.7": { title: "Kesiapan Tanggap Darurat", description: "Kesiapan menghadapi keadaan darurat", element: "keamanan-kerja", elementNum: "6" },
  "6.8": { title: "Pertolongan Pertama pada Kecelakaan (P3K)", description: "Sistem P3K di tempat kerja", element: "keamanan-kerja", elementNum: "6" },
  "6.9": { title: "Rencana Pemulihan Kondisi Darurat", description: "Rencana pemulihan pasca keadaan darurat", element: "keamanan-kerja", elementNum: "6" },
  "7.1": { title: "Pemeriksaan Bahaya (Inspeksi)", description: "Pelaksanaan inspeksi K3 secara berkala", element: "pemantauan", elementNum: "7" },
  "7.2": { title: "Pemantauan/Pengukuran Lingkungan Kerja", description: "Pemantauan kondisi lingkungan kerja", element: "pemantauan", elementNum: "7" },
  "7.3": { title: "Peralatan Pemeriksaan, Pengukuran & Pengujian", description: "Pengendalian dan kalibrasi alat ukur", element: "pemantauan", elementNum: "7" },
  "7.4": { title: "Pemantauan Kesehatan Tenaga Kerja (MCU)", description: "Pemantauan kesehatan tenaga kerja", element: "pemantauan", elementNum: "7" },
  "8.1": { title: "Pelaporan Bahaya", description: "Sistem pelaporan bahaya K3", element: "pelaporan", elementNum: "8" },
  "8.2": { title: "Pelaporan Kecelakaan Kerja & Penyakit Akibat Kerja", description: "Pelaporan dan pencatatan insiden K3", element: "pelaporan", elementNum: "8" },
  "8.3": { title: "Pemeriksaan & Pengkajian Kecelakaan (Investigasi)", description: "Investigasi kecelakaan kerja", element: "pelaporan", elementNum: "8" },
  "8.4": { title: "Penanganan Masalah K3", description: "Penanganan permasalahan K3", element: "pelaporan", elementNum: "8" },
  "9.1": { title: "Penanganan Material Secara Manual & Mekanis", description: "Penanganan material dengan aman", element: "material", elementNum: "9" },
  "9.2": { title: "Sistem Pengangkutan, Penyimpanan & Pembuangan", description: "Sistem pengangkutan dan penyimpanan material", element: "material", elementNum: "9" },
  "9.3": { title: "Pengendalian Bahan Kimia Berbahaya (B3)", description: "Pengelolaan bahan kimia berbahaya", element: "material", elementNum: "9" },
  "10.1": { title: "Pengumpulan & Pengarsipan Catatan K3", description: "Pengelolaan catatan K3", element: "data", elementNum: "10" },
  "10.2": { title: "Analisis Data & Laporan Kinerja K3", description: "Analisis data dan pelaporan kinerja K3", element: "data", elementNum: "10" },
  "11.1": { title: "Audit Internal SMK3", description: "Pelaksanaan audit internal SMK3", element: "pemeriksaan", elementNum: "11" },
  "12.1": { title: "Strategi Pelatihan (TNA, Program)", description: "Strategi dan perencanaan pelatihan K3", element: "pelatihan", elementNum: "12" },
  "12.2": { title: "Pelatihan bagi Manajemen & Penyelia", description: "Pelatihan K3 untuk manajemen dan penyelia", element: "pelatihan", elementNum: "12" },
  "12.3": { title: "Pelatihan bagi Tenaga Kerja", description: "Pelatihan K3 untuk tenaga kerja", element: "pelatihan", elementNum: "12" },
  "12.4": { title: "Pelatihan Pengenalan untuk Pengunjung & Kontraktor", description: "Safety induction untuk pengunjung dan kontraktor", element: "pelatihan", elementNum: "12" },
  "12.5": { title: "Pelatihan Keahlian Khusus", description: "Pelatihan sertifikasi dan lisensi khusus", element: "pelatihan", elementNum: "12" },
};

const pageTemplate = (subId, data) => `"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { subSubElements } from "@/data/subSubElements";

export default function SubElement${subId.replace(".", "")}Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const subSubElementsList = subSubElements["${subId}"] || [];

  return (
    <>
      {/* Page Header */}
      <div className="bg-[#231f20] py-[calc(72px+64px)] px-5 md:px-10 border-b-[4px] border-b-[#f15a22]">
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
            <Link href="/smk3/${data.element}" className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#c5c0bb] hover:text-[#f15a22] transition-colors">
              Elemen ${data.elementNum}
            </Link>
            <div className="text-[#c5c0bb]">/</div>
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22]">Sub-Elemen ${subId}</div>
          </div>

          {/* Title Section */}
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-[#f15a22] px-4 py-2 flex items-center justify-center text-white font-barlow-condensed font-extrabold text-[20px]">
              ${subId}
            </div>
            <div className="flex-1">
              <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-2">
                Sub-Elemen ${subId}
              </div>
              <h1 className="font-barlow-condensed font-extrabold text-white uppercase leading-[0.95] tracking-[-0.01em] text-[clamp(28px,4vw,48px)]">
                ${data.title}
              </h1>
            </div>
          </div>
          <p className="text-[#c5c0bb] text-[14px] max-w-3xl">
            ${data.description}
          </p>
        </div>
      </div>

      {/* Sub-Sub Elements Grid */}
      <section className="py-16 md:py-24 px-5 md:px-10 bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] flex items-center gap-3 mb-4">
              <span>{subSubElementsList.length} Sub-Sub Elemen</span>
              <span className="w-10 h-0.5 bg-[#f15a22]"></span>
            </div>
            <h2 className="font-barlow-condensed font-extrabold text-[#231f20] uppercase leading-tight text-[clamp(28px,4vw,48px)]">
              Komponen ${data.title}
            </h2>
          </div>

          {/* Grid of Sub-Sub Elements */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subSubElementsList.map((item, index) => (
              <div
                key={item.id}
                className="group bg-white border-t-4 border-t-[#f15a22] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Number Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#f15a22] text-white font-barlow-condensed font-extrabold text-[14px] px-3 py-1.5 group-hover:bg-[#f7941d] transition-colors">
                    {item.id}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#f15a22]/10 flex items-center justify-center text-[#f15a22] font-barlow-condensed font-bold text-[14px]">
                    {index + 1}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-barlow-condensed font-bold text-[16px] uppercase text-[#231f20] leading-tight mb-3 group-hover:text-[#f15a22] transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-[#6b6560] text-[13px] leading-relaxed mb-4">
                  {item.description}
                </p>

                {/* Action Button */}
                <button className="w-full px-4 py-2.5 bg-[#f15a22] text-white font-barlow-condensed font-bold text-[11px] tracking-[0.08em] uppercase hover:bg-[#f7941d] transition-colors">
                  Kelola Data
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
`;

// Generate pages
Object.entries(subElementsData).forEach(([subId, data]) => {
  const folderPath = path.join(__dirname, '..', 'src', 'app', 'smk3', data.element, subId.replace(".", "-"));
  const filePath = path.join(folderPath, 'page.tsx');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  
  // Write file
  fs.writeFileSync(filePath, pageTemplate(subId, data));
  console.log(`Created: ${filePath}`);
});

console.log(`\n✅ All ${Object.keys(subElementsData).length} sub-element pages generated successfully!`);
