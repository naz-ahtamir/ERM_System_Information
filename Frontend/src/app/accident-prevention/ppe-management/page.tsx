'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import {
  ppeHandoverApi,
  PpeHandoverRecord,
  PpeHandoverItem,
  CreatePpeHandoverDto,
} from '@/lib/ppeHandoverApi';
import {
  masterApdApi,
  MasterApd,
} from '@/lib/masterApdApi';
import {
  departmentsApi,
  usersApi,
  type Department,
  type SystemUser,
} from '@/lib/api';

// Keperluan Options untuk Formulir
const KEPERLUAN_OPTIONS = [
  'Paket APD Karyawan Baru',
  'Penggantian APD Rusak / Aus',
  'Pekerjaan Khusus / Working at Height / Hot Work',
  'Safety Induction & Kunjungan Tamu / Mitra',
  'Kebutuhan Rutin Uji Sampel & Operasional',
  'Tambahan APD Sesuai Evaluasi Bahaya',
  'Lainnya',
];

export default function PpeManagementPage() {
  return (
    <Suspense fallback={null}>
      <PpeManagementContent />
    </Suspense>
  );
}

function PpeManagementContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  // Data State
  const [records, setRecords] = useState<PpeHandoverRecord[]>([]);
  const [masterApdList, setMasterApdList] = useState<MasterApd[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [timeRange, setTimeRange] = useState<'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'CUSTOM'>('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [filterUserRoleScope, setFilterUserRoleScope] = useState<'all' | 'penerima' | 'pemberi'>('all');

  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<PpeHandoverRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<PpeHandoverRecord | null>(null);
  const [itemToDelete, setItemToDelete] = useState<PpeHandoverRecord | null>(null);

  // Form State
  const [formTanggal, setFormTanggal] = useState('');
  const [formPenerimaNama, setFormPenerimaNama] = useState('');
  const [formPenerimaIdKaryawan, setFormPenerimaIdKaryawan] = useState('');
  const [formPenerimaJabatan, setFormPenerimaJabatan] = useState('');
  const [formPenerimaDepartemen, setFormPenerimaDepartemen] = useState('');
  const [formPenerimaDivisi, setFormPenerimaDivisi] = useState('');
  const [formPenerimaPerusahaan, setFormPenerimaPerusahaan] = useState('PT. QMB New Energy Materials');
  const [formKeperluan, setFormKeperluan] = useState(KEPERLUAN_OPTIONS[0]);
  const [formCatatan, setFormCatatan] = useState('');
  const [formItems, setFormItems] = useState<PpeHandoverItem[]>([
    {
      namaApd: '',
      kategori: 'Pelindung Kepala',
      jumlah: 1,
      satuan: 'Pcs',
      ukuran: '',
      kondisi: 'Baru',
      keterangan: '',
    },
  ]);
  const [formFotoUrl, setFormFotoUrl] = useState('');
  const [formFotoName, setFormFotoName] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Auto-Fill User Lookup State
  const [idLookupStatus, setIdLookupStatus] = useState<'idle' | 'searching' | 'found' | 'not_found'>('idle');
  const [matchedUser, setMatchedUser] = useState<SystemUser | null>(null);
  const lookupDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Role & Permission Computations ────────────────────────
  const isAdmin = user?.role === 'admin';
  const userDivisi = ((user as any)?.divisi || (user as any)?.departemen || '').toUpperCase();
  const isDivisiPerencanaan =
    userDivisi.includes('PERENCANAAN KEAMANAN') && userDivisi.includes('PELATIHAN SIMULASI');

  const canModify = isAdmin;
  const canViewAll = isAdmin || isDivisiPerencanaan;
  const currentUserIdKaryawan = (user as any)?.idKaryawan || '';
  const currentUserName = (user as any)?.nama || user?.name || '';
  const currentUserDept = (user as any)?.departemen || '';
  const currentUserDiv = (user as any)?.divisi || '';

  // ── Load Data ─────────────────────────────────────────────
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [handoverData, apdData, deptData, usersData] = await Promise.all([
        ppeHandoverApi.getAll(),
        masterApdApi.getAll(),
        departmentsApi.getAll().catch(() => []),
        usersApi.getAll().catch(() => []),
      ]);
      setRecords(handoverData);
      setMasterApdList(apdData);
      setDepartments(deptData);
      setSystemUsers(usersData);
    } catch {
      showToast('Gagal memuat data serah terima APD', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Check URL query param for quick add
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      handleOpenAdd();
    }
  }, [searchParams]);

  // Set default tanggal form
  useEffect(() => {
    if (!formTanggal) {
      setFormTanggal(new Date().toISOString().slice(0, 10));
    }
  }, [formTanggal]);

  // ── Auto-Fill Employee ID Lookup Handler ──────────────────
  const performLookupId = useCallback(
    async (idToSearch: string) => {
      const clean = idToSearch.trim().toUpperCase();
      if (!clean) {
        setIdLookupStatus('idle');
        setMatchedUser(null);
        setFormPenerimaNama('');
        setFormPenerimaDepartemen('');
        setFormPenerimaDivisi('');
        setFormPenerimaJabatan('');
        setFormPenerimaPerusahaan('PT. QMB New Energy Materials');
        return;
      }

      setIdLookupStatus('searching');

      // 1. Cek pada daftar systemUsers yang sudah di-cache
      let found = systemUsers.find(
        (u) => u.idKaryawan && u.idKaryawan.trim().toUpperCase() === clean
      );

      // 2. Jika belum ditemukan di cache, coba fetch langsung dari backend
      if (!found) {
        try {
          found = await usersApi.getByIdKaryawan(clean) || undefined;
          if (found) {
            setSystemUsers((prev) => [...prev, found!]);
          }
        } catch {
          // ignore
        }
      }

      if (found) {
        setIdLookupStatus('found');
        setMatchedUser(found);
        setFormPenerimaNama(found.nama || '');
        setFormPenerimaDepartemen(found.departemen || departments[0]?.name || '');
        setFormPenerimaDivisi(found.divisi || '');
        setFormPenerimaJabatan(found.jabatan || '');
        setFormPenerimaPerusahaan(found.perusahaan || 'PT. QMB New Energy Materials');
        setFormErrors((prev) => ({
          ...prev,
          penerimaIdKaryawan: '',
          penerimaNama: '',
          penerimaDepartemen: '',
        }));
      } else {
        setIdLookupStatus('not_found');
        setMatchedUser(null);
        setFormPenerimaNama('');
        setFormPenerimaDepartemen('');
        setFormPenerimaDivisi('');
        setFormPenerimaJabatan('');
        setFormPenerimaPerusahaan('PT. QMB New Energy Materials');
      }
    },
    [systemUsers, departments]
  );

  const handleIdKaryawanChange = (value: string) => {
    setFormPenerimaIdKaryawan(value);
    if (formErrors.penerimaIdKaryawan) {
      setFormErrors((prev) => ({ ...prev, penerimaIdKaryawan: '' }));
    }

    if (lookupDebounceRef.current) {
      clearTimeout(lookupDebounceRef.current);
    }

    lookupDebounceRef.current = setTimeout(() => {
      performLookupId(value);
    }, 350);
  };

  // ── Filter Date Helper ───────────────────────────────────
  const isDateInRange = useCallback(
    (dateStr: string) => {
      if (timeRange === 'ALL') return true;
      const d = new Date(dateStr);
      const now = new Date();

      if (timeRange === 'THIS_MONTH') {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }
      if (timeRange === 'LAST_MONTH') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return d.getFullYear() === lastMonth.getFullYear() && d.getMonth() === lastMonth.getMonth();
      }
      if (timeRange === 'THIS_YEAR') {
        return d.getFullYear() === now.getFullYear();
      }
      if (timeRange === 'CUSTOM') {
        if (customStartDate && d < new Date(customStartDate)) return false;
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          if (d > end) return false;
        }
        return true;
      }
      return true;
    },
    [timeRange, customStartDate, customEndDate]
  );

  // ── Scoped Records (Role Access Rule) ─────────────────────
  const scopedRecords = useMemo(() => {
    if (canViewAll) {
      return records;
    }
    // User biasa: hanya melihat yang mereka terima ATAU yang mereka serahkan
    return records.filter(
      (r) =>
        r.penerimaIdKaryawan?.toLowerCase() === currentUserIdKaryawan.toLowerCase() ||
        r.pemberiIdKaryawan?.toLowerCase() === currentUserIdKaryawan.toLowerCase()
    );
  }, [records, canViewAll, currentUserIdKaryawan]);

  // ── Filtered Records for Table ───────────────────────────
  const filteredRecords = useMemo(() => {
    let list = scopedRecords;

    // Filter User Scope (khusus user biasa)
    if (!canViewAll) {
      if (filterUserRoleScope === 'penerima') {
        list = list.filter(
          (r) => r.penerimaIdKaryawan?.toLowerCase() === currentUserIdKaryawan.toLowerCase()
        );
      } else if (filterUserRoleScope === 'pemberi') {
        list = list.filter(
          (r) => r.pemberiIdKaryawan?.toLowerCase() === currentUserIdKaryawan.toLowerCase()
        );
      }
    }

    // Filter Departemen
    if (filterDept !== 'ALL') {
      list = list.filter((r) => r.penerimaDepartemen === filterDept);
    }

    // Filter Tanggal
    list = list.filter((r) => isDateInRange(r.tanggal));

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.nomorTransaksi.toLowerCase().includes(q) ||
          r.penerimaNama.toLowerCase().includes(q) ||
          r.penerimaIdKaryawan.toLowerCase().includes(q) ||
          r.penerimaDepartemen.toLowerCase().includes(q) ||
          r.pemberiNama.toLowerCase().includes(q) ||
          r.items.some((it) => it.namaApd.toLowerCase().includes(q))
      );
    }

    return list;
  }, [
    scopedRecords,
    canViewAll,
    filterUserRoleScope,
    currentUserIdKaryawan,
    filterDept,
    isDateInRange,
    search,
  ]);

  const hasActiveFilters =
    search !== '' ||
    filterDept !== 'ALL' ||
    timeRange !== 'ALL' ||
    filterUserRoleScope !== 'all';

  const handleResetFilters = () => {
    setSearch('');
    setFilterDept('ALL');
    setTimeRange('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
    setFilterUserRoleScope('all');
  };

  // ── Form Handlers ─────────────────────────────────────────
  const resetForm = () => {
    setEditingRecord(null);
    setFormTanggal(new Date().toISOString().slice(0, 10));
    setFormPenerimaNama('');
    setFormPenerimaIdKaryawan('');
    setFormPenerimaJabatan('');
    setFormPenerimaDepartemen('');
    setFormPenerimaDivisi('');
    setFormPenerimaPerusahaan('PT. QMB New Energy Materials');
    setFormKeperluan(KEPERLUAN_OPTIONS[0]);
    setFormCatatan('');
    setIdLookupStatus('idle');
    setMatchedUser(null);
    const firstApd = masterApdList[0];
    setFormItems([
      {
        namaApd: firstApd?.namaApd || 'Helm Safety (Safety Helmet V-Gard)',
        kategori: firstApd?.kategori || 'Pelindung Kepala',
        jumlah: 1,
        satuan: firstApd?.satuan || 'Pcs',
        ukuran: '',
        kondisi: 'Baru',
        keterangan: '',
      },
    ]);
    setFormFotoUrl('');
    setFormFotoName('');
    setFormErrors({});
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (rec: PpeHandoverRecord) => {
    setEditingRecord(rec);
    setFormTanggal(rec.tanggal);
    setFormPenerimaNama(rec.penerimaNama);
    setFormPenerimaIdKaryawan(rec.penerimaIdKaryawan);
    setFormPenerimaJabatan(rec.penerimaJabatan || '');
    setFormPenerimaDepartemen(rec.penerimaDepartemen);
    setFormPenerimaDivisi(rec.penerimaDivisi || '');
    setFormPenerimaPerusahaan(rec.penerimaPerusahaan || 'PT. QMB New Energy Materials');
    setFormKeperluan(rec.keperluan || KEPERLUAN_OPTIONS[0]);
    setFormCatatan(rec.catatan || '');
    setIdLookupStatus('found');
    setFormItems(
      rec.items.map((it) => ({
        ...it,
      }))
    );
    setFormFotoUrl(rec.fotoBuktiUrl);
    setFormFotoName(rec.fotoBuktiName || 'bukti_serah_terima.jpg');
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const addItemRow = () => {
    const defaultApd = masterApdList[0];
    setFormItems((prev) => [
      ...prev,
      {
        namaApd: defaultApd?.namaApd || '',
        kategori: defaultApd?.kategori || 'Pelindung Kepala',
        jumlah: 1,
        satuan: defaultApd?.satuan || 'Pcs',
        ukuran: '',
        kondisi: 'Baru',
        keterangan: '',
      },
    ]);
  };

  const removeItemRow = (idx: number) => {
    if (formItems.length === 1) {
      showToast('Minimal harus ada 1 item APD yang diserahkan', 'error');
      return;
    }
    setFormItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleApdSelectChange = (idx: number, selectedNamaApd: string) => {
    const matched = masterApdList.find((a) => a.namaApd === selectedNamaApd);
    setFormItems((prev) => {
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        namaApd: selectedNamaApd,
        kategori: matched?.kategori || copy[idx].kategori,
        satuan: matched?.satuan || copy[idx].satuan || 'Pcs',
      };
      return copy;
    });
  };

  const handleItemFieldChange = (idx: number, field: keyof PpeHandoverItem, value: any) => {
    setFormItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Format file harus berupa gambar (JPG, PNG, WebP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran foto maksimal 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormFotoUrl(base64);
      setFormFotoName(file.name);
      if (formErrors.foto) setFormErrors((prev) => ({ ...prev, foto: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formPenerimaIdKaryawan.trim()) {
      errors.penerimaIdKaryawan = 'No. ID Karyawan penerima wajib diisi';
    } else if (idLookupStatus !== 'found') {
      errors.penerimaIdKaryawan =
        'ID Karyawan tidak terdaftar di sistem. Silakan hubungi Admin untuk meminta penambahan user.';
    }

    if (!formPenerimaNama.trim()) {
      errors.penerimaNama = 'Nama penerima belum terisi (perlu ID terdaftar)';
    }
    if (!formPenerimaDepartemen) {
      errors.penerimaDepartemen = 'Departemen penerima belum terisi (perlu ID terdaftar)';
    }
    if (!formFotoUrl) {
      errors.foto = 'Foto bukti serah terima APD wajib diunggah!';
    }

    if (formItems.length === 0) {
      errors.items = 'Minimal sertakan 1 item APD yang diserahkan';
    } else {
      const hasEmptyApd = formItems.some((it) => !it.namaApd.trim() || Number(it.jumlah) < 1);
      if (hasEmptyApd) {
        errors.items = 'Pastikan semua baris APD memilih Jenis APD dan jumlah minimal 1';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast(
        idLookupStatus === 'not_found'
          ? 'ID Karyawan tidak terdaftar. Hubungi Admin untuk menambah user.'
          : 'Mohon lengkapi formulir dan unggah foto bukti serah terima',
        'error'
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreatePpeHandoverDto = {
        tanggal: formTanggal,
        pemberiId: (user as any)?.id,
        pemberiNama: currentUserName || 'Petugas K3',
        pemberiIdKaryawan: currentUserIdKaryawan || 'HSE-OFFICER',
        pemberiDepartemen: currentUserDept || 'HSE & Sustainability',
        pemberiDivisi: currentUserDiv || 'Keselamatan Kerja',

        penerimaNama: formPenerimaNama.trim(),
        penerimaIdKaryawan: formPenerimaIdKaryawan.trim().toUpperCase(),
        penerimaJabatan: formPenerimaJabatan.trim(),
        penerimaDepartemen: formPenerimaDepartemen,
        penerimaDivisi: formPenerimaDivisi.trim(),
        penerimaPerusahaan: formPenerimaPerusahaan.trim(),

        items: formItems,
        keperluan: formKeperluan,
        catatan: formCatatan.trim(),

        fotoBuktiUrl: formFotoUrl,
        fotoBuktiName: formFotoName,
      };

      if (editingRecord) {
        await ppeHandoverApi.update(editingRecord.id, payload);
        showToast('Catatan serah terima APD berhasil diperbarui');
      } else {
        await ppeHandoverApi.create(payload);
        showToast('Transaksi serah terima APD berhasil disimpan');
      }

      setIsFormModalOpen(false);
      resetForm();
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan transaksi serah terima APD', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await ppeHandoverApi.delete(itemToDelete.id);
      showToast(`Transaksi ${itemToDelete.nomorTransaksi} berhasil dihapus`);
      setItemToDelete(null);
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus transaksi', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ── Export CSV Handler ────────────────────────────────────
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }

    const headers = [
      'No Transaksi',
      'Tanggal',
      'Penerima (Nama)',
      'ID Karyawan Penerima',
      'Departemen Penerima',
      'Divisi',
      'Jabatan',
      'Perusahaan',
      'Pemberi (Nama)',
      'ID Karyawan Pemberi',
      'Total Unit APD',
      'Rincian APD Diserahkan',
      'Catatan',
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.nomorTransaksi}"`,
      `"${r.tanggal}"`,
      `"${r.penerimaNama.replace(/"/g, '""')}"`,
      `"${r.penerimaIdKaryawan}"`,
      `"${r.penerimaDepartemen.replace(/"/g, '""')}"`,
      `"${(r.penerimaDivisi || '').replace(/"/g, '""')}"`,
      `"${(r.penerimaJabatan || '').replace(/"/g, '""')}"`,
      `"${(r.penerimaPerusahaan || '').replace(/"/g, '""')}"`,
      `"${r.pemberiNama.replace(/"/g, '""')}"`,
      `"${r.pemberiIdKaryawan}"`,
      r.totalUnitApd,
      `"${r.items.map((it) => `${it.namaApd} (${it.jumlah} ${it.satuan} [${it.kondisi}])`).join('; ')}"`,
      `"${(r.catatan || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Serah_Terima_APD_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data serah terima APD berhasil diekspor ke CSV');
  };

  // ── Print Individual Handover Slip ────────────────────────
  const handlePrintSlip = (rec: PpeHandoverRecord) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Bukti Serah Terima APD - ${rec.nomorTransaksi}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 25px; color: #111; margin: 0; }
            .header { text-align: center; border-bottom: 2px solid #FF6B1A; padding-bottom: 12px; margin-bottom: 20px; }
            .header h2 { margin: 0; color: #111; font-size: 18px; }
            .header p { margin: 4px 0 0; font-size: 12px; color: #666; }
            .meta-table { width: 100%; margin-bottom: 20px; font-size: 12px; border-collapse: collapse; }
            .meta-table td { padding: 4px 6px; }
            .meta-label { font-weight: bold; width: 170px; color: #444; }
            .table-items { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            .table-items th, .table-items td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
            .table-items th { background-color: #FFF1E8; color: #FF6B1A; font-weight: bold; }
            .photo-box { margin-top: 20px; text-align: center; border: 1px dashed #ccc; padding: 12px; border-radius: 8px; }
            .photo-box img { max-width: 450px; max-height: 280px; border-radius: 6px; object-fit: contain; }
            .signatures { margin-top: 35px; display: flex; justify-content: space-between; }
            .sig-col { text-align: center; width: 220px; font-size: 12px; }
            .sig-space { height: 60px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>PT. QMB NEW ENERGY MATERIALS</h2>
            <p>DEPARTEMEN HEALTH, SAFETY & ENVIRONMENT (HSE)</p>
            <h3 style="color:#FF6B1A; margin-top:8px; font-size:15px;">FORMULIR BUKTI SERAH TERIMA ALAT PELINDUNG DIRI (APD)</h3>
          </div>
          <table class="meta-table">
            <tr>
              <td class="meta-label">Nomor Transaksi:</td>
              <td><strong>${rec.nomorTransaksi}</strong></td>
              <td class="meta-label">Tanggal Penyerahan:</td>
              <td>${rec.tanggal}</td>
            </tr>
            <tr>
              <td class="meta-label">Nama Penerima:</td>
              <td><strong>${rec.penerimaNama}</strong> (${rec.penerimaIdKaryawan})</td>
              <td class="meta-label">Petugas Pemberi:</td>
              <td>${rec.pemberiNama} (${rec.pemberiIdKaryawan})</td>
            </tr>
            <tr>
              <td class="meta-label">Departemen / Divisi:</td>
              <td>${rec.penerimaDepartemen} / ${rec.penerimaDivisi || '-'}</td>
              <td class="meta-label">Keperluan:</td>
              <td>${rec.keperluan}</td>
            </tr>
            <tr>
              <td class="meta-label">Perusahaan:</td>
              <td>${rec.penerimaPerusahaan || 'PT. QMB New Energy Materials'}</td>
              <td class="meta-label">Total Item APD:</td>
              <td><strong>${rec.totalUnitApd} Unit</strong></td>
            </tr>
          </table>

          <table class="table-items">
            <thead>
              <tr>
                <th style="width:30px; text-align:center;">No</th>
                <th>Jenis APD</th>
                <th>Kategori</th>
                <th style="text-align:center;">Jumlah</th>
                <th style="text-align:center;">Ukuran</th>
                <th style="text-align:center;">Kondisi</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${rec.items
                .map(
                  (it, i) => `
                <tr>
                  <td style="text-align:center;">${i + 1}</td>
                  <td><strong>${it.namaApd}</strong></td>
                  <td>${it.kategori}</td>
                  <td style="text-align:center; font-weight:bold;">${it.jumlah} ${it.satuan}</td>
                  <td style="text-align:center;">${it.ukuran || '-'}</td>
                  <td style="text-align:center;">${it.kondisi}</td>
                  <td>${it.keterangan || '-'}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>

          ${
            rec.fotoBuktiUrl
              ? `
            <div class="photo-box">
              <p style="font-size:11px; font-weight:bold; color:#666; margin-top:0;">DOKUMENTASI FOTO SERAH TERIMA APD</p>
              <img src="${rec.fotoBuktiUrl}" alt="Bukti Serah Terima" />
            </div>`
              : ''
          }

          <div class="signatures">
            <div class="sig-col">
              <p>Yang Menyerahkan (Petugas K3),</p>
              <div class="sig-space"></div>
              <p><strong>(${rec.pemberiNama})</strong><br>ID: ${rec.pemberiIdKaryawan}</p>
            </div>
            <div class="sig-col">
              <p>Yang Menerima,</p>
              <div class="sig-space"></div>
              <p><strong>(${rec.penerimaNama})</strong><br>ID: ${rec.penerimaIdKaryawan}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[700] px-5 py-3 rounded-xl shadow-lg text-[13px] font-semibold text-white transition-all flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Page Header (Sesuai Formulir Lain: Tanpa Breadcrumbs & Tanpa Tombol Ekstra) ── */}
      <div className="bg-white px-6 md:px-10 py-8 border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF6B1A] mb-1.5">
            Accident Prevention
          </p>
          <h1 className="font-bold text-[#1F2937] text-[clamp(22px,3.5vw,34px)] leading-tight">
            Pencatatan Serah Terima Alat Pelindung Diri (APD)
          </h1>
          <p className="text-[#6B7280] text-[13px] mt-1.5 max-w-3xl">
            Sistem pengelolaan distribusi dan serah terima APD karyawan PT. QMB New Energy Materials dengan multi-item dan dokumentasi foto fisik penyerahan.
          </p>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 space-y-5">
        {/* ── Toolbar Row 1: Search + Export + + Tambah Record (Di bawah Header) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor transaksi, nama penerima, ID karyawan, dept, atau jenis APD..."
              className="w-full pl-10 pr-9 py-2.5 text-[13px] bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 transition-colors shadow-xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1F2937]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            title="Download format CSV Excel"
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#E5E7EB] text-[#1F2937] text-[13px] font-semibold rounded-xl hover:border-emerald-400 hover:text-emerald-700 transition-colors shadow-xs whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>

          {/* Tombol + Tambah Record (Di bawah Header) */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B1A] text-white text-[13px] font-semibold rounded-xl hover:bg-[#E85D0F] transition-all shadow-xs whitespace-nowrap"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            + Tambah Record
          </button>
        </div>

        {/* ── Toolbar Row 2: Filter Dropdowns & Role Scope ── */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Departemen */}
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="py-2 px-3 text-[13px] bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] font-medium text-[#374151]"
            >
              <option value="ALL">Semua Departemen</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Filter Rentang Waktu */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="py-2 px-3 text-[13px] bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] font-medium text-[#374151]"
            >
              <option value="ALL">Semua Waktu</option>
              <option value="THIS_MONTH">Bulan Berjalan</option>
              <option value="LAST_MONTH">Bulan Lalu</option>
              <option value="THIS_YEAR">Tahun Ini</option>
              <option value="CUSTOM">Rentang Tanggal Khusus</option>
            </select>

            {/* Custom Date Pickers */}
            {timeRange === 'CUSTOM' && (
              <div className="flex items-center gap-2 text-[12px] bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                <span>Dari:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2 py-0.5 text-[12px] bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B1A]"
                />
                <span>Sampai:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2 py-0.5 text-[12px] bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B1A]"
                />
              </div>
            )}

            {/* Reset Filter Button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="py-2 px-3 text-[12px] text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-xl transition-colors font-semibold"
              >
                ✕ Reset Filter
              </button>
            )}
          </div>

          {/* Non-Admin User Scope Buttons */}
          {!canViewAll && (
            <div className="flex items-center gap-2 pt-2 border-t border-[#E5E7EB] text-[12px]">
              <span className="text-[#6B7280] font-medium">Tampilkan:</span>
              <button
                onClick={() => setFilterUserRoleScope('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  filterUserRoleScope === 'all'
                    ? 'bg-[#FF6B1A] text-white shadow-xs'
                    : 'bg-gray-100 text-[#4B5563] hover:bg-gray-200'
                }`}
              >
                Semua Terkait Saya ({scopedRecords.length})
              </button>
              <button
                onClick={() => setFilterUserRoleScope('penerima')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  filterUserRoleScope === 'penerima'
                    ? 'bg-[#FF6B1A] text-white shadow-xs'
                    : 'bg-gray-100 text-[#4B5563] hover:bg-gray-200'
                }`}
              >
                Saya Sebagai Penerima
              </button>
              <button
                onClick={() => setFilterUserRoleScope('pemberi')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  filterUserRoleScope === 'pemberi'
                    ? 'bg-[#FF6B1A] text-white shadow-xs'
                    : 'bg-gray-100 text-[#4B5563] hover:bg-gray-200'
                }`}
              >
                Saya Sebagai Pemberi
              </button>
            </div>
          )}
        </div>

        {/* ── Records Table (Kolom Keperluan Dihilangkan Sesuai Request) ── */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">No. Transaksi / Tgl</th>
                  <th className="py-3 px-4">Penerima (Receiver)</th>
                  <th className="py-3 px-4">Departemen</th>
                  <th className="py-3 px-4">Rincian APD Diserahkan</th>
                  <th className="py-3 px-4 text-center">Total Unit</th>
                  <th className="py-3 px-4 text-center">Pemberi</th>
                  <th className="py-3 px-4 text-center">Foto Bukti</th>
                  <th className="py-3 px-4 text-center w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[13px]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-14 text-center text-[#6B7280]">
                      <div className="w-8 h-8 border-4 border-[#FF6B1A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Memuat data serah terima APD...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-14 text-center text-[#9CA3AF]">
                      <svg
                        className="w-12 h-12 mx-auto mb-2 text-gray-300"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                      </svg>
                      <p className="font-semibold text-[#4B5563]">Belum ada catatan serah terima APD</p>
                      <p className="text-[12px] mt-0.5">
                        Klik tombol <strong>+ Tambah Record</strong> di atas untuk membuat catatan baru.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec, idx) => (
                    <tr key={rec.id} className="hover:bg-orange-50/20 transition-colors">
                      <td className="py-3.5 px-4 text-center text-[#9CA3AF] font-mono text-[12px]">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-[#1F2937] font-mono text-[12px]">
                          {rec.nomorTransaksi}
                        </div>
                        <div className="text-[11px] text-[#6B7280]">{rec.tanggal}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#1F2937]">{rec.penerimaNama}</div>
                        <div className="text-[11px] font-mono text-gray-500">
                          {rec.penerimaIdKaryawan} {rec.penerimaJabatan ? `• ${rec.penerimaJabatan}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-[12px] font-medium text-[#374151]">{rec.penerimaDepartemen}</div>
                        {rec.penerimaDivisi && (
                          <div className="text-[11px] text-[#9CA3AF]">{rec.penerimaDivisi}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="space-y-1">
                          {rec.items.slice(0, 2).map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[12px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B1A]" />
                              <span className="font-medium text-[#1F2937]">{item.namaApd}</span>
                              <span className="text-[#6B7280] font-mono">
                                ({item.jumlah} {item.satuan})
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                                  item.kondisi === 'Baru'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : item.kondisi === 'Penggantian'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-blue-50 text-blue-700'
                                }`}
                              >
                                {item.kondisi}
                              </span>
                            </div>
                          ))}
                          {rec.items.length > 2 && (
                            <div className="text-[11px] text-[#FF6B1A] font-semibold">
                              +{rec.items.length - 2} jenis APD lainnya
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#1F2937]">
                        {rec.totalUnitApd}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="text-[12px] font-medium text-[#374151]">{rec.pemberiNama}</div>
                        <div className="text-[10px] font-mono text-gray-400">{rec.pemberiIdKaryawan}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {rec.fotoBuktiUrl ? (
                          <button
                            onClick={() => setDetailRecord(rec)}
                            title="Klik untuk melihat foto dokumentasi"
                            className="relative group inline-block"
                          >
                            <img
                              src={rec.fotoBuktiUrl}
                              alt="Bukti"
                              className="w-10 h-10 object-cover rounded-lg border border-[#E5E7EB] group-hover:scale-105 transition-transform shadow-xs"
                            />
                            <span className="absolute bottom-0 right-0 bg-[#FF6B1A] text-white p-0.5 rounded-full text-[9px]">
                              ✓
                            </span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">Tidak ada foto</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Detail Button */}
                          <button
                            onClick={() => setDetailRecord(rec)}
                            title="Detail Transaksi & Foto"
                            className="p-1.5 rounded-lg text-gray-600 hover:text-[#FF6B1A] hover:bg-[#FFF1E8] transition-colors"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>

                          {/* Cetak Slip */}
                          <button
                            onClick={() => handlePrintSlip(rec)}
                            title="Cetak Formulir Serah Terima (PDF)"
                            className="p-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="6 9 6 2 18 2 18 9" />
                              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                              <rect x="6" y="14" width="12" height="8" />
                            </svg>
                          </button>

                          {/* Edit (Hanya Admin) */}
                          {canModify && (
                            <button
                              onClick={() => handleOpenEdit(rec)}
                              title="Edit Transaksi (Admin)"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-[#FF6B1A] hover:bg-[#FFF1E8] transition-colors"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                          )}

                          {/* Hapus (Hanya Admin) */}
                          {canModify && (
                            <button
                              onClick={() => setItemToDelete(rec)}
                              title="Hapus Transaksi (Admin)"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className="p-4 bg-[#FAFAFA] border-t border-[#E5E7EB] flex items-center justify-between text-[12px] text-[#6B7280] flex-wrap gap-2">
            <div>
              Menampilkan <strong>{filteredRecords.length}</strong> dari <strong>{scopedRecords.length}</strong> transaksi serah terima
            </div>
            <div className="text-[11px] text-[#9CA3AF]">
              * Data tersinkronisasi otomatis dengan kepatuhan SMK3 PT. QMB New Energy Materials
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          MODAL FORMULIR SERAH TERIMA APD (DENGAN AUTO-FILL USER)
         ════════════════════════════════════════════════════════════ */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[#E5E7EB] animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B1A]">
                  {editingRecord ? 'Perbarui Transaksi' : 'Pencatatan Baru'}
                </span>
                <h3 className="text-[18px] font-bold text-[#1F2937]">
                  {editingRecord ? 'Edit Catatan Serah Terima APD' : 'Formulir Serah Terima APD'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFormModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmitForm} className="p-6 md:p-8 space-y-6">
              {/* Bagian 1: Data Pemberi (Auto-Filled dari Akun Login) */}
              <div className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B1A]">
                    1. Data Petugas Penyerah APD (Pemberi)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF6B1A] text-white">
                    Auto-Filled Akun
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[13px]">
                  <div>
                    <span className="text-[11px] text-gray-500 block">Nama Petugas:</span>
                    <strong className="text-[#1F2937]">{currentUserName || 'User Sedang Login'}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 block">ID Karyawan:</span>
                    <span className="font-mono font-semibold text-[#1F2937]">{currentUserIdKaryawan || 'PETUGAS-K3'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 block">Departemen:</span>
                    <span className="text-[#1F2937]">{currentUserDept || 'HSE & Sustainability'}</span>
                  </div>
                </div>
              </div>

              {/* Bagian 2: Data Penerima (Auto-Fill Berdasarkan No. ID) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-[14px] text-[#1F2937] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#FFF1E8] text-[#FF6B1A] flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    Data Karyawan Penerima APD (Otomatis dari No. ID)
                  </h4>
                </div>

                {/* Input No. ID Karyawan dengan Auto-Check */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1F2937] mb-1">
                      No. ID Karyawan Penerima <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ketik No. ID Karyawan (cth: 82400469 / OPR-1042)..."
                        value={formPenerimaIdKaryawan}
                        onChange={(e) => handleIdKaryawanChange(e.target.value)}
                        onBlur={() => performLookupId(formPenerimaIdKaryawan)}
                        className={`w-full pl-3.5 pr-28 py-2.5 text-[13px] bg-white border rounded-xl font-mono uppercase focus:outline-none transition-all ${
                          idLookupStatus === 'found'
                            ? 'border-emerald-500 bg-emerald-50/20 text-[#1F2937] ring-1 ring-emerald-500/30'
                            : idLookupStatus === 'not_found'
                            ? 'border-red-400 bg-red-50/30 text-red-900 ring-1 ring-red-400/30'
                            : 'border-[#E5E7EB] focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20'
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {idLookupStatus === 'searching' && (
                          <div className="flex items-center gap-1 text-[11px] text-[#FF6B1A] font-medium">
                            <div className="w-3.5 h-3.5 border-2 border-[#FF6B1A] border-t-transparent rounded-full animate-spin" />
                            <span>Mengecek...</span>
                          </div>
                        )}
                        {idLookupStatus === 'found' && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            ✓ Terdaftar
                          </span>
                        )}
                        {idLookupStatus === 'not_found' && (
                          <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            ✕ Tidak Ditemukan
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Feedback Not Found (Peringatan Hubungi Admin) */}
                    {idLookupStatus === 'not_found' && (
                      <div className="mt-2.5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-[12px] text-red-800 flex items-start gap-2.5 animate-fade-in shadow-xs">
                        <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <div>
                          <p className="font-bold text-red-900">ID Karyawan Tidak Terdaftar atau Tidak Terbaca!</p>
                          <p className="text-red-700 text-[11px] mt-1 leading-relaxed">
                            Data penerima APD tidak dapat diisi otomatis karena No. ID ini belum ada di sistem pengguna. <strong>Silakan hubungi Admin</strong> untuk meminta penambahan user / akun karyawan terlebih dahulu di modul Manajemen User.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Feedback Found (Status Sukses Terisi) */}
                    {idLookupStatus === 'found' && (
                      <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[12px] text-emerald-800 flex items-center justify-between animate-fade-in">
                        <span className="font-medium flex items-center gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          Data user ditemukan: <strong>{formPenerimaNama}</strong> ({formPenerimaDepartemen || 'Departemen Terdaftar'})
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-md">
                          Data Terisi Otomatis
                        </span>
                      </div>
                    )}

                    {formErrors.penerimaIdKaryawan && (
                      <p className="text-red-500 text-[11px] mt-1">{formErrors.penerimaIdKaryawan}</p>
                    )}
                  </div>

                  {/* Field Penerima yang Terisi Otomatis */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nama Lengkap */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[13px] font-semibold text-[#1F2937]">
                          Nama Lengkap Penerima <span className="text-red-500">*</span>
                        </label>
                        {idLookupStatus === 'found' && (
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                            Auto-Filled
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder={idLookupStatus === 'found' ? formPenerimaNama : 'Terisi otomatis setelah No. ID dimasukkan...'}
                        value={formPenerimaNama}
                        readOnly={idLookupStatus === 'found'}
                        disabled={idLookupStatus !== 'found'}
                        className={`w-full px-3.5 py-2.5 text-[13px] border rounded-xl transition-all ${
                          idLookupStatus === 'found'
                            ? 'bg-gray-100/80 border-[#E5E7EB] text-[#1F2937] font-semibold cursor-not-allowed'
                            : 'bg-[#FAFAFA] border-gray-200 text-gray-400 placeholder:italic'
                        }`}
                      />
                      {formErrors.penerimaNama && (
                        <p className="text-red-500 text-[11px] mt-1">{formErrors.penerimaNama}</p>
                      )}
                    </div>

                    {/* Departemen */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[13px] font-semibold text-[#1F2937]">
                          Departemen Penerima <span className="text-red-500">*</span>
                        </label>
                        {idLookupStatus === 'found' && (
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                            Auto-Filled
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder={idLookupStatus === 'found' ? formPenerimaDepartemen : 'Terisi otomatis dari data user...'}
                        value={formPenerimaDepartemen}
                        readOnly={idLookupStatus === 'found'}
                        disabled={idLookupStatus !== 'found'}
                        className={`w-full px-3.5 py-2.5 text-[13px] border rounded-xl transition-all ${
                          idLookupStatus === 'found'
                            ? 'bg-gray-100/80 border-[#E5E7EB] text-[#1F2937] font-semibold cursor-not-allowed'
                            : 'bg-[#FAFAFA] border-gray-200 text-gray-400 placeholder:italic'
                        }`}
                      />
                      {formErrors.penerimaDepartemen && (
                        <p className="text-red-500 text-[11px] mt-1">{formErrors.penerimaDepartemen}</p>
                      )}
                    </div>

                    {/* Divisi / Unit Kerja */}
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1F2937] mb-1">
                        Divisi / Unit Kerja
                      </label>
                      <input
                        type="text"
                        placeholder={idLookupStatus === 'found' ? formPenerimaDivisi || '—' : 'Terisi otomatis dari data user...'}
                        value={formPenerimaDivisi}
                        readOnly={idLookupStatus === 'found'}
                        disabled={idLookupStatus !== 'found'}
                        className={`w-full px-3.5 py-2.5 text-[13px] border rounded-xl transition-all ${
                          idLookupStatus === 'found'
                            ? 'bg-gray-100/80 border-[#E5E7EB] text-[#1F2937] cursor-not-allowed'
                            : 'bg-[#FAFAFA] border-gray-200 text-gray-400 placeholder:italic'
                        }`}
                      />
                    </div>

                    {/* Jabatan */}
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1F2937] mb-1">
                        Jabatan
                      </label>
                      <input
                        type="text"
                        placeholder={idLookupStatus === 'found' ? formPenerimaJabatan || '—' : 'Terisi otomatis dari data user...'}
                        value={formPenerimaJabatan}
                        readOnly={idLookupStatus === 'found'}
                        disabled={idLookupStatus !== 'found'}
                        className={`w-full px-3.5 py-2.5 text-[13px] border rounded-xl transition-all ${
                          idLookupStatus === 'found'
                            ? 'bg-gray-100/80 border-[#E5E7EB] text-[#1F2937] cursor-not-allowed'
                            : 'bg-[#FAFAFA] border-gray-200 text-gray-400 placeholder:italic'
                        }`}
                      />
                    </div>

                    {/* Perusahaan */}
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1F2937] mb-1">
                        Perusahaan
                      </label>
                      <input
                        type="text"
                        value={formPenerimaPerusahaan}
                        readOnly={idLookupStatus === 'found'}
                        disabled={idLookupStatus !== 'found'}
                        className={`w-full px-3.5 py-2.5 text-[13px] border rounded-xl transition-all ${
                          idLookupStatus === 'found'
                            ? 'bg-gray-100/80 border-[#E5E7EB] text-[#1F2937] cursor-not-allowed'
                            : 'bg-[#FAFAFA] border-gray-200 text-gray-400'
                        }`}
                      />
                    </div>

                    {/* Tanggal Penyerahan */}
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1F2937] mb-1">
                        Tanggal Penyerahan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formTanggal}
                        onChange={(e) => setFormTanggal(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A]"
                      />
                    </div>
                  </div>

                  {/* Keperluan Penyerahan */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1F2937] mb-1">
                      Keperluan Penyerahan APD <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formKeperluan}
                      onChange={(e) => setFormKeperluan(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] font-medium text-[#374151]"
                    >
                      {KEPERLUAN_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Bagian 3: Rincian APD Diserahkan (Multi-Items) */}
              <div className="pt-4 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-[14px] text-[#1F2937] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#FFF1E8] text-[#FF6B1A] flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    Rincian APD yang Diserahkan (Multi-Item)
                  </h4>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-[#FF6B1A] hover:bg-[#E85D0F] rounded-xl transition-colors shadow-xs"
                  >
                    + Tambah Baris APD
                  </button>
                </div>

                {formErrors.items && (
                  <p className="text-red-500 text-[12px] mb-3">{formErrors.items}</p>
                )}

                <div className="space-y-3">
                  {formItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl relative group hover:border-[#FF6B1A]/40 transition-colors"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        {/* Jenis APD */}
                        <div className="sm:col-span-5">
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                            Jenis APD #{idx + 1}
                          </label>
                          <select
                            value={item.namaApd}
                            onChange={(e) => handleApdSelectChange(idx, e.target.value)}
                            className="w-full px-3 py-2 text-[12px] bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#FF6B1A] font-medium"
                          >
                            <option value="">-- Pilih Jenis APD --</option>
                            {masterApdList.map((a) => (
                              <option key={a.id} value={a.namaApd}>
                                {a.namaApd} [{a.kategori}]
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Jumlah */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                            Jumlah (Qty)
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={item.jumlah}
                            onChange={(e) => handleItemFieldChange(idx, 'jumlah', Number(e.target.value))}
                            className="w-full px-3 py-2 text-[12px] bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#FF6B1A] font-semibold text-center"
                          />
                        </div>

                        {/* Satuan */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                            Satuan
                          </label>
                          <input
                            type="text"
                            value={item.satuan}
                            onChange={(e) => handleItemFieldChange(idx, 'satuan', e.target.value)}
                            placeholder="Pasang / Pcs"
                            className="w-full px-3 py-2 text-[12px] bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#FF6B1A]"
                          />
                        </div>

                        {/* Kondisi */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                            Kondisi
                          </label>
                          <select
                            value={item.kondisi}
                            onChange={(e) => handleItemFieldChange(idx, 'kondisi', e.target.value as any)}
                            className="w-full px-2.5 py-2 text-[12px] bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#FF6B1A]"
                          >
                            <option value="Baru">Baru</option>
                            <option value="Penggantian">Penggantian</option>
                            <option value="Tambahan">Tambahan</option>
                          </select>
                        </div>

                        {/* Tombol Hapus Baris */}
                        <div className="sm:col-span-1 text-right sm:text-center pt-2 sm:pt-4">
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            title="Hapus Baris Ini"
                            className="text-gray-400 hover:text-red-600 p-1 rounded-md"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Ukuran & Keterangan Row */}
                        <div className="sm:col-span-6">
                          <input
                            type="text"
                            placeholder="Ukuran (misal: 42, L, XL, All Size)"
                            value={item.ukuran || ''}
                            onChange={(e) => handleItemFieldChange(idx, 'ukuran', e.target.value)}
                            className="w-full px-3 py-1.5 text-[11px] bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#FF6B1A]"
                          />
                        </div>
                        <div className="sm:col-span-6">
                          <input
                            type="text"
                            placeholder="Keterangan spesifik item ini..."
                            value={item.keterangan || ''}
                            onChange={(e) => handleItemFieldChange(idx, 'keterangan', e.target.value)}
                            className="w-full px-3 py-1.5 text-[11px] bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#FF6B1A]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bagian 4: Upload Foto Bukti Serah Terima (Wajib) */}
              <div className="pt-4 border-t border-[#E5E7EB]">
                <h4 className="font-bold text-[14px] text-[#1F2937] mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#FFF1E8] text-[#FF6B1A] flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  Unggah Foto Bukti Serah Terima APD <span className="text-red-500">* (Wajib)</span>
                </h4>
                <p className="text-[12px] text-[#6B7280] mb-3">
                  Wajib menyertakan foto penyerahan fisik APD kepada penerima sebagai dokumentasi resmi audit SMK3.
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Foto Upload Button / Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors w-full ${
                      formErrors.foto
                        ? 'border-red-400 bg-red-50/40'
                        : 'border-[#E5E7EB] hover:border-[#FF6B1A] bg-[#FAFAFA]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <svg
                      className="w-10 h-10 mx-auto text-[#FF6B1A] mb-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <p className="font-semibold text-[13px] text-[#1F2937]">
                      Klik untuk memilih foto dokumentasi serah terima
                    </p>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">
                      Mendukung format JPG, PNG, atau WebP (Maksimal 5MB)
                    </p>
                  </div>

                  {/* Foto Preview Box */}
                  {formFotoUrl && (
                    <div className="relative w-44 h-36 rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-xs flex-shrink-0">
                      <img src={formFotoUrl} alt="Preview Bukti" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormFotoUrl('');
                          setFormFotoName('');
                        }}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-black/50 p-1 text-[10px] text-white text-center truncate">
                        {formFotoName || 'Foto Terlampir'}
                      </div>
                    </div>
                  )}
                </div>
                {formErrors.foto && <p className="text-red-500 text-[11px] mt-2 font-medium">{formErrors.foto}</p>}
              </div>

              {/* Bagian 5: Catatan Tambahan */}
              <div>
                <label className="block text-[13px] font-semibold text-[#1F2937] mb-1">
                  Catatan Tambahan Penyerahan
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Karyawan telah diedukasi penggunaan APD dan bersedia menjaga kebersihan peralatan."
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A]"
                />
              </div>

              {/* Modal Form Actions */}
              <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3 sticky bottom-0 bg-white z-10">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormModalOpen(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 text-[13px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || (formPenerimaIdKaryawan !== '' && idLookupStatus !== 'found')}
                  className="px-6 py-2.5 text-[13px] font-semibold text-white bg-[#FF6B1A] hover:bg-[#E85D0F] rounded-xl transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {submitting ? 'Menyimpan...' : editingRecord ? 'Simpan Perubahan' : 'Simpan Transaksi Serah Terima'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL DETAIL TRANSAKSI & FOTO BUKTI
         ════════════════════════════════════════════════════════════ */}
      {detailRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#E5E7EB] animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B1A]">
                  Bukti Serah Terima APD
                </span>
                <h3 className="text-[17px] font-bold text-[#1F2937] font-mono">
                  {detailRecord.nomorTransaksi}
                </h3>
              </div>
              <button
                onClick={() => setDetailRecord(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Foto Bukti Dokumentasi */}
              <div>
                <p className="text-[12px] font-bold text-[#1F2937] mb-2 uppercase tracking-wide">
                  Foto Bukti Serah Terima:
                </p>
                {detailRecord.fotoBuktiUrl ? (
                  <div className="rounded-2xl overflow-hidden border border-[#E5E7EB] bg-black/5 text-center">
                    <img
                      src={detailRecord.fotoBuktiUrl}
                      alt="Bukti Serah Terima"
                      className="max-h-[350px] w-full object-contain mx-auto"
                    />
                  </div>
                ) : (
                  <p className="text-[13px] text-gray-400 italic">Foto tidak tersedia</p>
                )}
              </div>

              {/* Data Penerima & Pemberi Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#FAFAFA] rounded-2xl border border-[#E5E7EB] text-[13px]">
                <div>
                  <span className="text-[11px] font-bold text-[#FF6B1A] uppercase tracking-wide block mb-1">
                    Penerima APD
                  </span>
                  <p className="font-bold text-[#1F2937]">{detailRecord.penerimaNama}</p>
                  <p className="text-gray-600 font-mono text-[12px]">
                    ID: {detailRecord.penerimaIdKaryawan} • {detailRecord.penerimaJabatan || 'Karyawan'}
                  </p>
                  <p className="text-gray-600 text-[12px] mt-0.5">
                    {detailRecord.penerimaDepartemen} ({detailRecord.penerimaDivisi || '—'})
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{detailRecord.penerimaPerusahaan}</p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide block mb-1">
                    Petugas Pemberi APD
                  </span>
                  <p className="font-bold text-[#1F2937]">{detailRecord.pemberiNama}</p>
                  <p className="text-gray-600 font-mono text-[12px]">ID: {detailRecord.pemberiIdKaryawan}</p>
                  <p className="text-gray-600 text-[12px] mt-0.5">{detailRecord.pemberiDepartemen}</p>
                  <p className="text-[12px] text-[#FF6B1A] font-semibold mt-1">
                    Tgl Penyerahan: {detailRecord.tanggal}
                  </p>
                </div>
              </div>

              {/* Tabel APD */}
              <div>
                <p className="text-[12px] font-bold text-[#1F2937] mb-2 uppercase tracking-wide">
                  Daftar Barang APD ({detailRecord.totalUnitApd} Total Unit):
                </p>
                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[12px]">
                    <thead className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-gray-500 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Jenis APD</th>
                        <th className="py-2.5 px-3">Kategori</th>
                        <th className="py-2.5 px-3 text-center">Jumlah</th>
                        <th className="py-2.5 px-3 text-center">Ukuran</th>
                        <th className="py-2.5 px-3 text-center">Kondisi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {detailRecord.items.map((it, i) => (
                        <tr key={i}>
                          <td className="py-2.5 px-3 font-semibold text-[#1F2937]">{it.namaApd}</td>
                          <td className="py-2.5 px-3 text-gray-600">{it.kategori}</td>
                          <td className="py-2.5 px-3 text-center font-bold font-mono">
                            {it.jumlah} {it.satuan}
                          </td>
                          <td className="py-2.5 px-3 text-center">{it.ukuran || '—'}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                it.kondisi === 'Baru'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : it.kondisi === 'Penggantian'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {it.kondisi}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {detailRecord.catatan && (
                <div className="p-3 bg-gray-50 rounded-xl text-[12px] text-gray-700">
                  <span className="font-semibold block mb-0.5">Catatan:</span>
                  {detailRecord.catatan}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E5E7EB] bg-[#FAFAFA] flex items-center justify-between">
              <button
                type="button"
                onClick={() => handlePrintSlip(detailRecord)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-[12px] font-semibold hover:bg-blue-700 transition-colors shadow-xs"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Cetak Bukti Penyerahan (PDF)
              </button>

              <button
                type="button"
                onClick={() => setDetailRecord(null)}
                className="px-5 py-2 text-[12px] font-medium text-gray-700 bg-white border border-[#E5E7EB] rounded-xl hover:bg-gray-100 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL KONFIRMASI HAPUS (ADMIN)
         ════════════════════════════════════════════════════════════ */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-[#E5E7EB] animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h3 className="text-[16px] font-bold text-center text-[#1F2937]">Hapus Catatan Serah Terima APD?</h3>
            <p className="text-[13px] text-gray-600 text-center mt-2">
              Apakah Anda yakin ingin menghapus transaksi <strong>{itemToDelete.nomorTransaksi}</strong> atas nama penerima <strong>{itemToDelete.penerimaNama}</strong>?
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2.5 text-[13px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 text-[13px] font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs disabled:opacity-60 flex items-center gap-2"
              >
                {deleting && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
