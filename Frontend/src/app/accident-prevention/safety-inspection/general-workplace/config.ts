import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'ap-safety-inspection-general',
  title: 'General Workplace Inspection',
  description: 'Record inspeksi umum area kerja: housekeeping, rambu K3, akses darurat, dan kondisi lingkungan kerja.',
  parentLabel: 'Safety Inspection',
  fields: [
    { key: 'inspectionDate', label: 'Inspection Date', type: 'date', required: true, showInTable: true },
    { key: 'inspectionArea', label: 'Inspection Area', type: 'text', required: true, showInTable: true, placeholder: 'e.g. Production Floor, Warehouse, Office' },
    { key: 'inspector', label: 'Inspector', type: 'text', required: true, showInTable: true, placeholder: 'Inspector name' },
    {
      key: 'inspectionType', label: 'Inspection Type', type: 'select', required: true, showInTable: true,
      options: [
        { label: 'Routine Inspection', value: 'Routine Inspection' },
        { label: 'Surprise Inspection', value: 'Surprise Inspection' },
        { label: 'Pre-Shift Inspection', value: 'Pre-Shift Inspection' },
        { label: 'Post-Incident Inspection', value: 'Post-Incident Inspection' },
        { label: 'Management Walk-Through', value: 'Management Walk-Through' },
      ],
    },
    { key: 'findings', label: 'Findings / Observations', type: 'textarea', required: true, placeholder: 'Describe findings and observations...' },
    { key: 'findingCount', label: 'Number of Findings', type: 'number', placeholder: '0', showInTable: true },
    { key: 'correctiveAction', label: 'Corrective Action', type: 'textarea', placeholder: 'Actions taken or required...' },
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
