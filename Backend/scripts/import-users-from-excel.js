const xlsx = require('xlsx');
const axios = require('axios');
const path = require('path');

// ── Helper: Convert Excel serial date ke JavaScript Date ──
function excelDateToJSDate(serial) {
  if (!serial || typeof serial !== 'number') return null;
  
  // Excel epoch: 1 January 1900 (tapi Excel punya bug leap year 1900)
  const excelEpoch = new Date(1899, 11, 30); // 30 Dec 1899
  const days = Math.floor(serial);
  const milliseconds = Math.round((serial - days) * 86400000);
  
  const jsDate = new Date(excelEpoch.getTime() + days * 86400000 + milliseconds);
  return jsDate;
}

// ── Helper: Parse masa kerja dari format "X TAHUN Y BULAN Z HARI" ──
function parseMasaKerja(masaKerjaStr) {
  if (!masaKerjaStr) return null;
  
  const regex = /(\d+)\s*TAHUN.*?(\d+)\s*BULAN.*?(\d+)\s*HARI/i;
  const match = masaKerjaStr.match(regex);
  
  if (!match) return null;
  
  const years = parseInt(match[1]);
  const months = parseInt(match[2]);
  const days = parseInt(match[3]);
  
  // Hitung tanggal mulai kerja mundur dari sekarang
  const now = new Date();
  const startDate = new Date(now);
  startDate.setFullYear(now.getFullYear() - years);
  startDate.setMonth(now.getMonth() - months);
  startDate.setDate(now.getDate() - days);
  
  return startDate;
}

// ── Helper: Parse umur untuk estimasi tanggal lahir ──
function parseUmur(umurValue) {
  if (!umurValue) return null;
  
  const umur = typeof umurValue === 'number' ? umurValue : parseInt(umurValue);
  if (isNaN(umur)) return null;
  
  const now = new Date();
  const birthYear = now.getFullYear() - umur;
  return new Date(birthYear, 0, 1); // 1 Januari tahun kelahiran
}

