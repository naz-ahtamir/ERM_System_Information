import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'sc-design-change',
  title: 'Design & Change Management',
  description: 'Pengendalian perubahan desain, proses, atau peralatan yang berdampak pada K3.',
  parentLabel: 'Safety Compliance',
  fields: [
    {
        "key": "namaPerubahan",
        "label": "Nama / Deskripsi Perubahan",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "jenisPerubahan",
        "label": "Jenis Perubahan",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "Perubahan Desain",
                "value": "Perubahan Desain"
            },
            {
                "label": "Perubahan Proses",
                "value": "Perubahan Proses"
            },
            {
                "label": "Perubahan Peralatan",
                "value": "Perubahan Peralatan"
            },
            {
                "label": "Perubahan Material",
                "value": "Perubahan Material"
            },
            {
                "label": "Perubahan Organisasi",
                "value": "Perubahan Organisasi"
            }
        ]
    },
    {
        "key": "tanggalPerubahan",
        "label": "Tanggal Perubahan",
        "type": "date",
        "required": true,
        "showInTable": true
    },
    {
        "key": "alasanPerubahan",
        "label": "Alasan Perubahan",
        "type": "textarea",
        "required": true,
        "placeholder": "Uraikan alasan dan latar belakang perubahan..."
    },
    {
        "key": "dampakK3",
        "label": "Dampak terhadap K3",
        "type": "textarea",
        "required": true,
        "placeholder": "Uraikan potensi dampak K3 dari perubahan ini..."
    },
    {
        "key": "statusPersetujuan",
        "label": "Status Persetujuan",
        "type": "select",
        "required": true,
        "options": [
            {
                "label": "Disetujui",
                "value": "Disetujui"
            },
            {
                "label": "Pending Review",
                "value": "Pending Review"
            },
            {
                "label": "Ditolak",
                "value": "Ditolak"
            }
        ]
    },
    {
        "key": "disetujuiOleh",
        "label": "Disetujui Oleh",
        "type": "text",
        "placeholder": "Nama approver"
    }
],
};
