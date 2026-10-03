import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'ap-safety-inspection-fire',
  title: 'Fire Safety Inspection',
  description: 'Record inspeksi APAR, hydrant, jalur evakuasi, detektor asap, dan sistem pemadam kebakaran.',
  parentLabel: 'Safety Inspection',
  fields: [
    { key: 'inspectionDate', label: 'Inspection Date', type: 'date', required: true, showInTable: true },
    { key: 'location', label: 'Location / Area', type: 'text', required: true, showInTable: true, placeholder: 'e.g. Building A, Warehouse 2' },
    { key: 'inspector', label: 'Inspector', type: 'text', required: true, showInTable: true, placeholder: 'Inspector name' },
    {
      key: 'inspectionScope', label: 'Inspection Scope', type: 'select', required: true, showInTable: true,
      options: [
        { label: 'Fire Extinguisher (APAR)', value: 'Fire Extinguisher' },
        { label: 'Hydrant System', value: 'Hydrant System' },
        { label: 'Evacuation Route', value: 'Evacuation Route' },
        { label: 'Smoke / Heat Detector', value: 'Smoke Detector' },
        { label: 'Sprinkler System', value: 'Sprinkler System' },
        { label: 'Fire Alarm System', value: 'Fire Alarm System' },
        { label: 'Full Fire Safety Audit', value: 'Full Fire Safety Audit' },
      ],
    },
    { key: 'totalUnitsInspected', label: 'Total Units Inspected', type: 'number', placeholder: '0' },
    { key: 'totalDefects', label: 'Total Defects Found', type: 'number', placeholder: '0', showInTable: true },
    { key: 'findings', label: 'Findings / Defects', type: 'textarea', required: true, placeholder: 'Describe findings in detail...' },
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
