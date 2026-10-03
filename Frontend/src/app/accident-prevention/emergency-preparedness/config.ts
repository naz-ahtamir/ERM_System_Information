import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'ap-emergency',
  title: 'Emergency Preparedness',
  description: 'Kesiapsiagaan tanggap darurat: simulasi, latihan, peralatan darurat, dan prosedur evakuasi.',
  parentLabel: 'Accident Prevention',
  fields: [
    {
        "key": "jenisKedaruratan",
        "label": "Jenis Kedaruratan",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "Kebakaran",
                "value": "Kebakaran"
            },
            {
                "label": "Tumpahan B3",
                "value": "Tumpahan B3"
            },
            {
                "label": "Gempa Bumi",
                "value": "Gempa Bumi"
            },
            {
                "label": "Kecelakaan Kerja Besar",
                "value": "Kecelakaan Kerja Besar"
            },
            {
                "label": "Ledakan",
                "value": "Ledakan"
            },
            {
                "label": "Evakuasi Medis",
                "value": "Evakuasi Medis"
            }
        ]
    },
    {
        "key": "jenisKegiatan",
        "label": "Jenis Kegiatan",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "Drill / Simulasi",
                "value": "Drill"
            },
            {
                "label": "Inspeksi Peralatan Darurat",
                "value": "Inspeksi Peralatan"
            },
            {
                "label": "Pembaruan Prosedur",
                "value": "Pembaruan Prosedur"
            },
            {
                "label": "Pelatihan Tim Darurat",
                "value": "Pelatihan Tim"
            }
        ]
    },
    {
        "key": "tanggalKegiatan",
        "label": "Tanggal Kegiatan",
        "type": "date",
        "required": true,
        "showInTable": true
    },
    {
        "key": "lokasiKegiatan",
        "label": "Lokasi",
        "type": "text",
        "required": true
    },
    {
        "key": "jumlahPeserta",
        "label": "Jumlah Peserta",
        "type": "number",
        "placeholder": "0"
    },
    {
        "key": "hasilEvaluasi",
        "label": "Hasil Evaluasi",
        "type": "textarea",
        "placeholder": "Catatan evaluasi dan temuan..."
    },
    {
        "key": "tindakLanjut",
        "label": "Tindak Lanjut",
        "type": "textarea"
    }
],
};
