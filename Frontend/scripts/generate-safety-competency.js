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

  // ── SAFETY COMPETENCY (10 pages) ─────────────────────────────────────────────
  {
    route: 'safety-competency/training-management',
    categoryId: 'scomp-training-mgmt',
    title: 'Training Management',
    description: 'Perencanaan, pelaksanaan, dan evaluasi program pelatihan K3 secara keseluruhan.',
    parentLabel: 'Safety Competency',
    fields: [
      { key: 'namaProgram', label: 'Nama Program Pelatihan', type: 'text', required: true, showInTable: true },
      { key: 'targetPeserta', label: 'Target Peserta', type: 'text', required: true, showInTable: true, placeholder: 'Jabatan / departemen target' },
      { key: 'jadwalPelaksanaan', label: 'Jadwal Pelaksanaan', type: 'date', required: true, showInTable: true },
      { key: 'durasi', label: 'Durasi (jam)', type: 'number', placeholder: '8' },
      { key: 'metodePelatihan', label: 'Metode Pelatihan', type: 'select', options: [
        { label: 'Kelas / Classroom', value: 'Kelas' },
        { label: 'OJT (On the Job Training)', value: 'OJT' },
        { label: 'E-Learning', value: 'E-Learning' },
        { label: 'Simulasi / Praktek', value: 'Simulasi' },
        { label: 'Workshop', value: 'Workshop' },
      ]},
      { key: 'statusProgram', label: 'Status Program', type: 'select', required: true, options: [
        { label: 'Direncanakan', value: 'Direncanakan' },
        { label: 'Berjalan', value: 'Berjalan' },
        { label: 'Selesai', value: 'Selesai' },
        { label: 'Dibatalkan', value: 'Dibatalkan' },
      ]},
      { key: 'keterangan', label: 'Keterangan', type: 'textarea' },
    ],
  },
  {
    route: 'safety-competency/training-needs-analysis',
    categoryId: 'scomp-tna',
    title: 'Training Needs Analysis',
    description: 'Analisis kebutuhan pelatihan K3 berdasarkan gap kompetensi dan risiko pekerjaan.',
    parentLabel: 'Safety Competency',
    fields: [
      { key: 'jabatan', label: 'Jabatan / Posisi', type: 'text', required: true, showInTable: true },
      { key: 'departemen', label: 'Departemen', type: 'text', required: true, showInTable: true },
      { key: 'kompetensiDibutuhkan', label: 'Kompetensi yang Dibutuhkan', type: 'textarea', required: true, placeholder: 'Uraikan kompetensi K3 yang dibutuhkan untuk jabatan ini...' },
      { key: 'gapKompetensi', label: 'Gap Kompetensi', type: 'textarea', required: true, placeholder: 'Uraikan gap antara kompetensi yang dimiliki vs yang dibutuhkan...' },
      { key: 'prioritas', label: 'Prioritas', type: 'select', required: true, showInTable: true, options: [
        { label: 'Tinggi', value: 'Tinggi' },
        { label: 'Sedang', value: 'Sedang' },
        { label: 'Rendah', value: 'Rendah' },
      ]},
      { key: 'rekomendasiPelatihan', label: 'Rekomendasi Pelatihan', type: 'textarea', placeholder: 'Jenis pelatihan yang direkomendasikan...' },
      { key: 'targetWaktu', label: 'Target Waktu Pelatihan', type: 'date' },
    ],
  },
  {
    route: 'safety-competency/safety-induction',
    categoryId: 'scomp-induction',
    title: 'Safety Induction',
    description: 'Rekap pelaksanaan safety induction untuk karyawan baru, kontraktor, dan tamu.',
    parentLabel: 'Safety Competency',
    fields: [
      { key: 'namaPeserta', label: 'Nama Peserta', type: 'text', required: true, showInTable: true },
      { key: 'statusPeserta', label: 'Status Peserta', type: 'select', required: true, showInTable: true, options: [
        { label: 'Karyawan Baru', value: 'Karyawan Baru' },
        { label: 'Kontraktor', value: 'Kontraktor' },
        { label: 'Tamu / Visitor', value: 'Tamu' },
        { label: 'Magang / Trainee', value: 'Magang' },
      ]},
      { key: 'tanggalInduction', label: 'Tanggal Induction', type: 'date', required: true, showInTable: true },
      { key: 'durasiJam', label: 'Durasi (jam)', type: 'number', placeholder: '2' },
      { key: 'fasilitator', label: 'Fasilitator', type: 'text', required: true },
      { key: 'nilaiTest', label: 'Nilai Tes (jika ada)', type: 'number', placeholder: '0-100' },
      { key: 'statusLulus', label: 'Status Kelulusan', type: 'select', required: true, options: [
        { label: 'Lulus', value: 'Lulus' },
        { label: 'Tidak Lulus', value: 'Tidak Lulus' },
        { label: 'Belum Dites', value: 'Belum Dites' },
      ]},
      { key: 'keterangan', label: 'Keterangan', type: 'textarea' },
    ],
  },
  {
    route: 'safety-competency/safety-training',
    categoryId: 'scomp-safety-training',
    title: 'Safety Training',
    description: 'Rekap pelaksanaan pelatihan K3 teknis dan sertifikasi untuk tenaga kerja.',
    parentLabel: 'Safety Competency',
    fields: [
      { key: 'namaPelatihan', label: 'Nama Pelatihan', type: 'text', required: true, showInTable: true },
      { key: 'peserta', label: 'Nama Peserta', type: 'text', required: true, showInTable: true },
      { key: 'tanggalPelatihan', label: 'Tanggal Pelatihan', type: 'date', required: true, showInTable: true },
      { key: 'penyelenggara', label: 'Penyelenggara', type: 'text', required: true },
      { key: 'lokasiPelatihan', label: 'Lokasi Pelatihan', type: 'text' },
      { key: 'durasiJam', label: 'Durasi (jam)', type: 'number' },
      { key: 'hasilPenilaian', label: 'Hasil Penilaian / Nilai', type: 'text', placeholder: 'Contoh: 85/100, Kompeten' },
      { key: 'statusLulus', label: 'Status', type: 'select', required: true, options: [
        { label: 'Lulus', value: 'Lulus' },
        { label: 'Tidak Lulus', value: 'Tidak Lulus' },
        { label: 'Dalam Proses', value: 'Dalam Proses' },
      ]},
    ],
  },
  {
    route: 'safety-competency/refreshment-training',
    categoryId: 'scomp-refreshment',
    title: 'Refreshment Training',
    description: 'Rekap pelaksanaan pelatihan penyegaran K3 dan re-sertifikasi kompetensi.',
    parentLabel: 'Safety Competency',
    fields: [
      { key: 'namaPelatihan', label: 'Nama Pelatihan Penyegaran', type: 'text', required: true, showInTable: true },
      { key: 'peserta', label: 'Nama Peserta', type: 'text', required: true, showInTable: true },
      { key: 'tanggalRefreshment', label: 'Tanggal Refreshment', type: 'date', required: true, showInTable: true },
      { key: 'sertifikatSebelumnya', label: 'Sertifikat / Pelatihan Sebelumnya', type: 'text', placeholder: 'Referensi sertifikat atau pelatihan awal' },
      { key: 'tanggalKadaluarsaSebelumnya', label: 'Tanggal Kadaluarsa Sebelumnya', type: 'date' },
      { key: 'penyelenggara', label: 'Penyelenggara', type: 'text', required: true },
      { key: 'hasilRefreshment', label: 'Hasil', type: 'select', required: true, options: [
        { label: 'Lulus / Diperpanjang', value: 'Lulus' },
        { label: 'Tidak Lulus', value: 'Tidak Lulus' },
        { label: 'Dalam Proses', value: 'Dalam Proses' },
      ]},
      { key: 'tanggalKadaluarsaBaru', label: 'Tanggal Kadaluarsa Baru', type: 'date' },
    ],
  },
  {
    route: 'safety-competency/competency-management',
    categoryId: 'scomp-competency-mgmt',
    title: 'Competency Management',
    description: 'Pengelolaan matriks kompetensi K3 karyawan dan rencana pengembangan.',
    parentLabel: 'Safety Competency',
    fields: [
      { key: 'namaKaryawan', label: 'Nama Karyawan', type: 'text', required: true, showInTable: true },
      { key: 'jabatan', label: 'Jabatan', type: 'text', required: true, showInTable: true },
      { key: 'kompetensiK3', label: 'Kompetensi K3 yang Dimiliki', type: 'textarea', required: true, placeholder: 'Daftar kompetensi K3 yang sudah dimiliki...' },
      { key: 'levelKompetensi', label: 'Level Kompetensi K3', type: 'select', required: true, showInTable: true, options: [
        { label: 'Awareness (Sadar)', value: 'Awareness' },
        { label: 'Basic (Dasar)', value: 'Basic' },
        { label: 'Intermediate (Menengah)', value: 'Intermediate' },
        { label: 'Advanced (Mahir)', value: 'Advanced' },
        { label: 'Expert (Ahli)', value: 'Expert' },
      ]},
      { key: 'gapKompetensi', label: 'Gap Kompetensi', type: 'textarea', placeholder: 'Kompetensi yang masih perlu dikembangkan...' },
      { key: 'rencanaPengembangan', label: 'Rencana Pengembangan', type: 'textarea', placeholder: 'Rencana pelatihan atau pengembangan...' },
      { key: 'targetWaktu', label: 'Target Waktu', type: 'date' },
    ],
  },
  {
    route: 'safety-competency/license-certification',
    categoryId: 'scomp-license',
    title: 'License & Certification',
    description: 'Inventaris lisensi K3, sertifikat kompetensi operator, dan izin kerja khusus.',
    parentLabel: 'Safety Competency',
    fields: [
      { key: 'namaKaryawan', label: 'Nama Karyawan', type: 'text', required: true, showInTable: true },
      { key: 'jenisLisensi', label: 'Jenis Lisensi / Sertifikat', type: 'select', required: true, showInTable: true, options: [
        { label: 'SIO Crane', value: 'SIO Crane' },
        { label: 'SIO Forklift', value: 'SIO Forklift' },
        { label: 'SIO Rigger', value: 'SIO Rigger' },
        { label: 'AK3 Umum', value: 'AK3 Umum' },
        { label: 'AK3 Kebakaran', value: 'AK3 Kebakaran' },
        { label: 'AK3 Listrik', value: 'AK3 Listrik' },
        { label: 'AK3 Kimia', value: 'AK3 Kimia' },
        { label: 'P3K K3', value: 'P3K K3' },
        { label: 'Lainnya', value: 'Lainnya' },
      ]},
      { key: 'nomorSertifikat', label: 'Nomor Sertifikat', type: 'text', required: true, showInTable: true },
      { key: 'tanggalTerbit', label: 'Tanggal Terbit', type: 'date', required: true },
      { key: 'tanggalKadaluarsa', label: 'Tanggal Kadaluarsa', type: 'date', required: true },
      { key: 'penerbitSertifikat', label: 'Diterbitkan Oleh', type: 'text', placeholder: 'Kemnaker, BNSP, dll.' },
      { key: 'statusSertifikat', label: 'Status', type: 'select', required: true, options: [
        { label: 'Aktif', value: 'Aktif' },
        { label: 'Akan Kadaluarsa (< 3 Bulan)', value: 'Akan Kadaluarsa' },
        { label: 'Kadaluarsa', value: 'Kadaluarsa' },
        { label: 'Proses Perpanjangan', value: 'Proses Perpanjangan' },
      ]},
    ],
  },
  {
    route: 'safety-competency/job-competency',
    categoryId: 'scomp-job-competency',
    title: 'Job Competency',
    description: 'Penilaian kompetensi K3 spesifik berdasarkan jenis pekerjaan atau jabatan.',
    parentLabel: 'Safety Competency',
    fields: [
      { key: 'namaKaryawan', label: 'Nama Karyawan', type: 'text', required: true, showInTable: true },
      { key: 'jabatan', label: 'Jabatan / Posisi', type: 'text', required: true, showInTable: true },
      { key: 'jenisKompetensiKerja', label: 'Jenis Kompetensi Kerja', type: 'text', required: true, placeholder: 'Kompetensi spesifik pekerjaan', showInTable: true },
      { key: 'metodePenilaian', label: 'Metode Penilaian', type: 'select', options: [
        { label: 'Tes Tertulis', value: 'Tes Tertulis' },
        { label: 'Praktek Langsung', value: 'Praktek' },
        { label: 'Observasi', value: 'Observasi' },
        { label: 'Portofolio', value: 'Portofolio' },
      ]},
      { key: 'tanggalPenilaian', label: 'Tanggal Penilaian', type: 'date', required: true },
      { key: 'penilai', label: 'Penilai / Assessor', type: 'text', required: true },
      { key: 'hasilPenilaian', label: 'Hasil Penilaian', type: 'select', required: true, options: [
        { label: 'Kompeten', value: 'Kompeten' },
        { label: 'Belum Kompeten', value: 'Belum Kompeten' },
        { label: 'Perlu Pengembangan', value: 'Perlu Pengembangan' },
      ]},
      { key: 'catatanPenilaian', label: 'Catatan Penilaian', type: 'textarea' },
    ],
  },
  {
    route: 'safety-competency/safety-briefing',
    categoryId: 'scomp-safety-briefing',
    title: 'Safety Briefing / Toolbox Talk',
    description: 'Rekap pelaksanaan safety briefing, toolbox talk, dan morning safety talk harian.',
    parentLabel: 'Safety Competency',
    fields: [
      { key: 'tanggalBriefing', label: 'Tanggal Briefing', type: 'date', required: true, showInTable: true },
      { key: 'topik', label: 'Topik Briefing', type: 'text', required: true, showInTable: true, placeholder: 'Topik yang disampaikan' },
      { key: 'lokasi', label: 'Lokasi', type: 'text', required: true, showInTable: true },
      { key: 'pemimpin', label: 'Dipimpin Oleh', type: 'text', required: true },
      { key: 'jumlahPeserta', label: 'Jumlah Peserta', type: 'number', required: true, placeholder: '0' },
      { key: 'ringkasanMateri', label: 'Ringkasan Materi', type: 'textarea', required: true, placeholder: 'Ringkasan isi briefing...' },
      { key: 'temuanIssue', label: 'Temuan / Isu yang Diangkat', type: 'textarea', placeholder: 'Isu K3 yang dibahas dalam briefing...' },
      { key: 'tindakLanjut', label: 'Tindak Lanjut', type: 'textarea' },
    ],
  },
  {
    route: 'safety-competency/safety-culture',
    categoryId: 'scomp-safety-culture',
    title: 'Safety Culture Program',
    description: 'Program budaya K3, kampanye keselamatan, dan inisiatif peningkatan kesadaran K3.',
    parentLabel: 'Safety Competency',
    fields: [
      { key: 'namaProgram', label: 'Nama Program', type: 'text', required: true, showInTable: true },
      { key: 'jenisProgram', label: 'Jenis Program', type: 'select', required: true, showInTable: true, options: [
        { label: 'Kampanye K3', value: 'Kampanye K3' },
        { label: 'Safety Award / Penghargaan', value: 'Safety Award' },
        { label: 'Safety Poster / Infografis', value: 'Safety Poster' },
        { label: 'Safety Month', value: 'Safety Month' },
        { label: 'Zero Accident Program', value: 'Zero Accident' },
        { label: 'Behavioral Safety Program', value: 'Behavioral Safety' },
        { label: 'Safety Suggestion System', value: 'Safety Suggestion' },
      ]},
      { key: 'tanggalMulai', label: 'Tanggal Mulai', type: 'date', required: true, showInTable: true },
      { key: 'tanggalSelesai', label: 'Tanggal Selesai', type: 'date' },
      { key: 'targetPeserta', label: 'Target Peserta / Sasaran', type: 'text', required: true },
      { key: 'deskripsiProgram', label: 'Deskripsi Program', type: 'textarea', required: true, placeholder: 'Uraikan program dan tujuannya...' },
      { key: 'hasilDampak', label: 'Hasil / Dampak', type: 'textarea', placeholder: 'Uraikan hasil atau dampak yang dicapai...' },
      { key: 'statusProgram', label: 'Status', type: 'select', required: true, options: [
        { label: 'Berjalan', value: 'Berjalan' },
        { label: 'Selesai', value: 'Selesai' },
        { label: 'Direncanakan', value: 'Direncanakan' },
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

console.log(`\n🎉 Done! Generated ${pages.length} pages for Safety Competency.`);
