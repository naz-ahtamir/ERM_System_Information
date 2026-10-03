import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'scomp-safety-culture',
  title: 'Safety Culture Program',
  description: 'Program budaya K3, kampanye keselamatan, dan inisiatif peningkatan kesadaran K3.',
  parentLabel: 'Safety Competency',
  fields: [
    {
        "key": "namaProgram",
        "label": "Nama Program",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "jenisProgram",
        "label": "Jenis Program",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "Kampanye K3",
                "value": "Kampanye K3"
            },
            {
                "label": "Safety Award / Penghargaan",
                "value": "Safety Award"
            },
            {
                "label": "Safety Poster / Infografis",
                "value": "Safety Poster"
            },
            {
                "label": "Safety Month",
                "value": "Safety Month"
            },
            {
                "label": "Zero Accident Program",
                "value": "Zero Accident"
            },
            {
                "label": "Behavioral Safety Program",
                "value": "Behavioral Safety"
            },
            {
                "label": "Safety Suggestion System",
                "value": "Safety Suggestion"
            }
        ]
    },
    {
        "key": "tanggalMulai",
        "label": "Tanggal Mulai",
        "type": "date",
        "required": true,
        "showInTable": true
    },
    {
        "key": "tanggalSelesai",
        "label": "Tanggal Selesai",
        "type": "date"
    },
    {
        "key": "targetPeserta",
        "label": "Target Peserta / Sasaran",
        "type": "text",
        "required": true
    },
    {
        "key": "deskripsiProgram",
        "label": "Deskripsi Program",
        "type": "textarea",
        "required": true,
        "placeholder": "Uraikan program dan tujuannya..."
    },
    {
        "key": "hasilDampak",
        "label": "Hasil / Dampak",
        "type": "textarea",
        "placeholder": "Uraikan hasil atau dampak yang dicapai..."
    },
    {
        "key": "statusProgram",
        "label": "Status",
        "type": "select",
        "required": true,
        "options": [
            {
                "label": "Berjalan",
                "value": "Berjalan"
            },
            {
                "label": "Selesai",
                "value": "Selesai"
            },
            {
                "label": "Direncanakan",
                "value": "Direncanakan"
            }
        ]
    }
],
};
