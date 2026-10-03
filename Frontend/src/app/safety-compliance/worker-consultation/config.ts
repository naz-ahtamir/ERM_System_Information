import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'sc-worker-consultation',
  title: 'Worker Consultation (P2K3)',
  description: 'Rekap kegiatan P2K3, risalah rapat, dan konsultasi K3 dengan tenaga kerja.',
  parentLabel: 'Safety Compliance',
  fields: [
    {
        "key": "tanggalKegiatan",
        "label": "Tanggal Kegiatan",
        "type": "date",
        "required": true,
        "showInTable": true
    },
    {
        "key": "jenisKegiatan",
        "label": "Jenis Kegiatan",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "Rapat P2K3",
                "value": "Rapat P2K3"
            },
            {
                "label": "Konsultasi K3",
                "value": "Konsultasi K3"
            },
            {
                "label": "Safety Talk",
                "value": "Safety Talk"
            },
            {
                "label": "Toolbox Meeting",
                "value": "Toolbox Meeting"
            }
        ]
    },
    {
        "key": "lokasi",
        "label": "Lokasi",
        "type": "text",
        "required": true,
        "placeholder": "Ruang / area kegiatan",
        "showInTable": true
    },
    {
        "key": "jumlahPeserta",
        "label": "Jumlah Peserta",
        "type": "number",
        "placeholder": "0"
    },
    {
        "key": "agenda",
        "label": "Agenda / Topik",
        "type": "textarea",
        "required": true,
        "placeholder": "Uraikan agenda kegiatan..."
    },
    {
        "key": "hasilKeputusan",
        "label": "Hasil / Keputusan",
        "type": "textarea",
        "placeholder": "Uraikan hasil atau keputusan..."
    },
    {
        "key": "pemimpin",
        "label": "Dipimpin Oleh",
        "type": "text",
        "placeholder": "Nama pimpinan rapat"
    }
],
};
