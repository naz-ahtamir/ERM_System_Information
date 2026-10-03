# Smoke Test Document — C.R.A.C.K SMK3 API

**Proyek:** C.R.A.C.K Backend (SMK3 API Server)  
**Base URL:** `http://localhost:3001`  
**Swagger UI:** `http://localhost:3001/api/docs`  
**Tanggal Dokumen:** 2026-09-18  
**Versi:** 1.0

---

## Tujuan

Smoke test ini memverifikasi bahwa semua endpoint utama API dapat diakses dan merespons dengan benar setelah deployment atau perubahan kode. Bukan pengujian fungsional mendalam — hanya memastikan sistem "tidak mati" (sanity check).

---

## Persiapan

### Prasyarat
- Server backend berjalan di `http://localhost:3001`
- Database PostgreSQL terkoneksi
- Minimal 1 user admin sudah terseed (jalankan `node scripts/seed-admin.js`)

### Variabel yang Dibutuhkan

Sebelum menjalankan test, simpan nilai berikut setelah login berhasil:

| Variabel | Keterangan |
|---|---|
| `{{TOKEN}}` | JWT Bearer token dari response login |
| `{{USER_ID}}` | UUID user yang sedang login |
| `{{DEPT_ID}}` | UUID departemen (didapat setelah GET departments) |
| `{{FINDING_ID}}` | UUID finding (didapat setelah POST finding) |
| `{{DOC_ID}}` | UUID dokumen (didapat setelah POST document) |
| `{{POLICY_ID}}` | UUID K3 Policy |
| `{{OBJEK_ID}}` | UUID Objek K3 |
| `{{DRILL_ID}}` | UUID Emergency Drill |
| `{{INVEST_ID}}` | UUID Investigation |
| `{{INDUCTION_ID}}` | UUID Induction Session |

---

## Status Kode yang Diharapkan

| Kode | Arti |
|---|---|
| `200` | OK — request berhasil |
| `201` | Created — resource berhasil dibuat |
| `400` | Bad Request — input tidak valid |
| `401` | Unauthorized — token tidak ada/invalid |
| `404` | Not Found — resource tidak ditemukan |
| `409` | Conflict — data duplikat |

---

## Checklist Smoke Test

### ✅ TC-00 — Health Check

| # | Test Case | Method | Endpoint | Expected Status | Catatan |
|---|---|---|---|---|---|
| TC-00-01 | Server berjalan | GET | `/` | `200` | Response berisi pesan welcome |
| TC-00-02 | Swagger UI accessible | GET | `/api/docs` | `200` | HTML Swagger terbuka |

---

### ✅ TC-01 — Auth & User Management

**Base path:** `/api/auth`

| # | Test Case | Method | Endpoint | Auth | Body / Params | Expected Status |
|---|---|---|---|---|---|---|
| TC-01-01 | Login dengan kredensial valid | POST | `/api/auth/login` | ❌ | `{"idKaryawan":"EMP-001","password":"password123"}` | `200` + JWT token |
| TC-01-02 | Login dengan password salah | POST | `/api/auth/login` | ❌ | `{"idKaryawan":"EMP-001","password":"salah"}` | `401` |
| TC-01-03 | Login dengan user tidak ada | POST | `/api/auth/login` | ❌ | `{"idKaryawan":"TIDAK-ADA","password":"x"}` | `401` |
| TC-01-04 | Get semua user | GET | `/api/auth/users` | ❌ | — | `200` + array |
| TC-01-05 | Get user by UUID | GET | `/api/auth/users/{{USER_ID}}` | ✅ Bearer | — | `200` + user object |
| TC-01-06 | Get user by ID Karyawan | GET | `/api/auth/users/by-id-karyawan/EMP-001` | ✅ Bearer | — | `200` |
| TC-01-07 | Akses endpoint protected tanpa token | GET | `/api/auth/users/{{USER_ID}}` | ❌ | — | `401` |
| TC-01-08 | Update profil user | PATCH | `/api/auth/users/{{USER_ID}}` | ✅ Bearer | `{"nama":"Test User Update"}` | `200` |
| TC-01-09 | Update role user | PATCH | `/api/auth/users/{{USER_ID}}/role` | ✅ Bearer | `{"role":"supervisor"}` | `200` |
| TC-01-10 | Assign supervisor | PATCH | `/api/auth/users/{{USER_ID}}/supervisor` | ✅ Bearer | `{"supervisorId":null}` | `200` |
| TC-01-11 | Deactivate user | PATCH | `/api/auth/users/{{USER_ID}}/deactivate` | ✅ Bearer | — | `200` |
| TC-01-12 | Activate user kembali | PATCH | `/api/auth/users/{{USER_ID}}/activate` | ✅ Bearer | — | `200` |
| TC-01-13 | Change password (me) | POST | `/api/auth/me/change-password` | ✅ Bearer | `{"oldPassword":"password123","newPassword":"newpass123"}` | `200` |

