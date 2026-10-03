import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'ap-safety-inspection-electrical',
  title: 'Electrical Safety Inspection',
  description: 'Record inspeksi instalasi listrik, panel, kabel, dan peralatan listrik di area kerja.',
  parentLabel: 'Safety Inspection',
  fields: [
    { key: 'inspectionDate', label: 'Inspection Date', type: 'date', required: true, showInTable: true },
    { key: 'location', label: 'Location / Area', type: 'text', required: true, showInTable: true, placeholder: 'e.g. Panel Room A, Workshop B' },
    { key: 'inspector', label: 'Inspector', type: 'text', required: true, showInTable: true, placeholder: 'Inspector name' },
    {
      key: 'inspectionScope', label: 'Inspection Scope', type: 'select', required: true, showInTable: true,
      options: [
        { label: 'Power Distribution Panel', value: 'Power Distribution Panel' },
        { label: 'Wiring & Cable Installation', value: 'Wiring & Cable Installation' },
        { label: 'Grounding & Bonding', value: 'Grounding & Bonding' },
        { label: 'Electrical Equipment', value: 'Electrical Equipment' },
        { label: 'Emergency Lighting', value: 'Emergency Lighting' },
        { label: 'Full Electrical Audit', value: 'Full Electrical Audit' },
      ],
    },
    { key: 'findings', label: 'Findings', type: 'textarea', required: true, placeholder: 'Describe electrical safety findings...' },
    {
      key: 'riskLevel', label: 'Risk Level', type: 'select', required: true, showInTable: true,
      options: [
        { label: 'High', value: 'High' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Low', value: 'Low' },
      ],
    },
    { key: 'correctiveAction', label: 'Corrective Action', type: 'textarea', placeholder: 'Corrective actions to be taken...' },
    { key: 'targetDate', label: 'Target Completion Date', type: 'date' },
    { key: 'picName', label: 'Person in Charge (PIC)', type: 'text', placeholder: 'PIC name' },
    {
      key: 'status', label: 'Status', type: 'select', required: true, showInTable: true,
      options: [
        { label: 'Open', value: 'Open' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Closed', value: 'Closed' },
      ],
    },
    { key: 'evidence', label: 'Evidence / Photo', type: 'file', accept: '.jpg,.jpeg,.png,.pdf', showInTable: false, showInDetail: true },
  ],
};
