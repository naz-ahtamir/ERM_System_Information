import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'sc-k3-planning',
  title: 'K3 Planning & Risk Assessment',
  description: 'Rekap perencanaan K3, identifikasi bahaya, penilaian risiko, dan pengendalian risiko (HIRADC).',
  parentLabel: 'Safety Compliance',
  fields: [
    {
        "key": "namaProses",
        "label": "Nama Proses / Aktivitas",
        "type": "text",
        "required": true,
        "placeholder": "Contoh: Proses Peleburan",
        "showInTable": true
    },
    {
        "key": "identifikasiBahaya",
        "label": "Identifikasi Bahaya",
        "type": "textarea",
        "required": true,
        "placeholder": "Uraikan potensi bahaya..."
    },
    {
        "key": "tingkatRisiko",
        "label": "Tingkat Risiko",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "Low",
                "value": "Low"
            },
            {
                "label": "Medium",
                "value": "Medium"
            },
            {
                "label": "High",
                "value": "High"
            },
            {
                "label": "Extreme",
                "value": "Extreme"
            }
        ]
    },
    {
        "key": "pengendalian",
        "label": "Tindakan Pengendalian",
        "type": "textarea",
        "required": true,
        "placeholder": "Uraikan pengendalian yang diterapkan..."
    },
    {
        "key": "statusPengendalian",
        "label": "Status Pengendalian",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "Sudah Diterapkan",
                "value": "Sudah Diterapkan"
            },
            {
                "label": "Dalam Proses",
                "value": "Dalam Proses"
            },
            {
                "label": "Belum Diterapkan",
                "value": "Belum Diterapkan"
            }
        ]
    },
    {
        "key": "penanggungJawab",
        "label": "Penanggung Jawab",
        "type": "text",
        "placeholder": "Nama PIC"
    },
    {
        "key": "tanggalReview",
        "label": "Tanggal Review",
        "type": "date"
    }
],
};
