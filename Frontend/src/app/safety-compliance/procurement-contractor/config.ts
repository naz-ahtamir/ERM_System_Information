import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'sc-procurement',
  title: 'Procurement & Contractor Control',
  description: 'Pengendalian pengadaan dan kontraktor terkait persyaratan K3.',
  parentLabel: 'Safety Compliance',
  fields: [
    {
        "key": "namaVendor",
        "label": "Nama Vendor / Kontraktor",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "jenisLayanan",
        "label": "Jenis Layanan / Pekerjaan",
        "type": "text",
        "required": true,
        "showInTable": true,
        "placeholder": "Contoh: Pemeliharaan Crane"
    },
    {
        "key": "tanggalEvaluasi",
        "label": "Tanggal Evaluasi",
        "type": "date",
        "required": true,
        "showInTable": true
    },
    {
        "key": "statusK3Vendor",
        "label": "Status K3 Vendor",
        "type": "select",
        "required": true,
        "options": [
            {
                "label": "Lulus",
                "value": "Lulus"
            },
            {
                "label": "Kondisional",
                "value": "Kondisional"
            },
            {
                "label": "Tidak Lulus",
                "value": "Tidak Lulus"
            }
        ]
    },
    {
        "key": "persyaratanK3",
        "label": "Persyaratan K3 yang Dipenuhi",
        "type": "textarea",
        "placeholder": "Uraikan persyaratan K3 yang telah dipenuhi vendor..."
    },
    {
        "key": "temuanK3",
        "label": "Temuan / Ketidaksesuaian K3",
        "type": "textarea",
        "placeholder": "Uraikan temuan jika ada..."
    },
    {
        "key": "tindakLanjut",
        "label": "Tindak Lanjut",
        "type": "textarea",
        "placeholder": "Uraikan tindak lanjut yang diperlukan..."
    }
],
};
