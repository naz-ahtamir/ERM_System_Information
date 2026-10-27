// src/app/safety-compliance/k3-policy/config.ts
import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'sc-k3-policy',
  title: 'K3 Policy',
  description: 'Kelola kebijakan K3 perusahaan, dokumen komitmen manajemen, dan penetapan tujuan K3.',
  parentLabel: 'Safety Compliance',
  fields: [
    // 1. Jenis Kebijakan
    {
      key: 'jenisKebijakan',
      label: 'Jenis Kebijakan',
      type: 'select',
      required: true,
      showInTable: true,
      options: [
        { label: 'KEBIJAKAN UMUM', value: 'UMUM' },
        { label: 'KEBIJAKAN KHUSUS', value: 'KHUSUS' },
      ],
    },
    // 2. Judul Kebijakan (Ditampilkan di kolom utama "Judul Kebijakan", diset false di sini agar tidak duplikat di kolom samping)
    {
      key: 'judulKebijakan',
      label: 'Judul Kebijakan',
      type: 'text',
      required: true,
      placeholder: 'Judul lengkap kebijakan',
      showInTable: false,
    },
    // 3. Tanggal Penetapan
    {
      key: 'tanggalPenetapan',
      label: 'Tanggal Penetapan',
      type: 'date',
      required: true,
      showInTable: true,
    },
    // 4. Penandatangan
    {
      key: 'penandatangan',
      label: 'Penandatangan',
      type: 'text',
      required: true,
      placeholder: 'Nama penandatangan kebijakan',
      showInTable: true,
    },
    // 5. Jabatan
    {
      key: 'jabatan',
      label: 'Jabatan',
      type: 'text',
      required: true,
      placeholder: 'Jabatan penandatangan',
      showInTable: false,
    },
    // 6. Status Dokumen
    {
      key: 'statusDokumen',
      label: 'Status Dokumen',
      type: 'select',
      required: true,
      showInTable: false,
      options: [
        { label: 'ASLI', value: 'ASLI' },
        { label: 'SALINAN', value: 'SALINAN' },
        { label: 'ASLI-REVISI', value: 'ASLI-REVISI' },
        { label: 'SALINAN-REVISI', value: 'SALINAN-REVISI' },
      ],
    },
    // 7. Status Distribusi
    {
      key: 'statusDistribusi',
      label: 'Status Distribusi',
      type: 'select',
      required: false,
      showInTable: false,
      options: [
        { label: 'TERKENDALI', value: 'TERKENDALI' },
        { label: 'TIDAK TERKENDALI', value: 'TIDAK TERKENDALI' },
      ],
    },
    // 8. Status Validasi (Status Berlaku)
    {
      key: 'statusValidasi',
      label: 'Status Berlaku',
      type: 'select',
      required: false,
      showInTable: true,
      options: [
        { label: 'BERLAKU', value: 'BERLAKU' },
        { label: 'TIDAK BERLAKU', value: 'TIDAK BERLAKU' },
        { label: 'PEMUSNAHAN', value: 'PEMUSNAHAN' },
        { label: 'EDISI LAMA', value: 'EDISI LAMA' },
        { label: 'BATALKAN', value: 'BATALKAN' },
      ],
    },
    // 9. Upload Dokumen PDF
    {
      key: 'fileDokumen',
      label: 'Upload Dokumen (PDF)',
      type: 'file',
      required: false,
      accept: '.pdf',
      showInTable: false,
      showInDetail: true,
      placeholder: 'Unggah file PDF kebijakan',
    },
  ],
};
