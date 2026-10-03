import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'sc-documentation',
  title: 'Documentation & Records',
  description: 'Pengelolaan dokumen dan rekaman K3, termasuk distribusi, revisi, dan arsip dokumen.',
  parentLabel: 'Safety Compliance',
  fields: [
    {
        "key": "nomorDokumen",
        "label": "Nomor Dokumen",
        "type": "text",
        "required": true,
        "placeholder": "Contoh: SOP-K3-001",
        "showInTable": true
    },
    {
        "key": "judulDokumen",
        "label": "Judul Dokumen",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "jenisDokumen",
        "label": "Jenis Dokumen",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "SOP",
                "value": "SOP"
            },
            {
                "label": "IK (Instruksi Kerja)",
                "value": "IK"
            },
            {
                "label": "Formulir",
                "value": "Formulir"
            },
            {
                "label": "Manual",
                "value": "Manual"
            },
            {
                "label": "Prosedur",
                "value": "Prosedur"
            },
            {
                "label": "Rekaman",
                "value": "Rekaman"
            }
        ]
    },
    {
        "key": "revisi",
        "label": "Nomor Revisi",
        "type": "text",
        "placeholder": "Rev. 00"
    },
    {
        "key": "tanggalTerbit",
        "label": "Tanggal Terbit",
        "type": "date",
        "required": true
    },
    {
        "key": "statusDokumen",
        "label": "Status",
        "type": "select",
        "required": true,
        "options": [
            {
                "label": "Aktif",
                "value": "Aktif"
            },
            {
                "label": "Obsolete",
                "value": "Obsolete"
            },
            {
                "label": "Draft",
                "value": "Draft"
            }
        ]
    },
    {
        "key": "lokasiPenyimpanan",
        "label": "Lokasi Penyimpanan",
        "type": "text",
        "placeholder": "Folder / rak / sistem DMS"
    }
],
};
