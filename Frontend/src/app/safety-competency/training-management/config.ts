import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'scomp-training-mgmt',
  title: 'Training Management',
  description: 'Perencanaan, pelaksanaan, dan evaluasi program pelatihan K3 secara keseluruhan.',
  parentLabel: 'Safety Competency',
  fields: [
    {
        "key": "namaProgram",
        "label": "Nama Program Pelatihan",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "targetPeserta",
        "label": "Target Peserta",
        "type": "text",
        "required": true,
        "showInTable": true,
        "placeholder": "Jabatan / departemen target"
    },
    {
        "key": "jadwalPelaksanaan",
        "label": "Jadwal Pelaksanaan",
        "type": "date",
        "required": true,
        "showInTable": true
    },
    {
        "key": "durasi",
        "label": "Durasi (jam)",
        "type": "number",
        "placeholder": "8"
    },
    {
        "key": "metodePelatihan",
        "label": "Metode Pelatihan",
        "type": "select",
        "options": [
            {
                "label": "Kelas / Classroom",
                "value": "Kelas"
            },
            {
                "label": "OJT (On the Job Training)",
                "value": "OJT"
            },
            {
                "label": "E-Learning",
                "value": "E-Learning"
            },
            {
                "label": "Simulasi / Praktek",
                "value": "Simulasi"
            },
            {
                "label": "Workshop",
                "value": "Workshop"
            }
        ]
    },
    {
        "key": "statusProgram",
        "label": "Status Program",
        "type": "select",
        "required": true,
        "options": [
            {
                "label": "Direncanakan",
                "value": "Direncanakan"
            },
            {
                "label": "Berjalan",
                "value": "Berjalan"
            },
            {
                "label": "Selesai",
                "value": "Selesai"
            },
            {
                "label": "Dibatalkan",
                "value": "Dibatalkan"
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
