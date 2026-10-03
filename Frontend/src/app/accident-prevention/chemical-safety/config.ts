import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'ap-chemical-safety',
  title: 'Chemical Safety',
  description: 'Pengelolaan bahan kimia berbahaya (B3): inventaris, MSDS, penyimpanan, dan penanganan.',
  parentLabel: 'Accident Prevention',
  fields: [
    {
        "key": "namaBahanKimia",
        "label": "Nama Bahan Kimia",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "nomorCAS",
        "label": "Nomor CAS",
        "type": "text",
        "placeholder": "Chemical Abstracts Service number"
    },
    {
        "key": "kategoriB3",
        "label": "Kategori B3",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "Mudah Meledak (Explosive)",
                "value": "Explosive"
            },
            {
                "label": "Mudah Terbakar (Flammable)",
                "value": "Flammable"
            },
            {
                "label": "Beracun (Toxic)",
                "value": "Toxic"
            },
            {
                "label": "Korosif (Corrosive)",
                "value": "Corrosive"
            },
            {
                "label": "Oksidator",
                "value": "Oksidator"
            },
            {
                "label": "Berbahaya bagi Lingkungan",
                "value": "Lingkungan"
            }
        ]
    },
    {
        "key": "jumlahStok",
        "label": "Jumlah Stok",
        "type": "text",
        "required": true,
        "showInTable": true,
        "placeholder": "Contoh: 50 liter, 100 kg"
    },
    {
        "key": "lokasiPenyimpanan",
        "label": "Lokasi Penyimpanan",
        "type": "text",
        "required": true
    },
    {
        "key": "statusMSDS",
        "label": "Status MSDS / SDS",
        "type": "select",
        "required": true,
        "options": [
            {
                "label": "Tersedia & Update",
                "value": "Tersedia"
            },
            {
                "label": "Perlu Update",
                "value": "Perlu Update"
            },
            {
                "label": "Tidak Tersedia",
                "value": "Tidak Tersedia"
            }
        ]
    },
    {
        "key": "kondisiPenyimpanan",
        "label": "Kondisi Penyimpanan",
        "type": "textarea",
        "placeholder": "Suhu, ventilasi, segregasi, dll."
    }
],
};
