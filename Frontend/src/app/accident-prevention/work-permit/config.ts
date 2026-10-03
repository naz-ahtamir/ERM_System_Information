import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'ap-work-permit',
  title: 'Work Permit System',
  description: 'Pengelolaan izin kerja untuk pekerjaan berisiko tinggi (hot work, confined space, dll.).',
  parentLabel: 'Accident Prevention',
  fields: [
    {
        "key": "nomorIzin",
        "label": "Nomor Izin Kerja",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "jenisIzin",
        "label": "Jenis Izin Kerja",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "Hot Work Permit",
                "value": "Hot Work Permit"
            },
            {
                "label": "Confined Space Entry",
                "value": "Confined Space Entry"
            },
            {
                "label": "Working at Height",
                "value": "Working at Height"
            },
            {
                "label": "Electrical Work",
                "value": "Electrical Work"
            },
            {
                "label": "Excavation",
                "value": "Excavation"
            },
            {
                "label": "General Work Permit",
                "value": "General Work Permit"
            }
        ]
    },
    {
        "key": "lokasiPekerjaan",
        "label": "Lokasi Pekerjaan",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "tanggalMulai",
        "label": "Tanggal Mulai",
        "type": "date",
        "required": true
    },
    {
        "key": "tanggalSelesai",
        "label": "Tanggal Selesai",
        "type": "date",
        "required": true
    },
    {
        "key": "pelaksana",
        "label": "Pelaksana Pekerjaan",
        "type": "text",
        "required": true
    },
    {
        "key": "pengawas",
        "label": "Pengawas K3",
        "type": "text",
        "required": true
    },
    {
        "key": "statusIzin",
        "label": "Status",
        "type": "select",
        "required": true,
        "options": [
            {
                "label": "Aktif",
                "value": "Aktif"
            },
            {
                "label": "Selesai",
                "value": "Selesai"
            },
            {
                "label": "Dibatalkan",
                "value": "Dibatalkan"
            },
            {
                "label": "Pending Approval",
                "value": "Pending Approval"
            }
        ]
    },
    {
        "key": "keteranganRisiko",
        "label": "Uraian Risiko & APD",
        "type": "textarea",
        "placeholder": "Risiko yang teridentifikasi dan APD yang diperlukan..."
    }
],
};
