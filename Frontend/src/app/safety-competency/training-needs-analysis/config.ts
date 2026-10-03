import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'scomp-tna',
  title: 'Training Needs Analysis',
  description: 'Analisis kebutuhan pelatihan K3 berdasarkan gap kompetensi dan risiko pekerjaan.',
  parentLabel: 'Safety Competency',
  fields: [
    {
        "key": "jabatan",
        "label": "Jabatan / Posisi",
        "type": "text",
        "required": true,
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
        "key": "kompetensiDibutuhkan",
        "label": "Kompetensi yang Dibutuhkan",
        "type": "textarea",
        "required": true,
        "placeholder": "Uraikan kompetensi K3 yang dibutuhkan untuk jabatan ini..."
    },
    {
        "key": "gapKompetensi",
        "label": "Gap Kompetensi",
        "type": "textarea",
        "required": true,
        "placeholder": "Uraikan gap antara kompetensi yang dimiliki vs yang dibutuhkan..."
    },
    {
        "key": "prioritas",
        "label": "Prioritas",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "Tinggi",
                "value": "Tinggi"
            },
            {
                "label": "Sedang",
                "value": "Sedang"
            },
            {
                "label": "Rendah",
                "value": "Rendah"
            }
        ]
    },
    {
        "key": "rekomendasiPelatihan",
        "label": "Rekomendasi Pelatihan",
        "type": "textarea",
        "placeholder": "Jenis pelatihan yang direkomendasikan..."
    },
    {
        "key": "targetWaktu",
        "label": "Target Waktu Pelatihan",
        "type": "date"
    }
],
};