**Verifikasi TC-01-01:**
```json
// Expected response body
{
  "access_token": "<string>",
  "user": {
    "id": "<uuid>",
    "idKaryawan": "EMP-001",
    "nama": "<string>",
    "role": "admin"
  }
}
```

---

### ✅ TC-02 — Departments

**Base path:** `/api/departments`  
**Auth:** Semua endpoint butuh Bearer token

| # | Test Case | Method | Endpoint | Body | Expected Status |
|---|---|---|---|---|---|
| TC-02-01 | Get semua departemen | GET | `/api/departments` | — | `200` + array |
| TC-02-02 | Buat departemen baru | POST | `/api/departments` | `{"name":"HSE Department","code":"HSE"}` | `201` |
| TC-02-03 | Buat departemen dengan kode duplikat | POST | `/api/departments` | `{"name":"HSE Dup","code":"HSE"}` | `409` |
| TC-02-04 | Get detail satu departemen | GET | `/api/departments/{{DEPT_ID}}` | — | `200` |
| TC-02-05 | Get departemen tidak ada | GET | `/api/departments/invalid-id` | — | `404` |
| TC-02-06 | Update departemen | PUT | `/api/departments/{{DEPT_ID}}` | `{"name":"HSE Updated"}` | `200` |
| TC-02-07 | Seed banyak departemen | POST | `/api/departments/seed` | `{"departments":[{"name":"Produksi","code":"PROD"}]}` | `200` |
| TC-02-08 | Hapus departemen | DELETE | `/api/departments/{{DEPT_ID}}` | — | `200` |

---

### ✅ TC-03 — SMK3 Findings

**Base path:** `/api/smk3-data`  
**Auth:** Semua endpoint butuh Bearer token

| # | Test Case | Method | Endpoint | Body | Expected Status |
|---|---|---|---|---|---|
| TC-03-01 | Buat finding baru | POST | `/api/smk3-data` | `{"subElementId":"SE-001","title":"Tidak ada APAR","data":{}}` | `201` |
| TC-03-02 | Get semua finding | GET | `/api/smk3-data` | — | `200` + array |
| TC-03-03 | Get finding dengan filter status | GET | `/api/smk3-data?findingStatus=INPG` | — | `200` |
| TC-03-04 | Get finding dengan filter departemen | GET | `/api/smk3-data?departemen=HSE` | — | `200` |
| TC-03-05 | Get detail satu finding | GET | `/api/smk3-data/{{FINDING_ID}}` | — | `200` |
| TC-03-06 | Get finding tidak ada | GET | `/api/smk3-data/invalid-id` | — | `404` |
| TC-03-07 | Update finding | PUT | `/api/smk3-data/{{FINDING_ID}}` | `{"title":"Updated Title"}` | `200` |
| TC-03-08 | Update status finding (approve) | PATCH | `/api/smk3-data/{{FINDING_ID}}/status` | `{"approvalStatus":"ACC","approvalNote":"OK"}` | `200` |
| TC-03-09 | Update status finding (reject) | PATCH | `/api/smk3-data/{{FINDING_ID}}/status` | `{"approvalStatus":"TACC","approvalNote":"Perlu revisi"}` | `200` |
| TC-03-10 | Get deadline reminders | GET | `/api/smk3-data/deadline-reminders` | — | `200` |
| TC-03-11 | Soft delete finding | DELETE | `/api/smk3-data/{{FINDING_ID}}` | — | `200` |

