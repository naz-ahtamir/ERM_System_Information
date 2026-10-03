import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'ap-safety-observation',
  title: 'Safety Observation',
  description: 'Observasi perilaku keselamatan pekerja dan tindakan korektif perilaku tidak aman.',
  parentLabel: 'Accident Prevention',
  fields: [
    {
        "key": "tanggalObservasi",
        "label": "Tanggal Observasi",
        "type": "date",
        "required": true,
        "showInTable": true
    },
    {
        "key": "lokasi",
        "label": "Lokasi",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "observer",
        "label": "Observer",
        "type": "text",
        "required": true,
        "showInTable": true
    },
    {
        "key": "perilakuDiamati",
        "label": "Perilaku yang Diamati",
        "type": "textarea",
        "required": true,
        "placeholder": "Uraikan perilaku yang diamati..."
    },
    {
        "key": "kategoriperilaku",
        "label": "Kategori Perilaku",
        "type": "select",
        "required": true,
        "options": [
            {
                "label": "Safe Behavior",
                "value": "Safe Behavior"
            },
            {
                "label": "Unsafe Behavior",
                "value": "Unsafe Behavior"
            },
            {
                "label": "Near Miss",
                "value": "Near Miss"
            }
        ]
    },
    {
        "key": "tindakanKorektif",
        "label": "Tindakan Korektif",
        "type": "textarea",
        "placeholder": "Tindakan yang dilakukan di tempat atau ditindaklanjuti..."
    },
    {
        "key": "statusFeedback",
        "label": "Status Feedback",
        "type": "select",
        "options": [
            {
                "label": "Diberikan",
                "value": "Diberikan"
            },
            {
                "label": "Belum Diberikan",
                "value": "Belum Diberikan"
            }
        ]
    }
],
};
