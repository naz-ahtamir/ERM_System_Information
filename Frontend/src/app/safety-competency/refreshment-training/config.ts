import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'scomp-refreshment',
  title: 'Refreshment Training',
  description: 'Rekap pelaksanaan pelatihan penyegaran K3 dan re-sertifikasi kompetensi.',
  parentLabel: 'Safety Competency',
  fields: [
    {
        "key": "namaPelatihan",
        "label": "Nama Pelatihan Penyegaran",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "peserta",
        "label": "Nama Peserta",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "tanggalRefreshment",
        "label": "Tanggal Refreshment",
        "type": "date",
        "required": true,
        "showInTable": true
    },
    {
        "key": "sertifikatSebelumnya",
        "label": "Sertifikat / Pelatihan Sebelumnya",
        "type": "text",
        "placeholder": "Referensi sertifikat atau pelatihan awal"
    },
    {
        "key": "tanggalKadaluarsaSebelumnya",
        "label": "Tanggal Kadaluarsa Sebelumnya",
        "type": "date"
    },
    {
        "key": "penyelenggara",
        "label": "Penyelenggara",
        "type": "text",
        "required": true
    },
    {
        "key": "hasilRefreshment",
        "label": "Hasil",
        "type": "select",
        "required": true,
        "options": [
            {
                "label": "Lulus / Diperpanjang",
                "value": "Lulus"
            },
            {
                "label": "Tidak Lulus",
                "value": "Tidak Lulus"
            },
            {
                "label": "Dalam Proses",
                "value": "Dalam Proses"
            }
        ]
    },
    {
        "key": "tanggalKadaluarsaBaru",
        "label": "Tanggal Kadaluarsa Baru",
        "type": "date"
    }
],
};