**Verifikasi TC-03-01:**
```json
// Expected response body
{
  "id": "<uuid>",
  "subElementId": "SE-001",
  "title": "Tidak ada APAR",
  "findingStatus": "INPG",
  "createdById": "<uuid>",
  "createdAt": "<timestamp>"
}
```

---

### ✅ TC-04 — Notifications

**Base path:** `/api/notifications`  
**Auth:** Semua endpoint butuh Bearer token

| # | Test Case | Method | Endpoint | Body | Expected Status |
|---|---|---|---|---|---|
| TC-04-01 | Get notifikasi user | GET | `/api/notifications` | — | `200` + array |
| TC-04-02 | Get notifikasi dengan limit | GET | `/api/notifications?limit=5` | — | `200` + max 5 items |
| TC-04-03 | Get unread count | GET | `/api/notifications/unread-count` | — | `200` + `{"count":N}` |
| TC-04-04 | Mark semua notifikasi dibaca | PATCH | `/api/notifications/read-all` | — | `200` + `{"count":N}` |
| TC-04-05 | Mark satu notifikasi dibaca | PATCH | `/api/notifications/{{NOTIF_ID}}/read` | — | `200` |
| TC-04-06 | Buat notifikasi (admin) | POST | `/api/notifications` | `{"userId":"{{USER_ID}}","type":"finding_submitted","title":"Test","message":"Test msg"}` | `201` |

---

### ✅ TC-05 — Documents (Master List Dokumen)

**Base path:** `/api/documents`  
**Auth:** Semua endpoint butuh Bearer token

| # | Test Case | Method | Endpoint | Body | Expected Status |
|---|---|---|---|---|---|
| TC-05-01 | Get semua dokumen | GET | `/api/documents` | — | `200` + array |
| TC-05-02 | Get dokumen filter departemenId | GET | `/api/documents?departemenId={{DEPT_ID}}` | — | `200` |
| TC-05-03 | Get dokumen filter jenisDokumen | GET | `/api/documents?jenisDokumen=SOP` | — | `200` |
| TC-05-04 | Get dokumen tree | GET | `/api/documents/tree` | — | `200` + nested structure |
| TC-05-05 | Get dokumen stats | GET | `/api/documents/stats` | — | `200` + statistik |
| TC-05-06 | Get detail satu dokumen | GET | `/api/documents/{{DOC_ID}}` | — | `200` |
| TC-05-07 | Buat dokumen (JSON) | POST | `/api/documents` | *(lihat body di bawah)* | `201` |
| TC-05-08 | Update dokumen (JSON) | PUT | `/api/documents/{{DOC_ID}}` | `{"namaDokumen":"Updated SOP"}` | `200` |
| TC-05-09 | Hapus dokumen | DELETE | `/api/documents/{{DOC_ID}}` | — | `200` |

**Body TC-05-07:**
```json
{
  "departemenId": "{{DEPT_ID}}",
  "jenisDokumen": "SOP",
  "namaDokumen": "SOP Penanganan APAR",
  "nomorDokumen": "SOP-HSE-001",
  "revisi": "00",
  "tanggalTerbit": "2026-01-15",
  "statusDokumen": "ASLI",
  "statusDistribusi": "TERKENDALI",
  "statusValidasi": "BERLAKU"
}
```

---

### ✅ TC-06 — K3 Policy

