import type { CrudPageConfig } from '@/components/CrudPage';

export const config: CrudPageConfig = {
  categoryId: 'ap-safety-inspection-heavy-equipment',
  title: 'Heavy Equipment Inspection',
  description: 'Record inspeksi keselamatan alat berat: forklift, crane, excavator, dan kendaraan berat lainnya.',
  parentLabel: 'Safety Inspection',
  fields: [
    { key: 'inspectionDate', label: 'Inspection Date', type: 'date', required: true, showInTable: true },
    { key: 'equipmentName', label: 'Equipment Name / Type', type: 'text', required: true, showInTable: true, placeholder: 'e.g. Forklift, Crane, Excavator' },
    { key: 'equipmentId', label: 'Equipment ID / Unit No.', type: 'text', required: true, showInTable: true, placeholder: 'e.g. FL-001, CR-003' },
    { key: 'operator', label: 'Operator Name', type: 'text', required: true, placeholder: 'Operator name' },
    { key: 'inspector', label: 'Inspector', type: 'text', required: true, placeholder: 'Inspector name' },
    {
      key: 'inspectionType', label: 'Inspection Type', type: 'select', required: true, showInTable: true,
      options: [
        { label: 'Pre-Use Inspection (P2H)', value: 'Pre-Use Inspection' },
        { label: 'Periodic Inspection', value: 'Periodic Inspection' },
        { label: 'Post-Repair Inspection', value: 'Post-Repair Inspection' },
        { label: 'Annual Certification Check', value: 'Annual Certification Check' },
      ],
    },
    { key: 'findings', label: 'Findings / Defects', type: 'textarea', placeholder: 'List all defects or findings observed...' },
    {
      key: 'operationalStatus', label: 'Operational Status', type: 'select', required: true, showInTable: true,
      options: [
        { label: 'Fit to Operate', value: 'Fit to Operate' },
        { label: 'Conditional — Minor Repair', value: 'Conditional' },
        { label: 'Out of Service', value: 'Out of Service' },
      ],
    },
    { key: 'repairAction', label: 'Repair / Corrective Action', type: 'textarea', placeholder: 'Describe repair actions required or taken...' },
    { key: 'nextInspectionDate', label: 'Next Inspection Date', type: 'date' },
    {
      key: 'status', label: 'Status', type: 'select', required: true, showInTable: true,
      options: [
        { label: 'Open', value: 'Open' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Closed', value: 'Closed' },
      ],
    },
    { key: 'checklistFile', label: 'Inspection Checklist (PDF/Photo)', type: 'file', accept: '.jpg,.jpeg,.png,.pdf', showInTable: false, showInDetail: true },
  ],
};
