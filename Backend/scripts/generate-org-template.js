/**
 * generate-org-template.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generate file Excel seed-org-structure.xlsx dengan 4 sheet:
 *   Sheet 1 — centers      : daftar semua pusat
 *   Sheet 2 — departments  : daftar semua departemen + kode pusat
 *   Sheet 3 — divisions    : daftar semua divisi + PIC
 *   Sheet 4 — skipped      : baris yang tidak ada PIC (untuk tindak lanjut)
 *
 * Jalankan:
 *   cd Backend
 *   node scripts/generate-org-template.js
 *
 * Output: Backend/scripts/seed-org-structure.xlsx
 * ─────────────────────────────────────────────────────────────────────────────
 */

const xlsx = require('xlsx');
const path = require('path');

const OUTPUT = path.join(__dirname, 'seed-org-structure.xlsx');

// ── DATA (sama persis dengan seed-org-structure.js) ──────────────────────────

const CENTERS = [
  { center_code: 'CTR-DUKUNG',    center_name: 'PUSAT DUKUNGAN DAN PELAYANAN' },
  { center_code: 'CTR-ENERGI',    center_name: 'PUSAT MANAJEMEN ENERGI & OTOMASI' },
  { center_code: 'CTR-LOGISTIK',  center_name: 'PUSAT MANAJEMEN LOGISTIK, TRANSPORTASI, DAN KENDARAAN' },
  { center_code: 'CTR-TANGGAP',   center_name: 'PUSAT MANAJEMEN TANGGAP DARURAT DAN LINGKUNGAN' },
  { center_code: 'CTR-MANUFAKTUR',center_name: 'PUSAT MANUFAKTUR MATERIAL' },
  { center_code: 'CTR-PASCA',     center_name: 'PUSAT PASCA PEMPROSESAN' },
  { center_code: 'CTR-ORE',       center_name: 'PUSAT PEMBERIAN ORE' },
  { center_code: 'CTR-PELIHARA',  center_name: 'PUSAT PEMELIHARAAN DAN PERBAIKAN' },
  { center_code: 'CTR-RISET',     center_name: 'PUSAT PENELITIAN TEKNOLOGI REKAYASA' },
  { center_code: 'CTR-PENGADAAN', center_name: 'PUSAT PENGADAAN & PENJADWALAN MATERIAL' },
  { center_code: 'CTR-NIKEL',     center_name: 'PUSAT PENGADAAN STRATEGIS NIKEL ORE' },
  { center_code: 'CTR-SMELTER',   center_name: 'PUSAT SMELTER' },
  { center_code: 'CTR-PRODUKSI',  center_name: 'PUSAT PRODUKSI BAHAN PENDUKUNG & ENERGI' },
  { center_code: 'CTR-TEKNOLOGI', center_name: 'PUSAT TEKNOLOGI PERALATAN & PEMELIHARAAN FASILITAS' },
];

