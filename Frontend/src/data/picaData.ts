/**
 * PICA Data — Kriteria SMK3 (166 kriteria) dan Divisi (PIC)
 * Sumber: PP No. 50 Tahun 2012 — 12 Elemen SMK3
 */

// ── Kriteria SMK3 ─────────────────────────────────────────────────────────

export interface KriteriaSMK3 {
  id: string;       // e.g. "1.1.1"
  elemen: number;   // 1-12
  subElemen: string; // e.g. "1.1"
  kode: string;     // Kode kriteria
  deskripsi: string;
}

export const KRITERIA_SMK3: KriteriaSMK3[] = [
  // ── Elemen 1: Pembangunan dan Pemeliharaan Komitmen ──
  { id: '1.1.1', elemen: 1, subElemen: '1.1', kode: '1.1.1', deskripsi: 'Terdapat kebijakan K3 yang tertulis, bertanggal dan ditandatangani oleh pengusaha atau pengurus.' },
  { id: '1.1.2', elemen: 1, subElemen: '1.1', kode: '1.1.2', deskripsi: 'Kebijakan K3 disusun berdasarkan tinjauan awal (initial review) kondisi K3 perusahaan.' },
  { id: '1.1.3', elemen: 1, subElemen: '1.1', kode: '1.1.3', deskripsi: 'Kebijakan K3 disosialisasikan kepada seluruh tenaga kerja, tamu, kontraktor, dan pemasok.' },
  { id: '1.1.4', elemen: 1, subElemen: '1.1', kode: '1.1.4', deskripsi: 'Kebijakan K3 khusus untuk pekerjaan berisiko tinggi ditetapkan secara tertulis.' },
  { id: '1.1.5', elemen: 1, subElemen: '1.1', kode: '1.1.5', deskripsi: 'Kebijakan K3 ditinjau ulang secara berkala untuk menjamin kesesuaiannya.' },
  { id: '1.2.1', elemen: 1, subElemen: '1.2', kode: '1.2.1', deskripsi: 'Tanggung jawab dan wewenang K3 didistribusikan secara jelas kepada seluruh level manajemen.' },
  { id: '1.2.2', elemen: 1, subElemen: '1.2', kode: '1.2.2', deskripsi: 'Personel yang bertanggung jawab atas K3 ditunjuk secara tertulis.' },
  { id: '1.2.3', elemen: 1, subElemen: '1.2', kode: '1.2.3', deskripsi: 'Pimpinan unit kerja memiliki tanggung jawab K3 atas unit yang dikelolanya.' },
  { id: '1.2.4', elemen: 1, subElemen: '1.2', kode: '1.2.4', deskripsi: 'Pengurus SMK3 bertanggung jawab atas penerapan SMK3 di perusahaan.' },
  { id: '1.2.5', elemen: 1, subElemen: '1.2', kode: '1.2.5', deskripsi: 'Personel yang bertanggung jawab atas keadaan darurat ditetapkan secara tertulis.' },
  { id: '1.2.6', elemen: 1, subElemen: '1.2', kode: '1.2.6', deskripsi: 'Konsultasi dengan ahli K3 dilakukan jika diperlukan.' },
  { id: '1.2.7', elemen: 1, subElemen: '1.2', kode: '1.2.7', deskripsi: 'Kinerja K3 dilaporkan kepada pimpinan secara berkala.' },
  { id: '1.3.1', elemen: 1, subElemen: '1.3', kode: '1.3.1', deskripsi: 'Penerapan SMK3 ditinjau ulang secara berkala oleh pimpinan.' },
  { id: '1.3.2', elemen: 1, subElemen: '1.3', kode: '1.3.2', deskripsi: 'Hasil tinjauan ulang SMK3 ditindaklanjuti secara nyata.' },
  { id: '1.3.3', elemen: 1, subElemen: '1.3', kode: '1.3.3', deskripsi: 'Tinjauan ulang SMK3 dilakukan secara berkala sesuai jadwal.' },
  { id: '1.4.1', elemen: 1, subElemen: '1.4', kode: '1.4.1', deskripsi: 'Tenaga kerja dilibatkan dalam konsultasi pengembangan dan tinjauan kebijakan K3.' },
  { id: '1.4.2', elemen: 1, subElemen: '1.4', kode: '1.4.2', deskripsi: 'Prosedur konsultasi tenaga kerja atas perubahan K3 terdokumentasi.' },
  { id: '1.4.3', elemen: 1, subElemen: '1.4', kode: '1.4.3', deskripsi: 'P2K3 telah dibentuk sesuai ketentuan perundang-undangan.' },
  { id: '1.4.4', elemen: 1, subElemen: '1.4', kode: '1.4.4', deskripsi: 'Ketua P2K3 adalah pengusaha atau pengurus.' },
  { id: '1.4.5', elemen: 1, subElemen: '1.4', kode: '1.4.5', deskripsi: 'Sekretaris P2K3 adalah Ahli K3.' },
  { id: '1.4.6', elemen: 1, subElemen: '1.4', kode: '1.4.6', deskripsi: 'P2K3 aktif dalam pengembangan kebijakan dan pengendalian risiko K3.' },
  { id: '1.4.7', elemen: 1, subElemen: '1.4', kode: '1.4.7', deskripsi: 'Struktur P2K3 terdokumentasi dan disosialisasikan.' },
  { id: '1.4.8', elemen: 1, subElemen: '1.4', kode: '1.4.8', deskripsi: 'Pertemuan P2K3 dilaksanakan secara teratur dan hasilnya dikomunikasikan kepada tenaga kerja.' },
  { id: '1.4.9', elemen: 1, subElemen: '1.4', kode: '1.4.9', deskripsi: 'Kegiatan P2K3 dilaporkan kepada Disnaker setempat.' },
  { id: '1.4.10', elemen: 1, subElemen: '1.4', kode: '1.4.10', deskripsi: 'Kelompok kerja K3 dibentuk di masing-masing bagian sesuai kebutuhan.' },
  { id: '1.4.11', elemen: 1, subElemen: '1.4', kode: '1.4.11', deskripsi: 'Kegiatan kelompok kerja K3 terdokumentasi.' },

  // ── Elemen 2: Pembuatan dan Pendokumentasian Rencana K3 ──
  { id: '2.1.1', elemen: 2, subElemen: '2.1', kode: '2.1.1', deskripsi: 'Prosedur HIRADC (Hazard Identification Risk Assessment and Determining Control) terdokumentasi.' },
  { id: '2.1.2', elemen: 2, subElemen: '2.1', kode: '2.1.2', deskripsi: 'HIRADC dilaksanakan oleh personel yang kompeten.' },
  { id: '2.1.3', elemen: 2, subElemen: '2.1', kode: '2.1.3', deskripsi: 'Strategi K3 disusun berdasarkan HIRADC, persyaratan perundangan, dan hasil tinjauan.' },
  { id: '2.1.4', elemen: 2, subElemen: '2.1', kode: '2.1.4', deskripsi: 'Strategi K3 mencakup tindakan pengendalian risiko yang teridentifikasi.' },
  { id: '2.1.5', elemen: 2, subElemen: '2.1', kode: '2.1.5', deskripsi: 'Rencana kerja dan sasaran K3 ditetapkan secara tertulis.' },
  { id: '2.1.6', elemen: 2, subElemen: '2.1', kode: '2.1.6', deskripsi: 'Rencana K3 terintegrasi dengan sistem manajemen perusahaan.' },
  { id: '2.2.1', elemen: 2, subElemen: '2.2', kode: '2.2.1', deskripsi: 'Manual SMK3 tersedia dan memuat kebijakan, organisasi, dan prosedur K3.' },
  { id: '2.2.2', elemen: 2, subElemen: '2.2', kode: '2.2.2', deskripsi: 'Manual SMK3 khusus untuk pekerjaan berisiko tinggi tersedia.' },
  { id: '2.2.3', elemen: 2, subElemen: '2.2', kode: '2.2.3', deskripsi: 'Manual SMK3 mudah diakses oleh seluruh tenaga kerja yang membutuhkan.' },
  { id: '2.3.1', elemen: 2, subElemen: '2.3', kode: '2.3.1', deskripsi: 'Peraturan dan persyaratan K3 yang berlaku diidentifikasi dan terdokumentasi.' },
  { id: '2.3.2', elemen: 2, subElemen: '2.3', kode: '2.3.2', deskripsi: 'Terdapat penanggung jawab untuk memperoleh informasi peraturan K3 terkini.' },
  { id: '2.3.3', elemen: 2, subElemen: '2.3', kode: '2.3.3', deskripsi: 'Persyaratan regulasi K3 diintegrasikan ke dalam prosedur dan instruksi kerja.' },
  { id: '2.3.4', elemen: 2, subElemen: '2.3', kode: '2.3.4', deskripsi: 'Perubahan regulasi K3 ditinjau dan ditindaklanjuti.' },
  { id: '2.4.1', elemen: 2, subElemen: '2.4', kode: '2.4.1', deskripsi: 'Informasi K3 dikomunikasikan kepada seluruh level organisasi secara efektif.' },

  // ── Elemen 3: Pengendalian Perancangan dan Peninjauan Kontrak ──
  { id: '3.1.1', elemen: 3, subElemen: '3.1', kode: '3.1.1', deskripsi: 'HIRADC dilaksanakan pada setiap tahap perancangan dan modifikasi.' },
  { id: '3.1.2', elemen: 3, subElemen: '3.1', kode: '3.1.2', deskripsi: 'Prosedur dan instruksi kerja K3 dikembangkan berdasarkan hasil perancangan.' },
  { id: '3.1.3', elemen: 3, subElemen: '3.1', kode: '3.1.3', deskripsi: 'Aspek K3 diverifikasi dalam setiap tahap perancangan.' },
  { id: '3.1.4', elemen: 3, subElemen: '3.1', kode: '3.1.4', deskripsi: 'Perubahan dan modifikasi dikendalikan untuk mencegah risiko baru.' },
  { id: '3.2.1', elemen: 3, subElemen: '3.2', kode: '3.2.1', deskripsi: 'HIRADC dilaksanakan pada tahap pengadaan barang dan jasa.' },
  { id: '3.2.2', elemen: 3, subElemen: '3.2', kode: '3.2.2', deskripsi: 'Tinjauan kontrak mencakup persyaratan K3 dari berbagai pihak.' },
  { id: '3.2.3', elemen: 3, subElemen: '3.2', kode: '3.2.3', deskripsi: 'Kemampuan K3 pemasok dievaluasi sebelum kontrak ditandatangani.' },
  { id: '3.2.4', elemen: 3, subElemen: '3.2', kode: '3.2.4', deskripsi: 'Tinjauan kontrak K3 terdokumentasi.' },

  // ── Elemen 4: Pengendalian Dokumen ──
  { id: '4.1.1', elemen: 4, subElemen: '4.1', kode: '4.1.1', deskripsi: 'Dokumen K3 diidentifikasi, diberi nomor, dan dikendalikan.' },
  { id: '4.1.2', elemen: 4, subElemen: '4.1', kode: '4.1.2', deskripsi: 'Distribusi dokumen K3 dikendalikan untuk memastikan versi terkini digunakan.' },
  { id: '4.1.3', elemen: 4, subElemen: '4.1', kode: '4.1.3', deskripsi: 'Dokumen K3 disimpan dengan aman dan mudah ditemukan.' },
  { id: '4.1.4', elemen: 4, subElemen: '4.1', kode: '4.1.4', deskripsi: 'Dokumen K3 yang sudah tidak berlaku dikendalikan agar tidak digunakan secara tidak sengaja.' },
  { id: '4.2.1', elemen: 4, subElemen: '4.2', kode: '4.2.1', deskripsi: 'Perubahan dokumen K3 dikendalikan dan hanya personel berwenang yang dapat melakukan perubahan.' },
  { id: '4.2.2', elemen: 4, subElemen: '4.2', kode: '4.2.2', deskripsi: 'Informasi mengenai perubahan dokumen dikomunikasikan kepada pihak yang relevan.' },
  { id: '4.2.3', elemen: 4, subElemen: '4.2', kode: '4.2.3', deskripsi: 'Status dokumen K3 (berlaku/tidak berlaku) ditandai dengan jelas.' },

  // ── Elemen 5: Pembelian dan Pengendalian Produk ──
  { id: '5.1.1', elemen: 5, subElemen: '5.1', kode: '5.1.1', deskripsi: 'Aspek K3 dipertimbangkan dan diverifikasi pada proses pembelian barang/jasa.' },
  { id: '5.1.2', elemen: 5, subElemen: '5.1', kode: '5.1.2', deskripsi: 'Spesifikasi pembelian mencakup persyaratan K3.' },
  { id: '5.1.3', elemen: 5, subElemen: '5.1', kode: '5.1.3', deskripsi: 'Konsultasi K3 dilakukan sebelum pembelian barang/jasa baru.' },
  { id: '5.1.4', elemen: 5, subElemen: '5.1', kode: '5.1.4', deskripsi: 'Aspek K3 dipertimbangkan sebelum barang/jasa digunakan.' },
  { id: '5.1.5', elemen: 5, subElemen: '5.1', kode: '5.1.5', deskripsi: 'Kemampuan K3 pemasok dievaluasi secara berkala.' },
  { id: '5.2.1', elemen: 5, subElemen: '5.2', kode: '5.2.1', deskripsi: 'Barang dan jasa yang dibeli diverifikasi kesesuaiannya dengan spesifikasi K3.' },
  { id: '5.3.1', elemen: 5, subElemen: '5.3', kode: '5.3.1', deskripsi: 'Risiko K3 dari barang yang dipasok pelanggan diidentifikasi dan dikendalikan.' },
  { id: '5.4.1', elemen: 5, subElemen: '5.4', kode: '5.4.1', deskripsi: 'Produk dapat diidentifikasi dan ditelusuri sepanjang proses produksi.' },
  { id: '5.4.2', elemen: 5, subElemen: '5.4', kode: '5.4.2', deskripsi: 'Produk berisiko K3 dapat ditelusuri dan dikendalikan dari sumber ke tujuan.' },

  // ── Elemen 6: Keamanan Bekerja Berdasarkan SMK3 ──
  { id: '6.1.1', elemen: 6, subElemen: '6.1', kode: '6.1.1', deskripsi: 'Bahaya dan risiko K3 diidentifikasi dan dinilai secara sistematis.' },
  { id: '6.1.2', elemen: 6, subElemen: '6.1', kode: '6.1.2', deskripsi: 'Pengendalian risiko ditetapkan berdasarkan hirarki pengendalian.' },
  { id: '6.1.3', elemen: 6, subElemen: '6.1', kode: '6.1.3', deskripsi: 'Prosedur pengendalian risiko terdokumentasi dan diimplementasikan.' },
  { id: '6.1.4', elemen: 6, subElemen: '6.1', kode: '6.1.4', deskripsi: 'Pengendalian risiko memenuhi persyaratan perundangan K3.' },
  { id: '6.1.5', elemen: 6, subElemen: '6.1', kode: '6.1.5', deskripsi: 'Sistem izin kerja diterapkan untuk pekerjaan berisiko tinggi.' },
  { id: '6.1.6', elemen: 6, subElemen: '6.1', kode: '6.1.6', deskripsi: 'APD yang sesuai disediakan dan dipelihara secara memadai.' },
  { id: '6.1.7', elemen: 6, subElemen: '6.1', kode: '6.1.7', deskripsi: 'APD yang digunakan layak dan sesuai standar yang berlaku.' },
  { id: '6.1.8', elemen: 6, subElemen: '6.1', kode: '6.1.8', deskripsi: 'Efektivitas pengendalian risiko dievaluasi secara berkala.' },
  { id: '6.2.1', elemen: 6, subElemen: '6.2', kode: '6.2.1', deskripsi: 'Pengawasan pekerjaan dilakukan untuk memastikan prosedur K3 dipatuhi.' },
  { id: '6.2.2', elemen: 6, subElemen: '6.2', kode: '6.2.2', deskripsi: 'Pengawasan disesuaikan dengan tingkat risiko dan kompetensi tenaga kerja.' },
  { id: '6.2.3', elemen: 6, subElemen: '6.2', kode: '6.2.3', deskripsi: 'Pengawas terlibat aktif dalam proses HIRADC.' },
  { id: '6.2.4', elemen: 6, subElemen: '6.2', kode: '6.2.4', deskripsi: 'Pengawas melaksanakan investigasi kecelakaan di unitnya.' },
  { id: '6.2.5', elemen: 6, subElemen: '6.2', kode: '6.2.5', deskripsi: 'Pengawas terlibat dalam konsultasi K3 dengan tenaga kerja.' },
  { id: '6.3.1', elemen: 6, subElemen: '6.3', kode: '6.3.1', deskripsi: 'Persyaratan kesehatan dan kompetensi kerja ditetapkan untuk setiap jabatan.' },
  { id: '6.3.2', elemen: 6, subElemen: '6.3', kode: '6.3.2', deskripsi: 'Penempatan kerja mempertimbangkan kompetensi dan kondisi kesehatan tenaga kerja.' },
  { id: '6.4.1', elemen: 6, subElemen: '6.4', kode: '6.4.1', deskripsi: 'Risiko K3 pada area terbatas diidentifikasi dan dinilai.' },
  { id: '6.4.2', elemen: 6, subElemen: '6.4', kode: '6.4.2', deskripsi: 'Akses ke area terbatas dikendalikan melalui sistem izin dan pembatasan.' },
  { id: '6.4.3', elemen: 6, subElemen: '6.4', kode: '6.4.3', deskripsi: 'Fasilitas kerja yang memadai disediakan sesuai kebutuhan.' },
  { id: '6.4.4', elemen: 6, subElemen: '6.4', kode: '6.4.4', deskripsi: 'Rambu-rambu K3 dipasang di tempat yang tepat dan mudah terlihat.' },
  { id: '6.5.1', elemen: 6, subElemen: '6.5', kode: '6.5.1', deskripsi: 'Sarana produksi diperiksa dan dipelihara secara berkala.' },
  { id: '6.5.2', elemen: 6, subElemen: '6.5', kode: '6.5.2', deskripsi: 'Kegiatan pemeliharaan sarana produksi terdokumentasi.' },
  { id: '6.5.3', elemen: 6, subElemen: '6.5', kode: '6.5.3', deskripsi: 'Sarana dan peralatan yang wajib tersertifikasi memiliki sertifikat yang masih berlaku.' },
  { id: '6.5.4', elemen: 6, subElemen: '6.5', kode: '6.5.4', deskripsi: 'Petugas pemeliharaan memiliki kompetensi yang diperlukan.' },
  { id: '6.5.5', elemen: 6, subElemen: '6.5', kode: '6.5.5', deskripsi: 'Perubahan sarana produksi dikendalikan untuk mencegah risiko K3 baru.' },
  { id: '6.5.6', elemen: 6, subElemen: '6.5', kode: '6.5.6', deskripsi: 'Sistem permintaan perbaikan sarana produksi tersedia dan berfungsi.' },
  { id: '6.5.7', elemen: 6, subElemen: '6.5', kode: '6.5.7', deskripsi: 'Sistem Tag Out diterapkan untuk peralatan yang tidak aman digunakan.' },
  { id: '6.5.8', elemen: 6, subElemen: '6.5', kode: '6.5.8', deskripsi: 'Sistem Lock Out diterapkan untuk pengendalian energi berbahaya.' },
  { id: '6.5.9', elemen: 6, subElemen: '6.5', kode: '6.5.9', deskripsi: 'Keselamatan kerja pada saat pemeliharaan terjamin.' },
  { id: '6.5.10', elemen: 6, subElemen: '6.5', kode: '6.5.10', deskripsi: 'Peralatan mendapat persetujuan penggunaan setelah kegiatan pemeliharaan.' },
  { id: '6.6.1', elemen: 6, subElemen: '6.6', kode: '6.6.1', deskripsi: 'Pengendalian K3 atas jasa kontrak dari pihak ketiga dilakukan oleh perusahaan.' },
  { id: '6.6.2', elemen: 6, subElemen: '6.6', kode: '6.6.2', deskripsi: 'Kontraktor mematuhi persyaratan K3 perusahaan.' },
  { id: '6.7.1', elemen: 6, subElemen: '6.7', kode: '6.7.1', deskripsi: 'Prosedur keadaan darurat diidentifikasi dan terdokumentasi.' },
  { id: '6.7.2', elemen: 6, subElemen: '6.7', kode: '6.7.2', deskripsi: 'Sarana tanggap darurat disediakan dan diuji secara berkala.' },
  { id: '6.7.3', elemen: 6, subElemen: '6.7', kode: '6.7.3', deskripsi: 'Simulasi keadaan darurat dilaksanakan secara periodik.' },
  { id: '6.7.4', elemen: 6, subElemen: '6.7', kode: '6.7.4', deskripsi: 'Petugas keadaan darurat ditetapkan dan dilatih secara memadai.' },
  { id: '6.7.5', elemen: 6, subElemen: '6.7', kode: '6.7.5', deskripsi: 'Prosedur darurat dikomunikasikan kepada seluruh tenaga kerja dan pihak terkait.' },
  { id: '6.7.6', elemen: 6, subElemen: '6.7', kode: '6.7.6', deskripsi: 'Peralatan darurat diperiksa secara berkala untuk memastikan kesiapannya.' },
  { id: '6.7.7', elemen: 6, subElemen: '6.7', kode: '6.7.7', deskripsi: 'Sarana darurat ditempatkan di lokasi yang mudah dijangkau dan jumlahnya memadai.' },
  { id: '6.8.1', elemen: 6, subElemen: '6.8', kode: '6.8.1', deskripsi: 'Sistem P3K dievaluasi kecukupannya secara berkala.' },
  { id: '6.8.2', elemen: 6, subElemen: '6.8', kode: '6.8.2', deskripsi: 'Petugas P3K ditunjuk dan dilatih sesuai ketentuan.' },
  { id: '6.9.1', elemen: 6, subElemen: '6.9', kode: '6.9.1', deskripsi: 'Rencana pemulihan pasca kecelakaan kerja tersedia dan terdokumentasi.' },

  // ── Elemen 7: Standar Pemantauan ──
  { id: '7.1.1', elemen: 7, subElemen: '7.1', kode: '7.1.1', deskripsi: 'Inspeksi K3 dilaksanakan secara teratur sesuai jadwal.' },
  { id: '7.1.2', elemen: 7, subElemen: '7.1', kode: '7.1.2', deskripsi: 'Petugas inspeksi K3 memiliki kompetensi yang diperlukan.' },
  { id: '7.1.3', elemen: 7, subElemen: '7.1', kode: '7.1.3', deskripsi: 'Tenaga kerja dilibatkan dalam pelaksanaan inspeksi K3.' },
  { id: '7.1.4', elemen: 7, subElemen: '7.1', kode: '7.1.4', deskripsi: 'Checklist inspeksi K3 digunakan dan terdokumentasi.' },
  { id: '7.1.5', elemen: 7, subElemen: '7.1', kode: '7.1.5', deskripsi: 'Hasil inspeksi K3 dilaporkan kepada manajemen secara berkala.' },
  { id: '7.1.6', elemen: 7, subElemen: '7.1', kode: '7.1.6', deskripsi: 'Penanggung jawab tindakan perbaikan hasil inspeksi ditetapkan.' },
  { id: '7.1.7', elemen: 7, subElemen: '7.1', kode: '7.1.7', deskripsi: 'Tindakan perbaikan hasil inspeksi dipantau pelaksanaannya.' },
  { id: '7.2.1', elemen: 7, subElemen: '7.2', kode: '7.2.1', deskripsi: 'Pemantauan lingkungan kerja dilaksanakan secara berkala.' },
  { id: '7.2.2', elemen: 7, subElemen: '7.2', kode: '7.2.2', deskripsi: 'Ruang lingkup pengukuran lingkungan kerja mencakup semua faktor bahaya yang relevan.' },
  { id: '7.2.3', elemen: 7, subElemen: '7.2', kode: '7.2.3', deskripsi: 'Petugas pengukuran lingkungan kerja memiliki kompetensi yang diperlukan.' },
  { id: '7.3.1', elemen: 7, subElemen: '7.3', kode: '7.3.1', deskripsi: 'Alat ukur dan uji K3 diidentifikasi, dikalibrasi, dan dikendalikan.' },
  { id: '7.3.2', elemen: 7, subElemen: '7.3', kode: '7.3.2', deskripsi: 'Alat ukur dan uji K3 dipelihara dan dikalibrasi secara berkala.' },
  { id: '7.4.1', elemen: 7, subElemen: '7.4', kode: '7.4.1', deskripsi: 'Pemantauan kesehatan tenaga kerja dilaksanakan secara berkala.' },
  { id: '7.4.2', elemen: 7, subElemen: '7.4', kode: '7.4.2', deskripsi: 'Kebutuhan pemeriksaan kesehatan berdasarkan risiko pekerjaan diidentifikasi.' },
  { id: '7.4.3', elemen: 7, subElemen: '7.4', kode: '7.4.3', deskripsi: 'Pemeriksaan kesehatan dilaksanakan oleh dokter yang ditunjuk perusahaan.' },
  { id: '7.4.4', elemen: 7, subElemen: '7.4', kode: '7.4.4', deskripsi: 'Layanan kesehatan kerja tersedia bagi seluruh tenaga kerja.' },
  { id: '7.4.5', elemen: 7, subElemen: '7.4', kode: '7.4.5', deskripsi: 'Catatan kesehatan kerja terdokumentasi dan dijaga kerahasiaannya.' },

  // ── Elemen 8: Pelaporan dan Perbaikan Kekurangan ──
  { id: '8.1.1', elemen: 8, subElemen: '8.1', kode: '8.1.1', deskripsi: 'Sistem pelaporan bahaya K3 tersedia dan dapat diakses oleh seluruh tenaga kerja.' },
  { id: '8.2.1', elemen: 8, subElemen: '8.2', kode: '8.2.1', deskripsi: 'Sistem pelaporan dan pencatatan kecelakaan dan penyakit akibat kerja sesuai ketentuan.' },
  { id: '8.3.1', elemen: 8, subElemen: '8.3', kode: '8.3.1', deskripsi: 'Prosedur investigasi kecelakaan kerja terdokumentasi dan diimplementasikan.' },
  { id: '8.3.2', elemen: 8, subElemen: '8.3', kode: '8.3.2', deskripsi: 'Investigasi kecelakaan dilaksanakan oleh personel yang kompeten.' },
  { id: '8.3.3', elemen: 8, subElemen: '8.3', kode: '8.3.3', deskripsi: 'Hasil investigasi kecelakaan dilaporkan kepada manajemen.' },
  { id: '8.3.4', elemen: 8, subElemen: '8.3', kode: '8.3.4', deskripsi: 'Penanggung jawab tindakan perbaikan hasil investigasi ditetapkan.' },
  { id: '8.3.5', elemen: 8, subElemen: '8.3', kode: '8.3.5', deskripsi: 'Hasil tindakan perbaikan dikomunikasikan kepada tenaga kerja.' },
  { id: '8.3.6', elemen: 8, subElemen: '8.3', kode: '8.3.6', deskripsi: 'Tindakan perbaikan hasil investigasi dipantau pelaksanaannya.' },
  { id: '8.4.1', elemen: 8, subElemen: '8.4', kode: '8.4.1', deskripsi: 'Permasalahan K3 ditangani melalui prosedur yang sistematis.' },

  // ── Elemen 9: Pengelolaan Material dan Perpindahannya ──
  { id: '9.1.1', elemen: 9, subElemen: '9.1', kode: '9.1.1', deskripsi: 'HIRADC dilaksanakan untuk penanganan material secara manual dan mekanis.' },
  { id: '9.1.2', elemen: 9, subElemen: '9.1', kode: '9.1.2', deskripsi: 'Petugas penanganan material memiliki kompetensi yang diperlukan.' },
  { id: '9.1.3', elemen: 9, subElemen: '9.1', kode: '9.1.3', deskripsi: 'Risiko penanganan material dikendalikan secara memadai.' },
  { id: '9.1.4', elemen: 9, subElemen: '9.1', kode: '9.1.4', deskripsi: 'Prosedur penanganan tumpahan dan kebocoran tersedia dan diimplementasikan.' },
  { id: '9.2.1', elemen: 9, subElemen: '9.2', kode: '9.2.1', deskripsi: 'Penyimpanan dan pemindahan material dilakukan sesuai prosedur K3.' },
  { id: '9.2.2', elemen: 9, subElemen: '9.2', kode: '9.2.2', deskripsi: 'Material yang rusak dan kadaluarsa diidentifikasi dan dikendalikan.' },
  { id: '9.2.3', elemen: 9, subElemen: '9.2', kode: '9.2.3', deskripsi: 'Pembuangan material dilakukan secara aman dan sesuai ketentuan lingkungan.' },
  { id: '9.3.1', elemen: 9, subElemen: '9.3', kode: '9.3.1', deskripsi: 'Bahan kimia berbahaya (B3) dikelola sesuai ketentuan perundangan yang berlaku.' },
  { id: '9.3.2', elemen: 9, subElemen: '9.3', kode: '9.3.2', deskripsi: 'MSDS (Material Safety Data Sheet) tersedia untuk semua bahan kimia berbahaya.' },
  { id: '9.3.3', elemen: 9, subElemen: '9.3', kode: '9.3.3', deskripsi: 'Bahan kimia berbahaya diidentifikasi dan diberi label sesuai ketentuan.' },
  { id: '9.3.4', elemen: 9, subElemen: '9.3', kode: '9.3.4', deskripsi: 'Rambu bahaya bahan kimia berbahaya dipasang di tempat penyimpanan.' },
  { id: '9.3.5', elemen: 9, subElemen: '9.3', kode: '9.3.5', deskripsi: 'Personel yang menangani bahan kimia berbahaya memiliki kompetensi yang diperlukan.' },

  // ── Elemen 10: Pengumpulan dan Penggunaan Data ──
  { id: '10.1.1', elemen: 10, subElemen: '10.1', kode: '10.1.1', deskripsi: 'Catatan K3 dikelola dan dipelihara sesuai ketentuan.' },
  { id: '10.1.2', elemen: 10, subElemen: '10.1', kode: '10.1.2', deskripsi: 'Regulasi dan standar K3 dipelihara dalam kondisi terkini.' },
  { id: '10.1.3', elemen: 10, subElemen: '10.1', kode: '10.1.3', deskripsi: 'Kerahasiaan catatan K3 yang bersifat sensitif dijaga.' },
  { id: '10.1.4', elemen: 10, subElemen: '10.1', kode: '10.1.4', deskripsi: 'Catatan kompensasi dan rehabilitasi tenaga kerja terdokumentasi.' },
  { id: '10.2.1', elemen: 10, subElemen: '10.2', kode: '10.2.1', deskripsi: 'Data K3 dikumpulkan dan dianalisis untuk mendukung pengambilan keputusan.' },
  { id: '10.2.2', elemen: 10, subElemen: '10.2', kode: '10.2.2', deskripsi: 'Kinerja K3 dilaporkan secara berkala kepada manajemen.' },

  // ── Elemen 11: Pemeriksaan SMK3 ──
  { id: '11.1.1', elemen: 11, subElemen: '11.1', kode: '11.1.1', deskripsi: 'Audit internal SMK3 dilaksanakan secara berkala sesuai jadwal.' },
  { id: '11.1.2', elemen: 11, subElemen: '11.1', kode: '11.1.2', deskripsi: 'Auditor internal SMK3 memiliki kompetensi dan independensi yang diperlukan.' },
  { id: '11.1.3', elemen: 11, subElemen: '11.1', kode: '11.1.3', deskripsi: 'Hasil audit internal dilaporkan dan ditindaklanjuti secara nyata.' },

  // ── Elemen 12: Pengembangan Keterampilan dan Kemampuan ──
  { id: '12.1.1', elemen: 12, subElemen: '12.1', kode: '12.1.1', deskripsi: 'Analisis kebutuhan pelatihan K3 dilaksanakan secara teratur.' },
  { id: '12.1.2', elemen: 12, subElemen: '12.1', kode: '12.1.2', deskripsi: 'Program pelatihan K3 direncanakan berdasarkan hasil analisis kebutuhan.' },
  { id: '12.1.3', elemen: 12, subElemen: '12.1', kode: '12.1.3', deskripsi: 'Jenis pelatihan K3 ditetapkan sesuai kebutuhan masing-masing jabatan.' },
  { id: '12.1.4', elemen: 12, subElemen: '12.1', kode: '12.1.4', deskripsi: 'Penyedia pelatihan K3 memiliki kompetensi yang diperlukan.' },
  { id: '12.1.5', elemen: 12, subElemen: '12.1', kode: '12.1.5', deskripsi: 'Fasilitas dan sumber daya pelatihan K3 memadai.' },
  { id: '12.1.6', elemen: 12, subElemen: '12.1', kode: '12.1.6', deskripsi: 'Dokumentasi pelatihan K3 tersimpan dengan baik.' },
  { id: '12.1.7', elemen: 12, subElemen: '12.1', kode: '12.1.7', deskripsi: 'Program pelatihan K3 ditinjau efektivitasnya secara berkala.' },
  { id: '12.2.1', elemen: 12, subElemen: '12.2', kode: '12.2.1', deskripsi: 'Manajemen mendapat pelatihan K3 yang sesuai dengan tanggung jawabnya.' },
  { id: '12.2.2', elemen: 12, subElemen: '12.2', kode: '12.2.2', deskripsi: 'Pengawas dan penyelia mendapat pelatihan K3 sesuai kebutuhan.' },
  { id: '12.3.1', elemen: 12, subElemen: '12.3', kode: '12.3.1', deskripsi: 'Tenaga kerja mendapat pelatihan K3 sesuai kebutuhan dan risiko pekerjaannya.' },
  { id: '12.3.2', elemen: 12, subElemen: '12.3', kode: '12.3.2', deskripsi: 'Pelatihan K3 dilaksanakan ketika ada perubahan proses atau metode kerja.' },
  { id: '12.3.3', elemen: 12, subElemen: '12.3', kode: '12.3.3', deskripsi: 'Pelatihan K3 penyegaran dilaksanakan secara berkala.' },
  { id: '12.4.1', elemen: 12, subElemen: '12.4', kode: '12.4.1', deskripsi: 'Briefing K3 diberikan kepada pengunjung dan mitra kerja sebelum memasuki area kerja.' },
  { id: '12.5.1', elemen: 12, subElemen: '12.5', kode: '12.5.1', deskripsi: 'Lisensi dan kualifikasi kerja untuk pekerjaan khusus dikendalikan agar selalu berlaku.' },
];

