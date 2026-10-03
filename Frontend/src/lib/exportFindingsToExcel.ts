import * as XLSX from 'xlsx';

interface Finding {
  id: string;
  title: string;
  findingStatus: 'OPEN' | 'INPG' | 'CLSD';
  data?: {
    lokasiUtama?: string;
    tanggalInspeksi?: string;
    kategoriHazard?: string;
    levelHazard?: string;
  };
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
}

export function exportFindingsToExcel(findings: Finding[]): void {
  // Prepare data for Excel
  const excelData = findings.map((finding) => ({
    'Title': finding.title,
    'Status': finding.findingStatus,
    'Location': finding.data?.lokasiUtama || '-',
    'Date': finding.data?.tanggalInspeksi
      ? new Date(finding.data.tanggalInspeksi).toLocaleDateString('id-ID')
      : new Date(finding.createdAt).toLocaleDateString('id-ID'),
    'Category': finding.data?.kategoriHazard || '-',
    'Hazard Level': finding.data?.levelHazard || '-',
    'Created By': finding.createdBy,
    'Approved By': finding.approvedBy || '-',
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const columnWidths = [
    { wch: 20 }, // Title
    { wch: 10 }, // Status
    { wch: 25 }, // Location
    { wch: 15 }, // Date
    { wch: 15 }, // Category
    { wch: 15 }, // Hazard Level
    { wch: 15 }, // Created By
    { wch: 15 }, // Approved By
  ];
  worksheet['!cols'] = columnWidths;

  // Apply header styling with orange background and bold text
  const headerStyle = {
    fill: { fgColor: { rgb: 'FFF15A22' } }, // Orange background
    font: { bold: true, color: { rgb: 'FFFFFFFF' } }, // White bold text
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  // Apply styling to header row
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:H1');
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_col(col) + '1';
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = headerStyle;
    }
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Findings');

  // Generate filename with current date
  const today = new Date();
  const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  const filename = `findings-export-${dateString}.xlsx`;

  // Write file
  XLSX.writeFile(workbook, filename);
}