**Base path:** `/api/k3-policy`  
**Auth:** Semua endpoint butuh Bearer token

| # | Test Case | Method | Endpoint | Body | Expected Status |
|---|---|---|---|---|---|
| TC-06-01 | Get semua K3 Policy | GET | `/api/k3-policy` | — | `200` + array |
| TC-06-02 | Get satu K3 Policy | GET | `/api/k3-policy/{{POLICY_ID}}` | — | `200` |
| TC-06-03 | Get K3 Policy tidak ada | GET | `/api/k3-policy/invalid-id` | — | `404` |
| TC-06-04 | Buat K3 Policy (multipart, tanpa file) | POST | `/api/k3-policy/with-file` | *(multipart — lihat catatan)* | `201` |
| TC-06-05 | Update K3 Policy | PUT | `/api/k3-policy/with-file/{{POLICY_ID}}` | *(multipart)* | `200` |
| TC-06-06 | Hapus K3 Policy | DELETE | `/api/k3-policy/{{POLICY_ID}}` | — | `200` |

**Body TC-06-04 (multipart form-data):**
```
jenisKebijakan   = UMUM
judulKebijakan   = Kebijakan K3 PT QMB 2026
tanggalPenetapan = 2026-01-01
penandatangan    = Zhou Yang
jabatan          = Deputy Manager
statusDokumen    = ASLI
statusDistribusi = TERKENDALI
statusValidasi   = BERLAKU
```

---

### ✅ TC-07 — Objek K3

**Base path:** `/api/objek-k3`  
**Auth:** Semua endpoint butuh Bearer token

| # | Test Case | Method | Endpoint | Body | Expected Status |
|---|---|---|---|---|---|
| TC-07-01 | Get semua objek K3 | GET | `/api/objek-k3` | — | `200` + array |
| TC-07-02 | Get objek K3 filter perusahaan | GET | `/api/objek-k3?perusahaan=QMB` | — | `200` |
| TC-07-03 | Get objek K3 filter kategori | GET | `/api/objek-k3?kategori=INSTALASI_LISTRIK` | — | `200` |
| TC-07-04 | Get detail satu objek K3 | GET | `/api/objek-k3/{{OBJEK_ID}}` | — | `200` |
| TC-07-05 | Buat objek K3 | POST | `/api/objek-k3` | *(lihat body di bawah)* | `201` |
| TC-07-06 | Update objek K3 | PUT | `/api/objek-k3/{{OBJEK_ID}}` | `{"namaAlat":"Updated APAR"}` | `200` |
| TC-07-07 | Hapus objek K3 | DELETE | `/api/objek-k3/{{OBJEK_ID}}` | — | `200` |
| TC-07-08 | Get riwayat pemeriksaan | GET | `/api/objek-k3/{{OBJEK_ID}}/riwayat` | — | `200` + array |
| TC-07-09 | Tambah riwayat pemeriksaan | POST | `/api/objek-k3/{{OBJEK_ID}}/riwayat` | `{"tanggal":"2026-09-01","hasil":"Normal","catatan":"OK"}` | `201` |

**Body TC-07-05 (multipart atau JSON):**
```json
{
  "perusahaan": "QMB",
  "kategori": "INSTALASI_PROTEKSI_KEBAKARAN",
  "namaAlat": "APAR CO2",
  "noSeri": "APAR-001",
  "jumlah": 5,
  "departemenId": "{{DEPT_ID}}",
  "lokasi": "Lantai 1 - Area Produksi"
}
```

---

### ✅ TC-08 — Emergency Drill

**Base path:** `/api/emergency-drill`  
**Auth:** Semua endpoint butuh Bearer token