// ── Divisi dan PIC ─────────────────────────────────────────────────────────

export interface Divisi {
  id: string;
  namaDivisi: string;
  idPIC: string;
  namaPIC: string;
}

export const DIVISI_LIST: Divisi[] = [
  { id: 'DIV-001', namaDivisi: 'HSE (Health, Safety & Environment)', idPIC: '82400101', namaPIC: 'Ahmad Fauzan' },
  { id: 'DIV-002', namaDivisi: 'Produksi – Cathode', idPIC: '82400102', namaPIC: 'Budi Santoso' },
  { id: 'DIV-003', namaDivisi: 'Produksi – Anode', idPIC: '82400103', namaPIC: 'Candra Wijaya' },
  { id: 'DIV-004', namaDivisi: 'Produksi – Electrolyte', idPIC: '82400104', namaPIC: 'Dian Pratama' },
  { id: 'DIV-005', namaDivisi: 'Produksi – Cell Assembly', idPIC: '82400105', namaPIC: 'Eko Susilo' },
  { id: 'DIV-006', namaDivisi: 'Quality Control (QC)', idPIC: '82400106', namaPIC: 'Fajar Nugroho' },
  { id: 'DIV-007', namaDivisi: 'Quality Assurance (QA)', idPIC: '82400107', namaPIC: 'Gunawan Wibowo' },
  { id: 'DIV-008', namaDivisi: 'Maintenance & Engineering', idPIC: '82400108', namaPIC: 'Hendra Kusuma' },
  { id: 'DIV-009', namaDivisi: 'Research & Development (R&D)', idPIC: '82400109', namaPIC: 'Irfan Maulana' },
  { id: 'DIV-010', namaDivisi: 'Warehouse & Logistik', idPIC: '82400110', namaPIC: 'Joko Purnomo' },
  { id: 'DIV-011', namaDivisi: 'Supply Chain Management', idPIC: '82400111', namaPIC: 'Khoirul Anam' },
  { id: 'DIV-012', namaDivisi: 'Human Resources (HR)', idPIC: '82400112', namaPIC: 'Lina Marlinda' },
  { id: 'DIV-013', namaDivisi: 'Finance & Accounting', idPIC: '82400113', namaPIC: 'Muhammad Rizki' },
  { id: 'DIV-014', namaDivisi: 'Purchasing', idPIC: '82400114', namaPIC: 'Nadia Permatasari' },
  { id: 'DIV-015', namaDivisi: 'General Affairs (GA)', idPIC: '82400115', namaPIC: 'Oscar Hidayat' },
  { id: 'DIV-016', namaDivisi: 'Information Technology (IT)', idPIC: '82400116', namaPIC: 'Putri Rahayu' },
  { id: 'DIV-017', namaDivisi: 'Environment & Sustainability', idPIC: '82400117', namaPIC: 'Qomar Alfarisi' },
  { id: 'DIV-018', namaDivisi: 'Security & K3', idPIC: '82400118', namaPIC: 'Rizal Dermawan' },
  { id: 'DIV-019', namaDivisi: 'Process Engineering', idPIC: '82400119', namaPIC: 'Siti Fatimah' },
  { id: 'DIV-020', namaDivisi: 'Utility & Fasilitas', idPIC: '82400120', namaPIC: 'Taufik Hidayatullah' },
];

// ── Helper functions ───────────────────────────────────────────────────────

/** Group kriteria by elemen number */
export function groupKriteriaByElemen(kriteria: KriteriaSMK3[]) {
  return kriteria.reduce((acc, k) => {
    if (!acc[k.elemen]) acc[k.elemen] = [];
    acc[k.elemen].push(k);
    return acc;
  }, {} as Record<number, KriteriaSMK3[]>);
}

/** Get Divisi by ID */
export function getDivisiById(id: string): Divisi | undefined {
  return DIVISI_LIST.find((d) => d.id === id);
}

/** Get Kriteria by ID */
export function getKriteriaById(id: string): KriteriaSMK3 | undefined {
  return KRITERIA_SMK3.find((k) => k.id === id);
}
