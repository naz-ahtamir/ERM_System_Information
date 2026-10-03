const XLSX = require('xlsx');

// Sample data untuk template
const sampleData = [
  {
    'ID': '82400944',
    'Nama': 'Naz Ahtamir',
    'Email': 'naz@company.com',
    'Department': 'IT',
    'Jabatan': 'Manager'
  },
  {
    'ID': '82400999',
    'Nama': 'John Doe',
    'Email': 'john@company.com',
    'Department': 'Production',
    'Jabatan': 'Supervisor'
  },
  {
    'ID': '82401001',
    'Nama': 'Jane Smith',
    'Email': 'jane@company.com',
    'Department': 'QC',
    'Jabatan': 'Foreman'
  },
  {
    'ID': '82401002',
    'Nama': 'Bob Wilson',
    'Email': 'bob@company.com',
    'Department': 'Production',
    'Jabatan': 'Wakil Foreman'
  },
  {
    'ID': '82401003',
    'Nama': 'Alice Brown',
    'Email': '',
    'Department': 'Production',
    'Jabatan': 'Operator'
  }
];

// Create workbook
const wb = XLSX.utils.book_new();

// Convert JSON to worksheet
const ws = XLSX.utils.json_to_sheet(sampleData);

// Set column widths
ws['!cols'] = [
  { wch: 12 },  // ID
  { wch: 25 },  // Nama
  { wch: 30 },  // Email
  { wch: 15 },  // Department
  { wch: 20 }   // Jabatan
];

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Karyawan');

// Write file
XLSX.writeFile(wb, 'scripts/karyawan-template.xlsx');

console.log('✅ Template Excel berhasil dibuat: scripts/karyawan-template.xlsx');
console.log('\n📋 Kolom yang tersedia:');
console.log('   - ID: ID Karyawan (required)');
console.log('   - Nama: Nama lengkap (required)');
console.log('   - Email: Email karyawan (optional)');
console.log('   - Department: Departemen (optional)');
console.log('   - Jabatan: Jabatan/posisi (optional)');
console.log('\n💡 Tips:');
console.log('   - Jika Email kosong, akan auto-generate: <idKaryawan>@company.com');
console.log('   - Username: ID Karyawan');
console.log('   - Password default: <idKaryawan>K3');
console.log('   - Supervisor role: Wakil Foreman, Foreman, Supervisor, Manager');
console.log('   - Admin role: ID 82400944\n');
