import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'scomp-job-competency',
  title: 'Job Competency',
  description: 'Penilaian kompetensi K3 spesifik berdasarkan jenis pekerjaan atau jabatan.',
  parentLabel: 'Safety Competency',
  fields: [
    {
        "key": "namaKaryawan",
        "label": "Nama Karyawan",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "jabatan",
        "label": "Jabatan / Posisi",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "jenisKompetensiKerja",
        "label": "Jenis Kompetensi Kerja",
        "type": "text",
        "required": true,
        "placeholder": "Kompetensi spesifik pekerjaan",
        "showInTable": true
    },
    {
        "key": "metodePenilaian",
        "label": "Metode Penilaian",
        "type": "select",
        "options": [
            {
                "label": "Tes Tertulis",
                "value": "Tes Tertulis"
            },
            {
                "label": "Praktek Langsung",
                "value": "Praktek"
            },
            {
                "label": "Observasi",
                "value": "Observasi"
            },
            {
                "label": "Portofolio",
                "value": "Portofolio"
            }
        ]
    },
    {
        "key": "tanggalPenilaian",
        "label": "Tanggal Penilaian",
        "type": "date",
        "required": true
    },
    {
        "key": "penilai",
        "label": "Penilai / Assessor",
        "type": "text",
        "required": true
    },
    {
        "key": "hasilPenilaian",
        "label": "Hasil Penilaian",
        "type": "select",
        "required": true,
        "options": [
            {
                "label": "Kompeten",
                "value": "Kompeten"
            },
            {
                "label": "Belum Kompeten",
                "value": "Belum Kompeten"
            },
            {
                "label": "Perlu Pengembangan",
                "value": "Perlu Pengembangan"
            }
        ]
    },
    {
        "key": "catatanPenilaian",
        "label": "Catatan Penilaian",
        "type": "textarea"
    }
],
};