| # | Test Case | Method | Endpoint | Body | Expected Status |
|---|---|---|---|---|---|
| TC-08-01 | Get semua emergency drill | GET | `/api/emergency-drill` | — | `200` + array |
| TC-08-02 | Get drill filter status | GET | `/api/emergency-drill?status=NOT_COMPLETED` | — | `200` |
| TC-08-03 | Get drill filter departemen | GET | `/api/emergency-drill?departmentId={{DEPT_ID}}` | — | `200` |
| TC-08-04 | Get detail satu drill | GET | `/api/emergency-drill/{{DRILL_ID}}` | — | `200` |
| TC-08-05 | Buat emergency drill | POST | `/api/emergency-drill` | *(lihat body di bawah)* | `201` |
| TC-08-06 | Update drill (plan) | PUT | `/api/emergency-drill/{{DRILL_ID}}` | `{"notesPlan":"Updated notes"}` | `200` |
| TC-08-07 | Hapus drill | DELETE | `/api/emergency-drill/{{DRILL_ID}}` | — | `200` |

**Body TC-08-05:**
```json
{
  "planDate": "2026-10-01",
  "drillType": "FIRE",
  "scenario": "Kebakaran di area gudang bahan kimia",
  "departmentId": "{{DEPT_ID}}",
  "division": "HSE",
  "picPlan": "Ahmad Fauzi",
  "notesPlan": "Latihan evakuasi rutin tahunan"
}
```

---

### ✅ TC-09 — Investigation

**Base path:** `/api/investigations`  
**Auth:** Semua endpoint butuh Bearer token

| # | Test Case | Method | Endpoint | Body | Expected Status |
|---|---|---|---|---|---|
| TC-09-01 | Get semua investigasi | GET | `/api/investigations` | — | `200` + array |
| TC-09-02 | Get investigasi filter status | GET | `/api/investigations?status=DRAFT` | — | `200` |
| TC-09-03 | Get detail satu investigasi | GET | `/api/investigations/{{INVEST_ID}}` | — | `200` |
| TC-09-04 | Buat investigasi baru | POST | `/api/investigations` | *(lihat body di bawah)* | `201` |
| TC-09-05 | Update investigasi | PUT | `/api/investigations/{{INVEST_ID}}` | `{"catatanTambahan":"Update catatan"}` | `200` |
| TC-09-06 | Update status investigasi | PATCH | `/api/investigations/{{INVEST_ID}}/status` | `{"status":"UNDER_INVESTIGATION"}` | `200` |
| TC-09-07 | Sign approval | PATCH | `/api/investigations/{{INVEST_ID}}/sign-approval` | *(multipart — signatureApproval file)* | `200` |
| TC-09-08 | Get logs investigasi | GET | `/api/investigations/{{INVEST_ID}}/logs` | — | `200` + array |
| TC-09-09 | Hapus investigasi | DELETE | `/api/investigations/{{INVEST_ID}}` | — | `200` |

**Body TC-09-04:**
```json
{
  "tanggalKejadian": "2026-09-10",
  "waktuKejadian": "14:30",
  "lokasi": "Lantai 2 - Area Mesin",
  "area": "Produksi",
  "deskripsiKejadian": "Karyawan terpeleset di area basah",
  "jenisKecelakaan": "LUKA_RINGAN",
  "jumlahKorban": 1,
  "pelaporId": "{{USER_ID}}"
}
```

---

### ✅ TC-10 — Safety Induction

**Base path:** `/api/induction`  
**Auth:** Semua endpoint butuh Bearer token

