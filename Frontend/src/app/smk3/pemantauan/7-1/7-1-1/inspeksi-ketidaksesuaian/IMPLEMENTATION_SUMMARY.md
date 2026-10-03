# Implementasi Page 7.1.1.1 - Inspeksi Ketidaksesuaian

## Status Workflow yang Diimplementasikan

### OPEN (Draft - Dapat Diedit)
- Data baru disimpan dengan status **OPEN** saat user menekan **Enter** atau klik tombol "Simpan sebagai OPEN"
- Status OPEN = data masih draft, user masih bisa edit berkali-kali
- Hanya **pemilik data** (createdById) atau **admin** yang bisa edit data OPEN
- Tombol tersedia: **Ubah Data**, **Submit → INPG**

### INPG (In Progress - Terkunci)
- Data berubah ke **INPG** saat user menekan tombol **"Submit → INPG"**
- Setelah INPG, data **tidak bisa diedit lagi** sama sekali (locked forever)
- INPG = data sudah disubmit, menunggu perbaikan dan penutupan
- Hanya supervisor/admin yang bisa melihat catatan bahwa CLSD dilakukan di page 7.1.7

### CLSD (Closed - Selesai)
- Status CLSD **hanya bisa diubah oleh supervisor/admin** di **page 7.1.7** (bukan di 7.1.1)
- CLSD = temuan sudah diperbaiki dan ditutup
- Data CLSD juga locked, tidak bisa diedit

---

## Fitur yang Diimplementasikan

### 1. Auto-Save dengan Enter
- User isi form → tekan **Enter** → otomatis simpan sebagai **OPEN**
- Data tersimpan di backend dengan `findingStatus: "OPEN"`
- User bisa terus edit data OPEN sampai siap untuk submit

### 2. Workflow Buttons
Di panel detail (saat record dipilih):
- **Ubah Data** - muncul hanya untuk record OPEN, owner atau admin
- **Submit → INPG** - ubah OPEN ke INPG (konfirmasi required)
- **Hapus** - hanya admin yang bisa delete record

Di toolbar (panel kiri):
- **Tambah [N]** - buka form baru
- Filter status: **Semua**, **OPEN**, **INPG**, **CLSD**
- Search box dengan placeholder "Cari... [/]"

### 3. Search & Filter
Filter yang tersedia:
- **Tanggal** - filter berdasarkan tanggalInspeksi (dalam API: tanggalDari, tanggalSampai)
- **Status** - dropdown OPEN/INPG/CLSD (dalam API: status)
- **ID Karyawan** - text search (dalam API: idKaryawan)
- **Search umum** - cari di semua field termasuk nama, lokasi, deskripsi

### 4. Permission Control
**User biasa:**
- Hanya bisa lihat record yang `createdById` = ID user tersebut
- Bisa edit hanya record OPEN milik sendiri
- Bisa submit OPEN → INPG milik sendiri

**Supervisor:**
- Bisa lihat semua record dari semua user
- Bisa edit record OPEN milik siapapun (sebagai admin)
- Bisa CLSD record INPG di page 7.1.7

**Admin:**
- Akses penuh: lihat semua, edit OPEN, delete record
- Bisa edit record OPEN milik siapapun

### 5. Image Preview
- Upload foto → langsung tampil preview embed di form
- Di detail panel → foto hazard dan foto perbaikan ditampilkan full width
- Tidak perlu klik untuk lihat, langsung embed

### 6. Form Lock
- Record dengan status **INPG** atau **CLSD** tidak bisa diedit
- Fungsi `openEditPanel()` mengecek: jika bukan OPEN, tampilkan alert
- Button "Ubah Data" hanya muncul untuk record OPEN

### 7. Kolom Status Terlihat
- Badge status (OPEN/INPG/CLSD) ditampilkan di:
  - List record (panel kiri) - setiap card
  - Detail panel - di header
  - Summary count - total per status di atas list
- Warna badge:
  - OPEN = biru (blue-50/700)
  - INPG = amber/kuning (amber-50/700)
  - CLSD = hijau (green-50/700)

---

## API Endpoints yang Digunakan

### GET /api/smk3-data
Query params:
- `subSubElementId=7.1.1-inspeksi-ketidaksesuaian`
- `tanggalDari` (optional)
- `tanggalSampai` (optional)
- `status` (optional) - OPEN/INPG/CLSD
- `idKaryawan` (optional)
- `search` (optional)

Permission: User hanya dapat record milik sendiri, supervisor/admin dapat semua

### POST /api/smk3-data
Body: FormData dengan:
- `subSubElementId`
- `title`
- `findingStatus` = **"OPEN"** (default)
- Field-field form lainnya
- File uploads

Return: Record baru dengan status OPEN

### PATCH /api/smk3-data
Body: JSON
```json
{
  "id": "record_id",
  "action": "submit_inpg"
}
```

Fungsi: Ubah status dari OPEN → INPG
Validasi: Hanya boleh submit jika status = OPEN

### PUT /api/smk3-data (Admin only)
Body: FormData dengan `id` dan field yang diupdate
Permission: Hanya admin

### DELETE /api/smk3-data (Admin only)
Query: `?id=record_id`
Permission: Hanya admin

---

## File yang Dimodifikasi

1. **page.tsx** - UI lengkap dengan split panel, auto-save, workflow buttons
2. **route.ts** - API dengan filter, permission, submit_inpg action
3. **Finding.ts** - Model dengan status OPEN/INPG/CLSD
4. **subSubElement.ts** - TypeScript types dengan FindingStatus enum

---

## Keyboard Shortcuts

- **N** - Tambah temuan baru
- **/** - Focus ke search box
- **↑/↓** - Navigasi list
- **Esc** - Tutup panel / blur search
- **Enter** - Auto-save sebagai OPEN (saat di form)

---

## Cara Penggunaan

### Menambah Temuan Baru
1. Tekan **N** atau klik tombol "Tambah"
2. Isi form (safety officer otomatis terisi dari login)
3. Tekan **Enter** atau klik "Simpan sebagai OPEN"
4. Data tersimpan dengan status OPEN

### Mengedit Temuan OPEN
1. Pilih record OPEN dari list
2. Klik tombol "Ubah Data"
3. Edit field yang diperlukan
4. Tekan **Enter** untuk save

### Submit ke INPG
1. Pilih record OPEN yang sudah siap
2. Klik tombol "Submit → INPG"
3. Konfirmasi (data akan locked)
4. Status berubah ke INPG, tidak bisa edit lagi

### Pencarian
1. Gunakan filter status chip (Semua/OPEN/INPG/CLSD)
2. Ketik kata kunci di search box
3. Filter otomatis applied, hasil muncul langsung

---

## Catatan Penting

- Status **OPEN** adalah satu-satunya status yang editable
- Setelah **Submit → INPG**, data permanently locked
- **CLSD** hanya bisa dilakukan di page **7.1.7** oleh supervisor
- User biasa hanya melihat data sendiri (privacy)
- Image preview langsung embed, tidak perlu click
- Semua action memerlukan autentikasi (session check)

