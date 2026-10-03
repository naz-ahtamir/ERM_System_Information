import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'sc-legal-compliance',
  title: 'Legal Compliance',
  description: 'Pemantauan kepatuhan terhadap peraturan perundangan K3 yang berlaku.',
  parentLabel: 'Safety Compliance',
  fields: [
    {
        "key": "namaPeraturan",
        "label": "Nama Peraturan / Regulasi",
        "type": "text",
        "required": true,
        "placeholder": "Contoh: PP No. 50 Tahun 2012",
        "showInTable": true
    },
    {
        "key": "jenisRegulasi",
        "label": "Jenis Regulasi",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "Undang-Undang",
                "value": "Undang-Undang"
            },
            {
                "label": "Peraturan Pemerintah",
                "value": "Peraturan Pemerintah"
            },
            {
                "label": "Permenaker",
                "value": "Permenaker"
            },
            {
                "label": "SNI / Standar",
                "value": "SNI / Standar"
            },
            {
                "label": "Perda",
                "value": "Perda"
            }
        ]
    },
    {
        "key": "klausul",
        "label": "Klausul yang Relevan",
        "type": "text",
        "placeholder": "Pasal / ayat yang berlaku"
    },
    {
        "key": "statusKepatuhan",
        "label": "Status Kepatuhan",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "Memenuhi",
                "value": "Memenuhi"
            },
            {
                "label": "Sebagian Memenuhi",
                "value": "Sebagian Memenuhi"
            },
            {
                "label": "Tidak Memenuhi",
                "value": "Tidak Memenuhi"
            },
            {
                "label": "Dalam Proses",
                "value": "Dalam Proses"
            }
        ]
    },
    {
        "key": "buktiKepatuhan",
        "label": "Bukti Kepatuhan",
        "type": "textarea",
        "placeholder": "Uraikan bukti / evidensi kepatuhan..."
    },
    {
        "key": "tanggalEvaluasi",
        "label": "Tanggal Evaluasi",
        "type": "date",
        "required": true
    },
    {
        "key": "tindakLanjut",
        "label": "Tindak Lanjut",
        "type": "textarea",
        "placeholder": "Jika belum memenuhi, uraikan tindak lanjut..."
    }
],
};
