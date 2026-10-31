'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  safetySignApi,
  SafetySign,
  downloadSignImage,
} from '@/lib/safetySignApi';

// Standard common sizes for quick selection in modal
const COMMON_SIZES = ['20 x 30 cm', '30 x 40 cm', '40 x 60 cm', '60 x 80 cm', 'A4', 'A3'];

export default function SafetySignPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // State
  const [signs, setSigns] = useState<SafetySign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [previewSign, setPreviewSign] = useState<SafetySign | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSign, setEditingSign] = useState<SafetySign | null>(null);
  const [deletingSign, setDeletingSign] = useState<SafetySign | null>(null);

  // Form state
  const [formNama, setFormNama] = useState('');
  const [formUkuran, setFormUkuran] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formFilePreview, setFormFilePreview] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch signs
  const fetchSigns = async () => {
    setLoading(true);
    try {
      const data = await safetySignApi.getAll();
      setSigns(Array.isArray(data) ? data : []);
    } catch {
      showToast('Gagal memuat galeri safety sign', 'error');
      setSigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSigns();
  }, []);

  // Filtered signs by search query
  const filteredSigns = useMemo(() => {
    if (!search.trim()) return signs;
    const q = search.toLowerCase().trim();
    return signs.filter((sign) => {
      return (
        sign.nama.toLowerCase().includes(q) ||
        sign.ukuran.toLowerCase().includes(q)
      );
    });
  }, [signs, search]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingSign(null);
    setFormNama('');
    setFormUkuran('30 x 40 cm');
    setFormFile(null);
    setFormFilePreview('');
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (sign: SafetySign) => {
    setEditingSign(sign);
    setFormNama(sign.nama);
    setFormUkuran(sign.ukuran);
    setFormFile(null);
    setFormFilePreview(sign.imageUrl);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Handle file select in form
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormErrors((prev) => ({ ...prev, file: 'File harus berupa gambar (JPG, PNG, WebP, SVG)' }));
        return;
      }
      setFormFile(file);
      setFormErrors((prev) => ({ ...prev, file: '' }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Add / Edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formNama.trim()) errors.nama = 'Nama safety sign wajib diisi';
    if (!formUkuran.trim()) errors.ukuran = 'Ukuran safety sign wajib diisi';
    if (!editingSign && !formFile) errors.file = 'File gambar wajib diunggah';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('nama', formNama.trim());
      fd.append('ukuran', formUkuran.trim());
      if (formFile) {
        fd.append('file', formFile);
      }

      if (editingSign) {
        await safetySignApi.update(editingSign.id, fd);
        showToast('Safety sign berhasil diperbarui');
      } else {
        await safetySignApi.create(fd);
        showToast('Safety sign berhasil ditambahkan');
      }

      setIsFormOpen(false);
      await fetchSigns();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan safety sign', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deletingSign) return;
    setSaving(true);
    try {
      await safetySignApi.delete(deletingSign.id);
      showToast('Safety sign berhasil dihapus');
      setDeletingSign(null);
      if (previewSign?.id === deletingSign.id) setPreviewSign(null);
      await fetchSigns();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus safety sign', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle Download Single Sign
  const handleDownload = async (sign: SafetySign) => {
    try {
      showToast(`Mengunduh "${sign.nama}"...`);
      await downloadSignImage(sign.imageUrl, sign.nama, sign.ukuran);
    } catch {
      showToast('Gagal mengunduh gambar', 'error');
    }
  };

  // Handle Export CSV (Matching other forms)
  const handleExportCSV = () => {
    if (filteredSigns.length === 0) {
      showToast('Tidak ada data safety sign untuk diekspor', 'error');
      return;
    }

    const headers = ['No', 'Nama Safety Sign', 'Ukuran', 'URL Gambar', 'Tanggal Dibuat'];
    const rows = filteredSigns.map((s, idx) => [
      idx + 1,
      `"${s.nama.replace(/"/g, '""')}"`,
      `"${s.ukuran.replace(/"/g, '""')}"`,
      `"${(s.imageUrl || '').replace(/"/g, '""')}"`,
      `"${s.createdAt ? new Date(s.createdAt).toLocaleDateString('id-ID') : '—'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Safety_Signs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data safety sign berhasil diekspor ke CSV');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* ── Page Header (Pola Seragam dengan Form Lain) ── */}
      <div className="bg-white px-6 md:px-10 py-7 border-b border-[#E5E7EB] shadow-xs">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#FF6B1A] mb-1.5">
            Accident Prevention
          </p>
          <h1 className="font-bold text-[#1F2937] text-2xl md:text-3xl tracking-tight leading-tight">
            Safety Sign
          </h1>
          <p className="text-[#6B7280] text-sm mt-1">
            Pengelolaan katalog rambu keselamatan kerja K3, inventaris safety sign, dan unduhan file gambar resolusi tinggi.
          </p>
        </div>
      </div>

      {/* ── Main Content Container (max-w-6xl Seragam dengan Form Lain) ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
        {/* ── Toolbar: Search + Export + + Tambah Record ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          {/* Search Box */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
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
              placeholder="Cari safety sign..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder-gray-400 focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 transition-all shadow-xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1F2937]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Export Button (Seragam dengan Form Lain) */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] text-xs font-semibold rounded-xl hover:border-[#FF6B1A] hover:text-[#FF6B1A] transition-colors whitespace-nowrap shadow-xs"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>

          {/* Tombol + Tambah Record (Posisi & Nama Seragam dengan Form Lain) */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B1A] text-white text-xs font-semibold rounded-xl hover:bg-[#E85D0F] transition-all whitespace-nowrap shadow-xs hover:shadow"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            + Tambah Record
          </button>
        </div>

        {/* ── Status Info Bar ── */}
        <div className="flex items-center justify-between mb-4 px-1 flex-wrap gap-2">
          <p className="text-xs text-[#6B7280]">
            {loading
              ? 'Memuat data rambu...'
              : `Menampilkan ${filteredSigns.length} record${search ? ` dari total ${signs.length}` : ''}`}
          </p>
          {isAdmin && !loading && (
            <span className="text-[11px] px-2.5 py-0.5 bg-[#FFF1E8] text-[#FF6B1A] rounded-full font-semibold border border-[#FF6B1A]/20">
              Mode Admin
            </span>
          )}
        </div>

        {/* ── Gallery Grid / Empty State ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm animate-pulse space-y-3">
                <div className="aspect-[4/3] bg-gray-100 rounded-xl" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-9 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredSigns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF1E8] flex items-center justify-center mb-4 text-[#FF6B1A]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <p className="font-bold text-[#1F2937] text-base mb-1">
              {search ? 'Tidak ada safety sign yang cocok' : 'Belum Ada Record Safety Sign'}
            </p>
            <p className="text-[#6B7280] text-xs max-w-sm mb-5">
              {search
                ? 'Coba ganti kata kunci pencarian Anda.'
                : 'Belum ada data rambu safety sign yang tersimpan. Klik tombol "+ Tambah Record" di atas untuk menambahkan rambu baru.'}
            </p>
            {search ? (
              <button
                onClick={() => setSearch('')}
                className="px-4 py-2 text-xs font-semibold text-[#FF6B1A] bg-[#FFF1E8] hover:bg-orange-100 rounded-xl transition-colors"
              >
                Reset Pencarian
              </button>
            ) : (
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B1A] text-white text-xs font-semibold rounded-xl hover:bg-[#E85D0F] transition-all shadow-xs"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                + Tambah Record Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredSigns.map((sign) => (
              <div
                key={sign.id}
                className="bg-white rounded-2xl border border-[#E5E7EB]/80 hover:border-[#FF6B1A]/40 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-200 overflow-hidden flex flex-col group"
              >
                {/* Image Container with Preview overlay */}
                <div
                  className="aspect-[4/3] bg-gradient-to-b from-gray-50 to-gray-100 relative overflow-hidden flex items-center justify-center p-3 cursor-pointer select-none"
                  onClick={() => setPreviewSign(sign)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sign.imageUrl}
                    alt={sign.nama}
                    className="max-h-full max-w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Quick Preview Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 text-[#1F2937] text-[11px] font-bold rounded-lg shadow-md">
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      Lihat Detail
                    </span>
                  </div>

                  {/* Size tag top-right */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-black/60 text-white backdrop-blur-md">
                      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21.3 15.3l-6.6-6.6a2 2 0 0 0-2.8 0L2.7 17.9a2 2 0 0 0 0 2.8l3.6 3.6a2 2 0 0 0 2.8 0l9.2-9.2a2 2 0 0 0 0-2.8z" />
                      </svg>
                      {sign.ukuran}
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      className="font-bold text-[14px] text-[#1F2937] line-clamp-2 leading-snug group-hover:text-[#FF6B1A] transition-colors cursor-pointer"
                      onClick={() => setPreviewSign(sign)}
                      title={sign.nama}
                    >
                      {sign.nama}
                    </h3>

                    <div className="flex items-center gap-2 mt-2 text-[11px] text-[#6B7280]">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-[#4B5563] font-medium rounded-md">
                        📐 Ukuran: {sign.ukuran}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    {/* Download Button */}
                    <button
                      onClick={() => handleDownload(sign)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-50 hover:bg-[#FF6B1A] text-[#1F2937] hover:text-white rounded-xl text-[12px] font-semibold border border-gray-200/80 hover:border-[#FF6B1A] transition-all"
                      title="Unduh gambar sign"
                    >
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download
                    </button>

                    {/* Admin Actions: Edit & Delete */}
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(sign)}
                          className="p-2 text-[#6B7280] hover:text-[#FF6B1A] hover:bg-orange-50 rounded-xl transition-colors border border-transparent hover:border-orange-200"
                          title="Edit Sign"
                        >
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeletingSign(sign)}
                          className="p-2 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200"
                          title="Hapus Sign"
                        >
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox / Preview Modal ── */}
      {previewSign && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPreviewSign(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0 bg-white">
              <div className="pr-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B1A]">Preview Safety Sign</span>
                <h2 className="font-bold text-[16px] text-[#1F2937] leading-snug">{previewSign.nama}</h2>
              </div>
              <button
                onClick={() => setPreviewSign(null)}
                className="text-[#9CA3AF] hover:text-[#1F2937] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body: Image */}
            <div className="flex-1 bg-gray-50 flex items-center justify-center p-6 overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSign.imageUrl}
                alt={previewSign.nama}
                className="max-h-[60vh] max-w-full object-contain rounded-lg drop-shadow-md"
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#6B7280]">Ukuran Standar:</span>
                <span className="font-bold text-[12px] text-[#1F2937] bg-gray-100 px-2.5 py-1 rounded-md">
                  📐 {previewSign.ukuran}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewSign)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B1A] text-white text-[13px] font-semibold rounded-xl hover:bg-[#E85D0F] shadow-sm transition-colors"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Gambar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Tambah / Edit Record ── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && setIsFormOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="font-bold text-[16px] text-[#1F2937]">
                  {editingSign ? 'Edit Record Safety Sign' : 'Tambah Record Safety Sign'}
                </h2>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                  Unggah file gambar rambu dan tentukan nama serta ukuran fisiknya.
                </p>
              </div>
              <button
                onClick={() => !saving && setIsFormOpen(false)}
                className="text-[#9CA3AF] hover:text-[#1F2937] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Gambar Sign Upload */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] mb-1.5">
                  File Gambar Safety Sign <span className="text-red-500">*</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {formFilePreview ? (
                  <div className="relative rounded-xl border border-gray-200 bg-gray-50 p-3 flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formFilePreview}
                      alt="Preview"
                      className="max-h-48 max-w-full object-contain rounded-lg drop-shadow"
                    />
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 text-[11px] font-semibold text-[#1F2937] bg-white border border-gray-200 rounded-lg hover:border-[#FF6B1A] transition-colors"
                      >
                        Ganti Gambar
                      </button>
                      {formFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormFile(null);
                            setFormFilePreview(editingSign?.imageUrl || '');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="px-2.5 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Batal Ganti
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 hover:border-[#FF6B1A] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-orange-50/30 text-center"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6B1A] flex items-center justify-center mb-2">
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <p className="text-[13px] font-semibold text-[#1F2937]">Klik untuk pilih gambar</p>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">Mendukung format JPG, PNG, WebP, SVG</p>
                  </div>
                )}
                {formErrors.file && <p className="text-red-500 text-[11px] mt-1">{formErrors.file}</p>}
              </div>

              {/* Nama Sign */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] mb-1.5">
                  Nama Sign <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Contoh: Dilarang Merokok / No Smoking"
                  className={`w-full px-3.5 py-2.5 text-[13px] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]/30 focus:border-[#FF6B1A] transition-colors ${
                    formErrors.nama ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {formErrors.nama && <p className="text-red-500 text-[11px] mt-1">{formErrors.nama}</p>}
              </div>

              {/* Ukuran Sign */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] mb-1.5">
                  Ukuran Sign <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formUkuran}
                  onChange={(e) => setFormUkuran(e.target.value)}
                  placeholder="Contoh: 30 x 40 cm"
                  className={`w-full px-3.5 py-2.5 text-[13px] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]/30 focus:border-[#FF6B1A] transition-colors ${
                    formErrors.ukuran ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {formErrors.ukuran && <p className="text-red-500 text-[11px] mt-1">{formErrors.ukuran}</p>}

                {/* Quick Chips in Form */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-[#9CA3AF] uppercase font-bold mr-1">Pilihan Cepat:</span>
                  {COMMON_SIZES.map((sz) => (
                    <button
                      type="button"
                      key={sz}
                      onClick={() => setFormUkuran(sz)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                        formUkuran === sz
                          ? 'bg-[#FF6B1A] text-white border-[#FF6B1A]'
                          : 'bg-gray-50 text-[#6B7280] border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 text-[13px] font-semibold text-[#1F2937] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-[#FF6B1A] rounded-xl hover:bg-[#E85D0F] shadow-sm transition-colors disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Menyimpan...
                    </>
                  ) : editingSign ? (
                    'Simpan Perubahan'
                  ) : (
                    '+ Tambah Record'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {deletingSign && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && setDeletingSign(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6M9 6V4h6v2" />
              </svg>
            </div>
            <h3 className="font-bold text-[16px] text-[#1F2937]">Hapus Safety Sign?</h3>
            <p className="text-[12px] text-[#6B7280] mt-1 mb-5">
              Apakah Anda yakin ingin menghapus rambu <strong>&quot;{deletingSign.nama}&quot;</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingSign(null)}
                disabled={saving}
                className="flex-1 py-2 text-[13px] font-semibold text-[#1F2937] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={saving}
                className="flex-1 py-2 text-[13px] font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {saving ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[700] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-[13px] font-semibold text-white animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
