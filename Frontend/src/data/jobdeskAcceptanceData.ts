/**
 * Dummy Data untuk Jobdesk Acceptance
 * Simulasi data yang akan tersimpan saat karyawan submit jobdesk acceptance
 */

export interface JobdeskAcceptance {
  id: string;
  idKaryawan: string;
  namaKaryawan: string;
  jabatan: string;
  jobdeskTitle: string;
  jobdeskDescription: string;
  signature: string; // base64 or data URL
  acceptedAt: string; // ISO date string
  status: "accepted" | "pending" | "rejected";
  department?: string;
  notes?: string;
}

/**
 * Dummy jobdesk acceptance data
 * Grouped by jabatan untuk display di SMK3 1.2.1
 */
export const jobdeskAcceptanceData: JobdeskAcceptance[] = [
  // Safety Officer
  {
    id: "JD-001",
    idKaryawan: "82400944",
    namaKaryawan: "NASARUDDIN, ST",
    jabatan: "Safety Officer",
    jobdeskTitle: "Koordinator K3 & Pengawasan Keselamatan",
    jobdeskDescription: "Mengkoordinasi program K3, melakukan inspeksi rutin, dan memastikan compliance terhadap regulasi keselamatan kerja.",
    signature: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkN1cnNpdmUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMwMDAiPk5hc2FydWRkaW48L3RleHQ+PC9zdmc+",
    acceptedAt: "2026-07-10T08:30:00Z",
    status: "accepted",
    department: "HSE",
  },
  {
    id: "JD-002",
    idKaryawan: "82400945",
    namaKaryawan: "Ahmad Rizki, S.T.",
    jabatan: "Safety Officer",
    jobdeskTitle: "Safety Inspector & Risk Assessor",
    jobdeskDescription: "Melakukan inspeksi keselamatan, risk assessment, dan investigasi insiden kerja.",
    signature: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkN1cnNpdmUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMwMDAiPkEuIFJpemtpPC90ZXh0Pjwvc3ZnPg==",
    acceptedAt: "2026-07-10T09:15:00Z",
    status: "accepted",
    department: "HSE",
  },
  {
    id: "JD-003",
    idKaryawan: "82400946",
    namaKaryawan: "Budi Santoso",
    jabatan: "Safety Officer",
    jobdeskTitle: "Emergency Response Coordinator",
    jobdeskDescription: "Mengkoordinasi tim tanggap darurat, training evakuasi, dan manajemen emergency response.",
    signature: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkN1cnNpdmUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMwMDAiPkJ1ZGkgUy48L3RleHQ+PC9zdmc+",
    acceptedAt: "2026-07-10T10:00:00Z",
    status: "accepted",
    department: "HSE",
  },

  // Production Supervisor
  {
    id: "JD-004",
    idKaryawan: "82400950",
    namaKaryawan: "Siti Nurhaliza, S.T.",
    jabatan: "Production Supervisor",
    jobdeskTitle: "Supervisor Produksi Shift A",
    jobdeskDescription: "Mengawasi operasional produksi shift A, memastikan target produksi tercapai dengan standar K3.",
    signature: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkN1cnNpdmUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMwMDAiPlMuIE51cmhhbGl6YTwvdGV4dD48L3N2Zz4=",
    acceptedAt: "2026-07-11T07:00:00Z",
    status: "accepted",
    department: "Production",
  },
  {
    id: "JD-005",
    idKaryawan: "82400951",
    namaKaryawan: "Eko Prasetyo",
    jabatan: "Production Supervisor",
    jobdeskTitle: "Supervisor Produksi Shift B",
    jobdeskDescription: "Mengawasi operasional produksi shift B, quality control, dan keselamatan kerja di area produksi.",
    signature: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkN1cnNpdmUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMwMDAiPkVrbyBQLjwvdGV4dD48L3N2Zz4=",
    acceptedAt: "2026-07-11T08:30:00Z",
    status: "accepted",
    department: "Production",
  },

  // Maintenance Engineer
  {
    id: "JD-006",
    idKaryawan: "82400955",
    namaKaryawan: "Agus Setiawan, S.T.",
    jabatan: "Maintenance Engineer",
    jobdeskTitle: "Maintenance Coordinator",
    jobdeskDescription: "Mengkoordinasi preventive maintenance, troubleshooting mesin, dan memastikan peralatan aman digunakan.",
    signature: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkN1cnNpdmUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMwMDAiPkFndXMgUy48L3RleHQ+PC9zdmc+",
    acceptedAt: "2026-07-11T09:00:00Z",
    status: "accepted",
    department: "Maintenance",
  },
  {
    id: "JD-007",
    idKaryawan: "82400956",
    namaKaryawan: "Rudi Hartono",
    jabatan: "Maintenance Engineer",
    jobdeskTitle: "Electrical Maintenance Specialist",
    jobdeskDescription: "Maintenance sistem elektrik, instalasi listrik, dan safety electrical system.",
    signature: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkN1cnNpdmUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMwMDAiPlJ1ZGkgSC48L3RleHQ+PC9zdmc+",
    acceptedAt: "2026-07-11T10:30:00Z",
    status: "accepted",
    department: "Maintenance",
  },

  // Quality Control
  {
    id: "JD-008",
    idKaryawan: "82400960",
    namaKaryawan: "Dewi Lestari, S.Si.",
    jabatan: "Quality Control",
    jobdeskTitle: "QC Inspector & Lab Analyst",
    jobdeskDescription: "Inspeksi kualitas produk, analisis lab, dan memastikan produk sesuai standar keselamatan.",
    signature: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkN1cnNpdmUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMwMDAiPkRld2kgTC48L3RleHQ+PC9zdmc+",
    acceptedAt: "2026-07-12T08:00:00Z",
    status: "accepted",
    department: "Quality",
  },
  {
    id: "JD-009",
    idKaryawan: "82400961",
    namaKaryawan: "Fahmi Ramadhan",
    jabatan: "Quality Control",
    jobdeskTitle: "QC Auditor",
    jobdeskDescription: "Audit kualitas proses produksi dan compliance terhadap ISO standards.",
    signature: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkN1cnNpdmUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMwMDAiPkZhaG1pIFI8L3RleHQ+PC9zdmc+",
    acceptedAt: "2026-07-12T09:00:00Z",
    status: "accepted",
    department: "Quality",
  },

  // Warehouse Staff
  {
    id: "JD-010",
    idKaryawan: "82400965",
    namaKaryawan: "Joko Widodo",
    jabatan: "Warehouse Staff",
    jobdeskTitle: "Warehouse Coordinator",
    jobdeskDescription: "Mengkoordinasi penerimaan, penyimpanan, dan distribusi material dengan standar K3.",
    signature: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkN1cnNpdmUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMwMDAiPkpva28gVy48L3RleHQ+PC9zdmc+",
    acceptedAt: "2026-07-12T10:00:00Z",
    status: "accepted",
    department: "Logistics",
  },
  {
    id: "JD-011",
    idKaryawan: "82400966",
    namaKaryawan: "Linda Wijaya",
    jabatan: "Warehouse Staff",
    jobdeskTitle: "Inventory Controller",
    jobdeskDescription: "Mengelola inventory, stock opname, dan memastikan penyimpanan B3 sesuai regulasi.",
    signature: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkN1cnNpdmUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMwMDAiPkxpbmRhIFcuPC90ZXh0Pjwvc3ZnPg==",
    acceptedAt: "2026-07-12T11:00:00Z",
    status: "accepted",
    department: "Logistics",
  },

  // HR Staff
  {
    id: "JD-012",
    idKaryawan: "82400970",
    namaKaryawan: "Maya Kusuma, S.Psi.",
    jabatan: "HR Staff",
    jobdeskTitle: "HR & Safety Training Coordinator",
    jobdeskDescription: "Mengkoordinasi training K3, induction safety, dan pengembangan kompetensi karyawan.",
    signature: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkN1cnNpdmUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMwMDAiPk1heWEgSy48L3RleHQ+PC9zdmc+",
    acceptedAt: "2026-07-13T08:00:00Z",
    status: "accepted",
    department: "HR",
  },

  // Pending Status (belum di-accept)
  {
    id: "JD-013",
    idKaryawan: "82400975",
    namaKaryawan: "Rini Susanti",
    jabatan: "Admin Staff",
    jobdeskTitle: "Administrative Support",
    jobdeskDescription: "Administrasi dokumen K3, filing, dan support dokumentasi SMK3.",
    signature: "",
    acceptedAt: "2026-07-13T10:00:00Z",
    status: "pending",
    department: "Administration",
  },
];

/**
 * Helper function: Group jobdesk by jabatan
 */
export function groupByJabatan(data: JobdeskAcceptance[]): Record<string, JobdeskAcceptance[]> {
  return data.reduce((acc, item) => {
    const jabatan = item.jabatan || "Unassigned";
    if (!acc[jabatan]) {
      acc[jabatan] = [];
    }
    acc[jabatan].push(item);
    return acc;
  }, {} as Record<string, JobdeskAcceptance[]>);
}

/**
 * Helper function: Get stats by jabatan
 */
export function getJabatanStats(data: JobdeskAcceptance[]) {
  const grouped = groupByJabatan(data);
  return Object.entries(grouped).map(([jabatan, items]) => ({
    jabatan,
    total: items.length,
    accepted: items.filter(i => i.status === "accepted").length,
    pending: items.filter(i => i.status === "pending").length,
  }));
}

export default jobdeskAcceptanceData;
