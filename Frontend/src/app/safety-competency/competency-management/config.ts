import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'scomp-competency-mgmt',
  title: 'Competency Management',
  description: 'Pengelolaan matriks kompetensi K3 karyawan dan rencana pengembangan.',
  parentLabel: 'Safety Competency',
  fields: [
    {
        "key": "namaKaryawan",
        "label": "Nama Karyawan",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "jabatan",
        "label": "Jabatan",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "kompetensiK3",
        "label": "Kompetensi K3 yang Dimiliki",
        "type": "textarea",
        "required": true,
        "placeholder": "Daftar kompetensi K3 yang sudah dimiliki..."
    },
    {
        "key": "levelKompetensi",
        "label": "Level Kompetensi K3",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "Awareness (Sadar)",
                "value": "Awareness"
            },
            {
                "label": "Basic (Dasar)",
                "value": "Basic"
            },
            {
                "label": "Intermediate (Menengah)",
                "value": "Intermediate"
            },
            {
                "label": "Advanced (Mahir)",
                "value": "Advanced"
            },
            {
                "label": "Expert (Ahli)",
                "value": "Expert"
            }
        ]
    },
    {
        "key": "gapKompetensi",
        "label": "Gap Kompetensi",
        "type": "textarea",
        "placeholder": "Kompetensi yang masih perlu dikembangkan..."
    },
    {
        "key": "rencanaPengembangan",
        "label": "Rencana Pengembangan",
        "type": "textarea",
        "placeholder": "Rencana pelatihan atau pengembangan..."
    },
    {
        "key": "targetWaktu",
        "label": "Target Waktu",
        "type": "date"
    }
],
};
