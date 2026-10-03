import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'ap-ppe-management',
  title: 'PPE Management',
  description: 'Manajemen Alat Pelindung Diri (APD): pengadaan, distribusi, inspeksi, dan penggantian.',
  parentLabel: 'Accident Prevention',
  fields: [
    {
        "key": "jenisAPD",
        "label": "Jenis APD",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "Helm Safety",
                "value": "Helm Safety"
            },
            {
                "label": "Safety Shoes",
                "value": "Safety Shoes"
            },
            {
                "label": "Sarung Tangan",
                "value": "Sarung Tangan"
            },
            {
                "label": "Kacamata Safety",
                "value": "Kacamata Safety"
            },
            {
                "label": "Earplug / Earmuff",
                "value": "Earplug"
            },
            {
                "label": "Masker / Respirator",
                "value": "Masker"
            },
            {
                "label": "Body Harness",
                "value": "Body Harness"
            },
            {
                "label": "Baju Tahan Api",
                "value": "Baju Tahan Api"
            },
            {
                "label": "Apron / Pelindung Tubuh",
                "value": "Apron"
            }
        ]
    },
    {
        "key": "jumlah",
        "label": "Jumlah (unit)",
        "type": "number",
        "required": true,
        "showInTable": true
    },
    {
        "key": "kondisi",
        "label": "Kondisi",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "Baik",
                "value": "Baik"
            },
            {
                "label": "Perlu Penggantian",
                "value": "Perlu Penggantian"
            },
            {
                "label": "Rusak",
                "value": "Rusak"
            }
        ]
    },
    {
        "key": "tanggalInspeksi",
        "label": "Tanggal Inspeksi",
        "type": "date",
        "required": true
    },
    {
        "key": "lokasiPenyimpanan",
        "label": "Lokasi Penyimpanan",
        "type": "text"
    },
    {
        "key": "penanggungJawab",
        "label": "Penanggung Jawab",
        "type": "text"
    },
    {
        "key": "keterangan",
        "label": "Keterangan",
        "type": "textarea"
    }
],
};
