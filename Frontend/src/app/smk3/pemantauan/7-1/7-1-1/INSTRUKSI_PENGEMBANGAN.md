# Instruktur Pengembangan - 7.1.1 Inspection Types

## Struktur File Baru

```
src/app/smk3/pemantauan/7-1/7-1-1/
├── page.tsx                                    (Landing page - menu 4 tipe inspeksi)
├── inspeksi-ketidaksesuaian/                   (7.1.1.1)
│   └── page.tsx
├── inspeksi-sarana-prasarana/                  (7.1.1.2)
│   └── page.tsx
├── inspeksi-kotak-p3k/                         (7.1.1.3)
│   └── page.tsx
└── inspeksi-apd/                               (7.1.1.4)
    └── page.tsx
```

## Tipe Inspeksi & Form Config

### 1. Inspeksi Ketidaksesuaian (7.1.1.1)
**ID:** `7.1.1-inspeksi-ketidaksesuaian`
**Warna:** Orange (#f7941d)
**Field:** 
- tanggalInspeksi, lokasiKetidaksesuaian, petugasInspeksi
- jenisKetidaksesuaian (Minor/Major/Critical)
- deskripsiKetidaksesuaian, standarYangDilanggar
- rekomendasiPerbaikan, penanggungJawabPerbaikan
- targetPenyelesaian, dokumenLaporan, fotoDokumentasi

### 2. Inspeksi Sarana Prasarana (7.1.1.2)
**ID:** `7.1.1-inspeksi-sarana-prasarana`
**Warna:** Blue (#3a86ff)
**Field:**
- tanggalInspeksi, namaSaranaPrasarana, lokasi
- petugasInspeksi, komponenYangDIperiksa
- kondisiSaatIni (Baik Sekali/Baik/Cukup/Buruk/Kritis)
- masalahYangDitemukan, tindakLanjutDiperlukan
- penanggungJawabTindakLanjut, dokumenLaporan, fotoDokumentasi

### 3. Inspeksi Kotak P3K (7.1.1.3)
**ID:** `7.1.1-inspeksi-kotak-p3k`
**Warna:** Green (#80b918)
**Field:**
- tanggalInspeksi, lokasiKotakP3K, petugasInspeksi
- kondisiKotak, ketersediaanObat, ketersediaanAlat
- jumlahObat, jumlahAlat, masalahKetidaklengkapan
- tindakLanjut, penanggungJawab, dokumenLaporan, fotoDokumentasi

### 4. Inspeksi APD (7.1.1.4)
**ID:** `7.1.1-inspeksi-apd`
**Warna:** Orange Red (#e76f51)
**Field:**
- tanggalInspeksi, lokasiPenyimpanan, petugasInspeksi
- jenisAPD (Helmet, Kacamata, Pelindung Telinga, dll)
- jumlahAPD, kondisiFisik, ketersediaan
- masalahYangDitemukan, tindakLanjut, penanggungJawab
- dokumenLaporan, fotoDokumentasi

## Cara Menambah Halaman Baru

1. **Buat folder baru** di `7-1-1/` dengan nama `inspeksi-[nama]`

2. **Buat halaman** dengan struktur berikut:
```tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SMK3DataForm from "@/components/SMK3DataForm";
import SMK3DataList from "@/components/SMK3DataList";
import SMK3DataModal from "@/components/SMK3DataModal";

export default function NamaHalamanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const formConfig = getFormConfig("7.1.1-inspeksi-[nama]");
  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // ... rest of the code
}
```

3. **Update formConfigs.ts** dengan konfigurasi field khusus untuk tipe inspeksi baru

4. **Update landing page** (`7-1-1/page.tsx`) dengan menambahkan card baru di `inspectionTypes` array

## Data Isolation

Setiap tipe inspeksi memiliki data yang terpisah karena menggunakan `subSubElementId` yang berbeda:
- `7.1.1-inspeksi-ketidaksesuaian`
- `7.1.1-inspeksi-sarana-prasarana`
- `7.1.1-inspeksi-kotak-p3k`
- `7.1.1-inspeksi-apd`

Data disimpan di folder berbeda dalam `public/uploads/smk3/` berdasarkan ID.

## Catatan Penting

- API route `/api/smk3-data` sudah mendukung filtering berdasarkan `subSubElementId`
- Setiap halaman memiliki warna tema yang berbeda untuk identifikasi visual
- Landing page menampilkan 4 kartu dengan icon dan deskripsi masing-masing tipe inspeksi
- Form yang di-generate otomatis menyesuaikan field dari `formConfigs.ts`
