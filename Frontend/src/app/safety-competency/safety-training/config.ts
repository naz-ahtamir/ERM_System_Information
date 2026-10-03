import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'scomp-safety-training',
  title: 'Safety Training',
  description: 'Rekap pelaksanaan pelatihan K3 teknis dan sertifikasi untuk tenaga kerja.',
  parentLabel: 'Safety Competency',
  fields: [
    {
        "key": "namaPelatihan",
        "label": "Nama Pelatihan",
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
        "key": "tanggalPelatihan",
        "label": "Tanggal Pelatihan",
        "type": "date",
        "required": true,
        "showInTable": true
    },
    {
        "key": "penyelenggara",
        "label": "Penyelenggara",
        "type": "text",
        "required": true
    },
    {
        "key": "lokasiPelatihan",
        "label": "Lokasi Pelatihan",
        "type": "text"
    },
    {
        "key": "durasiJam",
        "label": "Durasi (jam)",
        "type": "number"
    },
    {
        "key": "hasilPenilaian",
        "label": "Hasil Penilaian / Nilai",
        "type": "text",
        "placeholder": "Contoh: 85/100, Kompeten"
    },
    {
        "key": "statusLulus",
        "label": "Status",
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
                "label": "Dalam Proses",
                "value": "Dalam Proses"
            }
        ]
    }
],
};
