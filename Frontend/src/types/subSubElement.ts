export interface SubSubElementFormConfig {
  subSubElementId: string;
  fields: FormField[];
}

export interface FormField {
  name: string;
  label: string;
  labelCn?: string;
  type: "text" | "email" | "number" | "date" | "textarea" | "select" | "file";
  required?: boolean;
  placeholder?: string;
  options?: string[] | { value: string; label: string }[];
  rows?: number;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  note?: string; 
  showWhen?: {        
    field: string;
    value: string;
  };
}

export interface FileAttachment {
  fieldName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

// Status lifecycle:
// Status workflow: OPEN → INPG (submit) → pending_approval (atasan review) → CLSD (approved)
// OPEN: draft, belum disubmit
// INPG: sudah disubmit, menunggu approval atasan
// pending_approval: legacy, sama dengan INPG
// CLSD: approved dan closed
export type FindingStatus = "OPEN" | "CLSD" | "INPG" | "pending_approval";

export interface ApprovalInfo {
  requestedAt: string;
  requestedBy: string;
  note?: string;
  approvedAt?: string;
  approvedBy?: string;
  approvalNote?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionNote?: string;
}

export interface SubSubElementData {
  id: string;
  subSubElementId: string;
  title: string;
  data: Record<string, any>;
  files: FileAttachment[];
  // status record-level (active/archived)
  status: string;
  // status temuan spesifik untuk inspeksi ketidaksesuaian
  findingStatus?: FindingStatus;
  approval?: ApprovalInfo;
  createdBy: string | { nama?: string; [key: string]: any };
  createdById?: string;  // ID karyawan pembuat
  createdAt: string;
  updatedAt: string;
  tanggalInspeksi?: string;
  safetyOfficer?: string;
  lokasiUtama?: string;
  areaInspeksiSpesifik?: string;
  qmbGroup?: string;
  namaDepartemen?: string;
  dokumentasiHazard?: string;       // URL setelah upload
  jenisTemuan?: string;
  levelHazard?: string;
  tipeTemuan?: string;
  kategoriHazard?: string;
  kategori6S?: string;
  deskripsiKetidaksesuaian?: string;
  hierarkiPengendalian?: string;
  rekomendasiPerbaikan?: string;
  deadlinePerbaikan?: string;
  picPerbaikan?: string;
  statusPerbaikan?: string;
  dokumentasiPerbaikan?: string;    // URL setelah upload
  keteranganTambahan?: string;
  [key: string]: unknown;
}