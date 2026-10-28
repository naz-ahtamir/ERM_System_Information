'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  trainingApi,
  MasterPelatihan,
  CreateMasterPelatihanDto,
  formatRupiah,
  DEFAULT_PELATIHAN_LIST,
} from '@/lib/trainingApi';

export default function DaftarPelatihanAdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [pelatihanList, setPelatihanList] = useState<MasterPelatihan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filter & Search
  const [search, setSearch] = useState('');
  const [filterLembaga, setFilterLembaga] = useState('ALL');

  // Modal Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterPelatihan | null>(null);
  const [formData, setFormData] = useState({
    namaPelatihan: '',
    lembagaSelect: 'KEMNAKER',
    lembagaCustom: '',
    durasiHari: 3,
    harga: 3500000,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Modal Delete
  const [itemToDelete, setItemToDelete] = useState<MasterPelatihan | null>(null);

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
      const data = await trainingApi.getAll();
      setPelatihanList(data);
    } catch {
      showToast('Gagal memuat data pelatihan', 'error');
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
      namaPelatihan: '',
      lembagaSelect: 'KEMNAKER',
      lembagaCustom: '',
      durasiHari: 3,
      harga: 3500000,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: MasterPelatihan) => {
    setEditingItem(item);
    const isStandard = ['KEMNAKER', 'BNSP'].includes(item.lembaga.toUpperCase());
    setFormData({
      namaPelatihan: item.namaPelatihan,
      lembagaSelect: isStandard ? item.lembaga.toUpperCase() : 'Lainnya',
      lembagaCustom: isStandard ? '' : item.lembaga,
      durasiHari: item.durasiHari || 1,
      harga: item.harga || 0,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.namaPelatihan.trim()) {
      errors.namaPelatihan = 'Nama pelatihan wajib diisi';
    }

    const finalLembaga =
      formData.lembagaSelect === 'Lainnya'
        ? formData.lembagaCustom.trim()
        : formData.lembagaSelect;

    if (!finalLembaga) {
      errors.lembaga = 'Nama lembaga pelatihan wajib diisi';
    }

    if (!formData.durasiHari || formData.durasiHari < 1) {
      errors.durasiHari = 'Durasi minimal 1 hari';
    }

    if (formData.harga === undefined || formData.harga === null || formData.harga < 0) {
      errors.harga = 'Biaya tidak boleh negatif';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const payload: CreateMasterPelatihanDto = {
        namaPelatihan: formData.namaPelatihan.trim(),
        lembaga: finalLembaga,
        durasiHari: Number(formData.durasiHari),
        harga: Number(formData.harga),
      };

      if (editingItem) {
        await trainingApi.update(editingItem.id, payload);
        showToast('Data pelatihan berhasil diperbarui');
      } else {
        await trainingApi.create(payload);
        showToast('Pelatihan baru berhasil ditambahkan');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan data pelatihan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await trainingApi.delete(itemToDelete.id);
      showToast(`Pelatihan "${itemToDelete.namaPelatihan}" berhasil dihapus`);
      setItemToDelete(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus pelatihan', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleResetDefault = () => {
    if (confirm('Kembalikan data pelatihan ke 32 daftar standar awal K3?')) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('erm_master_pelatihan_list', JSON.stringify(DEFAULT_PELATIHAN_LIST));
      }
      showToast('Data master pelatihan dikembalikan ke standar awal');
      loadData();
    }
  };

  // Filter & Search calculations
  const filteredList = useMemo(() => {
    let result = pelatihanList;

    if (filterLembaga !== 'ALL') {
      if (filterLembaga === 'LAINNYA') {
        result = result.filter(
          (p) => !['KEMNAKER', 'BNSP'].includes(p.lembaga.toUpperCase())
        );
      } else {
        result = result.filter(
          (p) => p.lembaga.toUpperCase() === filterLembaga
        );
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.namaPelatihan.toLowerCase().includes(q) ||
          p.lembaga.toLowerCase().includes(q) ||
          String(p.durasiHari).includes(q)
      );
    }

    return result;
  }, [pelatihanList, filterLembaga, search]);

  // Statistics
  const countTotal = pelatihanList.length;
  const countKemnaker = pelatihanList.filter((p) => p.lembaga.toUpperCase() === 'KEMNAKER').length;
  const countBnsp = pelatihanList.filter((p) => p.lembaga.toUpperCase() === 'BNSP').length;
  const countLainnya = countTotal - countKemnaker - countBnsp;

  const getLembagaBadge = (lembaga: string) => {
    const l = lembaga.toUpperCase();
    if (l === 'KEMNAKER') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          KEMNAKER
        </span>
      );
    }
    if (l === 'BNSP') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          BNSP
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
        {lembaga}
      </span>
    );
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-[#FF6B1A] border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px] text-[#6B7280]">Memuat Master Data Pelatihan...</p>
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
          {/* Breadcrumb */}
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
            <span className="text-[#FF6B1A] font-medium">Daftar Pelatihan</span>
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF6B1A] mb-2">
                Admin Panel • Master Data
              </div>
              <h1 className="font-bold text-[#1F2937] text-[clamp(24px,4vw,36px)] leading-tight">
                Daftar Pelatihan & Lisensi K3
              </h1>
              <p className="text-[#6B7280] text-[13px] mt-1.5 max-w-2xl">
                Kelola master daftar pelatihan resmi. Data di halaman ini otomatis menjadi opsi pilihan saat karyawan/admin menginput data di menu <strong>Safety Competency &gt; License &amp; Certification</strong>.
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
                href="/admin/org-structure"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5E7EB] text-[#374151] text-[12px] font-medium rounded-lg hover:border-[#FF6B1A] hover:text-[#FF6B1A] transition-colors shadow-xs"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
                Struktur Organisasi &amp; PIC
              </Link>
              <Link
                href="/safety-competency/license-certification"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FFF1E8] border border-[#FF6B1A]/30 text-[#FF6B1A] text-[12px] font-semibold rounded-lg hover:bg-[#FFE5D4] transition-colors shadow-xs"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Lihat Sertifikasi
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <section className="px-6 md:px-10 py-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 text-center shadow-xs">
              <div className="text-[28px] font-bold text-[#1F2937]">{countTotal}</div>
              <div className="text-[11px] text-[#6B7280] font-semibold uppercase tracking-wider mt-0.5">
                Total Pelatihan
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 text-center shadow-xs">
              <div className="text-[28px] font-bold text-blue-600">{countKemnaker}</div>
              <div className="text-[11px] text-[#6B7280] font-semibold uppercase tracking-wider mt-0.5">
                KEMNAKER
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 text-center shadow-xs">
              <div className="text-[28px] font-bold text-amber-600">{countBnsp}</div>
              <div className="text-[11px] text-[#6B7280] font-semibold uppercase tracking-wider mt-0.5">
                BNSP
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 text-center shadow-xs">
              <div className="text-[28px] font-bold text-purple-600">{countLainnya}</div>
              <div className="text-[11px] text-[#6B7280] font-semibold uppercase tracking-wider mt-0.5">
                Lainnya / Khusus
              </div>
            </div>
          </div>

          {/* Table Container Card */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            
            {/* Filter & Action Toolbar */}
            <div className="p-5 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 flex-wrap">
                {/* Search Input */}
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
                    placeholder="Cari nama pelatihan atau lembaga..."
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

                {/* Filter Lembaga */}
                <select
                  value={filterLembaga}
                  onChange={(e) => setFilterLembaga(e.target.value)}
                  className="py-2 px-3 text-[13px] bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] font-medium text-[#374151]"
                >
                  <option value="ALL">Semua Lembaga ({countTotal})</option>
                  <option value="KEMNAKER">KEMNAKER ({countKemnaker})</option>
                  <option value="BNSP">BNSP ({countBnsp})</option>
                  <option value="LAINNYA">Lainnya ({countLainnya})</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={handleResetDefault}
                  title="Kembalikan daftar awal 32 pelatihan standar K3"
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
                  Tambah Pelatihan
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama Pelatihan</th>
                    <th className="py-3 px-4">Lembaga</th>
                    <th className="py-3 px-4 text-center">Durasi</th>
                    <th className="py-3 px-4 text-right">Biaya / Harga</th>
                    <th className="py-3 px-4 text-center w-28">Aksi</th>
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
                        <p className="font-medium text-[#4B5563]">Tidak ada pelatihan yang cocok</p>
                        <p className="text-[12px] mt-0.5">Coba gunakan kata kunci pencarian lain atau klik Tambah Pelatihan.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-orange-50/20 transition-colors">
                        <td className="py-3.5 px-4 text-center text-[#9CA3AF] font-mono text-[12px]">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#1F2937]">{item.namaPelatihan}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {getLembagaBadge(item.lembaga)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2.5 py-1 bg-gray-100 text-[#374151] rounded-lg text-[12px] font-semibold">
                            {item.durasiHari} Hari
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-[#1F2937] font-mono">
                          {formatRupiah(item.harga)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditModal(item)}
                              title="Edit Pelatihan"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-[#FF6B1A] hover:bg-[#FFF1E8] transition-colors"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setItemToDelete(item)}
                              title="Hapus Pelatihan"
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

            {/* Table Footer info */}
            <div className="p-4 bg-[#FAFAFA] border-t border-[#E5E7EB] flex items-center justify-between text-[12px] text-[#6B7280]">
              <div>
                Menampilkan <strong>{filteredList.length}</strong> dari <strong>{countTotal}</strong> daftar pelatihan
              </div>
              <div className="text-[11px] text-[#9CA3AF]">
                * Terintegrasi otomatis dengan form Tambah Sertifikat
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E5E7EB] animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-white">
              <div>
                <h3 className="text-[16px] font-bold text-[#1F2937]">
                  {editingItem ? 'Edit Master Pelatihan' : 'Tambah Master Pelatihan Baru'}
                </h3>
                <p className="text-[12px] text-[#6B7280] mt-0.5">
                  Daftar ini akan otomatis muncul sebagai opsi sertifikat
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* Nama Pelatihan */}
              <div>
                <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">
                  Nama Pelatihan &amp; Sertifikat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: SIO Crane — Operator Crane / AK3 Umum"
                  value={formData.namaPelatihan}
                  onChange={(e) => {
                    setFormData({ ...formData, namaPelatihan: e.target.value });
                    if (formErrors.namaPelatihan) setFormErrors({ ...formErrors, namaPelatihan: '' });
                  }}
                  className={`w-full px-3.5 py-2.5 text-[13px] bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]/20 transition-all ${
                    formErrors.namaPelatihan
                      ? 'border-red-400 bg-red-50/50'
                      : 'border-[#E5E7EB] focus:border-[#FF6B1A]'
                  }`}
                />
                {formErrors.namaPelatihan && (
                  <p className="text-red-500 text-[11px] mt-1">{formErrors.namaPelatihan}</p>
                )}
              </div>

              {/* Lembaga Pelatihan */}
              <div>
                <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">
                  Lembaga Penyelenggara <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {(['KEMNAKER', 'BNSP', 'Lainnya'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFormData({ ...formData, lembagaSelect: opt })}
                      className={`py-2 text-[12px] font-bold rounded-xl border transition-all text-center ${
                        formData.lembagaSelect === opt
                          ? 'bg-[#FF6B1A] text-white border-[#FF6B1A] shadow-xs'
                          : 'bg-[#FAFAFA] text-[#4B5563] border-[#E5E7EB] hover:bg-gray-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {formData.lembagaSelect === 'Lainnya' && (
                  <div>
                    <input
                      type="text"
                      placeholder="Ketik nama lembaga lain (misal: Kemenkes, Disnaker, IRCA)..."
                      value={formData.lembagaCustom}
                      onChange={(e) => {
                        setFormData({ ...formData, lembagaCustom: e.target.value });
                        if (formErrors.lembaga) setFormErrors({ ...formErrors, lembaga: '' });
                      }}
                      className={`w-full px-3.5 py-2 text-[13px] bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]/20 transition-all ${
                        formErrors.lembaga
                          ? 'border-red-400 bg-red-50/50'
                          : 'border-[#E5E7EB] focus:border-[#FF6B1A]'
                      }`}
                    />
                    {formErrors.lembaga && (
                      <p className="text-red-500 text-[11px] mt-1">{formErrors.lembaga}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Grid Durasi & Harga */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Durasi */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">
                    Durasi (Hari) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={formData.durasiHari}
                      onChange={(e) => {
                        setFormData({ ...formData, durasiHari: Number(e.target.value) });
                        if (formErrors.durasiHari) setFormErrors({ ...formErrors, durasiHari: '' });
                      }}
                      className={`w-full px-3.5 py-2.5 text-[13px] bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]/20 transition-all ${
                        formErrors.durasiHari
                          ? 'border-red-400 bg-red-50/50'
                          : 'border-[#E5E7EB] focus:border-[#FF6B1A]'
                      }`}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] text-[#9CA3AF] font-medium">
                      Hari
                    </span>
                  </div>
                  {formErrors.durasiHari && (
                    <p className="text-red-500 text-[11px] mt-1">{formErrors.durasiHari}</p>
                  )}
                </div>

                {/* Harga */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">
                    Biaya / Harga (Rp) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#9CA3AF] font-bold">
                      Rp
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={50000}
                      value={formData.harga}
                      onChange={(e) => {
                        setFormData({ ...formData, harga: Number(e.target.value) });
                        if (formErrors.harga) setFormErrors({ ...formErrors, harga: '' });
                      }}
                      className={`w-full pl-10 pr-3.5 py-2.5 text-[13px] bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]/20 font-mono transition-all ${
                        formErrors.harga
                          ? 'border-red-400 bg-red-50/50'
                          : 'border-[#E5E7EB] focus:border-[#FF6B1A]'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-[#6B7280] mt-1 font-mono">
                    Format: {formatRupiah(formData.harga || 0)}
                  </p>
                  {formErrors.harga && (
                    <p className="text-red-500 text-[11px] mt-1">{formErrors.harga}</p>
                  )}
                </div>
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
                  {saving ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambahkan Pelatihan'}
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
            <h3 className="text-[16px] font-bold text-center text-[#1F2937]">Hapus Master Pelatihan?</h3>
            <p className="text-[13px] text-gray-600 text-center mt-2">
              Apakah Anda yakin ingin menghapus <strong>&ldquo;{itemToDelete.namaPelatihan}&rdquo;</strong> dari daftar master pelatihan?
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
