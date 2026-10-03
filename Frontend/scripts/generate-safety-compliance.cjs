const fs = require('fs');
const path = require('path');

// ── Helper ────────────────────────────────────────────────────────────────────
function mkdirp(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  mkdirp(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ created:', filePath);
}

const BASE = path.join(__dirname, '..', 'src', 'app');

// ── Page template ─────────────────────────────────────────────────────────────
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

// ── All page definitions ──────────────────────────────────────────────────────

const pages = [

  // ── SAFETY COMPLIANCE (9 pages) ─────────────────────────────────────────────
  {
    route: 'safety-compliance/k3-policy',
    categoryId: 'sc-k3-policy',
    title: 'K3 Policy',
    description: 'Kelola kebijakan K3 perusahaan, dokumen komitmen manajemen, dan penetapan tujuan K3.',
    parentLabel: 'Safety Compliance',
    fields: [
      { key: 'nomorDokumen', label: 'Nomor Dokumen', type: 'text', required: true, placeholder: 'Contoh: K3-POL-001', showInTable: true },
      { key: 'judulKebijakan', label: 'Judul Kebijakan', type: 'text', required: true, placeholder: 'Judul lengkap kebijakan', showInTable: true },
      { key: 'tanggalTerbit', label: 'Tanggal Terbit', type: 'date', required: true, showInTable: true },
      { key: 'tanggalReview', label: 'Tanggal Review Berikutnya', type: 'date' },
      { key: 'statusDokumen', label: 'Status Dokumen', type: 'select', required: true, showInTable: true, options: [
        { label: 'Aktif', value: 'Aktif' },
        { label: 'Draft', value: 'Draft' },
        { label: 'Revisi', value: 'Revisi' },
        { label: 'Kadaluarsa', value: 'Kadaluarsa' },
      ]},
      { key: 'penanggungJawab', label: 'Penanggung Jawab', type: 'text', placeholder: 'Nama PIC' },
      { key: 'keterangan', label: 'Keterangan', type: 'textarea', placeholder: 'Catatan tambahan...' },
    ],
  },
  {
    route: 'safety-compliance/organization-responsibility',
    categoryId: 'sc-org-responsibility',
    title: 'Organization & Responsibility',
    description: 'Dokumentasi struktur organisasi K3, tugas, wewenang, dan tanggung jawab personil.',
    parentLabel: 'Safety Compliance',
    fields: [
      { key: 'namaJabatan', label: 'Nama Jabatan / Posisi', type: 'text', required: true, placeholder: 'Contoh: Safety Officer', showInTable: true },
      { key: 'namaPejabat', label: 'Nama Pejabat', type: 'text', required: true, placeholder: 'Nama lengkap', showInTable: true },
      { key: 'departemen', label: 'Departemen', type: 'text', required: true, showInTable: true },
      { key: 'tanggungjawab', label: 'Tanggung Jawab Utama', type: 'textarea', required: true, placeholder: 'Uraikan tanggung jawab...' },
      { key: 'wewenang', label: 'Wewenang', type: 'textarea', placeholder: 'Uraikan wewenang yang diberikan...' },
      { key: 'statusAktif', label: 'Status', type: 'select', required: true, options: [
        { label: 'Aktif', value: 'Aktif' },
        { label: 'Tidak Aktif', value: 'Tidak Aktif' },
      ]},
    ],
  },
  {
    route: 'safety-compliance/worker-consultation',
    categoryId: 'sc-worker-consultation',
    title: 'Worker Consultation (P2K3)',
    description: 'Rekap kegiatan P2K3, risalah rapat, dan konsultasi K3 dengan tenaga kerja.',
    parentLabel: 'Safety Compliance',
    fields: [
      { key: 'tanggalKegiatan', label: 'Tanggal Kegiatan', type: 'date', required: true, showInTable: true },
      { key: 'jenisKegiatan', label: 'Jenis Kegiatan', type: 'select', required: true, showInTable: true, options: [
        { label: 'Rapat P2K3', value: 'Rapat P2K3' },
        { label: 'Konsultasi K3', value: 'Konsultasi K3' },
        { label: 'Safety Talk', value: 'Safety Talk' },
        { label: 'Toolbox Meeting', value: 'Toolbox Meeting' },
      ]},
      { key: 'lokasi', label: 'Lokasi', type: 'text', required: true, placeholder: 'Ruang / area kegiatan', showInTable: true },
      { key: 'jumlahPeserta', label: 'Jumlah Peserta', type: 'number', placeholder: '0' },
      { key: 'agenda', label: 'Agenda / Topik', type: 'textarea', required: true, placeholder: 'Uraikan agenda kegiatan...' },
      { key: 'hasilKeputusan', label: 'Hasil / Keputusan', type: 'textarea', placeholder: 'Uraikan hasil atau keputusan...' },
      { key: 'pemimpin', label: 'Dipimpin Oleh', type: 'text', placeholder: 'Nama pimpinan rapat' },
    ],
  },
  {
    route: 'safety-compliance/k3-planning',
    categoryId: 'sc-k3-planning',
    title: 'K3 Planning & Risk Assessment',
    description: 'Rekap perencanaan K3, identifikasi bahaya, penilaian risiko, dan pengendalian risiko (HIRADC).',
    parentLabel: 'Safety Compliance',
    fields: [
      { key: 'namaProses', label: 'Nama Proses / Aktivitas', type: 'text', required: true, placeholder: 'Contoh: Proses Peleburan', showInTable: true },
      { key: 'identifikasiBahaya', label: 'Identifikasi Bahaya', type: 'textarea', required: true, placeholder: 'Uraikan potensi bahaya...' },
      { key: 'tingkatRisiko', label: 'Tingkat Risiko', type: 'select', required: true, showInTable: true, options: [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' },
        { label: 'Extreme', value: 'Extreme' },
      ]},
      { key: 'pengendalian', label: 'Tindakan Pengendalian', type: 'textarea', required: true, placeholder: 'Uraikan pengendalian yang diterapkan...' },
      { key: 'statusPengendalian', label: 'Status Pengendalian', type: 'select', required: true, showInTable: true, options: [
        { label: 'Sudah Diterapkan', value: 'Sudah Diterapkan' },
        { label: 'Dalam Proses', value: 'Dalam Proses' },
        { label: 'Belum Diterapkan', value: 'Belum Diterapkan' },
      ]},
      { key: 'penanggungJawab', label: 'Penanggung Jawab', type: 'text', placeholder: 'Nama PIC' },
      { key: 'tanggalReview', label: 'Tanggal Review', type: 'date' },
    ],
  },
  {
    route: 'safety-compliance/documentation-records',
    categoryId: 'sc-documentation',
    title: 'Documentation & Records',
    description: 'Pengelolaan dokumen dan rekaman K3, termasuk distribusi, revisi, dan arsip dokumen.',
    parentLabel: 'Safety Compliance',
    fields: [
      { key: 'nomorDokumen', label: 'Nomor Dokumen', type: 'text', required: true, placeholder: 'Contoh: SOP-K3-001', showInTable: true },
      { key: 'judulDokumen', label: 'Judul Dokumen', type: 'text', required: true, showInTable: true },
      { key: 'jenisDokumen', label: 'Jenis Dokumen', type: 'select', required: true, showInTable: true, options: [
        { label: 'SOP', value: 'SOP' },
        { label: 'IK (Instruksi Kerja)', value: 'IK' },
        { label: 'Formulir', value: 'Formulir' },
        { label: 'Manual', value: 'Manual' },
        { label: 'Prosedur', value: 'Prosedur' },
        { label: 'Rekaman', value: 'Rekaman' },
      ]},
      { key: 'revisi', label: 'Nomor Revisi', type: 'text', placeholder: 'Rev. 00' },
      { key: 'tanggalTerbit', label: 'Tanggal Terbit', type: 'date', required: true },
      { key: 'statusDokumen', label: 'Status', type: 'select', required: true, options: [
        { label: 'Aktif', value: 'Aktif' },
        { label: 'Obsolete', value: 'Obsolete' },
        { label: 'Draft', value: 'Draft' },
      ]},
      { key: 'lokasiPenyimpanan', label: 'Lokasi Penyimpanan', type: 'text', placeholder: 'Folder / rak / sistem DMS' },
    ],
  },
  {
    route: 'safety-compliance/legal-compliance',
    categoryId: 'sc-legal-compliance',
    title: 'Legal Compliance',
    description: 'Pemantauan kepatuhan terhadap peraturan perundangan K3 yang berlaku.',
    parentLabel: 'Safety Compliance',
    fields: [
      { key: 'namaPeraturan', label: 'Nama Peraturan / Regulasi', type: 'text', required: true, placeholder: 'Contoh: PP No. 50 Tahun 2012', showInTable: true },
      { key: 'jenisRegulasi', label: 'Jenis Regulasi', type: 'select', required: true, showInTable: true, options: [
        { label: 'Undang-Undang', value: 'Undang-Undang' },
        { label: 'Peraturan Pemerintah', value: 'Peraturan Pemerintah' },
        { label: 'Permenaker', value: 'Permenaker' },
        { label: 'SNI / Standar', value: 'SNI / Standar' },
        { label: 'Perda', value: 'Perda' },
      ]},
      { key: 'klausul', label: 'Klausul yang Relevan', type: 'text', placeholder: 'Pasal / ayat yang berlaku' },
      { key: 'statusKepatuhan', label: 'Status Kepatuhan', type: 'select', required: true, showInTable: true, options: [
        { label: 'Memenuhi', value: 'Memenuhi' },
        { label: 'Sebagian Memenuhi', value: 'Sebagian Memenuhi' },
        { label: 'Tidak Memenuhi', value: 'Tidak Memenuhi' },
        { label: 'Dalam Proses', value: 'Dalam Proses' },
      ]},
      { key: 'buktiKepatuhan', label: 'Bukti Kepatuhan', type: 'textarea', placeholder: 'Uraikan bukti / evidensi kepatuhan...' },
      { key: 'tanggalEvaluasi', label: 'Tanggal Evaluasi', type: 'date', required: true },
      { key: 'tindakLanjut', label: 'Tindak Lanjut', type: 'textarea', placeholder: 'Jika belum memenuhi, uraikan tindak lanjut...' },
    ],
  },
  {
    route: 'safety-compliance/design-change-management',
    categoryId: 'sc-design-change',
    title: 'Design & Change Management',
    description: 'Pengendalian perubahan desain, proses, atau peralatan yang berdampak pada K3.',
    parentLabel: 'Safety Compliance',
    fields: [
      { key: 'namaPerubahan', label: 'Nama / Deskripsi Perubahan', type: 'text', required: true, showInTable: true },
      { key: 'jenisPerubahan', label: 'Jenis Perubahan', type: 'select', required: true, showInTable: true, options: [
        { label: 'Perubahan Desain', value: 'Perubahan Desain' },
        { label: 'Perubahan Proses', value: 'Perubahan Proses' },
        { label: 'Perubahan Peralatan', value: 'Perubahan Peralatan' },
        { label: 'Perubahan Material', value: 'Perubahan Material' },
        { label: 'Perubahan Organisasi', value: 'Perubahan Organisasi' },
      ]},
      { key: 'tanggalPerubahan', label: 'Tanggal Perubahan', type: 'date', required: true, showInTable: true },
      { key: 'alasanPerubahan', label: 'Alasan Perubahan', type: 'textarea', required: true, placeholder: 'Uraikan alasan dan latar belakang perubahan...' },
      { key: 'dampakK3', label: 'Dampak terhadap K3', type: 'textarea', required: true, placeholder: 'Uraikan potensi dampak K3 dari perubahan ini...' },
      { key: 'statusPersetujuan', label: 'Status Persetujuan', type: 'select', required: true, options: [
        { label: 'Disetujui', value: 'Disetujui' },
        { label: 'Pending Review', value: 'Pending Review' },
        { label: 'Ditolak', value: 'Ditolak' },
      ]},
      { key: 'disetujuiOleh', label: 'Disetujui Oleh', type: 'text', placeholder: 'Nama approver' },
    ],
  },
  {
    route: 'safety-compliance/procurement-contractor',
    categoryId: 'sc-procurement',
    title: 'Procurement & Contractor Control',
    description: 'Pengendalian pengadaan dan kontraktor terkait persyaratan K3.',
    parentLabel: 'Safety Compliance',
    fields: [
      { key: 'namaVendor', label: 'Nama Vendor / Kontraktor', type: 'text', required: true, showInTable: true },
      { key: 'jenisLayanan', label: 'Jenis Layanan / Pekerjaan', type: 'text', required: true, showInTable: true, placeholder: 'Contoh: Pemeliharaan Crane' },
      { key: 'tanggalEvaluasi', label: 'Tanggal Evaluasi', type: 'date', required: true, showInTable: true },
      { key: 'statusK3Vendor', label: 'Status K3 Vendor', type: 'select', required: true, options: [
        { label: 'Lulus', value: 'Lulus' },
        { label: 'Kondisional', value: 'Kondisional' },
        { label: 'Tidak Lulus', value: 'Tidak Lulus' },
      ]},
      { key: 'persyaratanK3', label: 'Persyaratan K3 yang Dipenuhi', type: 'textarea', placeholder: 'Uraikan persyaratan K3 yang telah dipenuhi vendor...' },
      { key: 'temuanK3', label: 'Temuan / Ketidaksesuaian K3', type: 'textarea', placeholder: 'Uraikan temuan jika ada...' },
      { key: 'tindakLanjut', label: 'Tindak Lanjut', type: 'textarea', placeholder: 'Uraikan tindak lanjut yang diperlukan...' },
    ],
  },
  {
    route: 'safety-compliance/occupational-health',
    categoryId: 'sc-occupational-health',
    title: 'Occupational Health Management',
    description: 'Manajemen kesehatan kerja, pemeriksaan kesehatan, dan pengendalian penyakit akibat kerja.',
    parentLabel: 'Safety Compliance',
    fields: [
      { key: 'jenisProgram', label: 'Jenis Program Kesehatan', type: 'select', required: true, showInTable: true, options: [
        { label: 'MCU (Medical Check Up)', value: 'MCU' },
        { label: 'Pemeriksaan Awal Kerja', value: 'Pemeriksaan Awal Kerja' },
        { label: 'Pemeriksaan Berkala', value: 'Pemeriksaan Berkala' },
        { label: 'Pemeriksaan Khusus', value: 'Pemeriksaan Khusus' },
        { label: 'Imunisasi / Vaksinasi', value: 'Imunisasi' },
        { label: 'Promosi Kesehatan', value: 'Promosi Kesehatan' },
      ]},
      { key: 'tanggalPelaksanaan', label: 'Tanggal Pelaksanaan', type: 'date', required: true, showInTable: true },
      { key: 'jumlahPeserta', label: 'Jumlah Peserta', type: 'number', placeholder: '0' },
      { key: 'lokasi', label: 'Lokasi', type: 'text', required: true, placeholder: 'Lokasi pelaksanaan', showInTable: true },
      { key: 'statusKegiatan', label: 'Status Kegiatan', type: 'select', required: true, options: [
        { label: 'Selesai', value: 'Selesai' },
        { label: 'Dalam Proses', value: 'Dalam Proses' },
        { label: 'Dijadwalkan', value: 'Dijadwalkan' },
      ]},
      { key: 'hasilTemuan', label: 'Hasil / Temuan', type: 'textarea', placeholder: 'Ringkasan hasil kegiatan...' },
      { key: 'tindakLanjut', label: 'Tindak Lanjut', type: 'textarea', placeholder: 'Tindak lanjut yang diperlukan...' },
    ],
  },

];

// ── Generate files ─────────────────────────────────────────────────────────────
pages.forEach(p => {
  const dir = path.join(BASE, p.route);
  const configImport = `@/app/${p.route}/config`;

  // config.ts
  writeFile(path.join(dir, 'config.ts'), configContent(p.categoryId, p.title, p.description, p.parentLabel, p.fields));
  // page.tsx
  writeFile(path.join(dir, 'page.tsx'), pageContent(p.categoryId, configImport));
  // layout.tsx
  writeFile(path.join(dir, 'layout.tsx'), layoutContent());
});

console.log(`\n🎉 Done! Generated ${pages.length} pages for Safety Compliance.`);
