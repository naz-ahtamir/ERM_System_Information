import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'scomp-induction',
  title: 'Safety Induction',
  description: 'Rekap pelaksanaan safety induction untuk karyawan baru, kontraktor, dan tamu.',
  parentLabel: 'Safety Competency',
  fields: [
    {
        "key": "namaPeserta",
        "label": "Nama Peserta",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "statusPeserta",
        "label": "Status Peserta",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "Karyawan Baru",
                "value": "Karyawan Baru"
            },
            {
                "label": "Kontraktor",
                "value": "Kontraktor"
            },
            {
                "label": "Tamu / Visitor",
                "value": "Tamu"
            },
            {
                "label": "Magang / Trainee",
                "value": "Magang"
            }
        ]
    },
    {
        "key": "tanggalInduction",
        "label": "Tanggal Induction",
        "type": "date",
        "required": true,
        "showInTable": true
    },
    {
        "key": "durasiJam",
        "label": "Durasi (jam)",
        "type": "number",
        "placeholder": "2"
    },
    {
        "key": "fasilitator",
        "label": "Fasilitator",
        "type": "text",
        "required": true
    },
    {
        "key": "nilaiTest",
        "label": "Nilai Tes (jika ada)",
        "type": "number",
        "placeholder": "0-100"
    },
    {
        "key": "statusLulus",
        "label": "Status Kelulusan",
        "type": "select",
        "required": true,
        "options": [
            {
                "label": "Lulus",
                "value": "Lulus"
            },
            {
                "label": "Tidak Lulus",
                "value": "Tidak Lulus"
            },
            {
                "label": "Belum Dites",
                "value": "Belum Dites"
            }
        ]
    },
    {
        "key": "keterangan",
        "label": "Keterangan",
        "type": "textarea"
    }
],
};
