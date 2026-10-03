import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'ap-workplace-monitoring',
  title: 'Workplace Monitoring',
  description: 'Pemantauan lingkungan kerja: kebisingan, suhu, pencahayaan, kualitas udara, dll.',
  parentLabel: 'Accident Prevention',
  fields: [
    {
        "key": "parameterYangDiukur",
        "label": "Parameter yang Diukur",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "Kebisingan (dB)",
                "value": "Kebisingan"
            },
            {
                "label": "Suhu Lingkungan",
                "value": "Suhu"
            },
            {
                "label": "Pencahayaan (lux)",
                "value": "Pencahayaan"
            },
            {
                "label": "Kualitas Udara",
                "value": "Kualitas Udara"
            },
            {
                "label": "Getaran",
                "value": "Getaran"
            },
            {
                "label": "Radiasi",
                "value": "Radiasi"
            },
            {
                "label": "Debu",
                "value": "Debu"
            }
        ]
    },
    {
        "key": "lokasi",
        "label": "Lokasi Pengukuran",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "tanggalPengukuran",
        "label": "Tanggal Pengukuran",
        "type": "date",
        "required": true,
        "showInTable": true
    },
    {
        "key": "nilaiHasil",
        "label": "Nilai Hasil Pengukuran",
        "type": "text",
        "required": true,
        "placeholder": "Contoh: 85 dB, 32°C"
    },
    {
        "key": "nilaiNAB",
        "label": "Nilai Ambang Batas (NAB)",
        "type": "text",
        "placeholder": "Nilai batas yang diperbolehkan"
    },
    {
        "key": "statusKepatuhan",
        "label": "Status vs NAB",
        "type": "select",
        "required": true,
        "options": [
            {
                "label": "Di Bawah NAB (Aman)",
                "value": "Di Bawah NAB"
            },
            {
                "label": "Mendekati NAB",
                "value": "Mendekati NAB"
            },
            {
                "label": "Melebihi NAB",
                "value": "Melebihi NAB"
            }
        ]
    },
    {
        "key": "tindakLanjut",
        "label": "Tindak Lanjut",
        "type": "textarea",
        "placeholder": "Tindak lanjut jika melebihi NAB..."
    }
],
};
