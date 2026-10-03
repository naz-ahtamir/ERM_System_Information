import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'ap-risk-control',
  title: 'Risk Control Implementation',
  description: 'Implementasi pengendalian risiko sesuai hierarki kontrol (eliminasi, substitusi, engineering, APD).',
  parentLabel: 'Accident Prevention',
  fields: [
    {
        "key": "risikoYangDikendalikan",
        "label": "Risiko yang Dikendalikan",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "hierarkiKontrol",
        "label": "Hierarki Kontrol",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "Eliminasi",
                "value": "Eliminasi"
            },
            {
                "label": "Substitusi",
                "value": "Substitusi"
            },
            {
                "label": "Engineering Control",
                "value": "Engineering Control"
            },
            {
                "label": "Administrative Control",
                "value": "Administrative Control"
            },
            {
                "label": "APD (PPE)",
                "value": "APD"
            }
        ]
    },
    {
        "key": "deskripsiKontrol",
        "label": "Deskripsi Tindakan Kontrol",
        "type": "textarea",
        "required": true,
        "placeholder": "Uraikan tindakan pengendalian yang diterapkan..."
    },
    {
        "key": "tanggalImplementasi",
        "label": "Tanggal Implementasi",
        "type": "date",
        "required": true,
        "showInTable": true
    },
    {
        "key": "statusImplementasi",
        "label": "Status",
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
                "label": "Belum Mulai",
                "value": "Belum Mulai"
            }
        ]
    },
    {
        "key": "efektivitas",
        "label": "Efektivitas Kontrol",
        "type": "select",
        "options": [
            {
                "label": "Efektif",
                "value": "Efektif"
            },
            {
                "label": "Cukup Efektif",
                "value": "Cukup Efektif"
            },
            {
                "label": "Tidak Efektif",
                "value": "Tidak Efektif"
            },
            {
                "label": "Belum Dievaluasi",
                "value": "Belum Dievaluasi"
            }
        ]
    },
    {
        "key": "penanggungJawab",
        "label": "Penanggung Jawab",
        "type": "text"
    }
],
};
