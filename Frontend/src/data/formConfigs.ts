import { SubSubElementFormConfig, FormField } from "@/types/subSubElement";

// Default template for generic sub-sub elements
const getDefaultFields = (): FormField[] => [
  { name: "judul", label: "Judul", type: "text", required: true },
  { name: "tanggal", label: "Tanggal", type: "date", required: true },
  { name: "penanggungJawab", label: "Penanggung Jawab", type: "text", required: true },
  { name: "deskripsi", label: "Deskripsi/Keterangan", type: "textarea", required: true, rows: 6 },
  { name: "dokumen", label: "Dokumen Pendukung (PDF)", type: "file", accept: ".pdf", maxSize: 5 },
  { name: "foto", label: "Foto/Gambar (opsional)", type: "file", accept: ".jpg,.jpeg,.png", maxSize: 2 },
];

// Helper function to get form config
export const getFormConfig = (subSubElementId: string): SubSubElementFormConfig => {
  // Check if specific config exists
  if (formConfigs[subSubElementId]) {
    return formConfigs[subSubElementId];
  }
  
  // Return default config
  return {
    subSubElementId,
    fields: getDefaultFields(),
  };
};

// Specific form configurations for sub-sub elements that need custom fields
// For elements not listed here, the default template will be used
export const formConfigs: Record<string, SubSubElementFormConfig> = {
  // K3 Policy (Safety Compliance)
  "sc-k3-policy": {
    subSubElementId: "sc-k3-policy",
    fields: [
      { name: "nomorDokumen", label: "Nomor Dokumen", type: "text", required: true },
      { name: "judulKebijakan", label: "Judul Kebijakan", type: "text", required: true },
      { name: "tanggalTerbit", label: "Tanggal Terbit", type: "date", required: true },
      { name: "tanggalReview", label: "Tanggal Review Berikutnya", type: "date" },
      { name: "statusDokumen", label: "Status Dokumen", type: "select", required: true, options: [{ value: "Aktif", label: "Aktif" }, { value: "Draft", label: "Draft" }, { value: "Revisi", label: "Revisi" }, { value: "Kadaluarsa", label: "Kadaluarsa" }] },
      { name: "penanggungJawab", label: "Penanggung Jawab", type: "text" },
      { name: "keterangan", label: "Keterangan", type: "textarea", rows: 4 },
      { name: "dokumen", label: "Dokumen Kebijakan (PDF)", type: "file", accept: ".pdf", maxSize: 5, required: true },
    ],
  },

  // ELEMEN 6: Keamanan Bekerja - Inspeksi & Pemeliharaan
  "6.5.1": {
    subSubElementId: "6.5.1",
    fields: [
      { name: "namaPeralatan", label: "Nama Peralatan/Sarana", type: "text", required: true },
      { name: "tanggalPemeriksaan", label: "Tanggal Pemeriksaan", type: "date", required: true },
      { name: "petugasPemeriksa", label: "Petugas Pemeriksa", type: "text", required: true },
      { name: "hasilPemeriksaan", label: "Hasil Pemeriksaan", type: "textarea", required: true, rows: 4 },
      { name: "tindakLanjut", label: "Tindak Lanjut", type: "textarea", rows: 4 },
      { name: "laporanPemeriksaan", label: "Laporan Pemeriksaan (PDF)", type: "file", accept: ".pdf", maxSize: 3 },
      { name: "fotoDokumentasi", label: "Foto Dokumentasi", type: "file", accept: ".jpg,.jpeg,.png", maxSize: 2 },
    ],
  },

  // ELEMEN 7: Pemantauan - Inspeksi K3

  // 7.1.1.1: Inspeksi Ketidaksesuaian (Non-Conformance Inspection)
  "7.1.1-inspeksi-ketidaksesuaian": {
  subSubElementId: "7.1.1-inspeksi-ketidaksesuaian",
  fields: [
    {
      name: "tanggalInspeksi",
      label: "Tanggal Inspeksi",
      labelCn: "日期",
      type: "date",
      required: true,
    },
    {
      name: "safetyOfficer",
      label: "Safety Officer",
      labelCn: "安全员",
      type: "text",
      required: true,
    },
    {
      name: "lokasiUtama",
      label: "Lokasi Utama",
      labelCn: "主要地點",
      type: "select",
      required: true,
      options: [
        { value: "140_hektar", label: "140 HEKTAR (140亩)" },
        { value: "500_hektar", label: "500 HEKTAR (500亩-第二选矿厂)" },
        { value: "86_selatan", label: "86 SELATAN (南86)" },
        { value: "86_utara", label: "86 UTARA (86区域)" },
        { value: "area_57", label: "AREA 57 (57平区域)" },
        { value: "imip_9", label: "IMIP 9 (新九区)" },
        { value: "imip_8", label: "IMIP 8 (新八区)" },
        { value: "km_3", label: "KM 3 (3公里)" },
        { value: "km_6", label: "KM 6 (6公里)" },
        { value: "jetty", label: "JETTY (中转罐、码头)" },
        { value: "lainnya", label: "Lainnya" },
      ],
    },
    {
      name: "areaInspeksiSpesifik",
      label: "Area Inspeksi Spesifik",
      labelCn: "區域",
      type: "text",
      required: true,
    },
    {
      name: "qmbGroup",
      label: "QMB Group / Kontraktor",
      labelCn: "青美邦/承包商",
      type: "select",
      required: true,
      options: [
        { value: "qmb", label: "QMB Group" },
        { value: "kontraktor", label: "Kontraktor" },
      ],
    },
    {
      name: "namaDepartemen",
      label: "Nama Departemen / Perusahaan",
      labelCn: "部门/公司",
      type: "text",
      required: true,
    },
    {
      name: "dokumentasiHazard",
      label: "Dokumentasi Hazard / Pelanggaran 6S",
      labelCn: "违规记录照片",
      type: "file",
      required: true,
      accept: "image/*",
      note: "Wajib upload foto",
    },
    {
      name: "jenisTemuan",
      label: "Unsafe Action / Unsafe Condition / Near Miss",
      type: "select",
      required: true,
      options: [
        { value: "unsafe_action",    label: "Unsafe Action" },
        { value: "unsafe_condition", label: "Unsafe Condition" },
        { value: "near_miss",        label: "Near Miss" },
      ],
    },
    {
      name: "levelHazard",
      label: "Level Hazard / Pelanggaran 6S",
      type: "select",
      required: true,
      options: [
        { value: "low",      label: "Low" },
        { value: "medium",   label: "Medium" },
        { value: "high",     label: "High" },
        { value: "critical", label: "Critical" },
      ],
    },

    // ── Tipe Temuan ─────────────────────────────────────────────────────
    {
      name: "tipeTemuan",
      label: "Tipe Temuan Ketidaksesuaian",
      type: "select",
      required: true,
      options: [
        { value: "hazard", label: "Hazard" },
        { value: "6s",     label: "Pelanggaran 6S" },
      ],
    },

    // Conditional: muncul hanya jika tipeTemuan === "hazard"
    {
      name: "kategoriHazard",
      label: "Kategori Hazard",
      labelCn: "危险类别",
      type: "select",
      required: false,
      showWhen: { field: "tipeTemuan", value: "hazard" },
      options: [
        { value: "1",  label: "1. Pekerjaan Panas (动火作业类)" },
        { value: "2",  label: "2. Ruang Terbatas (受限空间类)" },
        { value: "3",  label: "3. Pekerjaan Pengangkatan (吊装作业类)" },
        { value: "4",  label: "4. Keamanan Berkendara (车辆安全类)" },
        { value: "5",  label: "5. Pekerjaan Ketinggian (高空作业类)" },
        { value: "6",  label: "6. Pekerjaan Listrik (用电安全类)" },
        { value: "7",  label: "7. Pekerjaan Penggalian (动土作业)" },
        { value: "8",  label: "8. Pembatasan Akses Jalan (断路作业)" },
        { value: "9",  label: "9. Manajemen Lokasi (现场管理)" },
        { value: "10", label: "10. Hand Tools & Power Tools (工具与作业器具类)" },
        { value: "11", label: "11. Alat Berat & Mesin Bergerak (重型设备与移动机械类)" },
        { value: "12", label: "12. Kesehatan & P3K (健康与急救类)" },
        { value: "13", label: "13. Komunikasi dan Rambu K3 (安全标识与沟通类)" },
        { value: "14", label: "14. Traffic (交通)" },
        { value: "15", label: "15. Lain-Lain (其他)" },
      ],
    },

    // Conditional: muncul hanya jika tipeTemuan === "6s"
    {
      name: "kategori6S",
      label: "Kategori Pelanggaran 6S",
      labelCn: "6S违规类别",
      type: "select",
      required: false,
      showWhen: { field: "tipeTemuan", value: "6s" },
      options: [
        { value: "1",  label: "1. Lantai (地面)" },
        { value: "2",  label: "2. Peralatan (设备)" },
        { value: "3",  label: "3. Material (材料、物料)" },
        { value: "4",  label: "4. Kabinet Wadah (容器货架)" },
        { value: "5",  label: "5. Kabinet Kotak Alat (工具箱柜)" },
        { value: "6",  label: "6. Meja Kerja (工作台桌)" },
        { value: "7",  label: "7. Alat Transportasi (运输类工具)" },
        { value: "8",  label: "8. Lorong (通道)" },
        { value: "9",  label: "9. Dinding, Jendela & Pintu (门窗墙壁)" },
        { value: "10", label: "10. Rambu (标识牌)" },
        { value: "11", label: "11. Peralatan Listrik (电气设备)" },
        { value: "12", label: "12. Fasilitas Kebakaran (消防设施)" },
        { value: "13", label: "13. Peraturan (规章制度)" },
        { value: "14", label: "14. Peralatan Kebersihan (清洁用具)" },
        { value: "15", label: "15. APD & Pakaian (劳保用品、衣物)" },
        { value: "16", label: "16. Lain-Lain (其他)" },
      ],
    },

    {
      name: "deskripsiKetidaksesuaian",
      label: "Deskripsi Ketidaksesuaian",
      labelCn: "不符合项描述",
      type: "textarea",
      required: true,
      placeholder: "Jelaskan temuan ketidaksesuaian secara detail...",
    },
    {
      name: "hierarkiPengendalian",
      label: "Hirarki Pengendalian",
      labelCn: "危险控制层级",
      type: "select",
      required: true,
      options: [
        { value: "eliminasi",               label: "Eliminasi (消除)" },
        { value: "substitusi",              label: "Substitusi (替代)" },
        { value: "pengendalian_teknik",     label: "Pengendalian Teknik (工程控制)" },
        { value: "pengendalian_administratif", label: "Pengendalian Administratif (管理控制)" },
        { value: "apd",                     label: "Alat Pelindung Diri / APD (个人防护装备)" },
      ],
    },
    {
      name: "rekomendasiPerbaikan",
      label: "Rekomendasi Perbaikan",
      labelCn: "整改建议",
      type: "textarea",
      required: true,
      placeholder: "Tuliskan rekomendasi tindakan perbaikan...",
    },
    {
      name: "deadlinePerbaikan",
      label: "Deadline Perbaikan",
      labelCn: "整改期限",
      type: "date",
      required: true,
    },
    {
      name: "picPerbaikan",
      label: "PIC Perbaikan",
      labelCn: "负责人",
      type: "text",
      required: true,
    },
    {
      name: "statusPerbaikan",
      label: "Status Perbaikan",
      labelCn: "整改情况",
      type: "select",
      required: true,
      options: [
        { value: "INPG", label: "INPG – Perlu Persetujuan Atasan" },
        { value: "CLSD", label: "CLSD – Langsung Tersimpan" },
      ],
    },
    {
      name: "dokumentasiPerbaikan",
      label: "Dokumentasi Perbaikan",
      labelCn: "整改图片",
      type: "file",
      required: false,
      accept: "image/*",
      note: "Upload foto hasil perbaikan (opsional)",
    },
    {
      name: "keteranganTambahan",
      label: "Keterangan Tambahan",
      labelCn: "备注",
      type: "textarea",
      required: false,
      placeholder: "Catatan atau informasi tambahan...",
    },
  ],
},

  // 7.1.1.2: Inspeksi Sarana Prasarana (Facility Inspection)
  "7.1.1-inspeksi-sarana-prasarana": {
    subSubElementId: "7.1.1-inspeksi-sarana-prasarana",
    fields: [
      { name: "tanggalInspeksi", label: "Tanggal Inspeksi", type: "date", required: true },
      { name: "namaSaranaPrasarana", label: "Nama Sarana/Prasarana", type: "text", required: true },
      { name: "lokasi", label: "Lokasi Sarana/Prasarana", type: "text", required: true },
      { name: "petugasInspeksi", label: "Petugas Inspeksi", type: "text", required: true },
      { name: "komponenYangDIperiksa", label: "Komponen yang Diperiksa", type: "textarea", required: true, rows: 4 },
      { name: "kondisiSaatIni", label: "Kondisi Saat Ini", type: "select", required: true, options: ["Baik Sekali", "Baik", "Cukup", "Buruk", "Kritis"] },
      { name: "masalahYangDitemukan", label: "Masalah yang Ditemukan", type: "textarea", rows: 4 },
      { name: "tindakLanjutDiperlukan", label: "Tindak Lanjut yang Diperlukan", type: "textarea", rows: 4 },
      { name: "penanggungJawabTindakLanjut", label: "Penanggung Jawab Tindak Lanjut", type: "text" },
      { name: "dokumenLaporan", label: "Laporan Inspeksi (PDF)", type: "file", accept: ".pdf", maxSize: 3 },
      { name: "fotoDokumentasi", label: "Foto Dokumentasi", type: "file", accept: ".jpg,.jpeg,.png", maxSize: 2, multiple: true },
    ],
  },

  // 7.1.1.3: Inspeksi Kotak P3K (First Aid Kit Inspection)
  "7.1.1-inspeksi-kotak-p3k": {
    subSubElementId: "7.1.1-inspeksi-kotak-p3k",
    fields: [
      { name: "tanggalInspeksi", label: "Tanggal Inspeksi", type: "date", required: true },
      { name: "lokasiKotakP3K", label: "Lokasi Kotak P3K", type: "text", required: true },
      { name: "petugasInspeksi", label: "Petugas Inspeksi", type: "text", required: true },
      { name: "kondisiKotak", label: "Kondisi Kotak", type: "select", required: true, options: ["Baik", "Cukup Baik", "Buruk"] },
      { name: "ketersediaanObat", label: "Ketersediaan Obat & Obat-obatan", type: "textarea", required: true },
      { name: "ketersediaanAlat", label: "Ketersediaan Peralatan P3K", type: "textarea", required: true },
      { name: "jumlahObat", label: "Jumlah Obat (unit)", type: "number", required: true },
      { name: "jumlahAlat", label: "Jumlah Peralatan (unit)", type: "number", required: true },
      { name: "masalahKetidaklengkapan", label: "Masalah/Ketidaklengkapan", type: "textarea", rows: 3 },
      { name: "tindakLanjut", label: "Tindak Lanjut (Pengisian Ulang/Penggantian)", type: "textarea", rows: 3 },
      { name: "penanggungJawab", label: "Penanggung Jawab Pemeliharaan", type: "text" },
      { name: "dokumenLaporan", label: "Laporan Inspeksi (PDF)", type: "file", accept: ".pdf", maxSize: 2 },
      { name: "fotoDokumentasi", label: "Foto Kotak P3K", type: "file", accept: ".jpg,.jpeg,.png", maxSize: 2 },
    ],
  },

  // 7.1.1.4: Inspeksi APD (PPE Inspection)
  "7.1.1-inspeksi-apd": {
    subSubElementId: "7.1.1-inspeksi-apd",
    fields: [
      { name: "tanggalInspeksi", label: "Tanggal Inspeksi", type: "date", required: true },
      { name: "lokasiPenyimpanan", label: "Lokasi Penyimpanan APD", type: "text", required: true },
      { name: "petugasInspeksi", label: "Petugas Inspeksi", type: "text", required: true },
      { name: "jenisAPD", label: "Jenis APD", type: "select", required: true, options: ["Helmet/Topi Keselamatan", "Kacamata Pengaman", "Pelindung Telinga", "Masker/Respirator", "Sarung Tangan", "Sepatu Keselamatan", "Rompi Reflektif", "Harness Keselamatan"] },
      { name: "jumlahAPD", label: "Jumlah APD yang Diperiksa", type: "number", required: true },
      { name: "kondisiFisik", label: "Kondisi Fisik APD", type: "select", required: true, options: ["Baik Sekali", "Baik", "Cukup", "Buruk (Tidak Layak)", "Hilang"] },
      { name: "ketersediaan", label: "Ketersediaan", type: "select", required: true, options: ["Lengkap", "Tidak Lengkap", "Kurang"] },
      { name: "masalahYangDitemukan", label: "Masalah yang Ditemukan", type: "textarea", rows: 4 },
      { name: "tindakLanjut", label: "Tindak Lanjut (Perbaikan/Penggantian)", type: "textarea", required: true, rows: 4 },
      { name: "penanggungJawab", label: "Penanggung Jawab Pemeliharaan", type: "text" },
      { name: "dokumenLaporan", label: "Laporan Inspeksi (PDF)", type: "file", accept: ".pdf", maxSize: 2 },
      { name: "fotoDokumentasi", label: "Foto APD", type: "file", accept: ".jpg,.jpeg,.png", maxSize: 2, multiple: true },
    ],
  },

  "7.1.1": {
    subSubElementId: "7.1.1",
    fields: [
      { name: "tanggalInspeksi", label: "Tanggal Inspeksi", type: "date", required: true },
      { name: "areaInspeksi", label: "Area Inspeksi", type: "text", required: true },
      { name: "petugasInspeksi", label: "Petugas Inspeksi", type: "text", required: true },
      { name: "temuanInspeksi", label: "Temuan Inspeksi", type: "textarea", required: true, rows: 6 },
      { name: "rekomendasiPerbaikan", label: "Rekomendasi Perbaikan", type: "textarea", required: true, rows: 4 },
      { name: "laporanInspeksi", label: "Laporan Inspeksi (PDF)", type: "file", accept: ".pdf", maxSize: 3 },
      { name: "fotoTemuan", label: "Foto Temuan", type: "file", accept: ".jpg,.jpeg,.png", maxSize: 2, multiple: true },
    ],
  },

  // ELEMEN 8: Pelaporan - Investigasi Kecelakaan
  "8.3.1": {
    subSubElementId: "8.3.1",
    fields: [
      { name: "tanggalKecelakaan", label: "Tanggal Kecelakaan", type: "date", required: true },
      { name: "lokasiKecelakaan", label: "Lokasi Kecelakaan", type: "text", required: true },
      { name: "korban", label: "Nama Korban", type: "text", required: true },
      { name: "kronologi", label: "Kronologi Kejadian", type: "textarea", required: true, rows: 6 },
      { name: "penyebab", label: "Analisis Penyebab", type: "textarea", required: true, rows: 4 },
      { name: "tindakanKorektif", label: "Tindakan Korektif", type: "textarea", required: true, rows: 4 },
      { name: "laporanInvestigasi", label: "Laporan Investigasi (PDF)", type: "file", accept: ".pdf", maxSize: 5, required: true },
      { name: "fotoBukti", label: "Foto Bukti", type: "file", accept: ".jpg,.jpeg,.png", maxSize: 2, multiple: true },
    ],
  },

  // ELEMEN 9: Pengelolaan Material - Bahan Kimia Berbahaya
  "9.3.1": {
    subSubElementId: "9.3.1",
    fields: [
      { name: "namaBahan", label: "Nama Bahan Kimia", type: "text", required: true },
      { name: "nomorCAS", label: "Nomor CAS", type: "text" },
      { name: "kategoriBahaya", label: "Kategori Bahaya", type: "select", required: true, options: ["Mudah Terbakar", "Korosif", "Beracun", "Reaktif", "Oksidator"] },
      { name: "jumlahStok", label: "Jumlah Stok", type: "text", required: true },
      { name: "lokasiPenyimpanan", label: "Lokasi Penyimpanan", type: "text", required: true },
      { name: "tanggalMasuk", label: "Tanggal Masuk", type: "date", required: true },
      { name: "msds", label: "MSDS (PDF)", type: "file", accept: ".pdf", maxSize: 5, required: true },
      { name: "fotoLabel", label: "Foto Label", type: "file", accept: ".jpg,.jpeg,.png", maxSize: 2 },
    ],
  },

  // ELEMEN 11: Pemeriksaan SMK3 - Audit Internal
  "11.1.1": {
    subSubElementId: "11.1.1",
    fields: [
      { name: "tanggalAudit", label: "Tanggal Audit", type: "date", required: true },
      { name: "ruangLingkup", label: "Ruang Lingkup Audit", type: "text", required: true },
      { name: "timAuditor", label: "Tim Auditor", type: "textarea", required: true, rows: 3 },
      { name: "temuanAudit", label: "Temuan Audit", type: "textarea", required: true, rows: 6 },
      { name: "rekomendasiPerbaikan", label: "Rekomendasi Perbaikan", type: "textarea", required: true, rows: 4 },
      { name: "laporanAudit", label: "Laporan Audit (PDF)", type: "file", accept: ".pdf", maxSize: 5, required: true },
    ],
  },

  // ELEMEN 12: Pelatihan - Analisis Kebutuhan Pelatihan
  "12.1.1": {
    subSubElementId: "12.1.1",
    fields: [
      { name: "tahunPeriode", label: "Tahun/Periode", type: "text", required: true },
      { name: "departemen", label: "Departemen", type: "text", required: true },
      { name: "kebutuhanPelatihan", label: "Kebutuhan Pelatihan", type: "textarea", required: true, rows: 6 },
      { name: "jumlahPeserta", label: "Jumlah Peserta Target", type: "number", required: true },
      { name: "prioritas", label: "Prioritas", type: "select", required: true, options: ["Tinggi", "Sedang", "Rendah"] },
      { name: "dokumenTNA", label: "Dokumen TNA (PDF)", type: "file", accept: ".pdf", maxSize: 3 },
    ],
  },
};
