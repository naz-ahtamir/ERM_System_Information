import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'ap-safety-inspection',
  title: 'Safety Inspection',
  description: 'Rekap kegiatan inspeksi K3 di area kerja, temuan, dan tindak lanjut.',
  parentLabel: 'Accident Prevention',
  fields: [
    {
        "key": "tanggalInspeksi",
        "label": "Tanggal Inspeksi",
        "type": "date",
        "required": true,
        "showInTable": true
    },
    {
        "key": "areaInspeksi",
        "label": "Area yang Diinspeksi",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "inspektur",
        "label": "Inspektor",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "jenisInspeksi",
        "label": "Jenis Inspeksi",
        "type": "select",
        "required": true,
        "options": [
            {
                "label": "Inspeksi Rutin",
                "value": "Inspeksi Rutin"
            },
            {
                "label": "Inspeksi Mendadak",
                "value": "Inspeksi Mendadak"
            },
            {
                "label": "Inspeksi Khusus",
                "value": "Inspeksi Khusus"
            },
            {
                "label": "Pre-work Inspection",
                "value": "Pre-work Inspection"
            }
        ]
    },
    {
        "key": "temuanUnsafe",
        "label": "Temuan Unsafe Act / Condition",
        "type": "textarea",
        "placeholder": "Uraikan temuan tindakan atau kondisi tidak aman..."
    },
    {
        "key": "jumlahTemuan",
        "label": "Jumlah Temuan",
        "type": "number",
        "placeholder": "0"
    },
    {
        "key": "statusTindakLanjut",
        "label": "Status Tindak Lanjut",
        "type": "select",
        "required": true,
        "options": [
            {
                "label": "Selesai",
                "value": "Selesai"
            },
            {
                "label": "Dalam Proses",
                "value": "Dalam Proses"
            },
            {
                "label": "Belum Ditangani",
                "value": "Belum Ditangani"
            }
        ]
    },
    {
        "key": "tindakLanjut",
        "label": "Uraian Tindak Lanjut",
        "type": "textarea"
    }
],
};
