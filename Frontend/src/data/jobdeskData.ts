// src/data/jobdeskData.ts
export interface JobDesk {
  jabatan: string;
  departemen: string;
  uraian: string;
  spesifikasi: string;
  kompetensi: string[];
  fungsi: string[];
  tugasWewenang: string[];
  indikator: string;
}

// Contoh data dari file Excel (hanya beberapa jabatan untuk demo)
export const jobdeskList: JobDesk[] = [
  {
    jabatan: "Admin",
    departemen: "All",
    uraian: "Admin bertanggung jawab atas administrasi umum dan dokumentasi.",
    spesifikasi: "Pendidikan minimal D3/S1, pengalaman 2 tahun, usia 25-35 tahun.",
    kompetensi: [
      "Komunikasi efektif",
      "Manajemen waktu",
      "Microsoft Office",
      "Pengarsipan",
    ],
    fungsi: [
      "Mengatur arsip dokumen",
      "Menjadwalkan rapat",
      "Menjadi penghubung antar departemen",
    ],
    tugasWewenang: [
      "Mengelola dokumen",
      "Menyusun laporan",
      "Mengelola inventaris kantor",
    ],
    indikator: "Tugas tercapai sesuai target yang ditetapkan.",
  },
  {
    jabatan: "Supervisor HSE",
    departemen: "HSE",
    uraian: "Supervisor HSE bertanggung jawab atas pengawasan keselamatan dan kesehatan kerja di area perusahaan.",
    spesifikasi: "Pendidikan minimal S1, pengalaman 5 tahun, memiliki sertifikat AK3U dan POP.",
    kompetensi: [
      "Regulasi K3 Indonesia",
      "Sistem Manajemen HSE",
      "Analisis risiko",
      "Komunikasi strategis",
    ],
    fungsi: [
      "Mengorganisir kegiatan keselamatan",
      "Membuat perencanaan K3",
      "Melaporkan pelanggaran",
      "Menghentikan pekerjaan berbahaya",
    ],
    tugasWewenang: [
      "Menyusun diagram organisasi HSE",
      "Membuat job description tim HSE",
      "Melatih tim",
      "Mengadakan rapat P2K3",
    ],
    indikator: "Tercapainya target zero accident.",
  },
  // Tambahkan semua jabatan dari Excel di sini...
];