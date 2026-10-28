'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  masterApdApi,
  MasterApd,
  CreateMasterApdDto,
  KATEGORI_APD_OPTIONS,
  SATUAN_APD_OPTIONS,
  DEFAULT_MASTER_APD_LIST,
} from '@/lib/masterApdApi';

export default function MasterApdAdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [apdList, setApdList] = useState<MasterApd[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('ALL');

  // Modal Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterApd | null>(null);
  const [formData, setFormData] = useState<CreateMasterApdDto>({
    namaApd: '',
    kategori: KATEGORI_APD_OPTIONS[0],
    satuan: 'Pcs',
    stokAwal: 100,
    standar: '',
    keterangan: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Modal Delete
  const [itemToDelete, setItemToDelete] = useState<MasterApd | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Auth Protection: hanya admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await masterApdApi.getAll();
      setApdList(data);
    } catch {
      showToast('Gagal memuat katalog master APD', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user, loadData]);

  // Modal Handlers
  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      namaApd: '',
      kategori: KATEGORI_APD_OPTIONS[0],
      satuan: 'Pcs',
      stokAwal: 100,
      standar: '',
      keterangan: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: MasterApd) => {
    setEditingItem(item);
    setFormData({
      namaApd: item.namaApd,
      kategori: item.kategori,
      satuan: item.satuan,
      stokAwal: item.stokAwal || 0,
      standar: item.standar || '',
      keterangan: item.keterangan || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.namaApd.trim()) {
      errors.namaApd = 'Nama APD wajib diisi';
    }
    if (!formData.kategori) {
      errors.kategori = 'Kategori APD wajib dipilih';
    }
    if (!formData.satuan) {
      errors.satuan = 'Satuan wajib dipilih';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await masterApdApi.update(editingItem.id, formData);
        showToast('Data master APD berhasil diperbarui');
      } else {
        await masterApdApi.create(formData);
        showToast('Jenis APD baru berhasil ditambahkan');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan data APD', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await masterApdApi.delete(itemToDelete.id);
      showToast(`Jenis APD "${itemToDelete.namaApd}" berhasil dihapus`);
      setItemToDelete(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus jenis APD', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleResetDefault = () => {
    if (confirm('Kembalikan katalog APD ke 16 daftar standar awal PT QMB?')) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('erm_master_apd_list', JSON.stringify(DEFAULT_MASTER_APD_LIST));
      }
      showToast('Data master jenis APD dipulihkan ke standar awal');
      loadData();
    }
  };

  // Filter calculations
  const filteredList = useMemo(() => {
    let result = apdList;

    if (filterKategori !== 'ALL') {
      result = result.filter((item) => item.kategori === filterKategori);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.namaApd.toLowerCase().includes(q) ||
          item.kategori.toLowerCase().includes(q) ||
          (item.standar && item.standar.toLowerCase().includes(q)) ||
          (item.keterangan && item.keterangan.toLowerCase().includes(q))
      );
    }

    return result;
  }, [apdList, filterKategori, search]);

  const countTotal = apdList.length;
  const countHeadEye = apdList.filter((a) =>
    ['Pelindung Kepala', 'Pelindung Mata & Wajah', 'Pelindung Pendengaran', 'Pelindung Pernapasan'].includes(a.kategori)
  ).length;
  const countHandsFeet = apdList.filter((a) =>
    ['Pelindung Tangan', 'Pelindung Kaki'].includes(a.kategori)
  ).length;
  const countBodyFall = apdList.filter((a) =>
    ['Pelindung Tubuh', 'Pelindung Jatuh', 'Peralatan Keselamatan Khusus'].includes(a.kategori)
  ).length;

  const getKategoriBadgeColor = (kat: string) => {
    if (kat.includes('Kepala')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (kat.includes('Mata')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    if (kat.includes('Pernapasan')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (kat.includes('Tangan')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (kat.includes('Kaki')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (kat.includes('Jatuh')) return 'bg-red-50 text-red-700 border-red-200';
    if (kat.includes('Pendengaran')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-orange-50 text-orange-700 border-orange-200';
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-[#FF6B1A] border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px] text-[#6B7280]">Memuat Master Jenis APD...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-[13px] font-semibold text-white transition-all flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white px-6 md:px-10 py-8 border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[12px] text-[#6B7280] mb-4 flex-wrap">
            <Link href="/" className="hover:text-[#FF6B1A] transition-colors flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Home
            </Link>
            <span>/</span>
            <Link href="/dashboard" className="hover:text-[#FF6B1A] transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-[#6B7280]">Admin Panel</span>
            <span>/</span>
            <span className="text-[#FF6B1A] font-medium">Master Jenis APD</span>
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF6B1A] mb-2">
                Admin Panel • Katalog Keselamatan
              </div>
              <h1 className="font-bold text-[#1F2937] text-[clamp(24px,4vw,36px)] leading-tight">
                Master Jenis APD (Katalog APD)
              </h1>
              <p className="text-[#6B7280] text-[13px] mt-1.5 max-w-2xl">
                Kelola master jenis Alat Pelindung Diri (APD), standar teknis, dan satuan. Data pada tabel ini otomatis menjadi daftar opsi pilihan saat petugas/karyawan melakukan pencatatan di menu <strong>Accident Prevention &gt; PPE Management</strong>.
              </p>
            </div>

            {/* Quick Links Nav */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5E7EB] text-[#374151] text-[12px] font-medium rounded-lg hover:border-[#FF6B1A] hover:text-[#FF6B1A] transition-colors shadow-xs"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                </svg>
                Kelola Pengguna
              </Link>
              <Link
                href="/admin/daftar-pelatihan"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5E7EB] text-[#374151] text-[12px] font-medium rounded-lg hover:border-[#FF6B1A] hover:text-[#FF6B1A] transition-colors shadow-xs"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                Daftar Pelatihan
              </Link>
              <Link
                href="/accident-prevention/ppe-management"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FFF1E8] border border-[#FF6B1A]/30 text-[#FF6B1A] text-[12px] font-semibold rounded-lg hover:bg-[#FFE5D4] transition-colors shadow-xs"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                </svg>
                Serah Terima APD
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="px-6 md:px-10 py-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 text-center shadow-xs">
              <div className="text-[28px] font-bold text-[#1F2937]">{countTotal}</div>
              <div className="text-[11px] text-[#6B7280] font-semibold uppercase tracking-wider mt-0.5">
                Total Jenis APD
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 text-center shadow-xs">
              <div className="text-[28px] font-bold text-blue-600">{countHeadEye}</div>
              <div className="text-[11px] text-[#6B7280] font-semibold uppercase tracking-wider mt-0.5">
                Kepala, Mata, Nafas
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 text-center shadow-xs">
              <div className="text-[28px] font-bold text-amber-700">{countHandsFeet}</div>
              <div className="text-[11px] text-[#6B7280] font-semibold uppercase tracking-wider mt-0.5">
                Tangan &amp; Kaki
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 text-center shadow-xs">
              <div className="text-[28px] font-bold text-emerald-600">{countBodyFall}</div>
              <div className="text-[11px] text-[#6B7280] font-semibold uppercase tracking-wider mt-0.5">
                Tubuh, Jatuh &amp; Khusus
              </div>
            </div>
          </div>

          {/* Table Container Card */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            {/* Toolbar */}
            <div className="p-5 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 flex-wrap">
                {/* Search */}
                <div className="relative min-w-[240px] flex-1 max-w-md">
                  <svg
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                    width="15"
                    height="15"
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
                    placeholder="Cari nama APD, standar, atau spesifikasi..."
                    className="w-full pl-9 pr-8 py-2 text-[13px] bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 transition-all"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Kategori */}
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  className="py-2 px-3 text-[13px] bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] font-medium text-[#374151]"
                >
                  <option value="ALL">Semua Kategori ({countTotal})</option>
                  {KATEGORI_APD_OPTIONS.map((kat) => (
                    <option key={kat} value={kat}>
                      {kat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={handleResetDefault}
                  title="Kembalikan daftar awal 16 APD standar PT QMB"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  Reset Standar
                </button>

                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B1A] text-white text-[13px] font-semibold rounded-xl hover:bg-[#E85D0F] transition-colors shadow-xs"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Tambah Jenis APD
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama APD &amp; Spesifikasi</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4 text-center">Satuan</th>
                    <th className="py-3 px-4">Standar K3 / Spesifikasi</th>
                    <th className="py-3 px-4 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-[13px]">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#9CA3AF]">
                        <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p className="font-medium text-[#4B5563]">Tidak ada jenis APD yang sesuai</p>
                        <p className="text-[12px] mt-0.5">Coba cari dengan kata kunci lain atau klik Tambah Jenis APD.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-orange-50/20 transition-colors">
                        <td className="py-3.5 px-4 text-center text-[#9CA3AF] font-mono text-[12px]">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-[#1F2937]">{item.namaApd}</div>
                          {item.keterangan && (
                            <p className="text-[11px] text-[#6B7280] mt-0.5 line-clamp-1">{item.keterangan}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getKategoriBadgeColor(
                              item.kategori
                            )}`}
                          >
                            {item.kategori}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 bg-gray-100 text-[#374151] rounded-lg text-[12px] font-semibold">
                            {item.satuan}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[12px] font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200 inline-block">
                            {item.standar || 'Standar Pabrik PT QMB'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditModal(item)}
                              title="Edit Jenis APD"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-[#FF6B1A] hover:bg-[#FFF1E8] transition-colors"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setItemToDelete(item)}
                              title="Hapus Jenis APD"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Table */}
            <div className="p-4 bg-[#FAFAFA] border-t border-[#E5E7EB] flex items-center justify-between text-[12px] text-[#6B7280]">
              <div>
                Menampilkan <strong>{filteredList.length}</strong> dari <strong>{countTotal}</strong> jenis APD
              </div>
              <div className="text-[11px] text-[#9CA3AF]">
                * Terintegrasi langsung dengan menu Serah Terima APD
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E5E7EB] animate-scale-in">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-white">
              <div>
                <h3 className="text-[16px] font-bold text-[#1F2937]">
                  {editingItem ? 'Edit Master Jenis APD' : 'Tambah Jenis APD Baru'}
                </h3>
                <p className="text-[12px] text-[#6B7280] mt-0.5">
                  Daftar ini akan otomatis muncul saat pencatatan serah terima APD
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* Nama APD */}
              <div>
                <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">
                  Nama Alat Pelindung Diri (APD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Helm Safety (V-Gard) / Sepatu Safety Steel Toe"
                  value={formData.namaApd}
                  onChange={(e) => {
                    setFormData({ ...formData, namaApd: e.target.value });
                    if (formErrors.namaApd) setFormErrors({ ...formErrors, namaApd: '' });
                  }}
                  className={`w-full px-3.5 py-2.5 text-[13px] bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]/20 transition-all ${
                    formErrors.namaApd ? 'border-red-400 bg-red-50/50' : 'border-[#E5E7EB] focus:border-[#FF6B1A]'
                  }`}
                />
                {formErrors.namaApd && (
                  <p className="text-red-500 text-[11px] mt-1">{formErrors.namaApd}</p>
                )}
              </div>

              {/* Kategori & Satuan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">
                    Kategori APD <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] font-medium text-[#374151]"
                  >
                    {KATEGORI_APD_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">
                    Satuan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] font-medium text-[#374151]"
                  >
                    {SATUAN_APD_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Standar Teknis */}
              <div>
                <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">
                  Standar Keselamatan (SNI / ANSI / EN / NFPA)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: SNI 7079 / ANSI Z87.1 / EN 397"
                  value={formData.standar}
                  onChange={(e) => setFormData({ ...formData, standar: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] transition-all font-mono"
                />
              </div>

              {/* Keterangan / Spesifikasi */}
              <div>
                <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">
                  Keterangan &amp; Petunjuk Penggunaan
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Warna helm disesuaikan divisi. Wajib diinspeksi setiap 6 bulan."
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full px-3.5 py-2 text-[13px] bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] transition-all"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-[13px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-[13px] font-semibold text-white bg-[#FF6B1A] hover:bg-[#E85D0F] rounded-xl transition-colors shadow-xs disabled:opacity-60 flex items-center gap-2"
                >
                  {saving && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {saving ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambahkan APD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Confirmation */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-[#E5E7EB] animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h3 className="text-[16px] font-bold text-center text-[#1F2937]">Hapus Jenis APD?</h3>
            <p className="text-[13px] text-gray-600 text-center mt-2">
              Apakah Anda yakin ingin menghapus <strong>&ldquo;{itemToDelete.namaApd}&rdquo;</strong> dari katalog master APD?
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
