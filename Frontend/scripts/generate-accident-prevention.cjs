const fs = require('fs');
const path = require('path');

function mkdirp(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function writeFile(filePath, content) {
  mkdirp(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ created:', filePath);
}

const BASE = path.join(__dirname, '..', 'src', 'app');

function pageContent(categoryId, importPath) {
  return `'use client';
import { CrudPage } from '@/components/CrudPage';
import { config } from '${importPath}';
export default function Page() { return <CrudPage config={config} />; }
`;
}
function layoutContent() {
  return `'use client';
import { AuthenticatedShell } from '@/components/layout/AuthenticatedShell';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
`;
}
function configContent(categoryId, title, description, parentLabel, fields) {
  return `import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: '${categoryId}',
  title: '${title}',
  description: '${description}',
  parentLabel: '${parentLabel}',
  fields: ${JSON.stringify(fields, null, 4)},
};
`;
}

const pages = [

  // ── ACCIDENT PREVENTION (12 pages) ──────────────────────────────────────────
  {
    route: 'accident-prevention/hazard-identification',
    categoryId: 'ap-hazard-identification',
    title: 'Hazard Identification',
    description: 'Identifikasi bahaya di area kerja, sumber bahaya, dan potensi dampaknya.',
    parentLabel: 'Accident Prevention',
    fields: [
      { key: 'lokasiArea', label: 'Lokasi / Area', type: 'text', required: true, placeholder: 'Contoh: Area Furnace, Workshop', showInTable: true },
      { key: 'sumberBahaya', label: 'Sumber Bahaya', type: 'text', required: true, placeholder: 'Contoh: Mesin berputar, bahan kimia', showInTable: true },
      { key: 'jenisBahaya', label: 'Jenis Bahaya', type: 'select', required: true, showInTable: true, options: [
        { label: 'Fisik', value: 'Fisik' },
        { label: 'Kimia', value: 'Kimia' },
        { label: 'Biologi', value: 'Biologi' },
        { label: 'Ergonomi', value: 'Ergonomi' },
        { label: 'Psikologi', value: 'Psikologi' },
        { label: 'Listrik', value: 'Listrik' },
        { label: 'Mekanis', value: 'Mekanis' },
      ]},
      { key: 'potensiDampak', label: 'Potensi Dampak', type: 'textarea', required: true, placeholder: 'Uraikan potensi cedera atau penyakit...' },
      { key: 'tingkatKeparahan', label: 'Tingkat Keparahan', type: 'select', required: true, options: [
        { label: 'Ringan', value: 'Ringan' },
        { label: 'Sedang', value: 'Sedang' },
        { label: 'Berat', value: 'Berat' },
        { label: 'Kritis', value: 'Kritis' },
      ]},
      { key: 'tanggalIdentifikasi', label: 'Tanggal Identifikasi', type: 'date', required: true },
      { key: 'pengidentifikasi', label: 'Diidentifikasi Oleh', type: 'text', placeholder: 'Nama petugas' },
    ],
  },
  {
    route: 'accident-prevention/risk-control',
    categoryId: 'ap-risk-control',
    title: 'Risk Control Implementation',
    description: 'Implementasi pengendalian risiko sesuai hierarki kontrol (eliminasi, substitusi, engineering, APD).',
    parentLabel: 'Accident Prevention',
    fields: [
      { key: 'risikoYangDikendalikan', label: 'Risiko yang Dikendalikan', type: 'text', required: true, showInTable: true },
      { key: 'hierarkiKontrol', label: 'Hierarki Kontrol', type: 'select', required: true, showInTable: true, options: [
        { label: 'Eliminasi', value: 'Eliminasi' },
        { label: 'Substitusi', value: 'Substitusi' },
        { label: 'Engineering Control', value: 'Engineering Control' },
        { label: 'Administrative Control', value: 'Administrative Control' },
        { label: 'APD (PPE)', value: 'APD' },
      ]},
      { key: 'deskripsiKontrol', label: 'Deskripsi Tindakan Kontrol', type: 'textarea', required: true, placeholder: 'Uraikan tindakan pengendalian yang diterapkan...' },
      { key: 'tanggalImplementasi', label: 'Tanggal Implementasi', type: 'date', required: true, showInTable: true },
      { key: 'statusImplementasi', label: 'Status', type: 'select', required: true, options: [
        { label: 'Selesai', value: 'Selesai' },
        { label: 'Dalam Proses', value: 'Dalam Proses' },
        { label: 'Belum Mulai', value: 'Belum Mulai' },
      ]},
      { key: 'efektivitas', label: 'Efektivitas Kontrol', type: 'select', options: [
        { label: 'Efektif', value: 'Efektif' },
        { label: 'Cukup Efektif', value: 'Cukup Efektif' },
        { label: 'Tidak Efektif', value: 'Tidak Efektif' },
        { label: 'Belum Dievaluasi', value: 'Belum Dievaluasi' },
      ]},
      { key: 'penanggungJawab', label: 'Penanggung Jawab', type: 'text' },
    ],
  },
  {
    route: 'accident-prevention/work-permit',
    categoryId: 'ap-work-permit',
    title: 'Work Permit System',
    description: 'Pengelolaan izin kerja untuk pekerjaan berisiko tinggi (hot work, confined space, dll.).',
    parentLabel: 'Accident Prevention',
    fields: [
      { key: 'nomorIzin', label: 'Nomor Izin Kerja', type: 'text', required: true, showInTable: true },
      { key: 'jenisIzin', label: 'Jenis Izin Kerja', type: 'select', required: true, showInTable: true, options: [
        { label: 'Hot Work Permit', value: 'Hot Work Permit' },
        { label: 'Confined Space Entry', value: 'Confined Space Entry' },
        { label: 'Working at Height', value: 'Working at Height' },
        { label: 'Electrical Work', value: 'Electrical Work' },
        { label: 'Excavation', value: 'Excavation' },
        { label: 'General Work Permit', value: 'General Work Permit' },
      ]},
      { key: 'lokasiPekerjaan', label: 'Lokasi Pekerjaan', type: 'text', required: true, showInTable: true },
      { key: 'tanggalMulai', label: 'Tanggal Mulai', type: 'date', required: true },
      { key: 'tanggalSelesai', label: 'Tanggal Selesai', type: 'date', required: true },
      { key: 'pelaksana', label: 'Pelaksana Pekerjaan', type: 'text', required: true },
      { key: 'pengawas', label: 'Pengawas K3', type: 'text', required: true },
      { key: 'statusIzin', label: 'Status', type: 'select', required: true, options: [
        { label: 'Aktif', value: 'Aktif' },
        { label: 'Selesai', value: 'Selesai' },
        { label: 'Dibatalkan', value: 'Dibatalkan' },
        { label: 'Pending Approval', value: 'Pending Approval' },
      ]},
      { key: 'keteranganRisiko', label: 'Uraian Risiko & APD', type: 'textarea', placeholder: 'Risiko yang teridentifikasi dan APD yang diperlukan...' },
    ],
  },
  {
    route: 'accident-prevention/ppe-management',
    categoryId: 'ap-ppe-management',
    title: 'PPE Management',
    description: 'Manajemen Alat Pelindung Diri (APD): pengadaan, distribusi, inspeksi, dan penggantian.',
    parentLabel: 'Accident Prevention',
    fields: [
      { key: 'jenisAPD', label: 'Jenis APD', type: 'select', required: true, showInTable: true, options: [
        { label: 'Helm Safety', value: 'Helm Safety' },
        { label: 'Safety Shoes', value: 'Safety Shoes' },
        { label: 'Sarung Tangan', value: 'Sarung Tangan' },
        { label: 'Kacamata Safety', value: 'Kacamata Safety' },
        { label: 'Earplug / Earmuff', value: 'Earplug' },
        { label: 'Masker / Respirator', value: 'Masker' },
        { label: 'Body Harness', value: 'Body Harness' },
        { label: 'Baju Tahan Api', value: 'Baju Tahan Api' },
        { label: 'Apron / Pelindung Tubuh', value: 'Apron' },
      ]},
      { key: 'jumlah', label: 'Jumlah (unit)', type: 'number', required: true, showInTable: true },
      { key: 'kondisi', label: 'Kondisi', type: 'select', required: true, showInTable: true, options: [
        { label: 'Baik', value: 'Baik' },
        { label: 'Perlu Penggantian', value: 'Perlu Penggantian' },
        { label: 'Rusak', value: 'Rusak' },
      ]},
      { key: 'tanggalInspeksi', label: 'Tanggal Inspeksi', type: 'date', required: true },
      { key: 'lokasiPenyimpanan', label: 'Lokasi Penyimpanan', type: 'text' },
      { key: 'penanggungJawab', label: 'Penanggung Jawab', type: 'text' },
      { key: 'keterangan', label: 'Keterangan', type: 'textarea' },
    ],
  },
  {
    route: 'accident-prevention/safety-inspection',
    categoryId: 'ap-safety-inspection',
    title: 'Safety Inspection',
    description: 'Rekap kegiatan inspeksi K3 di area kerja, temuan, dan tindak lanjut.',
    parentLabel: 'Accident Prevention',
    fields: [
      { key: 'tanggalInspeksi', label: 'Tanggal Inspeksi', type: 'date', required: true, showInTable: true },
      { key: 'areaInspeksi', label: 'Area yang Diinspeksi', type: 'text', required: true, showInTable: true },
      { key: 'inspektur', label: 'Inspektor', type: 'text', required: true, showInTable: true },
      { key: 'jenisInspeksi', label: 'Jenis Inspeksi', type: 'select', required: true, options: [
        { label: 'Inspeksi Rutin', value: 'Inspeksi Rutin' },
        { label: 'Inspeksi Mendadak', value: 'Inspeksi Mendadak' },
        { label: 'Inspeksi Khusus', value: 'Inspeksi Khusus' },
        { label: 'Pre-work Inspection', value: 'Pre-work Inspection' },
      ]},
      { key: 'temuanUnsafe', label: 'Temuan Unsafe Act / Condition', type: 'textarea', placeholder: 'Uraikan temuan tindakan atau kondisi tidak aman...' },
      { key: 'jumlahTemuan', label: 'Jumlah Temuan', type: 'number', placeholder: '0' },
      { key: 'statusTindakLanjut', label: 'Status Tindak Lanjut', type: 'select', required: true, options: [
        { label: 'Selesai', value: 'Selesai' },
        { label: 'Dalam Proses', value: 'Dalam Proses' },
        { label: 'Belum Ditangani', value: 'Belum Ditangani' },
      ]},
      { key: 'tindakLanjut', label: 'Uraian Tindak Lanjut', type: 'textarea' },
    ],
  },
  {
    route: 'accident-prevention/safety-observation',
    categoryId: 'ap-safety-observation',
    title: 'Safety Observation',
    description: 'Observasi perilaku keselamatan pekerja dan tindakan korektif perilaku tidak aman.',
    parentLabel: 'Accident Prevention',
    fields: [
      { key: 'tanggalObservasi', label: 'Tanggal Observasi', type: 'date', required: true, showInTable: true },
      { key: 'lokasi', label: 'Lokasi', type: 'text', required: true, showInTable: true },
      { key: 'observer', label: 'Observer', type: 'text', required: true, showInTable: true },
      { key: 'perilakuDiamati', label: 'Perilaku yang Diamati', type: 'textarea', required: true, placeholder: 'Uraikan perilaku yang diamati...' },
      { key: 'kategoriperilaku', label: 'Kategori Perilaku', type: 'select', required: true, options: [
        { label: 'Safe Behavior', value: 'Safe Behavior' },
        { label: 'Unsafe Behavior', value: 'Unsafe Behavior' },
        { label: 'Near Miss', value: 'Near Miss' },
      ]},
      { key: 'tindakanKorektif', label: 'Tindakan Korektif', type: 'textarea', placeholder: 'Tindakan yang dilakukan di tempat atau ditindaklanjuti...' },
      { key: 'statusFeedback', label: 'Status Feedback', type: 'select', options: [
        { label: 'Diberikan', value: 'Diberikan' },
        { label: 'Belum Diberikan', value: 'Belum Diberikan' },
      ]},
    ],
  },
  {
    route: 'accident-prevention/workplace-monitoring',
    categoryId: 'ap-workplace-monitoring',
    title: 'Workplace Monitoring',
    description: 'Pemantauan lingkungan kerja: kebisingan, suhu, pencahayaan, kualitas udara, dll.',
    parentLabel: 'Accident Prevention',
    fields: [
      { key: 'parameterYangDiukur', label: 'Parameter yang Diukur', type: 'select', required: true, showInTable: true, options: [
        { label: 'Kebisingan (dB)', value: 'Kebisingan' },
        { label: 'Suhu Lingkungan', value: 'Suhu' },
        { label: 'Pencahayaan (lux)', value: 'Pencahayaan' },
        { label: 'Kualitas Udara', value: 'Kualitas Udara' },
        { label: 'Getaran', value: 'Getaran' },
        { label: 'Radiasi', value: 'Radiasi' },
        { label: 'Debu', value: 'Debu' },
      ]},
      { key: 'lokasi', label: 'Lokasi Pengukuran', type: 'text', required: true, showInTable: true },
      { key: 'tanggalPengukuran', label: 'Tanggal Pengukuran', type: 'date', required: true, showInTable: true },
      { key: 'nilaiHasil', label: 'Nilai Hasil Pengukuran', type: 'text', required: true, placeholder: 'Contoh: 85 dB, 32°C' },
      { key: 'nilaiNAB', label: 'Nilai Ambang Batas (NAB)', type: 'text', placeholder: 'Nilai batas yang diperbolehkan' },
      { key: 'statusKepatuhan', label: 'Status vs NAB', type: 'select', required: true, options: [
        { label: 'Di Bawah NAB (Aman)', value: 'Di Bawah NAB' },
        { label: 'Mendekati NAB', value: 'Mendekati NAB' },
        { label: 'Melebihi NAB', value: 'Melebihi NAB' },
      ]},
      { key: 'tindakLanjut', label: 'Tindak Lanjut', type: 'textarea', placeholder: 'Tindak lanjut jika melebihi NAB...' },
    ],
  },
  {
    route: 'accident-prevention/equipment-safety',
    categoryId: 'ap-equipment-safety',
    title: 'Equipment Safety',
    description: 'Inspeksi dan pemeliharaan keselamatan peralatan kerja, mesin, dan instalasi.',
    parentLabel: 'Accident Prevention',
    fields: [
      { key: 'namaPeralatan', label: 'Nama Peralatan', type: 'text', required: true, showInTable: true },
      { key: 'nomorAset', label: 'Nomor Aset / ID', type: 'text', showInTable: true },
      { key: 'lokasiPeralatan', label: 'Lokasi', type: 'text', required: true, showInTable: true },
      { key: 'jenisInspeksi', label: 'Jenis Inspeksi', type: 'select', required: true, options: [
        { label: 'Inspeksi Harian', value: 'Inspeksi Harian' },
        { label: 'Inspeksi Mingguan', value: 'Inspeksi Mingguan' },
        { label: 'Inspeksi Bulanan', value: 'Inspeksi Bulanan' },
        { label: 'Inspeksi Tahunan', value: 'Inspeksi Tahunan' },
        { label: 'Sertifikasi Uji Berkala', value: 'Sertifikasi Uji Berkala' },
      ]},
      { key: 'tanggalInspeksi', label: 'Tanggal Inspeksi', type: 'date', required: true },
      { key: 'kondisiPeralatan', label: 'Kondisi Peralatan', type: 'select', required: true, options: [
        { label: 'Baik', value: 'Baik' },
        { label: 'Perlu Perbaikan', value: 'Perlu Perbaikan' },
        { label: 'Tidak Layak Pakai', value: 'Tidak Layak Pakai' },
      ]},
      { key: 'temuanKerusakan', label: 'Temuan / Kerusakan', type: 'textarea', placeholder: 'Uraikan temuan atau kerusakan...' },
      { key: 'tindakLanjut', label: 'Tindak Lanjut', type: 'textarea' },
    ],
  },
  {
    route: 'accident-prevention/loto',
    categoryId: 'ap-loto',
    title: 'LOTO / Tag Out',
    description: 'Pengelolaan prosedur Lockout Tagout untuk pekerjaan pemeliharaan dan perbaikan peralatan.',
    parentLabel: 'Accident Prevention',
    fields: [
      { key: 'namaPeralatan', label: 'Nama Peralatan / Mesin', type: 'text', required: true, showInTable: true },
      { key: 'lokasiLOTO', label: 'Lokasi', type: 'text', required: true, showInTable: true },
      { key: 'tanggalLOTO', label: 'Tanggal LOTO', type: 'date', required: true, showInTable: true },
      { key: 'pelaksanaLOTO', label: 'Pelaksana LOTO', type: 'text', required: true },
      { key: 'pengawasLOTO', label: 'Pengawas', type: 'text', required: true },
      { key: 'jenisPenguncian', label: 'Jenis Penguncian', type: 'select', required: true, options: [
        { label: 'Lockout (Gembok)', value: 'Lockout' },
        { label: 'Tagout (Label)', value: 'Tagout' },
        { label: 'Lockout & Tagout', value: 'Lockout & Tagout' },
      ]},
      { key: 'sumberEnergi', label: 'Sumber Energi yang Diisolasi', type: 'textarea', required: true, placeholder: 'Listrik, pneumatik, hidrolik, dll.' },
      { key: 'statusLOTO', label: 'Status', type: 'select', required: true, options: [
        { label: 'Terpasang (Aktif)', value: 'Aktif' },
        { label: 'Dilepas (Selesai)', value: 'Selesai' },
      ]},
    ],
  },
  {
    route: 'accident-prevention/chemical-safety',
    categoryId: 'ap-chemical-safety',
    title: 'Chemical Safety',
    description: 'Pengelolaan bahan kimia berbahaya (B3): inventaris, MSDS, penyimpanan, dan penanganan.',
    parentLabel: 'Accident Prevention',
    fields: [
      { key: 'namaBahanKimia', label: 'Nama Bahan Kimia', type: 'text', required: true, showInTable: true },
      { key: 'nomorCAS', label: 'Nomor CAS', type: 'text', placeholder: 'Chemical Abstracts Service number' },
      { key: 'kategoriB3', label: 'Kategori B3', type: 'select', required: true, showInTable: true, options: [
        { label: 'Mudah Meledak (Explosive)', value: 'Explosive' },
        { label: 'Mudah Terbakar (Flammable)', value: 'Flammable' },
        { label: 'Beracun (Toxic)', value: 'Toxic' },
        { label: 'Korosif (Corrosive)', value: 'Corrosive' },
        { label: 'Oksidator', value: 'Oksidator' },
        { label: 'Berbahaya bagi Lingkungan', value: 'Lingkungan' },
      ]},
      { key: 'jumlahStok', label: 'Jumlah Stok', type: 'text', required: true, showInTable: true, placeholder: 'Contoh: 50 liter, 100 kg' },
      { key: 'lokasiPenyimpanan', label: 'Lokasi Penyimpanan', type: 'text', required: true },
      { key: 'statusMSDS', label: 'Status MSDS / SDS', type: 'select', required: true, options: [
        { label: 'Tersedia & Update', value: 'Tersedia' },
        { label: 'Perlu Update', value: 'Perlu Update' },
        { label: 'Tidak Tersedia', value: 'Tidak Tersedia' },
      ]},
      { key: 'kondisiPenyimpanan', label: 'Kondisi Penyimpanan', type: 'textarea', placeholder: 'Suhu, ventilasi, segregasi, dll.' },
    ],
  },
  {
    route: 'accident-prevention/emergency-preparedness',
    categoryId: 'ap-emergency',
    title: 'Emergency Preparedness',
    description: 'Kesiapsiagaan tanggap darurat: simulasi, latihan, peralatan darurat, dan prosedur evakuasi.',
    parentLabel: 'Accident Prevention',
    fields: [
      { key: 'jenisKedaruratan', label: 'Jenis Kedaruratan', type: 'select', required: true, showInTable: true, options: [
        { label: 'Kebakaran', value: 'Kebakaran' },
        { label: 'Tumpahan B3', value: 'Tumpahan B3' },
        { label: 'Gempa Bumi', value: 'Gempa Bumi' },
        { label: 'Kecelakaan Kerja Besar', value: 'Kecelakaan Kerja Besar' },
        { label: 'Ledakan', value: 'Ledakan' },
        { label: 'Evakuasi Medis', value: 'Evakuasi Medis' },
      ]},
      { key: 'jenisKegiatan', label: 'Jenis Kegiatan', type: 'select', required: true, showInTable: true, options: [
        { label: 'Drill / Simulasi', value: 'Drill' },
        { label: 'Inspeksi Peralatan Darurat', value: 'Inspeksi Peralatan' },
        { label: 'Pembaruan Prosedur', value: 'Pembaruan Prosedur' },
        { label: 'Pelatihan Tim Darurat', value: 'Pelatihan Tim' },
      ]},
      { key: 'tanggalKegiatan', label: 'Tanggal Kegiatan', type: 'date', required: true, showInTable: true },
      { key: 'lokasiKegiatan', label: 'Lokasi', type: 'text', required: true },
      { key: 'jumlahPeserta', label: 'Jumlah Peserta', type: 'number', placeholder: '0' },
      { key: 'hasilEvaluasi', label: 'Hasil Evaluasi', type: 'textarea', placeholder: 'Catatan evaluasi dan temuan...' },
      { key: 'tindakLanjut', label: 'Tindak Lanjut', type: 'textarea' },
    ],
  },
  {
    route: 'accident-prevention/incident-near-miss',
    categoryId: 'ap-incident',
    title: 'Incident & Near Miss',
    description: 'Pelaporan dan investigasi kecelakaan kerja, insiden, dan near miss.',
    parentLabel: 'Accident Prevention',
    fields: [
      { key: 'tanggalKejadian', label: 'Tanggal Kejadian', type: 'date', required: true, showInTable: true },
      { key: 'jenisKejadian', label: 'Jenis Kejadian', type: 'select', required: true, showInTable: true, options: [
        { label: 'Near Miss', value: 'Near Miss' },
        { label: 'First Aid Case', value: 'First Aid Case' },
        { label: 'Medical Treatment Case', value: 'Medical Treatment Case' },
        { label: 'Lost Time Injury', value: 'Lost Time Injury' },
        { label: 'Fatality', value: 'Fatality' },
        { label: 'Property Damage', value: 'Property Damage' },
      ]},
      { key: 'lokasi', label: 'Lokasi Kejadian', type: 'text', required: true, showInTable: true },
      { key: 'deskripsiKejadian', label: 'Deskripsi Kejadian', type: 'textarea', required: true, placeholder: 'Uraikan kronologi kejadian...' },
      { key: 'penyebabLangsung', label: 'Penyebab Langsung', type: 'textarea', placeholder: 'Unsafe act / unsafe condition yang menyebabkan kejadian...' },
      { key: 'penyebabDasar', label: 'Penyebab Dasar (Root Cause)', type: 'textarea', placeholder: 'Faktor manusia, sistem, atau lingkungan...' },
      { key: 'tindakanKorektif', label: 'Tindakan Korektif', type: 'textarea', required: true },
      { key: 'statusInvestigasi', label: 'Status Investigasi', type: 'select', required: true, options: [
        { label: 'Selesai', value: 'Selesai' },
        { label: 'Dalam Investigasi', value: 'Dalam Investigasi' },
        { label: 'Belum Diinvestigasi', value: 'Belum Diinvestigasi' },
      ]},
    ],
  },

];

pages.forEach(p => {
  const dir = path.join(BASE, p.route);
  const configImport = `@/app/${p.route}/config`;
  writeFile(path.join(dir, 'config.ts'), configContent(p.categoryId, p.title, p.description, p.parentLabel, p.fields));
  writeFile(path.join(dir, 'page.tsx'), pageContent(p.categoryId, configImport));
  writeFile(path.join(dir, 'layout.tsx'), layoutContent());
});

console.log(`\n🎉 Done! Generated ${pages.length} pages for Accident Prevention.`);