const DEPARTMENTS = [
  { department_code: 'DEPT-ADM-KEND',    department_name: 'DEPARTEMEN ADMINISTRASI KENDARAAN',                                       center_code: 'CTR-DUKUNG' },
  { department_code: 'DEPT-ADM-PLAY',    department_name: 'DEPARTEMEN ADMINISTRASI PELAYANAN',                                        center_code: 'CTR-DUKUNG' },
  { department_code: 'DEPT-HRGA-ID',     department_name: 'DEPARTEMEN HRGA INDONESIA',                                               center_code: 'CTR-DUKUNG' },
  { department_code: 'DEPT-HRGA-CN',     department_name: 'DEPARTEMEN HRGA TIONGKOK',                                                center_code: 'CTR-DUKUNG' },
  { department_code: 'DEPT-LOGISTIK',    department_name: 'DEPARTEMEN LOGISTIK',                                                     center_code: 'CTR-DUKUNG' },
  { department_code: 'DEPT-BUDAYA-ESG',  department_name: 'PERPADUAN BUDAYA DAN ESG',                                               center_code: 'CTR-DUKUNG' },
  { department_code: 'DEPT-SECURITY',    department_name: 'DEPARTEMEN SECURITY',                                                     center_code: 'CTR-DUKUNG' },
  { department_code: 'DEPT-IT-OTOMASI',  department_name: 'DEPARTEMEN SISTEM INFORMASI DAN OTOMASI',                                center_code: 'CTR-ENERGI' },
  { department_code: 'DEPT-ENERGI',      department_name: 'MANAJEMEN ENERGI',                                                       center_code: 'CTR-ENERGI' },
  { department_code: 'DEPT-GUDANG',      department_name: 'DEPARTEMEN GUDANG',                                                      center_code: 'CTR-LOGISTIK' },
  { department_code: 'DEPT-TRANSPORT',   department_name: 'DEPARTEMEN TRANSPORTASI DAN MANAJEMEN PERALATAN',                        center_code: 'CTR-LOGISTIK' },
  { department_code: 'DEPT-LINGKUNGAN',  department_name: 'DEPARTEMEN MANAJEMEN LINGKUNGAN',                                        center_code: 'CTR-TANGGAP' },
  { department_code: 'DEPT-TANGGAP',     department_name: 'DEPARTEMEN MANAJEMEN TANGGAP DARURAT',                                   center_code: 'CTR-TANGGAP' },
  { department_code: 'DEPT-TAILING',     department_name: 'DEPARTEMEN PENGELOLAAN TAILING',                                         center_code: 'CTR-TANGGAP' },
  { department_code: 'DEPT-UMUM-MFG',    department_name: 'DEPARTEMEN UMUM',                                                        center_code: 'CTR-MANUFAKTUR' },
  { department_code: 'DEPT-KRISTAL',     department_name: 'WORKSHOP KRISTALISASI',                                                   center_code: 'CTR-MANUFAKTUR' },
  { department_code: 'DEPT-PREKURSOR',   department_name: 'WORKSHOP PREKURSOR',                                                      center_code: 'CTR-MANUFAKTUR' },
  { department_code: 'DEPT-PASCA-1',     department_name: 'DEPARTEMEN 1 PASCA PEMPROSESAN MANUFAKTUR',                              center_code: 'CTR-PASCA' },
  { department_code: 'DEPT-PASCA-2',     department_name: 'DEPARTEMEN 2 PASCA PEMPROSESAN MANUFAKTUR',                              center_code: 'CTR-PASCA' },
  { department_code: 'DEPT-MINERAL-1',   department_name: 'DEPARTEMEN 1 MINERAL PROCESSING DAN MANUFAKTUR',                         center_code: 'CTR-ORE' },
  { department_code: 'DEPT-MINERAL-2',   department_name: 'DEPARTEMEN 2 MINERAL PROCESSING DAN MANUFAKTUR',                         center_code: 'CTR-ORE' },
  { department_code: 'DEPT-WS-PELIHARA-1', department_name: 'WORKSHOP PEMELIHARAAN 1',                                             center_code: 'CTR-PELIHARA' },
  { department_code: 'DEPT-WS-PELIHARA-2', department_name: 'WORKSHOP PEMELIHARAAN 2',                                             center_code: 'CTR-PELIHARA' },
  { department_code: 'DEPT-QUALITY',     department_name: 'MANAJEMEN QUALITY',                                                      center_code: 'CTR-RISET' },
  { department_code: 'DEPT-ANALISIS',    department_name: 'TIM KERJA ANALISIS',                                                     center_code: 'CTR-RISET' },
  { department_code: 'DEPT-PILOT',       department_name: 'TIM PILOT PLANT',                                                        center_code: 'CTR-RISET' },
  { department_code: 'DEPT-RISET',       department_name: 'TIM PROYEK RISET',                                                       center_code: 'CTR-RISET' },
  { department_code: 'DEPT-PENGADAAN',   department_name: 'DEPARTEMEN PENGADAAN BAHAN BAKU MATERIAL & PENJADWALAN MATERIAL',        center_code: 'CTR-PENGADAAN' },
  { department_code: 'DEPT-NIKEL-ORE',   department_name: 'DEPARTEMEN PENGEMBANGAN NIKEL ORE',                                      center_code: 'CTR-NIKEL' },
  { department_code: 'DEPT-ESG-HPAL',    department_name: 'DEPARTEMEN ESG-HPAL MANUFAKTUR',                                         center_code: 'CTR-SMELTER' },
  { department_code: 'DEPT-HPAL-1',      department_name: 'DEPARTEMEN 1 HPAL MANUFAKTUR',                                           center_code: 'CTR-SMELTER' },
  { department_code: 'DEPT-HPAL-2',      department_name: 'DEPARTEMEN 2 HPAL MANUFAKTUR',                                           center_code: 'CTR-SMELTER' },
  { department_code: 'DEPT-PROD-ASAM',   department_name: 'DEPARTEMEN PRODUKSI ASAM',                                               center_code: 'CTR-PRODUKSI' },
  { department_code: 'DEPT-MGMT-ALAT',   department_name: 'DEPARTEMEN MANAJEMEN PERALATAN',                                         center_code: 'CTR-TEKNOLOGI' },
  { department_code: 'DEPT-PELIHARA-ALT',department_name: 'DEPARTEMEN PEMELIHARAAN PERALATAN',                                      center_code: 'CTR-TEKNOLOGI' },
];