| # | Test Case | Method | Endpoint | Body | Expected Status |
|---|---|---|---|---|---|
| TC-10-01 | Get semua sesi induction | GET | `/api/induction` | — | `200` + array |
| TC-10-02 | Get sesi filter status | GET | `/api/induction?status=INPG` | — | `200` |
| TC-10-03 | Buat sesi induction baru | POST | `/api/induction` | *(lihat body di bawah)* | `201` |
| TC-10-04 | Get detail satu sesi | GET | `/api/induction/{{INDUCTION_ID}}` | — | `200` |
| TC-10-05 | Update sesi | PUT | `/api/induction/{{INDUCTION_ID}}` | `{"topik":"K3 Dasar Updated"}` | `200` |
| TC-10-06 | Tambah peserta | POST | `/api/induction/{{INDUCTION_ID}}/participants` | *(lihat body di bawah)* | `201` |
| TC-10-07 | Get semua peserta sesi | GET | `/api/induction/{{INDUCTION_ID}}/participants` | — | `200` + array |
| TC-10-08 | Scan QR peserta | PATCH | `/api/induction/{{INDUCTION_ID}}/participants/scan` | `{"cardCode":"CARD-001"}` | `200` |
| TC-10-09 | Upload media sesi | POST | `/api/induction/{{INDUCTION_ID}}/media` | *(multipart — file)* | `201` |
| TC-10-10 | Get media sesi | GET | `/api/induction/{{INDUCTION_ID}}/media` | — | `200` + array |
| TC-10-11 | Close sesi induction | PATCH | `/api/induction/{{INDUCTION_ID}}/close` | — | `200` |
| TC-10-12 | Hapus sesi | DELETE | `/api/induction/{{INDUCTION_ID}}` | — | `200` |

**Body TC-10-03:**
```json
{
  "tanggal": "2026-10-05",
  "lokasi": "Ruang Meeting HSE",
  "topik": "K3 Dasar & APD",
  "deskripsi": "Induction untuk karyawan baru",
  "picId": "{{USER_ID}}"
}
```

**Body TC-10-06 (tambah peserta external):**
```json
{
  "nama": "Budi Santoso",
  "perusahaan": "PT Vendor ABC",
  "identitas": "KTP-123456",
  "jabatan": "Teknisi",
  "tipe": "EXTERNAL"
}
```

---

### ✅ TC-11 — File Upload

**Auth:** Semua endpoint butuh Bearer token

| # | Test Case | Method | Endpoint | Expected Status | Catatan |
|---|---|---|---|---|---|
| TC-11-01 | Upload file finding (image) | POST | `/api/smk3-data` (multipart) | `201` | Field: `dokumentasiHazard` |
| TC-11-02 | Upload file dokumen (PDF) | POST | `/api/documents/with-file` (multipart) | `201` | Field: `file`, maks 10 MB |
| TC-11-03 | Upload file K3 Policy (PDF) | POST | `/api/k3-policy/with-file` (multipart) | `201` | Field: `file` |
| TC-11-04 | Akses file yang sudah diupload | GET | `/uploads/<filename>` | `200` | Static file server |
| TC-11-05 | Upload file melebihi batas (>10 MB) | POST | endpoint manapun | `400/413` | Harus ditolak |

---

### ✅ TC-12 — Authorization (Negatif Test)

| # | Test Case | Method | Endpoint | Kondisi | Expected Status |
|---|---|---|---|---|---|
| TC-12-01 | Request tanpa token | GET | `/api/smk3-data` | No Authorization header | `401` |
| TC-12-02 | Request dengan token invalid | GET | `/api/smk3-data` | `Authorization: Bearer invalid_token` | `401` |
| TC-12-03 | Request dengan token expired | GET | `/api/smk3-data` | Token expired | `401` |
| TC-12-04 | User biasa buat notifikasi (admin only) | POST | `/api/notifications` | Role: `user` | `403` |

---

## Urutan Eksekusi yang Disarankan

Jalankan test case dalam urutan berikut untuk menghindari dependency error:

```
1. TC-00 (Health Check)
2. TC-01-01 (Login → simpan TOKEN)
3. TC-02 (Departments → simpan DEPT_ID)
4. TC-03 (Findings → simpan FINDING_ID)
5. TC-04 (Notifications)
6. TC-05 (Documents → simpan DOC_ID)
7. TC-06 (K3 Policy → simpan POLICY_ID)
8. TC-07 (Objek K3 → simpan OBJEK_ID)
9. TC-08 (Emergency Drill → simpan DRILL_ID)
10. TC-09 (Investigation → simpan INVEST_ID)
11. TC-10 (Safety Induction → simpan INDUCTION_ID)
12. TC-11 (File Upload)
13. TC-12 (Authorization Negatif)
```