// ── Main: Import users dari Excel ──
async function importUsersFromExcel() {
  try {
    // 1. Baca file Excel
    const excelFilePath = path.join(__dirname, '..', '..', 'mock-user.xlsx');
    console.log(`📖 Membaca file: ${excelFilePath}`);
    
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // 2. Convert ke JSON dengan header dari row 1
    const rawData = xlsx.utils.sheet_to_json(sheet, { 
      header: 1,
      defval: null 
    });
    
    // Header ada di row index 1 (row 2 di Excel)
    const headers = rawData[1];
    const dataRows = rawData.slice(2); // Data mulai dari row 3
    
    console.log(`✅ Ditemukan ${dataRows.length} baris data\n`);
    
    // 3. Map data ke format yang dibutuhkan
    const usersData = dataRows
      .filter(row => row && row.length > 0) // Filter empty rows
      .map((row, index) => {
        const idCard = row[2]?.toString().trim(); // ID CARD
        
        if (!idCard) {
          console.warn(`⚠️  Baris ${index + 3}: ID CARD kosong, skip`);
          return null;
        }
        
        // Parse tanggal kerja dari EFEKTIF KERJA atau MASA KERJA
        let tanggalMulaiKerja = null;
        if (row[10]) { // EFEKTIF KERJA (Excel date serial)
          tanggalMulaiKerja = excelDateToJSDate(row[10]);
        } else if (row[11]) { // MASA KERJA (string format)
          tanggalMulaiKerja = parseMasaKerja(row[11]);
        }
        
        // Parse tanggal lahir dari UMUR
        let tanggalLahir = null;
        if (row[15]) { // UMUR
          tanggalLahir = parseUmur(row[15]);
        }
        
        return {
          idKaryawan: idCard,
          nama: row[3]?.toString().trim() || 'Unknown',
          perusahaan: row[1]?.toString().trim() || null,
          pusat: row[5]?.toString().trim()?.split('\n')[0] || null, // Ambil baris pertama (CN removed)
          departemen: row[6]?.toString().trim()?.split('\n')[0] || null,
          divisi: row[7]?.toString().trim()?.split('\n')[0] || null,
          jabatan: row[8]?.toString().trim()?.split('\n')[0] || null,
          agama: row[12]?.toString().trim()?.split(' ')[0] || null, // Ambil kata pertama (CN removed)
          jenisKelamin: row[13]?.toString().trim()?.split(' ')[0] || null,
          tempatLahir: row[14]?.toString().trim() || null,
          pendidikan: row[16]?.toString().trim()?.split(' ')[0] || null,
          namaSekolah: row[17]?.toString().trim() || null,
          jurusan: row[18]?.toString().trim() || null,
          tanggalMulaiKerja: tanggalMulaiKerja,
          tanggalLahir: tanggalLahir,
        };
      })
      .filter(user => user !== null); // Remove nulls
    
    console.log(`📊 Total user valid untuk diimport: ${usersData.length}\n`);
    
    // Debug: tampilkan 2 user pertama
    console.log('👤 Sample data (2 user pertama):');
    console.log(JSON.stringify(usersData.slice(0, 2), null, 2));
    console.log('');
    
    // 4. Login dulu untuk dapatkan token admin
    console.log('🔐 Login sebagai admin...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      idKaryawan: '82400944',
      password: '82400944K3'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login berhasil\n');
    
    // 5. Import users via API
    console.log('📤 Mengirim data ke backend...');
    const importResponse = await axios.post(
      'http://localhost:3001/api/auth/bulk-create-users',
      { users: usersData },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // 6. Tampilkan hasil
    const results = importResponse.data;
    console.log('\n' + '='.repeat(60));
    console.log('📊 HASIL IMPORT');
    console.log('='.repeat(60));
    console.log(`✅ Berhasil: ${results.success.length} user`);
    console.log(`❌ Gagal: ${results.failed.length} user`);
    
    if (results.success.length > 0) {
      console.log('\n✅ User yang berhasil diimport:');
      results.success.forEach((u, i) => {
        console.log(`  ${i + 1}. ${u.idKaryawan} - ${u.nama} (${u.role})`);
      });
    }
    
    if (results.failed.length > 0) {
      console.log('\n❌ User yang gagal diimport:');
      results.failed.forEach((u, i) => {
        console.log(`  ${i + 1}. ${u.idKaryawan} - ${u.reason}`);
      });
    }
    
    // 7. Auto-assign supervisor berdasarkan departemen/tim
    console.log('\n' + '='.repeat(60));
    console.log('👥 AUTO-ASSIGN SUPERVISOR PER TIM');
    console.log('='.repeat(60));
    
    try {
      console.log('\n🔍 Mengambil data user untuk assign supervisor...');
      const usersResponse = await axios.get('http://localhost:3001/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const allUsers = usersResponse.data;
      
      // Group users by departemen
      const usersByDepartemen = {};
      allUsers.forEach(user => {
        const dept = user.departemen || 'NO_DEPARTMENT';
        if (!usersByDepartemen[dept]) {
          usersByDepartemen[dept] = [];
        }
        usersByDepartemen[dept].push(user);
      });
      
      let assignCount = 0;
      
      // Untuk setiap departemen, assign supervisor
      for (const [dept, users] of Object.entries(usersByDepartemen)) {
        if (dept === 'NO_DEPARTMENT') continue;
        
        // Cari supervisor di departemen ini
        const supervisors = users.filter(u => u.role === 'supervisor');
        
        if (supervisors.length === 0) {
          console.log(`⚠️  ${dept}: Tidak ada supervisor, skip`);
          continue;
        }
        
        // Jika ada banyak supervisor, pilih yang pertama (atau bisa pakai round-robin)
        const supervisor = supervisors[0];
        
        // Assign semua user non-supervisor ke supervisor ini
        const members = users.filter(u => u.role === 'user' && !u.supervisorId);
        
        console.log(`\n📋 ${dept}:`);
        console.log(`   Supervisor: ${supervisor.nama} (${supervisor.idKaryawan})`);
        console.log(`   Members: ${members.length} user`);
        
        for (const member of members) {
          try {
            await axios.patch(
              `http://localhost:3001/api/auth/users/${member.id}/supervisor`,
              { supervisorId: supervisor.id },
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            console.log(`   ✅ ${member.nama} → ${supervisor.nama}`);
            assignCount++;
          } catch (err) {
            console.log(`   ❌ ${member.nama}: ${err.message}`);
          }
        }
      }
      
      console.log(`\n✅ Total ${assignCount} user berhasil di-assign supervisor\n`);
      
    } catch (error) {
      console.log('⚠️  Auto-assign supervisor gagal (optional, bisa di-skip)');
      console.log(`   Error: ${error.message}\n`);
    }
    
    console.log('✨ Import dan setup selesai!\n');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Error dari API:', error.response.data);
    } else if (error.request) {
      console.error('❌ Tidak dapat terhubung ke backend. Pastikan backend berjalan di http://localhost:3001');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

// Run the import
importUsersFromExcel();