const DIVISIONS = [
  { division_name: 'DEPARTEMEN ADMINISTRASI KENDARAAN',          department_code: 'DEPT-ADM-KEND',    pic_id_karyawan: '82400585', pic_nama: 'SHAFFRIADI S.' },
  { division_name: 'PELAYANAN ADMINISTRASI (PR)',                 department_code: 'DEPT-ADM-PLAY',    pic_id_karyawan: '82401209', pic_nama: 'WELEM BITTIKAKA' },
  { division_name: 'DEPARTEMEN HRGA INDONESIA',                  department_code: 'DEPT-HRGA-ID',     pic_id_karyawan: '82400512', pic_nama: 'ARDI ALAM JABIR' },
  { division_name: 'EXIT-ENTRY',                                 department_code: 'DEPT-HRGA-CN',     pic_id_karyawan: '82403090', pic_nama: 'DANIEL FU' },
  { division_name: 'KANTIN CHINA',                               department_code: 'DEPT-LOGISTIK',    pic_id_karyawan: '82400070', pic_nama: 'MARIA DHARMALIA' },
  { division_name: 'KANTIN INDONESIA',                           department_code: 'DEPT-LOGISTIK',    pic_id_karyawan: '82400070', pic_nama: 'MARIA DHARMALIA' },
  { division_name: 'KLINIK',                                     department_code: 'DEPT-LOGISTIK',    pic_id_karyawan: '82403762', pic_nama: 'JUWITA WULANDARI' },
  { division_name: 'PENGHIJAUAN',                                department_code: 'DEPT-LOGISTIK',    pic_id_karyawan: '87800052', pic_nama: 'MUHAMAD BAHTIAR' },
  { division_name: 'PENYEDIAAN MATERIAL',                        department_code: 'DEPT-LOGISTIK',    pic_id_karyawan: '82400070', pic_nama: 'MARIA DHARMALIA' },
  { division_name: 'KEGIATAN BUDAYA DAN OLAHRAGA',               department_code: 'DEPT-BUDAYA-ESG',  pic_id_karyawan: '82400424', pic_nama: 'SARTIKA. S' },
  { division_name: 'MANAJEMEN ESG',                              department_code: 'DEPT-BUDAYA-ESG',  pic_id_karyawan: '82401018', pic_nama: 'LA ODE MUHAMAD SYAWALUDDIN' },
  { division_name: 'PUBLIKASI MEDIA',                            department_code: 'DEPT-BUDAYA-ESG',  pic_id_karyawan: '82401878', pic_nama: 'CYNTIA DEWI' },
  { division_name: 'DEPARTEMEN SECURITY',                        department_code: 'DEPT-SECURITY',    pic_id_karyawan: '82402635', pic_nama: 'CIN FUK' },
  { division_name: 'INSTRUMEN & OTOMASI',                        department_code: 'DEPT-IT-OTOMASI',  pic_id_karyawan: '82403183', pic_nama: 'GIEFFARI MUHAMMAD' },
  { division_name: 'TIM IT',                                     department_code: 'DEPT-IT-OTOMASI',  pic_id_karyawan: '82402687', pic_nama: 'KRISTIAN YOSUA KONDO' },
  { division_name: 'WORKSHOP PEMELIHARAAN LISTRIK',              department_code: 'DEPT-ENERGI',      pic_id_karyawan: '82400069', pic_nama: 'MUHAMMAD RIDHO ABD MANAN' },
  { division_name: 'WORKSHOP PRODUKSI AIR',                      department_code: 'DEPT-ENERGI',      pic_id_karyawan: '82401017', pic_nama: 'LA JURU' },
  { division_name: 'DEPARTEMEN GUDANG',                          department_code: 'DEPT-GUDANG',      pic_id_karyawan: '82400172', pic_nama: 'I KADEK MERTAWAN' },
  { division_name: 'TIM PEMELIHARAAN PERALATAN',                 department_code: 'DEPT-TRANSPORT',   pic_id_karyawan: '80714943', pic_nama: 'ADE ANGGRIAWAN' },
  { division_name: 'TIM PENJADWALAN TRANSPORTASI',               department_code: 'DEPT-TRANSPORT',   pic_id_karyawan: '80715570', pic_nama: 'ARIF MUALLIS' },
  { division_name: 'DEPARTEMEN MANAJEMEN LINGKUNGAN',            department_code: 'DEPT-LINGKUNGAN',  pic_id_karyawan: '82402530', pic_nama: 'AKBAR SUDARMO' },
  { division_name: 'PEMERIKSAAN LAPANGAN & MANAJEMEN DARURAT',   department_code: 'DEPT-TANGGAP',     pic_id_karyawan: '82404858', pic_nama: 'HENDRI FIRNANDA' },
  { division_name: 'PERENCANAAN KEAMANAN & PELATIHAN SIMULASI',  department_code: 'DEPT-TANGGAP',     pic_id_karyawan: '82404858', pic_nama: 'HENDRI FIRNANDA' },
  { division_name: 'TIM PEMADAM KEBAKARAN',                      department_code: 'DEPT-TANGGAP',     pic_id_karyawan: '82403095', pic_nama: 'GABRIEL ALFONSO HUTABARAT' },
  { division_name: 'WORKSHOP KRISTALISASI',                      department_code: 'DEPT-KRISTAL',     pic_id_karyawan: '82402711', pic_nama: 'LADY VIOLA MAHARANI' },
  { division_name: 'WORKSHOP PREKURSOR',                         department_code: 'DEPT-PREKURSOR',   pic_id_karyawan: '87900098', pic_nama: 'ULFI ROHMAWATI' },
  { division_name: 'WORKSHOP PASCA PEMPROSESAN 1',               department_code: 'DEPT-PASCA-1',     pic_id_karyawan: '82400535', pic_nama: 'ANDI FACHRY. S' },
  { division_name: 'WORKSHOP PASCA PEMPROSESAN 2',               department_code: 'DEPT-PASCA-1',     pic_id_karyawan: '82400483', pic_nama: 'ARI KISWANTO' },
  { division_name: 'WORKSHOP TAIL SLAG',                         department_code: 'DEPT-PASCA-1',     pic_id_karyawan: '82400463', pic_nama: 'EMIL SALIM' },
  { division_name: 'WORKSHOP PASCA PEMPROSESAN ESG',             department_code: 'DEPT-PASCA-2',     pic_id_karyawan: '82404817', pic_nama: 'JAYA EDIANTA' },
  { division_name: 'DIVISI MINERAL PROCESSING',                  department_code: 'DEPT-MINERAL-1',   pic_id_karyawan: '82400256', pic_nama: 'ILHAM ISMAIL' },
  { division_name: 'DIVISI BATU KAPUR',                          department_code: 'DEPT-MINERAL-2',   pic_id_karyawan: '82400531', pic_nama: 'IMRAN. M' },
  { division_name: 'MANAJEMEN SIPIL',                            department_code: 'DEPT-WS-PELIHARA-1', pic_id_karyawan: '80715045', pic_nama: 'SANDI' },
  { division_name: 'TIM LISTRIK DAN INSTRUMEN (TANGGAP DARURAT)',department_code: 'DEPT-WS-PELIHARA-1', pic_id_karyawan: '82400518', pic_nama: 'MUH FIRDAUS J' },
  { division_name: 'TIM SIPIL (TANGGAP DARURAT)',                department_code: 'DEPT-WS-PELIHARA-1', pic_id_karyawan: '82400238', pic_nama: 'ADHE ZAKTI' },
  { division_name: 'WORKSHOP PEMELIHARAAN 2',                    department_code: 'DEPT-WS-PELIHARA-2', pic_id_karyawan: '82400917', pic_nama: 'RIFKI RIDAYANTO' },
  { division_name: 'INSPEKSI',                                   department_code: 'DEPT-QUALITY',     pic_id_karyawan: '82404935', pic_nama: 'FELISCA MELIN DIANES' },
  { division_name: 'PREPARASI & SAMPLING',                       department_code: 'DEPT-QUALITY',     pic_id_karyawan: '82400322', pic_nama: 'SADRIADI' },
  { division_name: 'TIM KERJA ANALISIS',                         department_code: 'DEPT-ANALISIS',    pic_id_karyawan: '80714678', pic_nama: 'SARLOTA' },
  { division_name: 'TIM PILOT PLANT',                            department_code: 'DEPT-PILOT',       pic_id_karyawan: '82402315', pic_nama: 'DIMAS AGUNG PRAMUDIKTO' },
  { division_name: 'TIM PROYEK RISET',                           department_code: 'DEPT-RISET',       pic_id_karyawan: '82401865', pic_nama: 'JENIE FAKHRI WIBOWO' },
  { division_name: 'DEPARTEMEN PENGADAAN MATERIAL & DISTRIBUSI LOGISTIK (PML)', department_code: 'DEPT-PENGADAAN', pic_id_karyawan: '82404906', pic_nama: 'MICHAEL KLAN LIE' },
  { division_name: 'DEPARTEMEN ESG-HPAL MANUFAKTUR',             department_code: 'DEPT-ESG-HPAL',    pic_id_karyawan: '82400947', pic_nama: 'PIYAN RAHMADI' },
  { division_name: 'DEPARTEMEN HPAL MANUFAKTUR (1)',             department_code: 'DEPT-HPAL-1',      pic_id_karyawan: '82400510', pic_nama: 'EVAN WAHYU KRISTIYANTO' },
  { division_name: 'DEPARTEMEN HPAL MANUFAKTUR (2)',             department_code: 'DEPT-HPAL-2',      pic_id_karyawan: '82404723', pic_nama: 'MUHAMMAD IRSYAL NADJIB' },
  { division_name: 'WORKSHOP PRODUKSI ASAM 1 & AREA TANGKI ASAM',department_code: 'DEPT-PROD-ASAM',  pic_id_karyawan: '82401665', pic_nama: 'MOH. RIDWAN' },
  { division_name: 'WORKSHOP PRODUKSI ASAM 2',                   department_code: 'DEPT-PROD-ASAM',   pic_id_karyawan: '82401711', pic_nama: 'ISLAMMUDDIN' },
  { division_name: 'WORKSHOP PRODUKSI ASAM 3',                   department_code: 'DEPT-PROD-ASAM',   pic_id_karyawan: '82401196', pic_nama: 'MOH. IKHSAN' },
  { division_name: 'DEPARTEMEN MANAJEMEN PERALATAN',             department_code: 'DEPT-MGMT-ALAT',   pic_id_karyawan: '82402271', pic_nama: 'JECKY MITRA SAINI' },
  { division_name: 'AREA PERBAIKAN 1',                           department_code: 'DEPT-PELIHARA-ALT', pic_id_karyawan: '82400680', pic_nama: 'NOSTALGIAN' },
  { division_name: 'AREA PERBAIKAN 2',                           department_code: 'DEPT-PELIHARA-ALT', pic_id_karyawan: '82400639', pic_nama: 'ADRIANZA' },
  { division_name: 'AREA PERBAIKAN 3',                           department_code: 'DEPT-PELIHARA-ALT', pic_id_karyawan: '82400675', pic_nama: 'NOLDI' },
  { division_name: 'WORKSHOP PERBAIKAN TERPADU',                 department_code: 'DEPT-PELIHARA-ALT', pic_id_karyawan: '82401392', pic_nama: 'ANDI SUSANTO' },
];