---

## Hasil Smoke Test

### Format Pencatatan

Isi tabel ini saat menjalankan smoke test:

| Test Case ID | Status | Actual Response | Catatan | Tester | Tanggal |
|---|---|---|---|---|---|
| TC-00-01 | ✅ PASS / ❌ FAIL | | | | |
| TC-00-02 | ✅ PASS / ❌ FAIL | | | | |
| TC-01-01 | ✅ PASS / ❌ FAIL | | | | |
| TC-01-02 | ✅ PASS / ❌ FAIL | | | | |
| TC-01-03 | ✅ PASS / ❌ FAIL | | | | |
| TC-01-04 | ✅ PASS / ❌ FAIL | | | | |
| TC-01-05 | ✅ PASS / ❌ FAIL | | | | |
| TC-02-01 | ✅ PASS / ❌ FAIL | | | | |
| TC-02-02 | ✅ PASS / ❌ FAIL | | | | |
| TC-03-01 | ✅ PASS / ❌ FAIL | | | | |
| TC-03-02 | ✅ PASS / ❌ FAIL | | | | |
| TC-04-01 | ✅ PASS / ❌ FAIL | | | | |
| TC-04-03 | ✅ PASS / ❌ FAIL | | | | |
| TC-05-01 | ✅ PASS / ❌ FAIL | | | | |
| TC-05-05 | ✅ PASS / ❌ FAIL | | | | |
| TC-06-01 | ✅ PASS / ❌ FAIL | | | | |
| TC-07-01 | ✅ PASS / ❌ FAIL | | | | |
| TC-08-01 | ✅ PASS / ❌ FAIL | | | | |
| TC-09-01 | ✅ PASS / ❌ FAIL | | | | |
| TC-10-01 | ✅ PASS / ❌ FAIL | | | | |
| TC-11-04 | ✅ PASS / ❌ FAIL | | | | |
| TC-12-01 | ✅ PASS / ❌ FAIL | | | | |
| TC-12-02 | ✅ PASS / ❌ FAIL | | | | |

---

## Kriteria Lulus (Pass/Fail Criteria)

| Kriteria | Nilai |
|---|---|
| Minimum test case harus PASS | **90%** dari total test case |
| TC kritis yang wajib PASS | TC-01-01, TC-00-01, TC-12-01, TC-12-02 |
| Jika ada 1 TC kritis FAIL | **→ Deployment DITOLAK** |
| Jika <90% test PASS | **→ Deployment DITOLAK** |

### TC Kritis (wajib PASS semua)
- `TC-00-01` — Server harus bisa diakses
- `TC-01-01` — Login harus berfungsi
- `TC-01-07` — Endpoint protected harus menolak tanpa token
- `TC-12-01` — Unauthorized harus return 401
- `TC-12-02` — Token invalid harus return 401

---

## Tools yang Dapat Digunakan

| Tool | Cara Pakai |
|---|---|
| **Postman** | Import `SMK3_API_Postman_Collection.json` yang ada di root project |
| **Swagger UI** | Buka `http://localhost:3001/api/docs` — test langsung di browser |
| **curl** | Lihat contoh curl di bawah |

### Contoh curl

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"idKaryawan":"EMP-001","password":"password123"}'

# Get all findings (dengan token)
curl -X GET http://localhost:3001/api/smk3-data \
  -H "Authorization: Bearer <TOKEN>"

# Get departments
curl -X GET http://localhost:3001/api/departments \
  -H "Authorization: Bearer <TOKEN>"
```

---

*Dokumen ini dibuat secara otomatis berdasarkan source code controllers di `src/`. Perbarui dokumen ini jika ada penambahan endpoint baru.*
