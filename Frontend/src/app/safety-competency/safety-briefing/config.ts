import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'scomp-safety-briefing',
  title: 'Safety Briefing / Toolbox Talk',
  description: 'Rekap pelaksanaan safety briefing, toolbox talk, dan morning safety talk harian.',
  parentLabel: 'Safety Competency',
  fields: [
    {
        "key": "tanggalBriefing",
        "label": "Tanggal Briefing",
        "type": "date",
        "required": true,
        "showInTable": true
    },
    {
        "key": "topik",
        "label": "Topik Briefing",
        "type": "text",
        "required": true,
        "showInTable": true,
        "placeholder": "Topik yang disampaikan"
    },
    {
        "key": "lokasi",
        "label": "Lokasi",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "pemimpin",
        "label": "Dipimpin Oleh",
        "type": "text",
        "required": true
    },
    {
        "key": "jumlahPeserta",
        "label": "Jumlah Peserta",
        "type": "number",
        "required": true,
        "placeholder": "0"
    },
    {
        "key": "ringkasanMateri",
        "label": "Ringkasan Materi",
        "type": "textarea",
        "required": true,
        "placeholder": "Ringkasan isi briefing..."
    },
    {
        "key": "temuanIssue",
        "label": "Temuan / Isu yang Diangkat",
        "type": "textarea",
        "placeholder": "Isu K3 yang dibahas dalam briefing..."
    },
    {
        "key": "tindakLanjut",
        "label": "Tindak Lanjut",
        "type": "textarea"
    }
],
};
