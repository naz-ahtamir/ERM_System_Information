import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'sc-occupational-health',
  title: 'Occupational Health Management',
  description: 'Manajemen kesehatan kerja, pemeriksaan kesehatan, dan pengendalian penyakit akibat kerja.',
  parentLabel: 'Safety Compliance',
  fields: [
    {
        "key": "jenisProgram",
        "label": "Jenis Program Kesehatan",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "MCU (Medical Check Up)",
                "value": "MCU"
            },
            {
                "label": "Pemeriksaan Awal Kerja",
                "value": "Pemeriksaan Awal Kerja"
            },
            {
                "label": "Pemeriksaan Berkala",
                "value": "Pemeriksaan Berkala"
            },
            {
                "label": "Pemeriksaan Khusus",
                "value": "Pemeriksaan Khusus"
            },
            {
                "label": "Imunisasi / Vaksinasi",
                "value": "Imunisasi"
            },
            {
                "label": "Promosi Kesehatan",
                "value": "Promosi Kesehatan"
            }
        ]
    },
    {
        "key": "tanggalPelaksanaan",
        "label": "Tanggal Pelaksanaan",
        "type": "date",
        "required": true,
        "showInTable": true
    },
    {
        "key": "jumlahPeserta",
        "label": "Jumlah Peserta",
        "type": "number",
        "placeholder": "0"
    },
    {
        "key": "lokasi",
        "label": "Lokasi",
        "type": "text",
        "required": true,
        "placeholder": "Lokasi pelaksanaan",
        "showInTable": true
    },
    {
        "key": "statusKegiatan",
        "label": "Status Kegiatan",
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
                "label": "Dijadwalkan",
                "value": "Dijadwalkan"
            }
        ]
    },
    {
        "key": "hasilTemuan",
        "label": "Hasil / Temuan",
        "type": "textarea",
        "placeholder": "Ringkasan hasil kegiatan..."
    },
    {
        "key": "tindakLanjut",
        "label": "Tindak Lanjut",
        "type": "textarea",
        "placeholder": "Tindak lanjut yang diperlukan..."
    }
],
};
