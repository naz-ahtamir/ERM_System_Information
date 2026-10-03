const XLSX = require('xlsx');
const axios = require('axios');
const path = require('path');

// Configuration
const EXCEL_FILE_PATH = process.argv[2] || './karyawan.xlsx';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const BATCH_SIZE = 50; // Process 50 users at a time

/**
 * Read Excel file and convert to JSON
 */
function readExcelFile(filePath) {
  try {
    console.log(`📖 Reading Excel file: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    console.log(`✅ Found ${data.length} rows in Excel file`);
    return data;
  } catch (error) {
    console.error('❌ Error reading Excel file:', error.message);
    process.exit(1);
  }
}

/**
 * Transform Excel data to user format
 * Expected Excel columns:
 * - ID / No_ID / idKaryawan (required)
 * - Nama / Name (required)
 * - Email (required)
 * - Department / Departemen (optional)
 * - Jabatan / Position (optional)
 */
function transformData(excelData) {
  console.log('\n🔄 Transforming data...');
  
  const users = [];
  const errors = [];

  excelData.forEach((row, index) => {
    try {
      // Get ID (try different column names)
      const idKaryawan = String(
        row.ID || row.No_ID || row.idKaryawan || row['No. ID'] || row['ID Karyawan'] || ''
      ).trim();

      // Get Name
      const name = String(
        row.Nama || row.Name || row.nama || row.name || ''
      ).trim();

      // Get Email (if not provided, generate from idKaryawan)
      let email = String(
        row.Email || row.email || ''
      ).trim();
      
      if (!email && idKaryawan) {
        email = `${idKaryawan}@company.com`;
      }

      // Get Department
      const department = String(
        row.Department || row.Departemen || row.department || row.departemen || ''
      ).trim() || undefined;

      // Get Jabatan
      const jabatan = String(
        row.Jabatan || row.Position || row.jabatan || row.position || ''
      ).trim() || undefined;

      // Validation
      if (!idKaryawan) {
        errors.push(`Row ${index + 2}: Missing ID Karyawan`);
        return;
      }

      if (!name) {
        errors.push(`Row ${index + 2}: Missing Name`);
        return;
      }

      if (!email) {
        errors.push(`Row ${index + 2}: Missing Email`);
        return;
      }

      users.push({
        idKaryawan,
        name,
        email,
        department,
        jabatan,
      });
    } catch (error) {
      errors.push(`Row ${index + 2}: ${error.message}`);
    }
  });

  if (errors.length > 0) {
    console.log('\n⚠️  Warnings during transformation:');
    errors.forEach(err => console.log(`  - ${err}`));
  }

  console.log(`✅ Transformed ${users.length} valid users`);
  return users;
}

/**
 * Send users to backend in batches
 */
async function importUsers(users) {
  console.log(`\n📤 Importing ${users.length} users to backend...`);
  console.log(`   Backend URL: ${BACKEND_URL}/api/auth/bulk-create-users`);
  console.log(`   Batch size: ${BATCH_SIZE}`);

  const allResults = {
    success: [],
    failed: [],
  };

  // Split into batches
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(users.length / BATCH_SIZE);

    console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} users)...`);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/bulk-create-users`,
        { users: batch },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const results = response.data;
      allResults.success.push(...results.success);
      allResults.failed.push(...results.failed);

      console.log(`   ✅ Success: ${results.success.length}`);
      console.log(`   ❌ Failed: ${results.failed.length}`);
    } catch (error) {
      console.error(`   ❌ Batch ${batchNum} failed:`, error.message);
      if (error.response?.data) {
        console.error('   Error details:', error.response.data);
      }
      
      // Mark all users in this batch as failed
      batch.forEach(user => {
        allResults.failed.push({
          idKaryawan: user.idKaryawan,
          reason: 'Batch request failed',
        });
      });
    }
  }

  return allResults;
}

/**
 * Print summary
 */
function printSummary(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`\n✅ Successfully imported: ${results.success.length} users`);
  if (results.success.length > 0) {
    console.log('\nSample of imported users:');
    results.success.slice(0, 5).forEach(user => {
      console.log(`  - ${user.idKaryawan} | ${user.name} | Role: ${user.role}`);
    });
    if (results.success.length > 5) {
      console.log(`  ... and ${results.success.length - 5} more`);
    }
  }

  console.log(`\n❌ Failed to import: ${results.failed.length} users`);
  if (results.failed.length > 0) {
    console.log('\nFailed users:');
    results.failed.forEach(failure => {
      console.log(`  - ${failure.idKaryawan}: ${failure.reason}`);
    });
  }

  console.log('\n' + '='.repeat(60));
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 SMK3 Karyawan Import Script');
  console.log('='.repeat(60));

  // Check if file path is provided
  if (process.argv.length < 3) {
    console.log('\n📝 Usage:');
    console.log('   node import-karyawan.js <path-to-excel-file>');
    console.log('\n📋 Example:');
    console.log('   node import-karyawan.js ./karyawan.xlsx');
    console.log('\n💡 Excel file should have columns:');
    console.log('   - ID / No_ID / idKaryawan (required)');
    console.log('   - Nama / Name (required)');
    console.log('   - Email (optional, will be auto-generated if missing)');
    console.log('   - Department / Departemen (optional)');
    console.log('   - Jabatan / Position (optional)');
    console.log('\n🔐 Default credentials:');
    console.log('   - Username: <idKaryawan>');
    console.log('   - Password: <idKaryawan>K3');
    console.log('   - Example: ID 82400999 → username: 82400999, password: 82400999K3');
    console.log('\n👔 Role assignment:');
    console.log('   - Supervisor: Wakil Foreman, Foreman, Supervisor, Manager');
    console.log('   - Admin: ID 82400944');
    console.log('   - User: Others\n');
    process.exit(0);
  }

  // Read and transform Excel data
  const excelData = readExcelFile(EXCEL_FILE_PATH);
  const users = transformData(excelData);

  if (users.length === 0) {
    console.error('\n❌ No valid users to import!');
    process.exit(1);
  }

  // Confirm import
  console.log('\n⚠️  Ready to import users to database.');
  console.log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');
  
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Import users
  const results = await importUsers(users);

  // Print summary
  printSummary(results);

  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run main function
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
