import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'ap-loto',
  title: 'LOTO / Tag Out',
  description: 'Pengelolaan prosedur Lockout Tagout untuk pekerjaan pemeliharaan dan perbaikan peralatan.',
  parentLabel: 'Accident Prevention',
  fields: [
    {
        "key": "namaPeralatan",
        "label": "Nama Peralatan / Mesin",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "lokasiLOTO",
        "label": "Lokasi",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "tanggalLOTO",
        "label": "Tanggal LOTO",
        "type": "date",
        "required": true,
        "showInTable": true
    },
    {
        "key": "pelaksanaLOTO",
        "label": "Pelaksana LOTO",
        "type": "text",
        "required": true
    },
    {
        "key": "pengawasLOTO",
        "label": "Pengawas",
        "type": "text",
        "required": true
    },
    {
        "key": "jenisPenguncian",
        "label": "Jenis Penguncian",
        "type": "select",
        "required": true,
        "options": [
            {
                "label": "Lockout (Gembok)",
                "value": "Lockout"
            },
            {
                "label": "Tagout (Label)",
                "value": "Tagout"
            },
            {
                "label": "Lockout & Tagout",
                "value": "Lockout & Tagout"
            }
        ]
    },
    {
        "key": "sumberEnergi",
        "label": "Sumber Energi yang Diisolasi",
        "type": "textarea",
        "required": true,
        "placeholder": "Listrik, pneumatik, hidrolik, dll."
    },
    {
        "key": "statusLOTO",
        "label": "Status",
        "type": "select",
        "required": true,
        "options": [
            {
                "label": "Terpasang (Aktif)",
                "value": "Aktif"
            },
            {
                "label": "Dilepas (Selesai)",
                "value": "Selesai"
            }
        ]
    }
],
};
