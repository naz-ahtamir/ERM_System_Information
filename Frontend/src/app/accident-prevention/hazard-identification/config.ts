import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'ap-hazard-identification',
  title: 'Hazard Identification',
  description: 'Identifikasi bahaya di area kerja, sumber bahaya, dan potensi dampaknya.',
  parentLabel: 'Accident Prevention',
  fields: [
    {
        "key": "lokasiArea",
        "label": "Lokasi / Area",
        "type": "text",
        "required": true,
        "placeholder": "Contoh: Area Furnace, Workshop",
        "showInTable": true
    },
    {
        "key": "sumberBahaya",
        "label": "Sumber Bahaya",
        "type": "text",
        "required": true,
        "placeholder": "Contoh: Mesin berputar, bahan kimia",
        "showInTable": true
    },
    {
        "key": "jenisBahaya",
        "label": "Jenis Bahaya",
        "type": "select",
        "required": true,
        "showInTable": true,
        "options": [
            {
                "label": "Fisik",
                "value": "Fisik"
            },
            {
                "label": "Kimia",
                "value": "Kimia"
            },
            {
                "label": "Biologi",
                "value": "Biologi"
            },
            {
                "label": "Ergonomi",
                "value": "Ergonomi"
            },
            {
                "label": "Psikologi",
                "value": "Psikologi"
            },
            {
                "label": "Listrik",
                "value": "Listrik"
            },
            {
                "label": "Mekanis",
                "value": "Mekanis"
            }
        ]
    },
    {
        "key": "potensiDampak",
        "label": "Potensi Dampak",
        "type": "textarea",
        "required": true,
        "placeholder": "Uraikan potensi cedera atau penyakit..."
    },
    {
        "key": "tingkatKeparahan",
        "label": "Tingkat Keparahan",
        "type": "select",
        "required": true,
        "options": [
            {
                "label": "Ringan",
                "value": "Ringan"
            },
            {
                "label": "Sedang",
                "value": "Sedang"
            },
            {
                "label": "Berat",
                "value": "Berat"
            },
            {
                "label": "Kritis",
                "value": "Kritis"
            }
        ]
    },
    {
        "key": "tanggalIdentifikasi",
        "label": "Tanggal Identifikasi",
        "type": "date",
        "required": true
    },
    {
        "key": "pengidentifikasi",
        "label": "Diidentifikasi Oleh",
        "type": "text",
        "placeholder": "Nama petugas"
    }
],
};
