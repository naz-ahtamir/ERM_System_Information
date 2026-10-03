import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'sc-org-responsibility',
  title: 'Organization & Responsibility',
  description: 'Dokumentasi struktur organisasi K3, tugas, wewenang, dan tanggung jawab personil.',
  parentLabel: 'Safety Compliance',
  fields: [
    {
        "key": "namaJabatan",
        "label": "Nama Jabatan / Posisi",
        "type": "text",
        "required": true,
        "placeholder": "Contoh: Safety Officer",
        "showInTable": true
    },
    {
        "key": "namaPejabat",
        "label": "Nama Pejabat",
        "type": "text",
        "required": true,
        "placeholder": "Nama lengkap",
        "showInTable": true
    },
    {
        "key": "departemen",
        "label": "Departemen",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "tanggungjawab",
        "label": "Tanggung Jawab Utama",
        "type": "textarea",
        "required": true,
        "placeholder": "Uraikan tanggung jawab..."
    },
    {
        "key": "wewenang",
        "label": "Wewenang",
        "type": "textarea",
        "placeholder": "Uraikan wewenang yang diberikan..."
    },
    {
        "key": "statusAktif",
        "label": "Status",
        "type": "select",
        "required": true,
        "options": [
            {
                "label": "Aktif",
                "value": "Aktif"
            },
            {
                "label": "Tidak Aktif",
                "value": "Tidak Aktif"
            }
        ]
    }
],
};