// Baris yang di-skip (tidak ada PIC)
const SKIPPED = [
  { pusat: 'PUSAT MANAJEMEN TANGGAP DARURAT DAN LINGKUNGAN', departemen: 'DEPARTEMEN PENGELOLAAN TAILING',                                        divisi: 'TIM PENUMPUKKAN MATERIAL',              keterangan: 'PIC tidak ada di data HR' },
  { pusat: 'PUSAT MANUFAKTUR MATERIAL',                       departemen: 'DEPARTEMEN UMUM',                                                        divisi: 'IPQC',                                   keterangan: 'PIC tidak ada di data HR' },
  { pusat: 'PUSAT PENGADAAN & PENJADWALAN MATERIAL',          departemen: 'DEPARTEMEN PENGADAAN BAHAN BAKU MATERIAL & PENJADWALAN MATERIAL',        divisi: 'DEPARTEMEN PERENCANAAN PENGADAAN',       keterangan: 'PIC tidak ada di data HR' },
  { pusat: 'PUSAT PENGADAAN STRATEGIS NIKEL ORE',             departemen: 'DEPARTEMEN PENGEMBANGAN NIKEL ORE',                                      divisi: 'DEPARTEMEN PENGEMBANGAN NIKEL ORE',      keterangan: 'PIC tidak ada di data HR' },
  { pusat: 'PUSAT PRODUKSI BAHAN PENDUKUNG & ENERGI',         departemen: 'DEPARTEMEN PRODUKSI ASAM',                                               divisi: 'WORKSHOP PELEBURAN BELERANG',            keterangan: 'PIC tidak ada di data HR' },
];

