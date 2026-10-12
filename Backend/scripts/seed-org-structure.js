/**
 * seed-org-structure.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Seed hierarki lengkap dalam 4 langkah berurutan:
 *   STEP 0 — PIC Users   : buat akun user untuk semua PIC divisi
 *   STEP 1 — Centers     : seed pusat
 *   STEP 2 — Departments : seed departemen + sambungkan ke pusat
 *   STEP 3 — Divisions   : seed divisi + tunjuk PIC
 *
 * Data sudah di-embed langsung dari sheet HR. Idempotent — aman dijalankan
 * berulang kali tanpa duplikasi data.
 *
 * Jalankan:
 *   cd Backend
 *   node scripts/seed-org-structure.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

const axios = require('axios');

const API_BASE   = 'http://127.0.0.1:3001';
const ADMIN_ID   = '82401013';   // ← ganti jika perlu
const ADMIN_PASS = '82401013K3'; // ← ganti jika perlu

// ── 0. DATA PIC USERS ────────────────────────────────────────────────────────
// User yang akan menjadi PIC divisi. Jika sudah ada di DB, di-skip.
// Password default: {idKaryawan}K3
const PIC_USERS = [
  { idKaryawan: '82400585', nama: 'SHAFFRIADI S.',              jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN ADMINISTRASI KENDARAAN',                                           divisi: 'DEPARTEMEN ADMINISTRASI KENDARAAN',           pusat: 'PUSAT DUKUNGAN DAN PELAYANAN' },
  { idKaryawan: '82401209', nama: 'WELEM BITTIKAKA',            jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN ADMINISTRASI PELAYANAN',                                            divisi: 'PELAYANAN ADMINISTRASI (PR)',                  pusat: 'PUSAT DUKUNGAN DAN PELAYANAN' },
  { idKaryawan: '82400512', nama: 'ARDI ALAM JABIR',            jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN HRGA INDONESIA',                                                    divisi: 'DEPARTEMEN HRGA INDONESIA',                   pusat: 'PUSAT DUKUNGAN DAN PELAYANAN' },
  { idKaryawan: '82403090', nama: 'DANIEL FU',                  jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN HRGA TIONGKOK',                                                     divisi: 'EXIT-ENTRY',                                  pusat: 'PUSAT DUKUNGAN DAN PELAYANAN' },
  { idKaryawan: '82400070', nama: 'MARIA DHARMALIA',            jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN LOGISTIK',                                                          divisi: 'KANTIN CHINA',                                pusat: 'PUSAT DUKUNGAN DAN PELAYANAN' },
  { idKaryawan: '82403762', nama: 'JUWITA WULANDARI',           jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN LOGISTIK',                                                          divisi: 'KLINIK',                                      pusat: 'PUSAT DUKUNGAN DAN PELAYANAN' },
  { idKaryawan: '87800052', nama: 'MUHAMAD BAHTIAR',            jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN LOGISTIK',                                                          divisi: 'PENGHIJAUAN',                                 pusat: 'PUSAT DUKUNGAN DAN PELAYANAN' },
  { idKaryawan: '82400424', nama: 'SARTIKA. S',                 jabatan: 'PIC DIVISI', departemen: 'PERPADUAN BUDAYA DAN ESG',                                                     divisi: 'KEGIATAN BUDAYA DAN OLAHRAGA',                pusat: 'PUSAT DUKUNGAN DAN PELAYANAN' },
  { idKaryawan: '82401018', nama: 'LA ODE MUHAMAD SYAWALUDDIN', jabatan: 'PIC DIVISI', departemen: 'PERPADUAN BUDAYA DAN ESG',                                                     divisi: 'MANAJEMEN ESG',                               pusat: 'PUSAT DUKUNGAN DAN PELAYANAN' },
  { idKaryawan: '82401878', nama: 'CYNTIA DEWI',                jabatan: 'PIC DIVISI', departemen: 'PERPADUAN BUDAYA DAN ESG',                                                     divisi: 'PUBLIKASI MEDIA',                             pusat: 'PUSAT DUKUNGAN DAN PELAYANAN' },
  { idKaryawan: '82402635', nama: 'CIN FUK',                    jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN SECURITY',                                                          divisi: 'DEPARTEMEN SECURITY',                         pusat: 'PUSAT DUKUNGAN DAN PELAYANAN' },
  { idKaryawan: '82403183', nama: 'GIEFFARI MUHAMMAD',          jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN SISTEM INFORMASI DAN OTOMASI',                                      divisi: 'INSTRUMEN & OTOMASI',                         pusat: 'PUSAT MANAJEMEN ENERGI & OTOMASI' },
  { idKaryawan: '82402687', nama: 'KRISTIAN YOSUA KONDO',       jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN SISTEM INFORMASI DAN OTOMASI',                                      divisi: 'TIM IT',                                      pusat: 'PUSAT MANAJEMEN ENERGI & OTOMASI' },
  { idKaryawan: '82400069', nama: 'MUHAMMAD RIDHO ABD MANAN',   jabatan: 'PIC DIVISI', departemen: 'MANAJEMEN ENERGI',                                                             divisi: 'WORKSHOP PEMELIHARAAN LISTRIK',                pusat: 'PUSAT MANAJEMEN ENERGI & OTOMASI' },
  { idKaryawan: '82401017', nama: 'LA JURU',                    jabatan: 'PIC DIVISI', departemen: 'MANAJEMEN ENERGI',                                                             divisi: 'WORKSHOP PRODUKSI AIR',                       pusat: 'PUSAT MANAJEMEN ENERGI & OTOMASI' },
  { idKaryawan: '82400172', nama: 'I KADEK MERTAWAN',           jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN GUDANG',                                                            divisi: 'DEPARTEMEN GUDANG',                           pusat: 'PUSAT MANAJEMEN LOGISTIK, TRANSPORTASI, DAN KENDARAAN' },
  { idKaryawan: '80714943', nama: 'ADE ANGGRIAWAN',             jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN TRANSPORTASI DAN MANAJEMEN PERALATAN',                              divisi: 'TIM PEMELIHARAAN PERALATAN',                  pusat: 'PUSAT MANAJEMEN LOGISTIK, TRANSPORTASI, DAN KENDARAAN' },
  { idKaryawan: '80715570', nama: 'ARIF MUALLIS',               jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN TRANSPORTASI DAN MANAJEMEN PERALATAN',                              divisi: 'TIM PENJADWALAN TRANSPORTASI',                pusat: 'PUSAT MANAJEMEN LOGISTIK, TRANSPORTASI, DAN KENDARAAN' },
  { idKaryawan: '82402530', nama: 'AKBAR SUDARMO',              jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN MANAJEMEN LINGKUNGAN',                                              divisi: 'DEPARTEMEN MANAJEMEN LINGKUNGAN',              pusat: 'PUSAT MANAJEMEN TANGGAP DARURAT DAN LINGKUNGAN' },
  { idKaryawan: '82404858', nama: 'HENDRI FIRNANDA',            jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN MANAJEMEN TANGGAP DARURAT',                                         divisi: 'PEMERIKSAAN LAPANGAN & MANAJEMEN DARURAT',    pusat: 'PUSAT MANAJEMEN TANGGAP DARURAT DAN LINGKUNGAN' },
  { idKaryawan: '82403095', nama: 'GABRIEL ALFONSO HUTABARAT',  jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN MANAJEMEN TANGGAP DARURAT',                                         divisi: 'TIM PEMADAM KEBAKARAN',                       pusat: 'PUSAT MANAJEMEN TANGGAP DARURAT DAN LINGKUNGAN' },
  { idKaryawan: '82402711', nama: 'LADY VIOLA MAHARANI',        jabatan: 'PIC DIVISI', departemen: 'WORKSHOP KRISTALISASI',                                                        divisi: 'WORKSHOP KRISTALISASI',                       pusat: 'PUSAT MANUFAKTUR MATERIAL' },
  { idKaryawan: '87900098', nama: 'ULFI ROHMAWATI',             jabatan: 'PIC DIVISI', departemen: 'WORKSHOP PREKURSOR',                                                           divisi: 'WORKSHOP PREKURSOR',                          pusat: 'PUSAT MANUFAKTUR MATERIAL' },
  { idKaryawan: '82400535', nama: 'ANDI FACHRY. S',             jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN 1 PASCA PEMPROSESAN MANUFAKTUR',                                    divisi: 'WORKSHOP PASCA PEMPROSESAN 1',                pusat: 'PUSAT PASCA PEMPROSESAN' },
  { idKaryawan: '82400483', nama: 'ARI KISWANTO',               jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN 1 PASCA PEMPROSESAN MANUFAKTUR',                                    divisi: 'WORKSHOP PASCA PEMPROSESAN 2',                pusat: 'PUSAT PASCA PEMPROSESAN' },
  { idKaryawan: '82400463', nama: 'EMIL SALIM',                 jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN 1 PASCA PEMPROSESAN MANUFAKTUR',                                    divisi: 'WORKSHOP TAIL SLAG',                          pusat: 'PUSAT PASCA PEMPROSESAN' },
  { idKaryawan: '82404817', nama: 'JAYA EDIANTA',               jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN 2 PASCA PEMPROSESAN MANUFAKTUR',                                    divisi: 'WORKSHOP PASCA PEMPROSESAN ESG',              pusat: 'PUSAT PASCA PEMPROSESAN' },
  { idKaryawan: '82400256', nama: 'ILHAM ISMAIL',               jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN 1 MINERAL PROCESSING DAN MANUFAKTUR',                               divisi: 'DIVISI MINERAL PROCESSING',                   pusat: 'PUSAT PEMBERIAN ORE' },
  { idKaryawan: '82400531', nama: 'IMRAN. M',                   jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN 2 MINERAL PROCESSING DAN MANUFAKTUR',                               divisi: 'DIVISI BATU KAPUR',                           pusat: 'PUSAT PEMBERIAN ORE' },
  { idKaryawan: '80715045', nama: 'SANDI',                      jabatan: 'PIC DIVISI', departemen: 'WORKSHOP PEMELIHARAAN 1',                                                      divisi: 'MANAJEMEN SIPIL',                             pusat: 'PUSAT PEMELIHARAAN DAN PERBAIKAN' },
  { idKaryawan: '82400518', nama: 'MUH FIRDAUS J',              jabatan: 'PIC DIVISI', departemen: 'WORKSHOP PEMELIHARAAN 1',                                                      divisi: 'TIM LISTRIK DAN INSTRUMEN (TANGGAP DARURAT)', pusat: 'PUSAT PEMELIHARAAN DAN PERBAIKAN' },
  { idKaryawan: '82400238', nama: 'ADHE ZAKTI',                 jabatan: 'PIC DIVISI', departemen: 'WORKSHOP PEMELIHARAAN 1',                                                      divisi: 'TIM SIPIL (TANGGAP DARURAT)',                 pusat: 'PUSAT PEMELIHARAAN DAN PERBAIKAN' },
  { idKaryawan: '82400917', nama: 'RIFKI RIDAYANTO',            jabatan: 'PIC DIVISI', departemen: 'WORKSHOP PEMELIHARAAN 2',                                                      divisi: 'WORKSHOP PEMELIHARAAN 2',                     pusat: 'PUSAT PEMELIHARAAN DAN PERBAIKAN' },
  { idKaryawan: '82404935', nama: 'FELISCA MELIN DIANES',       jabatan: 'PIC DIVISI', departemen: 'MANAJEMEN QUALITY',                                                            divisi: 'INSPEKSI',                                    pusat: 'PUSAT PENELITIAN TEKNOLOGI REKAYASA' },
  { idKaryawan: '82400322', nama: 'SADRIADI',                   jabatan: 'PIC DIVISI', departemen: 'MANAJEMEN QUALITY',                                                            divisi: 'PREPARASI & SAMPLING',                        pusat: 'PUSAT PENELITIAN TEKNOLOGI REKAYASA' },
  { idKaryawan: '80714678', nama: 'SARLOTA',                    jabatan: 'PIC DIVISI', departemen: 'TIM KERJA ANALISIS',                                                           divisi: 'TIM KERJA ANALISIS',                          pusat: 'PUSAT PENELITIAN TEKNOLOGI REKAYASA' },
  { idKaryawan: '82402315', nama: 'DIMAS AGUNG PRAMUDIKTO',     jabatan: 'PIC DIVISI', departemen: 'TIM PILOT PLANT',                                                              divisi: 'TIM PILOT PLANT',                             pusat: 'PUSAT PENELITIAN TEKNOLOGI REKAYASA' },
  { idKaryawan: '82401865', nama: 'JENIE FAKHRI WIBOWO',        jabatan: 'PIC DIVISI', departemen: 'TIM PROYEK RISET',                                                             divisi: 'TIM PROYEK RISET',                            pusat: 'PUSAT PENELITIAN TEKNOLOGI REKAYASA' },
  { idKaryawan: '82404906', nama: 'MICHAEL KLAN LIE',           jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN PENGADAAN BAHAN BAKU MATERIAL & PENJADWALAN MATERIAL',              divisi: 'DEPARTEMEN PENGADAAN MATERIAL & DISTRIBUSI LOGISTIK (PML)', pusat: 'PUSAT PENGADAAN & PENJADWALAN MATERIAL' },
  { idKaryawan: '82400947', nama: 'PIYAN RAHMADI',              jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN ESG-HPAL MANUFAKTUR',                                               divisi: 'DEPARTEMEN ESG-HPAL MANUFAKTUR',              pusat: 'PUSAT SMELTER' },
  { idKaryawan: '82400510', nama: 'EVAN WAHYU KRISTIYANTO',     jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN 1 HPAL MANUFAKTUR',                                                 divisi: 'DEPARTEMEN HPAL MANUFAKTUR (1)',              pusat: 'PUSAT SMELTER' },
  { idKaryawan: '82404723', nama: 'MUHAMMAD IRSYAL NADJIB',     jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN 2 HPAL MANUFAKTUR',                                                 divisi: 'DEPARTEMEN HPAL MANUFAKTUR (2)',              pusat: 'PUSAT SMELTER' },
  { idKaryawan: '82401665', nama: 'MOH. RIDWAN',                jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN PRODUKSI ASAM',                                                     divisi: 'WORKSHOP PRODUKSI ASAM 1 & AREA TANGKI ASAM',pusat: 'PUSAT PRODUKSI BAHAN PENDUKUNG & ENERGI' },
  { idKaryawan: '82401711', nama: 'ISLAMMUDDIN',                jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN PRODUKSI ASAM',                                                     divisi: 'WORKSHOP PRODUKSI ASAM 2',                    pusat: 'PUSAT PRODUKSI BAHAN PENDUKUNG & ENERGI' },
  { idKaryawan: '82401196', nama: 'MOH. IKHSAN',                jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN PRODUKSI ASAM',                                                     divisi: 'WORKSHOP PRODUKSI ASAM 3',                    pusat: 'PUSAT PRODUKSI BAHAN PENDUKUNG & ENERGI' },
  { idKaryawan: '82402271', nama: 'JECKY MITRA SAINI',          jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN MANAJEMEN PERALATAN',                                               divisi: 'DEPARTEMEN MANAJEMEN PERALATAN',               pusat: 'PUSAT TEKNOLOGI PERALATAN & PEMELIHARAAN FASILITAS' },
  { idKaryawan: '82400680', nama: 'NOSTALGIAN',                 jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN PEMELIHARAAN PERALATAN',                                            divisi: 'AREA PERBAIKAN 1',                            pusat: 'PUSAT TEKNOLOGI PERALATAN & PEMELIHARAAN FASILITAS' },
  { idKaryawan: '82400639', nama: 'ADRIANZA',                   jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN PEMELIHARAAN PERALATAN',                                            divisi: 'AREA PERBAIKAN 2',                            pusat: 'PUSAT TEKNOLOGI PERALATAN & PEMELIHARAAN FASILITAS' },
  { idKaryawan: '82400675', nama: 'NOLDI',                      jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN PEMELIHARAAN PERALATAN',                                            divisi: 'AREA PERBAIKAN 3',                            pusat: 'PUSAT TEKNOLOGI PERALATAN & PEMELIHARAAN FASILITAS' },
  { idKaryawan: '82401392', nama: 'ANDI SUSANTO',               jabatan: 'PIC DIVISI', departemen: 'DEPARTEMEN PEMELIHARAAN PERALATAN',                                            divisi: 'WORKSHOP PERBAIKAN TERPADU',                  pusat: 'PUSAT TEKNOLOGI PERALATAN & PEMELIHARAAN FASILITAS' },
];

// ── 1. DATA CENTERS (PUSAT) ──────────────────────────────────────────────────
const CENTERS = [
  { code: 'CTR-DUKUNG',    name: 'PUSAT DUKUNGAN DAN PELAYANAN' },
  { code: 'CTR-ENERGI',    name: 'PUSAT MANAJEMEN ENERGI & OTOMASI' },
  { code: 'CTR-LOGISTIK',  name: 'PUSAT MANAJEMEN LOGISTIK, TRANSPORTASI, DAN KENDARAAN' },
  { code: 'CTR-TANGGAP',   name: 'PUSAT MANAJEMEN TANGGAP DARURAT DAN LINGKUNGAN' },
  { code: 'CTR-MANUFAKTUR',name: 'PUSAT MANUFAKTUR MATERIAL' },
  { code: 'CTR-PASCA',     name: 'PUSAT PASCA PEMPROSESAN' },
  { code: 'CTR-ORE',       name: 'PUSAT PEMBERIAN ORE' },
  { code: 'CTR-PELIHARA',  name: 'PUSAT PEMELIHARAAN DAN PERBAIKAN' },
  { code: 'CTR-RISET',     name: 'PUSAT PENELITIAN TEKNOLOGI REKAYASA' },
  { code: 'CTR-PENGADAAN', name: 'PUSAT PENGADAAN & PENJADWALAN MATERIAL' },
  { code: 'CTR-NIKEL',     name: 'PUSAT PENGADAAN STRATEGIS NIKEL ORE' },
  { code: 'CTR-SMELTER',   name: 'PUSAT SMELTER' },
  { code: 'CTR-PRODUKSI',  name: 'PUSAT PRODUKSI BAHAN PENDUKUNG & ENERGI' },
  { code: 'CTR-TEKNOLOGI', name: 'PUSAT TEKNOLOGI PERALATAN & PEMELIHARAAN FASILITAS' },
];

// ── 2. DATA DEPARTMENTS (DEPARTEMEN) ────────────────────────────────────────
const DEPARTMENTS = [
  // PUSAT DUKUNGAN DAN PELAYANAN
  { code: 'DEPT-ADM-KEND',     name: 'DEPARTEMEN ADMINISTRASI KENDARAAN',                                       centerCode: 'CTR-DUKUNG' },
  { code: 'DEPT-ADM-PLAY',     name: 'DEPARTEMEN ADMINISTRASI PELAYANAN',                                        centerCode: 'CTR-DUKUNG' },
  { code: 'DEPT-HRGA-ID',      name: 'DEPARTEMEN HRGA INDONESIA',                                               centerCode: 'CTR-DUKUNG' },
  { code: 'DEPT-HRGA-CN',      name: 'DEPARTEMEN HRGA TIONGKOK',                                                centerCode: 'CTR-DUKUNG' },
  { code: 'DEPT-LOGISTIK',     name: 'DEPARTEMEN LOGISTIK',                                                     centerCode: 'CTR-DUKUNG' },
  { code: 'DEPT-BUDAYA-ESG',   name: 'PERPADUAN BUDAYA DAN ESG',                                               centerCode: 'CTR-DUKUNG' },
  { code: 'DEPT-SECURITY',     name: 'DEPARTEMEN SECURITY',                                                     centerCode: 'CTR-DUKUNG' },
  // PUSAT MANAJEMEN ENERGI & OTOMASI
  { code: 'DEPT-IT-OTOMASI',   name: 'DEPARTEMEN SISTEM INFORMASI DAN OTOMASI',                                centerCode: 'CTR-ENERGI' },
  { code: 'DEPT-ENERGI',       name: 'MANAJEMEN ENERGI',                                                       centerCode: 'CTR-ENERGI' },
  // PUSAT MANAJEMEN LOGISTIK, TRANSPORTASI, DAN KENDARAAN
  { code: 'DEPT-GUDANG',       name: 'DEPARTEMEN GUDANG',                                                      centerCode: 'CTR-LOGISTIK' },
  { code: 'DEPT-TRANSPORT',    name: 'DEPARTEMEN TRANSPORTASI DAN MANAJEMEN PERALATAN',                        centerCode: 'CTR-LOGISTIK' },
  // PUSAT MANAJEMEN TANGGAP DARURAT DAN LINGKUNGAN
  { code: 'DEPT-LINGKUNGAN',   name: 'DEPARTEMEN MANAJEMEN LINGKUNGAN',                                        centerCode: 'CTR-TANGGAP' },
  { code: 'DEPT-TANGGAP',      name: 'DEPARTEMEN MANAJEMEN TANGGAP DARURAT',                                   centerCode: 'CTR-TANGGAP' },
  { code: 'DEPT-TAILING',      name: 'DEPARTEMEN PENGELOLAAN TAILING',                                         centerCode: 'CTR-TANGGAP' },
  // PUSAT MANUFAKTUR MATERIAL
  { code: 'DEPT-UMUM-MFG',     name: 'DEPARTEMEN UMUM',                                                        centerCode: 'CTR-MANUFAKTUR' },
  { code: 'DEPT-KRISTAL',      name: 'WORKSHOP KRISTALISASI',                                                   centerCode: 'CTR-MANUFAKTUR' },
  { code: 'DEPT-PREKURSOR',    name: 'WORKSHOP PREKURSOR',                                                      centerCode: 'CTR-MANUFAKTUR' },
  // PUSAT PASCA PEMPROSESAN
  { code: 'DEPT-PASCA-1',      name: 'DEPARTEMEN 1 PASCA PEMPROSESAN MANUFAKTUR',                              centerCode: 'CTR-PASCA' },
  { code: 'DEPT-PASCA-2',      name: 'DEPARTEMEN 2 PASCA PEMPROSESAN MANUFAKTUR',                              centerCode: 'CTR-PASCA' },
  // PUSAT PEMBERIAN ORE
  { code: 'DEPT-MINERAL-1',    name: 'DEPARTEMEN 1 MINERAL PROCESSING DAN MANUFAKTUR',                         centerCode: 'CTR-ORE' },
  { code: 'DEPT-MINERAL-2',    name: 'DEPARTEMEN 2 MINERAL PROCESSING DAN MANUFAKTUR',                         centerCode: 'CTR-ORE' },
  // PUSAT PEMELIHARAAN DAN PERBAIKAN
  { code: 'DEPT-WS-PELIHARA-1',name: 'WORKSHOP PEMELIHARAAN 1',                                               centerCode: 'CTR-PELIHARA' },
  { code: 'DEPT-WS-PELIHARA-2',name: 'WORKSHOP PEMELIHARAAN 2',                                               centerCode: 'CTR-PELIHARA' },
  // PUSAT PENELITIAN TEKNOLOGI REKAYASA
  { code: 'DEPT-QUALITY',      name: 'MANAJEMEN QUALITY',                                                      centerCode: 'CTR-RISET' },
  { code: 'DEPT-ANALISIS',     name: 'TIM KERJA ANALISIS',                                                     centerCode: 'CTR-RISET' },
  { code: 'DEPT-PILOT',        name: 'TIM PILOT PLANT',                                                        centerCode: 'CTR-RISET' },
  { code: 'DEPT-RISET',        name: 'TIM PROYEK RISET',                                                       centerCode: 'CTR-RISET' },
  // PUSAT PENGADAAN & PENJADWALAN MATERIAL
  { code: 'DEPT-PENGADAAN',    name: 'DEPARTEMEN PENGADAAN BAHAN BAKU MATERIAL & PENJADWALAN MATERIAL',        centerCode: 'CTR-PENGADAAN' },
  // PUSAT PENGADAAN STRATEGIS NIKEL ORE
  { code: 'DEPT-NIKEL-ORE',    name: 'DEPARTEMEN PENGEMBANGAN NIKEL ORE',                                      centerCode: 'CTR-NIKEL' },
  // PUSAT SMELTER
  { code: 'DEPT-ESG-HPAL',     name: 'DEPARTEMEN ESG-HPAL MANUFAKTUR',                                         centerCode: 'CTR-SMELTER' },
  { code: 'DEPT-HPAL-1',       name: 'DEPARTEMEN 1 HPAL MANUFAKTUR',                                           centerCode: 'CTR-SMELTER' },
  { code: 'DEPT-HPAL-2',       name: 'DEPARTEMEN 2 HPAL MANUFAKTUR',                                           centerCode: 'CTR-SMELTER' },
  // PUSAT PRODUKSI BAHAN PENDUKUNG & ENERGI
  { code: 'DEPT-PROD-ASAM',    name: 'DEPARTEMEN PRODUKSI ASAM',                                               centerCode: 'CTR-PRODUKSI' },
  // PUSAT TEKNOLOGI PERALATAN & PEMELIHARAAN FASILITAS
  { code: 'DEPT-MGMT-ALAT',    name: 'DEPARTEMEN MANAJEMEN PERALATAN',                                         centerCode: 'CTR-TEKNOLOGI' },
  { code: 'DEPT-PELIHARA-ALT', name: 'DEPARTEMEN PEMELIHARAAN PERALATAN',                                      centerCode: 'CTR-TEKNOLOGI' },
];

// ── 3. DATA DIVISIONS (DIVISI + PIC) ────────────────────────────────────────
// Hanya baris yang memiliki idKaryawan PIC valid.
// 5 baris tanpa PIC di-skip (lihat catatan di summary).
const DIVISIONS = [
  // PUSAT DUKUNGAN DAN PELAYANAN
  { name: 'DEPARTEMEN ADMINISTRASI KENDARAAN',            deptCode: 'DEPT-ADM-KEND',     picIdKaryawan: '82400585' },
  { name: 'PELAYANAN ADMINISTRASI (PR)',                   deptCode: 'DEPT-ADM-PLAY',     picIdKaryawan: '82401209' },
  { name: 'DEPARTEMEN HRGA INDONESIA',                    deptCode: 'DEPT-HRGA-ID',      picIdKaryawan: '82400512' },
  { name: 'EXIT-ENTRY',                                   deptCode: 'DEPT-HRGA-CN',      picIdKaryawan: '82403090' },
  { name: 'KANTIN CHINA',                                 deptCode: 'DEPT-LOGISTIK',     picIdKaryawan: '82400070' },
  { name: 'KANTIN INDONESIA',                             deptCode: 'DEPT-LOGISTIK',     picIdKaryawan: '82400070' },
  { name: 'KLINIK',                                       deptCode: 'DEPT-LOGISTIK',     picIdKaryawan: '82403762' },
  { name: 'PENGHIJAUAN',                                  deptCode: 'DEPT-LOGISTIK',     picIdKaryawan: '87800052' },
  { name: 'PENYEDIAAN MATERIAL',                          deptCode: 'DEPT-LOGISTIK',     picIdKaryawan: '82400070' },
  { name: 'KEGIATAN BUDAYA DAN OLAHRAGA',                 deptCode: 'DEPT-BUDAYA-ESG',   picIdKaryawan: '82400424' },
  { name: 'MANAJEMEN ESG',                                deptCode: 'DEPT-BUDAYA-ESG',   picIdKaryawan: '82401018' },
  { name: 'PUBLIKASI MEDIA',                              deptCode: 'DEPT-BUDAYA-ESG',   picIdKaryawan: '82401878' },
  { name: 'DEPARTEMEN SECURITY',                          deptCode: 'DEPT-SECURITY',     picIdKaryawan: '82402635' },
  // PUSAT MANAJEMEN ENERGI & OTOMASI
  { name: 'INSTRUMEN & OTOMASI',                          deptCode: 'DEPT-IT-OTOMASI',   picIdKaryawan: '82403183' },
  { name: 'TIM IT',                                       deptCode: 'DEPT-IT-OTOMASI',   picIdKaryawan: '82402687' },
  { name: 'WORKSHOP PEMELIHARAAN LISTRIK',                deptCode: 'DEPT-ENERGI',       picIdKaryawan: '82400069' },
  { name: 'WORKSHOP PRODUKSI AIR',                        deptCode: 'DEPT-ENERGI',       picIdKaryawan: '82401017' },
  // PUSAT MANAJEMEN LOGISTIK, TRANSPORTASI, DAN KENDARAAN
  { name: 'DEPARTEMEN GUDANG',                            deptCode: 'DEPT-GUDANG',       picIdKaryawan: '82400172' },
  { name: 'TIM PEMELIHARAAN PERALATAN',                   deptCode: 'DEPT-TRANSPORT',    picIdKaryawan: '80714943' },
  { name: 'TIM PENJADWALAN TRANSPORTASI',                 deptCode: 'DEPT-TRANSPORT',    picIdKaryawan: '80715570' },
  // PUSAT MANAJEMEN TANGGAP DARURAT DAN LINGKUNGAN
  { name: 'DEPARTEMEN MANAJEMEN LINGKUNGAN',              deptCode: 'DEPT-LINGKUNGAN',   picIdKaryawan: '82402530' },
  { name: 'PEMERIKSAAN LAPANGAN & MANAJEMEN DARURAT',     deptCode: 'DEPT-TANGGAP',      picIdKaryawan: '82404858' },
  { name: 'PERENCANAAN KEAMANAN & PELATIHAN SIMULASI',    deptCode: 'DEPT-TANGGAP',      picIdKaryawan: '82404858' },
  { name: 'TIM PEMADAM KEBAKARAN',                        deptCode: 'DEPT-TANGGAP',      picIdKaryawan: '82403095' },
  // TIM PENUMPUKKAN MATERIAL → skip (tidak ada PIC di data HR)
  // PUSAT MANUFAKTUR MATERIAL
  // IPQC → skip (tidak ada PIC di data HR)
  { name: 'WORKSHOP KRISTALISASI',                        deptCode: 'DEPT-KRISTAL',      picIdKaryawan: '82402711' },
  { name: 'WORKSHOP PREKURSOR',                           deptCode: 'DEPT-PREKURSOR',    picIdKaryawan: '87900098' },
  // PUSAT PASCA PEMPROSESAN
  { name: 'WORKSHOP PASCA PEMPROSESAN 1',                 deptCode: 'DEPT-PASCA-1',      picIdKaryawan: '82400535' },
  { name: 'WORKSHOP PASCA PEMPROSESAN 2',                 deptCode: 'DEPT-PASCA-1',      picIdKaryawan: '82400483' },
  { name: 'WORKSHOP TAIL SLAG',                           deptCode: 'DEPT-PASCA-1',      picIdKaryawan: '82400463' },
  { name: 'WORKSHOP PASCA PEMPROSESAN ESG',               deptCode: 'DEPT-PASCA-2',      picIdKaryawan: '82404817' },
  // PUSAT PEMBERIAN ORE
  { name: 'DIVISI MINERAL PROCESSING',                    deptCode: 'DEPT-MINERAL-1',    picIdKaryawan: '82400256' },
  { name: 'DIVISI BATU KAPUR',                            deptCode: 'DEPT-MINERAL-2',    picIdKaryawan: '82400531' },
  // PUSAT PEMELIHARAAN DAN PERBAIKAN
  { name: 'MANAJEMEN SIPIL',                              deptCode: 'DEPT-WS-PELIHARA-1',picIdKaryawan: '80715045' },
  { name: 'TIM LISTRIK DAN INSTRUMEN (TANGGAP DARURAT)',  deptCode: 'DEPT-WS-PELIHARA-1',picIdKaryawan: '82400518' },
  { name: 'TIM SIPIL (TANGGAP DARURAT)',                  deptCode: 'DEPT-WS-PELIHARA-1',picIdKaryawan: '82400238' },
  { name: 'WORKSHOP PEMELIHARAAN 2',                      deptCode: 'DEPT-WS-PELIHARA-2',picIdKaryawan: '82400917' },
  // PUSAT PENELITIAN TEKNOLOGI REKAYASA
  { name: 'INSPEKSI',                                     deptCode: 'DEPT-QUALITY',      picIdKaryawan: '82404935' },
  { name: 'PREPARASI & SAMPLING',                         deptCode: 'DEPT-QUALITY',      picIdKaryawan: '82400322' },
  { name: 'TIM KERJA ANALISIS',                           deptCode: 'DEPT-ANALISIS',     picIdKaryawan: '80714678' },
  { name: 'TIM PILOT PLANT',                              deptCode: 'DEPT-PILOT',        picIdKaryawan: '82402315' },
  { name: 'TIM PROYEK RISET',                             deptCode: 'DEPT-RISET',        picIdKaryawan: '82401865' },
  // PUSAT PENGADAAN & PENJADWALAN MATERIAL
  // DEPARTEMEN PERENCANAAN PENGADAAN → skip (tidak ada PIC di data HR)
  { name: 'DEPARTEMEN PENGADAAN MATERIAL & DISTRIBUSI LOGISTIK (PML)', deptCode: 'DEPT-PENGADAAN', picIdKaryawan: '82404906' },
  // DEPARTEMEN PENGEMBANGAN NIKEL ORE → skip (tidak ada PIC di data HR)
  // PUSAT SMELTER
  { name: 'DEPARTEMEN ESG-HPAL MANUFAKTUR',               deptCode: 'DEPT-ESG-HPAL',     picIdKaryawan: '82400947' },
  { name: 'DEPARTEMEN HPAL MANUFAKTUR (1)',                deptCode: 'DEPT-HPAL-1',       picIdKaryawan: '82400510' },
  { name: 'DEPARTEMEN HPAL MANUFAKTUR (2)',                deptCode: 'DEPT-HPAL-2',       picIdKaryawan: '82404723' },
  // PUSAT PRODUKSI BAHAN PENDUKUNG & ENERGI
  // WORKSHOP PELEBURAN BELERANG → skip (tidak ada PIC di data HR)
  { name: 'WORKSHOP PRODUKSI ASAM 1 & AREA TANGKI ASAM',  deptCode: 'DEPT-PROD-ASAM',    picIdKaryawan: '82401665' },
  { name: 'WORKSHOP PRODUKSI ASAM 2',                      deptCode: 'DEPT-PROD-ASAM',    picIdKaryawan: '82401711' },
  { name: 'WORKSHOP PRODUKSI ASAM 3',                      deptCode: 'DEPT-PROD-ASAM',    picIdKaryawan: '82401196' },
  // PUSAT TEKNOLOGI PERALATAN & PEMELIHARAAN FASILITAS
  { name: 'DEPARTEMEN MANAJEMEN PERALATAN',                deptCode: 'DEPT-MGMT-ALAT',    picIdKaryawan: '82402271' },
  { name: 'AREA PERBAIKAN 1',                              deptCode: 'DEPT-PELIHARA-ALT', picIdKaryawan: '82400680' },
  { name: 'AREA PERBAIKAN 2',                              deptCode: 'DEPT-PELIHARA-ALT', picIdKaryawan: '82400639' },
  { name: 'AREA PERBAIKAN 3',                              deptCode: 'DEPT-PELIHARA-ALT', picIdKaryawan: '82400675' },
  { name: 'WORKSHOP PERBAIKAN TERPADU',                    deptCode: 'DEPT-PELIHARA-ALT', picIdKaryawan: '82401392' },
];

// ── UTILITY ───────────────────────────────────────────────────────────────────
function sep(title) {
  console.log('\n' + '═'.repeat(60));
  console.log(`  ${title}`);
  console.log('═'.repeat(60));
}
function ok(msg)   { console.log(`  ✅ ${msg}`); }
function skip(msg) { console.log(`  ⏭  ${msg}`); }
function err(msg)  { console.log(`  ❌ ${msg}`); }

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║        SEED ORG STRUCTURE — QMB ERM SYSTEM            ║');
  console.log('║  Step 0: PIC Users → Step 1: Centers →                ║');
  console.log('║  Step 2: Departments → Step 3: Divisions              ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  // ── Login ──────────────────────────────────────────────────────────────────
  let token;
  try {
    const { data } = await axios.post(`${API_BASE}/api/auth/login`, {
      idKaryawan: ADMIN_ID,
      password:   ADMIN_PASS,
    });
    token = data.token;
    console.log(`\n🔐 Login berhasil sebagai admin (${ADMIN_ID})`);
  } catch (e) {
    console.error(`\n❌ Login gagal: ${e.response?.data?.message ?? e.message}`);
    console.error('   Pastikan backend berjalan dan credentials admin benar.');
    process.exit(1);
  }

  const H = { Authorization: `Bearer ${token}` };

  // ── STEP 0: Seed PIC Users ─────────────────────────────────────────────────
  sep('STEP 0 — Seed PIC Users (jika belum ada di DB)');

  const { data: existingUsers } = await axios.get(`${API_BASE}/api/auth/users`, { headers: H });
  const existingIds = new Set(existingUsers.map(u => u.idKaryawan));

  const newPicUsers = PIC_USERS.filter(u => !existingIds.has(u.idKaryawan));
  const skipCount0  = PIC_USERS.length - newPicUsers.length;

  if (newPicUsers.length === 0) {
    console.log(`  ⏭  Semua ${PIC_USERS.length} PIC user sudah ada di DB.`);
  } else {
    console.log(`  ℹ️  ${skipCount0} sudah ada, ${newPicUsers.length} akan dibuat...\n`);
    let uOk = 0, uFail = 0;

    // Kirim via bulk-create (max 50 per request)
    const CHUNK = 50;
    for (let i = 0; i < newPicUsers.length; i += CHUNK) {
      const chunk = newPicUsers.slice(i, i + CHUNK);
      try {
        const { data: result } = await axios.post(
          `${API_BASE}/api/auth/bulk-create-users`,
          { users: chunk },
          { headers: H }
        );
        result.success.forEach(u => {
          ok(`${u.idKaryawan} — ${u.nama}  (role: ${u.role}, pwd: ${u.idKaryawan}K3)`);
          uOk++;
        });
        result.failed.forEach(u => {
          if (u.reason === 'User sudah ada') {
            skip(`${u.idKaryawan} — sudah ada`);
          } else {
            err(`${u.idKaryawan} — ${u.reason}`);
            uFail++;
          }
        });
      } catch (e) {
        err(`Bulk create gagal: ${e.response?.data?.message ?? e.message}`);
        uFail += chunk.length;
      }
    }
    console.log(`\n  Hasil: ✅ ${uOk} dibuat  ⏭  ${skipCount0} skip  ❌ ${uFail} gagal`);
    console.log('  🔑 Password default: {idKaryawan}K3');
  }

  // ── STEP 1: Centers ────────────────────────────────────────────────────────
  sep('STEP 1 — Centers (Pusat)');

  const centerMap = {}; // code → id
  const { data: existingCenters } = await axios.get(`${API_BASE}/api/centers`, { headers: H });
  existingCenters.forEach(c => { centerMap[c.code] = c.id; });

  let cOk = 0, cSkip = 0, cFail = 0;
  for (const c of CENTERS) {
    if (centerMap[c.code]) { skip(`[${c.code}] ${c.name}`); cSkip++; continue; }
    try {
      const { data } = await axios.post(`${API_BASE}/api/centers`, c, { headers: H });
      centerMap[c.code] = data.id;
      ok(`[${c.code}] ${c.name}`);
      cOk++;
    } catch (e) {
      err(`[${c.code}] ${c.name} — ${e.response?.data?.message ?? e.message}`);
      cFail++;
    }
  }
  console.log(`\n  Hasil: ✅ ${cOk} baru  ⏭  ${cSkip} skip  ❌ ${cFail} gagal`);

  // ── STEP 2: Departments ────────────────────────────────────────────────────
  sep('STEP 2 — Departments (Departemen)');

  const deptMap = {}; // code → id
  const { data: existingDepts } = await axios.get(`${API_BASE}/api/departments`, { headers: H });
  existingDepts.forEach(d => { deptMap[d.code] = d.id; });

  let dOk = 0, dUpdate = 0, dFail = 0;
  for (const d of DEPARTMENTS) {
    const centerId = centerMap[d.centerCode];
    if (!centerId) { err(`[${d.code}] Center "${d.centerCode}" tidak ditemukan`); dFail++; continue; }

    if (deptMap[d.code]) {
      // Sudah ada → update centerId agar tersambung ke pusat
      try {
        await axios.put(
          `${API_BASE}/api/departments/${deptMap[d.code]}`,
          { name: d.name, code: d.code, centerId },
          { headers: H }
        );
        ok(`UPDATE centerId → [${d.code}] ${d.name}`);
        dUpdate++;
      } catch (e) {
        err(`UPDATE [${d.code}] — ${e.response?.data?.message ?? e.message}`);
        dFail++;
      }
      continue;
    }

    try {
      const { data } = await axios.post(
        `${API_BASE}/api/departments`,
        { name: d.name, code: d.code, centerId },
        { headers: H }
      );
      deptMap[d.code] = data.id;
      ok(`[${d.code}] ${d.name}`);
      dOk++;
    } catch (e) {
      err(`[${d.code}] ${d.name} — ${e.response?.data?.message ?? e.message}`);
      dFail++;
    }
  }
  console.log(`\n  Hasil: ✅ ${dOk} baru  🔄 ${dUpdate} diupdate  ❌ ${dFail} gagal`);

  // ── STEP 3: Divisions ──────────────────────────────────────────────────────
  sep('STEP 3 — Divisions (Divisi + PIC)');

  // Refresh user map setelah step 0 (ada user baru)
  const { data: allUsers } = await axios.get(`${API_BASE}/api/auth/users`, { headers: H });
  const userMap = Object.fromEntries(allUsers.map(u => [u.idKaryawan, { id: u.id, nama: u.nama }]));

  // Refresh dept map (mungkin ada dept baru)
  const { data: allDepts } = await axios.get(`${API_BASE}/api/departments`, { headers: H });
  allDepts.forEach(d => { if (!deptMap[d.code]) deptMap[d.code] = d.id; });

  // Set divisi yang sudah ada (deteksi duplikat)
  const { data: existingDivs } = await axios.get(`${API_BASE}/api/divisions`, { headers: H });
  const divSet = new Set(existingDivs.map(div => `${div.name}||${div.departmentId}`));

  let vOk = 0, vSkip = 0, vFail = 0;
  for (const div of DIVISIONS) {
    const departmentId = deptMap[div.deptCode];
    const picUser      = userMap[div.picIdKaryawan];

    if (!departmentId) { err(`"${div.name}" — dept "${div.deptCode}" tidak ditemukan`); vFail++; continue; }
    if (!picUser)      { err(`"${div.name}" — PIC "${div.picIdKaryawan}" tidak ada di DB`);  vFail++; continue; }

    const key = `${div.name}||${departmentId}`;
    if (divSet.has(key)) { skip(`"${div.name}"`); vSkip++; continue; }

    try {
      await axios.post(
        `${API_BASE}/api/divisions`,
        { name: div.name, departmentId, picId: picUser.id },
        { headers: H }
      );
      divSet.add(key);
      ok(`"${div.name}"  PIC: ${picUser.nama} (${div.picIdKaryawan})`);
      vOk++;
    } catch (e) {
      err(`"${div.name}" — ${e.response?.data?.message ?? e.message}`);
      vFail++;
    }
  }
  console.log(`\n  Hasil: ✅ ${vOk} baru  ⏭  ${vSkip} skip  ❌ ${vFail} gagal`);

  // ── STEP 4: Assign divisionId ke PIC users ──────────────────────────────
  sep('STEP 4 — Assign divisionId ke PIC Users');

  // Refresh userMap dan divisiList setelah STEP 3
  const { data: usersAfter } = await axios.get(`${API_BASE}/api/auth/users`, { headers: H });
  const userMapFull = Object.fromEntries(usersAfter.map(u => [u.idKaryawan, u.id]));

  const { data: divsAfter } = await axios.get(`${API_BASE}/api/divisions`, { headers: H });
  // Map: picId (user.id) → divisionId (division.id) — ambil divisi pertama yang PIC-nya user ini
  const picToDivision = {};
  divsAfter.forEach(div => {
    if (div.pic?.idKaryawan && !picToDivision[div.pic.idKaryawan]) {
      picToDivision[div.pic.idKaryawan] = div.id;
    }
  });

  let aOk = 0, aSkip = 0, aFail = 0;
  for (const picUser of PIC_USERS) {
    const userId     = userMapFull[picUser.idKaryawan];
    const divisionId = picToDivision[picUser.idKaryawan];

    if (!userId)     { err(`${picUser.idKaryawan} — user tidak ditemukan`); aFail++; continue; }
    if (!divisionId) { err(`${picUser.idKaryawan} — tidak ada divisi yang terhubung`); aFail++; continue; }

    // Cek apakah divisionId sudah di-set
    const existingUser = usersAfter.find(u => u.idKaryawan === picUser.idKaryawan);
    if (existingUser?.divisionId === divisionId) {
      skip(`${picUser.idKaryawan} — ${picUser.nama} (divisionId sudah di-set)`);
      aSkip++; continue;
    }

    try {
      await axios.patch(
        `${API_BASE}/api/auth/users/${userId}`,
        { divisionId },
        { headers: H }
      );
      ok(`${picUser.idKaryawan} — ${picUser.nama} → divisionId set`);
      aOk++;
    } catch (e) {
      err(`${picUser.idKaryawan} — ${e.response?.data?.message ?? e.message}`);
      aFail++;
    }
  }
  console.log(`\n  Hasil: ✅ ${aOk} di-assign  ⏭  ${aSkip} skip  ❌ ${aFail} gagal`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                   SEED SELESAI ✔                      ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`  PIC Users   : ${PIC_USERS.length} total`);
  console.log(`  Centers     : ${cOk} baru, ${cSkip} skip`);
  console.log(`  Departments : ${dOk} baru, ${dUpdate} diupdate`);
  console.log(`  Divisions   : ${vOk} baru, ${vSkip} skip`);
  console.log(`  divisionId  : ${aOk} di-assign ke PIC users`);
  console.log('');
  console.log('  ⚠️  Divisi yang di-skip (PIC belum ada di data HR):');
  console.log('      - TIM PENUMPUKKAN MATERIAL       (DEPT-TAILING)');
  console.log('      - IPQC                           (DEPT-UMUM-MFG)');
  console.log('      - DEPARTEMEN PERENCANAAN PENGADAAN (DEPT-PENGADAAN)');
  console.log('      - DEPARTEMEN PENGEMBANGAN NIKEL ORE (DEPT-NIKEL-ORE)');
  console.log('      - WORKSHOP PELEBURAN BELERANG    (DEPT-PROD-ASAM)');
  console.log('  → Isi PIC-nya via Admin Panel setelah seed selesai.');
  console.log('');
}

main().catch(e => {
  console.error('\n❌ Fatal error:', e.message);
  process.exit(1);
});