// ── STYLE HELPERS ────────────────────────────────────────────────────────────

function headerStyle(bgColor) {
  return {
    font:      { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
    fill:      { fgColor: { rgb: bgColor } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top:    { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left:   { style: 'thin', color: { rgb: '000000' } },
      right:  { style: 'thin', color: { rgb: '000000' } },
    },
  };
}

function cellStyle(bgColor) {
  return {
    fill:      { fgColor: { rgb: bgColor } },
    alignment: { vertical: 'center', wrapText: true },
    border: {
      top:    { style: 'thin', color: { rgb: 'DDDDDD' } },
      bottom: { style: 'thin', color: { rgb: 'DDDDDD' } },
      left:   { style: 'thin', color: { rgb: 'DDDDDD' } },
      right:  { style: 'thin', color: { rgb: 'DDDDDD' } },
    },
  };
}

// ── BUILD WORKSHEET ──────────────────────────────────────────────────────────

function makeSheet(headers, rows, bgHeader, bgRow) {
  const ws  = {};
  const ref = { s: { c: 0, r: 0 }, e: { c: headers.length - 1, r: rows.length } };

  // Header row
  headers.forEach((h, c) => {
    const cell = xlsx.utils.encode_cell({ r: 0, c });
    ws[cell] = { v: h, t: 's', s: headerStyle(bgHeader) };
  });

  // Data rows
  rows.forEach((row, r) => {
    const values = Object.values(row);
    values.forEach((v, c) => {
      const cell = xlsx.utils.encode_cell({ r: r + 1, c });
      ws[cell] = { v: v ?? '', t: 's', s: cellStyle(r % 2 === 0 ? bgRow : 'FFFFFF') };
    });
  });

  ws['!ref'] = xlsx.utils.encode_range(ref);

  // Column widths
  ws['!cols'] = headers.map((_, i) => {
    const maxLen = Math.max(
      headers[i].length,
      ...rows.map(row => String(Object.values(row)[i] ?? '').length)
    );
    return { wch: Math.min(maxLen + 4, 60) };
  });

  // Freeze header row
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };

  return ws;
}

// ── MAIN ─────────────────────────────────────────────────────────────────────

function main() {
  const wb = xlsx.utils.book_new();

  // Sheet 1 — Centers
  const wsCenters = makeSheet(
    ['center_code', 'center_name'],
    CENTERS,
    '1F4E79',  // dark blue header
    'DEEAF1'   // light blue alt row
  );
  xlsx.utils.book_append_sheet(wb, wsCenters, 'centers');

  // Sheet 2 — Departments
  const wsDepts = makeSheet(
    ['department_code', 'department_name', 'center_code'],
    DEPARTMENTS,
    '375623',  // dark green header
    'E2EFDA'   // light green alt row
  );
  xlsx.utils.book_append_sheet(wb, wsDepts, 'departments');

  // Sheet 3 — Divisions
  const wsDivs = makeSheet(
    ['division_name', 'department_code', 'pic_id_karyawan', 'pic_nama'],
    DIVISIONS,
    '7B3F00',  // dark orange header
    'FCE4D6'   // light orange alt row
  );
  xlsx.utils.book_append_sheet(wb, wsDivs, 'divisions');

  // Sheet 4 — Skipped (untuk tindak lanjut)
  const wsSkip = makeSheet(
    ['pusat', 'departemen', 'divisi', 'keterangan'],
    SKIPPED,
    '843C0C',  // dark red header
    'FFF2CC'   // yellow alt row
  );
  xlsx.utils.book_append_sheet(wb, wsSkip, 'skipped_no_pic');

  xlsx.writeFile(wb, OUTPUT, { bookType: 'xlsx', type: 'binary' });

  console.log('');
  console.log('✅ File Excel berhasil dibuat:');
  console.log(`   ${OUTPUT}`);
  console.log('');
  console.log('   Sheet 1 — centers        :', CENTERS.length, 'pusat');
  console.log('   Sheet 2 — departments    :', DEPARTMENTS.length, 'departemen');
  console.log('   Sheet 3 — divisions      :', DIVISIONS.length, 'divisi (dengan PIC)');
  console.log('   Sheet 4 — skipped_no_pic :', SKIPPED.length, 'baris (PIC belum ada)');
  console.log('');
}

main();
