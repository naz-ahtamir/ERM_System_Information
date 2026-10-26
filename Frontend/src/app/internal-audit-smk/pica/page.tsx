'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import {
  picaApi,
  formatTanggalPica,
  sisaHariDeadline,
  sisaHariColor,
  isTerlambat,
  hitungStatistikPica,
  formatFileSize,
  isImageFile,
} from '@/lib/picaApi';
import type { PicaRecord, PicaFilters, StatusPerbaikan, KategoriTemuan, JenisTemuan, HiraruchiPengendalian } from '@/types/pica';
import {
  KATEGORI_TEMUAN_LABELS,
  STATUS_PERBAIKAN_LABELS,
  JENIS_TEMUAN_OPTIONS,
  HIRARKI_OPTIONS,
  KATEGORI_OPTIONS,
} from '@/types/pica';
import { KRITERIA_SMK3 } from '@/data/picaData';
import toast from 'react-hot-toast';

// ── Input style constants ─────────────────────────────────────────────────────
const inputCls    = 'w-full border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 transition-colors bg-white';
const textareaCls = inputCls + ' resize-none';

// ── Shared form sub-components ────────────────────────────────────────────────

function FormSection({
  title, icon, badge, children,
}: {
  title: string; icon: React.ReactNode; badge?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="bg-[#FAFAFA] border-b border-[#E5E7EB] px-5 py-3 flex items-center gap-2.5">
        <span className="text-[#FF6B1A]">{icon}</span>
        <h2 className="text-[14px] font-semibold text-[#1F2937]">{title}</h2>
        {badge}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label, required, optional, children, hint,
}: {
  label: string; required?: boolean; optional?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1F2937] mb-1.5">
        {label}
        {required && <span className="text-red-500 text-[12px]">*</span>}
        {optional && <span className="text-[#9CA3AF] text-[11px] font-normal">(opsional)</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[#9CA3AF] mt-1">{hint}</p>}
    </div>
  );
}

function FileUploadArea({
  files, onAdd, onRemove,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
  placeholder = 'Klik atau drag file ke sini',
  subtext = 'Foto, PDF, dokumen',
}: {
  files: File[]; onAdd: (f: File[]) => void; onRemove: (i: number) => void;
  accept?: string; placeholder?: string; subtext?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  // Buat object URL untuk preview gambar (di-revoke saat unmount)
  const [previews, setPreviews] = useState<string[]>([]);
  useEffect(() => {
    const urls = files.map((f) =>
      isImageFile(f.name) ? URL.createObjectURL(f) : ''
    );
    setPreviews(urls);
    return () => { urls.forEach((u) => { if (u) URL.revokeObjectURL(u); }); };
  }, [files]);

  const imageFiles = files.filter((f) => isImageFile(f.name));
  const otherFiles = files.filter((f) => !isImageFile(f.name));

  return (
    <>
      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-4 text-center hover:border-[#FF6B1A] transition-colors cursor-pointer"
        onClick={() => ref.current?.click()}
      >
        <svg className="w-6 h-6 text-[#E5E7EB] mx-auto mb-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <p className="text-[12px] text-[#6B7280]">{placeholder}</p>
        <p className="text-[11px] text-[#9CA3AF] mt-0.5">{subtext}</p>
        <input ref={ref} type="file" className="hidden" multiple accept={accept}
          onChange={(e) => { if (e.target.files) { onAdd(Array.from(e.target.files)); e.target.value = ''; } }} />
      </div>

      {files.length > 0 && (
        <>
          {/* ── Thumbnail grid untuk gambar baru ── */}
          {imageFiles.length > 0 && (
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {imageFiles.map((file) => {
                const originalIdx = files.indexOf(file);
                const previewUrl = previews[originalIdx] || '';
                return (
                  <div key={originalIdx} className="relative group aspect-square rounded-xl overflow-hidden border border-[#E5E7EB] shadow-sm">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {/* Overlay info + hapus */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => onRemove(originalIdx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md"
                        title="Hapus"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                    {/* Label di bawah */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                      <p className="text-white text-[10px] truncate leading-snug">{file.name}</p>
                      <p className="text-white/70 text-[9px]">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Daftar file non-gambar ── */}
          {otherFiles.length > 0 && (
            <div className={`space-y-1.5 ${imageFiles.length > 0 ? 'mt-2' : 'mt-2'}`}>
              {otherFiles.map((file) => {
                const originalIdx = files.indexOf(file);
                return (
                  <div key={originalIdx} className="flex items-center gap-2 bg-[#FAFAFA] rounded-lg px-3 py-2">
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span className="text-[12px] text-[#1F2937] flex-1 truncate">{file.name}</span>
                    <span className="text-[11px] text-[#9CA3AF]">{(file.size / 1024).toFixed(0)} KB</span>
                    <button type="button" onClick={() => onRemove(originalIdx)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
}

// ── File Preview Lightbox ─────────────────────────────────────────────────

function FileLightbox({
  files,
  initialIndex,
  onClose,
}: {
  files: { fileName: string; fileUrl: string; fileSize: number }[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(initialIndex);
  const file = files[idx];
  const isImg = isImageFile(file.fileName);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx((i) => Math.min(i + 1, files.length - 1));
      if (e.key === 'ArrowLeft')  setIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [files.length, onClose]);

  return (
    <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative z-10 flex flex-col items-center w-full max-w-4xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="w-full flex items-center justify-between bg-black/60 rounded-t-2xl px-4 py-2.5 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {isImg
              ? <svg className="w-4 h-4 text-green-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              : <svg className="w-4 h-4 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            }
            <span className="text-white text-[13px] truncate">{file.fileName}</span>
            <span className="text-[#9CA3AF] text-[11px] flex-shrink-0">{formatFileSize(file.fileSize)}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {files.length > 1 && (
              <span className="text-[#9CA3AF] text-[12px]">{idx + 1} / {files.length}</span>
            )}
            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-colors"
              title="Buka di tab baru">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="w-full bg-[#1a1a1a] rounded-b-2xl overflow-hidden flex items-center justify-center"
          style={{ maxHeight: 'calc(90vh - 48px)' }}>
          {isImg ? (
            <img
              src={file.fileUrl}
              alt={file.fileName}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: 'calc(90vh - 48px)' }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <p className="text-white font-semibold text-[15px] mb-1">{file.fileName}</p>
              <p className="text-[#9CA3AF] text-[13px] mb-5">Preview tidak tersedia untuk tipe file ini</p>
              <a href={file.fileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B1A] text-white text-[13px] font-semibold rounded-xl hover:bg-[#E85D0F] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Buka File
              </a>
            </div>
          )}
        </div>

        {/* Arrow navigation */}
        {files.length > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => Math.max(i - 1, 0))}
              disabled={idx === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white disabled:opacity-30 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button
              onClick={() => setIdx((i) => Math.min(i + 1, files.length - 1))}
              disabled={idx === files.length - 1}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white disabled:opacity-30 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </>
        )}

        {/* Thumbnail strip */}
        {files.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 max-w-full">
            {files.map((f, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  i === idx ? 'border-[#FF6B1A]' : 'border-transparent opacity-60 hover:opacity-100'
                }`}>
                {isImageFile(f.fileName) ? (
                  <img src={f.fileUrl} alt={f.fileName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── FileListWithDelete — seperti FileList tapi tiap file punya tombol hapus ──

function FileListWithDelete({
  files,
  deletingIds,
  onDelete,
}: {
  files: { id?: string; fileName: string; fileUrl: string; fileSize: number }[];
  deletingIds: Set<string>;
  onDelete: (fileId: string) => void;
}) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!files?.length) return null;

  const imageFiles = files.filter((f) => isImageFile(f.fileName));
  const otherFiles = files.filter((f) => !isImageFile(f.fileName));

  // Normalize files to include id for lightbox compatibility
  const lightboxFiles = files.map((f) => ({
    fileName: f.fileName,
    fileUrl: f.fileUrl,
    fileSize: f.fileSize,
  }));

  return (
    <>
      {/* ── Thumbnail grid untuk file gambar ── */}
      {imageFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {imageFiles.map((f) => {
            const originalIdx = files.indexOf(f);
            const fileId = f.id ?? '';
            const isDeleting = fileId ? deletingIds.has(fileId) : false;
            return (
              <div
                key={originalIdx}
                className={`relative group aspect-square rounded-xl overflow-hidden border shadow-sm transition-all ${
                  isDeleting ? 'opacity-40 border-red-300' : 'border-[#E5E7EB] hover:border-[#FF6B1A]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setLightboxIdx(originalIdx)}
                  className="absolute inset-0 w-full h-full focus:outline-none"
                  title={f.fileName}
                >
                  <img
                    src={f.fileUrl}
                    alt={f.fileName}
                    className="w-full h-full object-cover"
                  />
                  {/* View overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                    <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 drop-shadow transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </div>
                  {/* Nama file */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-white text-[10px] truncate leading-snug">{f.fileName}</p>
                    <p className="text-white/70 text-[9px]">{formatFileSize(f.fileSize)}</p>
                  </div>
                </button>
                {/* Tombol hapus */}
                {fileId && (
                  <button
                    type="button"
                    onClick={() => onDelete(fileId)}
                    disabled={isDeleting}
                    className="absolute top-1.5 right-1.5 z-10 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-all"
                    title="Hapus file ini"
                  >
                    {isDeleting ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Daftar file non-gambar ── */}
      {otherFiles.length > 0 && (
        <div className={`space-y-1.5 ${imageFiles.length > 0 ? 'mt-2' : 'mt-2'}`}>
          {otherFiles.map((f) => {
            const originalIdx = files.indexOf(f);
            const fileId = f.id ?? '';
            const isDeleting = fileId ? deletingIds.has(fileId) : false;
            return (
              <div
                key={originalIdx}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 border transition-all ${
                  isDeleting ? 'opacity-40 bg-red-50 border-red-200' : 'bg-[#FAFAFA] border-[#E5E7EB]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setLightboxIdx(originalIdx)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                >
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span className="text-[12px] text-[#6B7280] truncate flex-1">{f.fileName}</span>
                  <span className="text-[10px] text-[#9CA3AF] flex-shrink-0">{formatFileSize(f.fileSize)}</span>
                </button>
                {fileId && (
                  <button
                    type="button"
                    onClick={() => onDelete(fileId)}
                    disabled={isDeleting}
                    className="flex-shrink-0 text-red-400 hover:text-red-600 disabled:opacity-40 p-0.5 transition-colors"
                    title="Hapus file ini"
                  >
                    {isDeleting ? (
                      <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="m19 6-.867 14.142A2 2 0 0 1 16.138 22H7.862a2 2 0 0 1-1.995-1.858L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                      </svg>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {lightboxIdx !== null && (
        <FileLightbox
          files={lightboxFiles}
          initialIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}

function FileList({ files }: { files: { fileName: string; fileUrl: string; fileSize: number }[] }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!files?.length) return null;

  const imageFiles = files.filter((f) => isImageFile(f.fileName));
  const otherFiles = files.filter((f) => !isImageFile(f.fileName));

  return (
    <>
      {/* ── Embed thumbnail grid untuk file gambar ── */}
      {imageFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {imageFiles.map((f) => {
            const originalIdx = files.indexOf(f);
            return (
              <button
                key={originalIdx}
                onClick={() => setLightboxIdx(originalIdx)}
                className="relative group aspect-square rounded-xl overflow-hidden border border-[#E5E7EB] hover:border-[#FF6B1A] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]/30"
                title={f.fileName}
              >
                <img
                  src={f.fileUrl}
                  alt={f.fileName}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                {/* Overlay saat hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                {/* Label nama file di bawah */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-[10px] truncate leading-snug">{f.fileName}</p>
                  <p className="text-white/70 text-[9px]">{formatFileSize(f.fileSize)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Daftar file non-gambar ── */}
      {otherFiles.length > 0 && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${imageFiles.length > 0 ? 'mt-2' : 'mt-2'}`}>
          {otherFiles.map((f) => {
            const originalIdx = files.indexOf(f);
            return (
              <button key={originalIdx} onClick={() => setLightboxIdx(originalIdx)}
                className="flex items-center gap-2.5 bg-[#FAFAFA] hover:bg-orange-50 border border-[#E5E7EB] hover:border-orange-200 rounded-xl px-3 py-2 transition-colors group text-left w-full">
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span className="text-[12px] text-[#6B7280] group-hover:text-[#FF6B1A] truncate flex-1 transition-colors">{f.fileName}</span>
                <span className="text-[10px] text-[#9CA3AF] flex-shrink-0">{formatFileSize(f.fileSize)}</span>
                <svg className="w-3 h-3 text-[#E5E7EB] group-hover:text-[#FF6B1A] flex-shrink-0 transition-colors ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {lightboxIdx !== null && (
        <FileLightbox
          files={files}
          initialIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}

function RiwayatTimeline({ riwayat }: { riwayat: PicaRecord['riwayatApproval'] }) {
  if (!riwayat?.length) return <p className="text-[12px] text-[#9CA3AF] italic">Belum ada riwayat</p>;
  return (
    <div className="space-y-3">
      {[...riwayat].reverse().map((r, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${r.action === 'ACC' ? 'bg-green-100' : 'bg-red-100'}`}>
            {r.action === 'ACC'
              ? <svg className="w-3 h-3 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
              : <svg className="w-3 h-3 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[12px] font-bold ${r.action === 'ACC' ? 'text-green-700' : 'text-red-700'}`}>
                {r.action === 'ACC' ? 'Disetujui (ACC)' : 'Ditolak (TACC)'}
              </span>
              <span className="text-[11px] text-[#9CA3AF]">— {r.oleh}</span>
            </div>
            <div className="text-[11px] text-[#9CA3AF]">{formatTanggalPica(r.tanggal)}</div>
            {r.keterangan && (
              <div className={`mt-1 text-[12px] rounded-lg px-2 py-1 ${r.action === 'TACC' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                {r.keterangan}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────

function StatusPill({ status, isTacc }: { status: StatusPerbaikan; isTacc?: boolean }) {
  if (isTacc) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-700">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      OPEN (TACC)
    </span>
  );
  const { label, bg, text } = STATUS_PERBAIKAN_LABELS[status] ?? { label: status, bg: 'bg-gray-100', text: 'text-gray-700' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${bg} ${text}`}>{label}</span>;
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, color, active, onClick }: {
  label: string; value: number; color: string; active?: boolean; onClick?: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`bg-white rounded-xl border px-4 py-3 flex flex-col gap-1 shadow-sm w-full text-left transition-all ${active ? 'border-[#FF6B1A] ring-1 ring-[#FF6B1A]' : 'border-[#E5E7EB] hover:border-[#E5E7EB]'} ${onClick ? 'cursor-pointer' : 'cursor-default'}`}>
      <span className="text-[12px] text-[#6B7280]">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </button>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const iconInfo = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const iconPerbaikan = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const iconHistory = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL: Create / Edit Temuan (admin only)
// ═══════════════════════════════════════════════════════════════════════════════

interface CreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record?: PicaRecord | null; // null = create mode
  user: any;
}

function CreateEditModal({ isOpen, onClose, onSuccess, record, user }: CreateEditModalProps) {
  const isEdit = !!record;
  const [saving, setSaving] = useState(false);

  // ── Divisi list dari API ────────────────────────────────────────────────
  const [divisiList, setDivisiList]       = useState<any[]>([]);
  const [divisiLoading, setDivisiLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setDivisiLoading(true);
    const token = localStorage.getItem('smk3_token');
    fetch('/api/divisions', {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
      .then((r) => r.json())
      .then((data) => setDivisiList(Array.isArray(data) ? data : []))
      .catch(() => setDivisiList([]))
      .finally(() => setDivisiLoading(false));
  }, [isOpen]);

  const [temuanMasalah,        setTemuanMasalah]        = useState('');
  const [kriteriaId,           setKriteriaId]           = useState('');
  const [kriteriaSearch,       setKriteriaSearch]       = useState('');
  const [showKriteria,         setShowKriteria]         = useState(false);
  const [kategori,             setKategori]             = useState<KategoriTemuan | ''>('');
  const [lokasiDivisiId,       setLokasiDivisiId]       = useState('');
  const [picNamaManual,        setPicNamaManual]        = useState('');
  const [picIdManual,          setPicIdManual]          = useState('');
  const [dokTeks,              setDokTeks]              = useState('');
  const [temuanFiles,          setTemuanFiles]          = useState<File[]>([]);
  const [tanggalTemuan,        setTanggalTemuan]        = useState(new Date().toISOString().split('T')[0]);
  const [jenisTemuan,          setJenisTemuan]          = useState<JenisTemuan | ''>('');
  const [batasAkhir,           setBatasAkhir]           = useState('');
  const [hirarki,              setHirarki]              = useState<HiraruchiPengendalian[]>([]);
  const [rekomendasi,          setRekomendasi]          = useState('');
  const [perbaikanFiles,       setPerbaikanFiles]       = useState<File[]>([]);

  // ── State untuk hapus file existing (temuan + perbaikan) ───────────────
  const [deletingIds,           setDeletingIds]           = useState<Set<string>>(new Set());
  const [existingTemuanFiles,   setExistingTemuanFiles]   = useState<PicaRecord['dokumentasiTemuanFiles']>([]);
  const [existingPerbaikanFiles, setExistingPerbaikanFiles] = useState<PicaRecord['dokumentasiPerbaikanFiles']>([]);

  // Populate on edit
  useEffect(() => {
    if (isOpen) {
      if (record) {
        setTemuanMasalah(record.temuanMasalah);
        setKriteriaId(record.kriteriaId);
        setKategori(record.kategori as KategoriTemuan);
        setLokasiDivisiId(record.lokasiDivisiId);
        setPicNamaManual(record.picNama);
        setPicIdManual(record.picId);
        setDokTeks(record.dokumentasiTemuanTeks || '');
        setTanggalTemuan(record.tanggalTemuan);
        setJenisTemuan(record.jenisTemuan as JenisTemuan);
        setBatasAkhir(record.batasAkhir);
        setHirarki(record.hierarkiPengendalian as HiraruchiPengendalian[]);
        setRekomendasi(record.rekomendasiPerbaikan || '');
        setTemuanFiles([]);
        setPerbaikanFiles([]);
        setDeletingIds(new Set());
        setExistingTemuanFiles(record.dokumentasiTemuanFiles);
        setExistingPerbaikanFiles(record.dokumentasiPerbaikanFiles);
      } else {
        setTemuanMasalah(''); setKriteriaId(''); setKriteriaSearch('');
        setKategori(''); setLokasiDivisiId(''); setPicNamaManual(''); setPicIdManual('');
        setDokTeks(''); setTemuanFiles([]);
        setTanggalTemuan(new Date().toISOString().split('T')[0]);
        setJenisTemuan(''); setBatasAkhir('');
        setHirarki([]); setRekomendasi(''); setPerbaikanFiles([]);
        setDeletingIds(new Set());
        setExistingTemuanFiles([]);
        setExistingPerbaikanFiles([]);
      }
    }
  }, [isOpen, record]);

  // ── Handler hapus file existing ────────────────────────────────────────
  const handleDeleteTemuanFile = async (fileId: string) => {
    if (!record) return;
    if (!confirm('Hapus foto/file ini? Tindakan ini tidak bisa dibatalkan.')) return;
    setDeletingIds((prev) => new Set(prev).add(fileId));
    try {
      await picaApi.deleteFile(record.id, fileId);
      setExistingTemuanFiles((prev) => prev.filter((f) => (f as any).id !== fileId));
      toast.success('File berhasil dihapus');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus file');
    } finally {
      setDeletingIds((prev) => { const s = new Set(prev); s.delete(fileId); return s; });
    }
  };

  const handleDeletePerbaikanFile = async (fileId: string) => {
    if (!record) return;
    if (!confirm('Hapus bukti perbaikan ini? Tindakan ini tidak bisa dibatalkan.')) return;
    setDeletingIds((prev) => new Set(prev).add(fileId));
    try {
      await picaApi.deleteFile(record.id, fileId);
      setExistingPerbaikanFiles((prev) => prev.filter((f) => (f as any).id !== fileId));
      toast.success('File berhasil dihapus');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus file');
    } finally {
      setDeletingIds((prev) => { const s = new Set(prev); s.delete(fileId); return s; });
    }
  };

  const selectedDivisi   = divisiList.find((d) => d.id === lokasiDivisiId);
  const selectedKriteria = KRITERIA_SMK3.find((k) => k.id === kriteriaId);
  const filteredKriteria = kriteriaSearch.trim()
    ? KRITERIA_SMK3.filter((k) =>
        k.id.toLowerCase().includes(kriteriaSearch.toLowerCase()) ||
        k.deskripsi.toLowerCase().includes(kriteriaSearch.toLowerCase())
      ).slice(0, 20)
    : [];

  const toggleHirarki = (h: HiraruchiPengendalian) =>
    setHirarki((prev) => prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]);

  const handleSubmit = async () => {
    if (!temuanMasalah.trim()) { toast.error('Temuan masalah wajib diisi'); return; }
    setSaving(true);
    try {
      const picNama  = selectedDivisi?.pic?.nama || picNamaManual || user?.nama || 'TBD';
      const picId    = selectedDivisi?.pic?.id   || picIdManual   || user?.id   || 'TBD';
      const divisiId = lokasiDivisiId || user?.departemen || 'TBD';

      const fd = new FormData();
      fd.append('temuanMasalah',         temuanMasalah);
      fd.append('kriteriaId',            kriteriaId    || 'TBD');
      fd.append('kriteriaDeskripsi',     selectedKriteria?.deskripsi || '');
      fd.append('kategori',              kategori      || 'MINOR');
      fd.append('lokasiDivisiId',        lokasiDivisiId || divisiId);
      fd.append('lokasiDivisiNama',      selectedDivisi?.name || '');
      fd.append('dokumentasiTemuanTeks', dokTeks);
      fd.append('tanggalTemuan',         tanggalTemuan);
      fd.append('jenisTemuan',           jenisTemuan || 'Kondisi Tidak Aman');
      fd.append('batasAkhir',            batasAkhir || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
      fd.append('picId',                 picId);
      fd.append('picNama',               picNama);
      fd.append('divisiId',              divisiId);
      fd.append('hierarkiPengendalian',  JSON.stringify(hirarki.length ? hirarki : ['Administrasi']));
      fd.append('rekomendasiPerbaikan',  rekomendasi || '-');

      if (!isEdit) {
        fd.append('createdBy',   user?.nama || user?.name || 'Admin');
        fd.append('createdById', user?.id   || '');
        temuanFiles.forEach((f) => fd.append('dokumentasiTemuan', f));
        const result = await picaApi.create(fd);
        const newId  = result.data.id;

        if (perbaikanFiles.length > 0 && newId) {
          const buktifd = new FormData();
          perbaikanFiles.forEach((f) => buktifd.append('dokumentasiPerbaikan', f));
          await picaApi.action({ id: newId, action: 'submit_perbaikan', formData: buktifd });
          toast.success('Temuan dibuat dan bukti perbaikan disubmit!');
        } else {
          toast.success('Temuan berhasil dibuat!');
        }
      } else {
        // Edit: id sudah ada di record
        temuanFiles.forEach((f) => fd.append('dokumentasiTemuan', f));
        await picaApi.update(record!.id, fd, true);

        if (perbaikanFiles.length > 0) {
          const buktifd = new FormData();
          perbaikanFiles.forEach((f) => buktifd.append('dokumentasiPerbaikan', f));
          await picaApi.action({
            id: record!.id, action: 'submit_perbaikan',
            formData: buktifd, oleh: user?.nama || 'Admin', keterangan: rekomendasi,
          });
          toast.success('Data tersimpan dan bukti perbaikan disubmit!');
        } else {
          toast.success('Data temuan berhasil disimpan');
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <h2 className="font-bold text-[15px] text-[#1F2937]">
            {isEdit ? 'Edit Temuan PICA' : 'Tambah Record'}
          </h2>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1F2937] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* ── Bagian 1: Informasi Temuan ── */}
          <FormSection title="Informasi Temuan" icon={iconInfo}>
            <Field label="Temuan Masalah" required>
              <textarea className={textareaCls} rows={3}
                placeholder="Deskripsikan temuan masalah yang ditemukan saat audit..."
                value={temuanMasalah} onChange={(e) => setTemuanMasalah(e.target.value)} />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Tanggal Temuan" required>
                <input type="date" className={inputCls} value={tanggalTemuan}
                  onChange={(e) => setTanggalTemuan(e.target.value)} />
              </Field>
              <Field label="Jenis Temuan" required>
                <select className={inputCls} value={jenisTemuan}
                  onChange={(e) => setJenisTemuan(e.target.value as JenisTemuan)}>
                  <option value="">-- Pilih Jenis --</option>
                  {JENIS_TEMUAN_OPTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Tingkat Keparahan" required>
              <div className="flex gap-2 flex-wrap">
                {KATEGORI_OPTIONS.map((k) => {
                  const { label, bg, text, border } = KATEGORI_TEMUAN_LABELS[k];
                  return (
                    <button key={k} type="button" onClick={() => setKategori(k)}
                      className={`px-4 py-2 rounded-xl text-[13px] font-semibold border-2 transition-all ${
                        kategori === k ? `${bg} ${text} ${border} shadow-sm` : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#E5E7EB]'
                      }`}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Kriteria SMK3" optional hint="Cari berdasarkan kode (misal: 6.1.1) atau kata kunci">
              <div className="relative">
                <input type="text" className={inputCls}
                  placeholder="Cari kriteria..."
                  value={kriteriaSearch || (selectedKriteria ? `${selectedKriteria.id} — ${selectedKriteria.deskripsi.slice(0, 60)}…` : '')}
                  onChange={(e) => { setKriteriaSearch(e.target.value); setKriteriaId(''); setShowKriteria(true); }}
                  onFocus={() => { if (!kriteriaId) setShowKriteria(true); }} />
                {kriteriaId && (
                  <button type="button" onClick={() => { setKriteriaId(''); setKriteriaSearch(''); setShowKriteria(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1F2937]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
                {showKriteria && filteredKriteria.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 bg-white border border-[#E5E7EB] rounded-xl shadow-lg mt-1 max-h-52 overflow-y-auto">
                    {filteredKriteria.map((k) => (
                      <button key={k.id} type="button"
                        className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors border-b border-[#FAFAFA] last:border-0"
                        onClick={() => { setKriteriaId(k.id); setKriteriaSearch(''); setShowKriteria(false); }}>
                        <div className="flex items-start gap-2">
                          <span className="inline-block bg-[#FF6B1A]/10 text-[#FF6B1A] text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0">{k.id}</span>
                          <span className="text-[12px] text-[#1F2937] leading-snug">{k.deskripsi}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {kriteriaId && selectedKriteria && (
                  <div className="mt-2 p-3 bg-orange-50 rounded-xl border border-orange-100 text-[12px]">
                    <span className="inline-block bg-[#FF6B1A] text-white font-mono font-bold px-2 py-0.5 rounded mr-2">{selectedKriteria.id}</span>
                    {selectedKriteria.deskripsi}
                  </div>
                )}
              </div>
            </Field>

            <Field label="Lokasi Temuan (Divisi)" required hint="PIC akan otomatis terisi sesuai divisi">
              <select className={inputCls} value={lokasiDivisiId} onChange={(e) => setLokasiDivisiId(e.target.value)}
                disabled={divisiLoading}>
                <option value="">
                  {divisiLoading ? 'Memuat divisi...' : `-- Pilih Divisi (${divisiList.length}) --`}
                </option>
                {divisiList.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {selectedDivisi && (
                <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-100 text-[12px]">
                  <div className="font-semibold text-blue-800">{selectedDivisi.name}</div>
                  <div className="text-blue-600 mt-0.5">
                    PIC: <strong>{selectedDivisi.pic?.nama ?? '—'}</strong>
                    <span className="ml-2 text-blue-400">ID: {selectedDivisi.pic?.idKaryawan ?? '—'}</span>
                  </div>
                  {selectedDivisi.department?.name && (
                    <div className="text-blue-400 mt-0.5">Departemen: {selectedDivisi.department.name}</div>
                  )}
                </div>
              )}
              {!lokasiDivisiId && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Field label="Nama PIC" optional>
                    <input type="text" className={inputCls} placeholder="Nama PIC..." value={picNamaManual} onChange={(e) => setPicNamaManual(e.target.value)} />
                  </Field>
                  <Field label="ID PIC" optional>
                    <input type="text" className={inputCls} placeholder="ID PIC..." value={picIdManual} onChange={(e) => setPicIdManual(e.target.value)} />
                  </Field>
                </div>
              )}
            </Field>

            <Field label="Batas Akhir Perbaikan" required>
              <input type="date" className={inputCls} value={batasAkhir} min={tanggalTemuan}
                onChange={(e) => setBatasAkhir(e.target.value)} />
            </Field>

            <Field label="Dokumentasi Temuan" optional>
              <textarea className={`${textareaCls} mb-3`} rows={2}
                placeholder="Deskripsi singkat kondisi saat temuan (opsional)..."
                value={dokTeks} onChange={(e) => setDokTeks(e.target.value)} />
              {/* File lama (edit mode) — dengan tombol hapus */}
              {isEdit && existingTemuanFiles.length > 0 && (
                <div className="mb-3">
                  <p className="text-[12px] font-semibold text-[#1F2937] mb-1.5 flex items-center gap-1.5">
                    File Tersimpan
                    <span className="text-[11px] font-normal text-[#9CA3AF]">({existingTemuanFiles.length} file — hover untuk hapus)</span>
                  </p>
                  <FileListWithDelete
                    files={existingTemuanFiles.map((f) => ({ ...(f as any), id: (f as any).id }))}
                    deletingIds={deletingIds}
                    onDelete={handleDeleteTemuanFile}
                  />
                </div>
              )}
              {/* Upload file baru */}
              <FileUploadArea files={temuanFiles}
                onAdd={(f) => setTemuanFiles((p) => [...p, ...f])}
                onRemove={(i) => setTemuanFiles((p) => p.filter((_, j) => j !== i))}
                placeholder={isEdit && existingTemuanFiles.length > 0 ? 'Tambah foto / dokumen baru' : 'Upload foto / dokumen temuan'}
                subtext="Foto, PDF, dokumen" />
            </Field>
          </FormSection>

          {/* ── Bagian 2: Tindakan Perbaikan ── */}
          <FormSection title="Tindakan Perbaikan" icon={iconPerbaikan}
            badge={<span className="ml-auto text-[11px] text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-medium">Dapat diisi semua pengguna</span>}>

            <Field label="Hirarki Pengendalian" required hint="Pilih satu atau lebih">
              <div className="flex flex-wrap gap-2">
                {HIRARKI_OPTIONS.map((h) => {
                  const selected = hirarki.includes(h);
                  return (
                    <button key={h} type="button" onClick={() => toggleHirarki(h)}
                      className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all ${
                        selected ? 'bg-[#FF6B1A] text-white border-[#FF6B1A] shadow-sm' : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#FF6B1A] hover:text-[#FF6B1A]'
                      }`}>
                      {selected && <span className="mr-1">✓</span>}{h}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Rekomendasi Tindakan Perbaikan" required>
              <textarea className={textareaCls} rows={3}
                placeholder="Tuliskan rekomendasi tindakan perbaikan..."
                value={rekomendasi} onChange={(e) => setRekomendasi(e.target.value)} />
            </Field>

            <Field label="Bukti Perbaikan" optional hint="Jika diupload, status temuan akan otomatis menjadi INPG">
              {/* File bukti perbaikan lama (edit mode) — dengan tombol hapus */}
              {isEdit && existingPerbaikanFiles.length > 0 && (
                <div className="mb-3">
                  <p className="text-[12px] font-semibold text-[#1F2937] mb-1.5 flex items-center gap-1.5">
                    Bukti Perbaikan Tersimpan
                    <span className="text-[11px] font-normal text-[#9CA3AF]">({existingPerbaikanFiles.length} file — hover untuk hapus)</span>
                  </p>
                  <FileListWithDelete
                    files={existingPerbaikanFiles.map((f) => ({ ...(f as any), id: (f as any).id }))}
                    deletingIds={deletingIds}
                    onDelete={handleDeletePerbaikanFile}
                  />
                </div>
              )}
              <FileUploadArea files={perbaikanFiles}
                onAdd={(f) => setPerbaikanFiles((p) => [...p, ...f])}
                onRemove={(i) => setPerbaikanFiles((p) => p.filter((_, j) => j !== i))}
                placeholder={isEdit && existingPerbaikanFiles.length > 0 ? 'Tambah bukti perbaikan baru' : 'Upload bukti perbaikan (opsional)'}
                subtext="Foto, PDF, dokumen — jika diisi, status langsung INPG" />
              {perbaikanFiles.length > 0 && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-[12px] text-blue-700">
                    <strong>{perbaikanFiles.length} file bukti</strong> akan diupload. Status akan otomatis berubah ke <strong>INPG</strong>.
                  </p>
                </div>
              )}
            </Field>
          </FormSection>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] flex-shrink-0">
          <button onClick={onClose} disabled={saving}
            className="px-4 py-2 text-[13px] font-semibold text-[#1F2937] bg-[#FAFAFA] rounded-xl hover:bg-[#E5E7EB] transition-colors disabled:opacity-50">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-[#FF6B1A] text-white text-[13px] font-semibold rounded-xl hover:bg-[#E85D0F] transition-colors disabled:opacity-60">
            {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? 'Menyimpan...' : perbaikanFiles.length > 0 ? 'Simpan & Submit Perbaikan' : isEdit ? 'Simpan Perubahan' : 'Buat Temuan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL: Submit Perbaikan (user/PIC — status OPEN)
// ═══════════════════════════════════════════════════════════════════════════════

interface SubmitPerbaikanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record: PicaRecord;
  user: any;
}

function SubmitPerbaikanModal({ isOpen, onClose, onSuccess, record, user }: SubmitPerbaikanModalProps) {
  const [saving,       setSaving]       = useState(false);
  const [hirarki,      setHirarki]      = useState<HiraruchiPengendalian[]>([]);
  const [rekomendasi,  setRekomendasi]  = useState('');
  const [files,        setFiles]        = useState<File[]>([]);
  // IDs file lama yang sedang dihapus (loading indicator per-file)
  const [deletingIds,  setDeletingIds]  = useState<Set<string>>(new Set());
  // Local copy file perbaikan lama agar UI langsung update setelah hapus
  const [existingFiles, setExistingFiles] = useState<typeof record.dokumentasiPerbaikanFiles>([]);

  useEffect(() => {
    if (isOpen) {
      setHirarki(record.hierarkiPengendalian as HiraruchiPengendalian[]);
      setRekomendasi(record.rekomendasiPerbaikan || '');
      setFiles([]);
      setDeletingIds(new Set());
      setExistingFiles(record.dokumentasiPerbaikanFiles);
    }
  }, [isOpen, record]);

  const toggleHirarki = (h: HiraruchiPengendalian) =>
    setHirarki((prev) => prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]);

  // Hapus satu file lama
  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Hapus file ini? Tindakan ini tidak bisa dibatalkan.')) return;
    setDeletingIds((prev) => new Set(prev).add(fileId));
    try {
      await picaApi.deleteFile(record.id, fileId);
      setExistingFiles((prev) => prev.filter((f) => (f as any).id !== fileId));
      toast.success('File berhasil dihapus');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus file');
    } finally {
      setDeletingIds((prev) => { const s = new Set(prev); s.delete(fileId); return s; });
    }
  };

  const handleSubmit = async () => {
    if (hirarki.length === 0)   { toast.error('Pilih minimal 1 hirarki pengendalian'); return; }
    if (!rekomendasi.trim())     { toast.error('Keterangan perbaikan wajib diisi'); return; }
    if (files.length === 0 && existingFiles.length === 0) {
      toast.error('Upload minimal 1 file bukti perbaikan'); return;
    }
    if (files.length === 0 && existingFiles.length > 0) {
      // Boleh submit dengan file lama yang tersisa (sudah upload sebelumnya, tinggal revisi keterangan)
    } else if (files.length === 0) {
      toast.error('Upload minimal 1 file bukti perbaikan'); return;
    }

    setSaving(true);
    try {
      // Update hirarki + rekomendasi
      const fd = new FormData();
      fd.append('temuanMasalah',        record.temuanMasalah);
      fd.append('hierarkiPengendalian', JSON.stringify(hirarki));
      fd.append('rekomendasiPerbaikan', rekomendasi);
      await picaApi.update(record.id, fd, false);

      // Submit bukti (hanya jika ada file baru)
      if (files.length > 0) {
        const buktifd = new FormData();
        files.forEach((f) => buktifd.append('dokumentasiPerbaikan', f));
        await picaApi.action({
          id: record.id, action: 'submit_perbaikan',
          formData: buktifd, oleh: user?.nama || 'User', keterangan: rekomendasi,
        });
      } else {
        // Tidak ada file baru tapi ada file lama → tetap submit action untuk ubah status
        const emptyFd = new FormData();
        await picaApi.action({
          id: record.id, action: 'submit_perbaikan',
          formData: emptyFd, oleh: user?.nama || 'User', keterangan: rekomendasi,
        });
      }

      toast.success('Bukti perbaikan disubmit! Status berubah ke INPG.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal submit perbaikan');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // Label kategori + warna
  const { label: kategoriLabel, bg: kategoriBg, text: kategoriText } =
    KATEGORI_TEMUAN_LABELS[record.kategori] ?? { label: record.kategori, bg: 'bg-gray-100', text: 'text-gray-700' };

  const sisa      = sisaHariDeadline(record.batasAkhir);
  const isTacc    = !!record.catatanTACC;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#FF6B1A] mb-0.5">Submit Tindakan Perbaikan</p>
            <h2 className="font-bold text-[15px] text-[#1F2937]">
              {isTacc ? '🔄 Revisi Perbaikan (TACC)' : '📤 Upload Bukti Perbaikan'}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1F2937] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── TACC banner ── */}
        {isTacc && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 flex-shrink-0">
            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <p className="text-[12px] font-bold text-red-700 mb-0.5">Perbaikan Ditolak (TACC) — Revisi Diperlukan</p>
              <p className="text-[12px] text-red-600">{record.catatanTACC}</p>
            </div>
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ═══ BAGIAN 1: Rincian Temuan (read-only) ═══ */}
          <FormSection title="Rincian Temuan" icon={iconInfo}>
            <div className="space-y-3">

              {/* Temuan masalah */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#9CA3AF] mb-1">Temuan Masalah</p>
                <p className="text-[13px] text-[#1F2937] font-medium leading-snug">{record.temuanMasalah}</p>
              </div>

              {/* Grid: Tanggal, Jenis, Kategori, Lokasi */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#FAFAFA] rounded-xl p-3 border border-[#E5E7EB]">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF] mb-0.5">Tanggal Temuan</p>
                  <p className="text-[12px] text-[#1F2937] font-medium">{formatTanggalPica(record.tanggalTemuan)}</p>
                </div>
                <div className="bg-[#FAFAFA] rounded-xl p-3 border border-[#E5E7EB]">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF] mb-0.5">Jenis Temuan</p>
                  <p className="text-[12px] text-[#1F2937] font-medium">{record.jenisTemuan || '—'}</p>
                </div>
                <div className="bg-[#FAFAFA] rounded-xl p-3 border border-[#E5E7EB]">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF] mb-0.5">Tingkat Keparahan</p>
                  <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-lg ${kategoriBg} ${kategoriText}`}>
                    {kategoriLabel}
                  </span>
                </div>
                <div className="bg-[#FAFAFA] rounded-xl p-3 border border-[#E5E7EB]">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF] mb-0.5">Batas Akhir</p>
                  <p className={`text-[12px] font-bold ${sisaHariColor(sisa)}`}>
                    {formatTanggalPica(record.batasAkhir)}
                  </p>
                  {sisa !== null && (
                    <p className={`text-[10px] ${sisaHariColor(sisa)}`}>
                      {sisa < 0 ? `Terlambat ${Math.abs(sisa)} hari` : `Sisa ${sisa} hari`}
                    </p>
                  )}
                </div>
              </div>

              {/* Lokasi + PIC */}
              <div className="bg-[#FAFAFA] rounded-xl p-3 border border-[#E5E7EB] grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF] mb-0.5">Lokasi / Divisi</p>
                  <p className="text-[12px] text-[#1F2937] font-medium">{record.lokasiDivisiNama || record.lokasiDivisiId || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF] mb-0.5">PIC</p>
                  <p className="text-[12px] text-[#1F2937] font-medium">{record.picNama || '—'}</p>
                </div>
              </div>

              {/* Kriteria */}
              {record.kriteriaId && record.kriteriaId !== 'TBD' && (
                <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-orange-500 mb-0.5">Kriteria SMK3</p>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 inline-block bg-[#FF6B1A] text-white font-mono font-bold text-[11px] px-2 py-0.5 rounded mt-0.5">{record.kriteriaId}</span>
                    {record.kriteriaDeskripsi && (
                      <p className="text-[12px] text-[#6B7280] leading-snug">{record.kriteriaDeskripsi}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Dokumentasi temuan (teks + file) */}
              {(record.dokumentasiTemuanTeks || record.dokumentasiTemuanFiles.length > 0) && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF] mb-1.5">Dokumentasi Temuan</p>
                  {record.dokumentasiTemuanTeks && (
                    <p className="text-[12px] text-[#6B7280] mb-2 leading-relaxed">{record.dokumentasiTemuanTeks}</p>
                  )}
                  {record.dokumentasiTemuanFiles.length > 0 && (
                    <FileList files={record.dokumentasiTemuanFiles} />
                  )}
                </div>
              )}
            </div>
          </FormSection>

          {/* ═══ BAGIAN 2: Tindakan Perbaikan (dapat diisi user) ═══ */}
          <FormSection title="Tindakan Perbaikan" icon={iconPerbaikan}
            badge={<span className="ml-auto text-[11px] text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-medium">Lengkapi & Submit</span>}>

            <Field label="Hirarki Pengendalian" required hint="Pilih satu atau lebih">
              <div className="flex flex-wrap gap-2">
                {HIRARKI_OPTIONS.map((h) => {
                  const selected = hirarki.includes(h);
                  return (
                    <button key={h} type="button" onClick={() => toggleHirarki(h)}
                      className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all ${
                        selected ? 'bg-[#FF6B1A] text-white border-[#FF6B1A] shadow-sm' : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#FF6B1A] hover:text-[#FF6B1A]'
                      }`}>
                      {selected && <span className="mr-1">✓</span>}{h}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Keterangan Tindakan Perbaikan" required>
              <textarea className={textareaCls} rows={3}
                placeholder="Tuliskan tindakan perbaikan yang sudah dilakukan..."
                value={rekomendasi} onChange={(e) => setRekomendasi(e.target.value)} />
            </Field>

            {/* File lama dengan tombol hapus */}
            {existingFiles.length > 0 && (
              <div>
                <p className="text-[13px] font-semibold text-[#1F2937] mb-1.5 flex items-center gap-1.5">
                  File Perbaikan Sebelumnya
                  <span className="text-[11px] font-normal text-[#9CA3AF]">({existingFiles.length} file — hover untuk hapus)</span>
                </p>
                <FileListWithDelete
                  files={existingFiles.map((f) => ({ ...(f as any), id: (f as any).id }))}
                  deletingIds={deletingIds}
                  onDelete={handleDeleteFile}
                />
              </div>
            )}

            {/* Upload file baru */}
            <Field
              label={existingFiles.length > 0 ? 'Tambah File Bukti Baru' : 'Bukti Perbaikan'}
              required={existingFiles.length === 0}
              optional={existingFiles.length > 0}
              hint={existingFiles.length > 0 ? 'Opsional — tambahkan file baru jika perlu' : 'Upload minimal 1 file sebagai bukti'}
            >
              <FileUploadArea files={files}
                onAdd={(f) => setFiles((p) => [...p, ...f])}
                onRemove={(i) => setFiles((p) => p.filter((_, j) => j !== i))}
                placeholder="Upload foto, laporan, atau dokumen bukti"
                subtext="Foto, PDF, dokumen — tanpa batas ukuran" />
              {files.length > 0 && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-[12px] text-blue-700">
                    <strong>{files.length} file baru</strong> akan diupload bersama dengan file yang sudah ada.
                  </p>
                </div>
              )}
            </Field>
          </FormSection>

          {/* ═══ BAGIAN 3: Riwayat (jika ada) ═══ */}
          {record.riwayatApproval.length > 0 && (
            <FormSection title="Riwayat Review" icon={iconHistory}>
              <RiwayatTimeline riwayat={record.riwayatApproval} />
            </FormSection>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[#E5E7EB] flex-shrink-0">
          <p className="text-[11px] text-[#9CA3AF]">
            {existingFiles.length > 0
              ? `${existingFiles.length} file lama tersisa${files.length > 0 ? ` + ${files.length} file baru` : ''}`
              : files.length > 0 ? `${files.length} file baru siap diupload` : 'Belum ada file'
            }
          </p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} disabled={saving}
              className="px-4 py-2 text-[13px] font-semibold text-[#1F2937] bg-[#FAFAFA] rounded-xl hover:bg-[#E5E7EB] transition-colors disabled:opacity-50">
              Batal
            </button>
            <button onClick={handleSubmit} disabled={saving || (existingFiles.length === 0 && files.length === 0)}
              className="flex items-center gap-2 px-5 py-2 bg-[#FF6B1A] text-white text-[13px] font-semibold rounded-xl hover:bg-[#E85D0F] transition-colors disabled:opacity-60">
              {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? 'Mengupload...' : isTacc ? '🔄 Submit Revisi → INPG' : '📤 Submit Perbaikan → INPG'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL: Approval / Review (admin — status INPG)
// ═══════════════════════════════════════════════════════════════════════════════

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record: PicaRecord;
  user: any;
}

function ApprovalModal({ isOpen, onClose, onSuccess, record, user }: ApprovalModalProps) {
  const [saving,         setSaving]         = useState(false);
  const [approvalAction, setApprovalAction] = useState<'ACC' | 'TACC' | null>(null);
  const [keterangan,     setKeterangan]     = useState('');

  useEffect(() => {
    if (isOpen) { setApprovalAction(null); setKeterangan(''); }
  }, [isOpen]);

  const handleApproval = async () => {
    if (!approvalAction) return;
    if (approvalAction === 'TACC' && !keterangan.trim()) {
      toast.error('Keterangan wajib diisi untuk TACC');
      return;
    }
    setSaving(true);
    try {
      await picaApi.action({
        id: record.id,
        action: approvalAction === 'ACC' ? 'approve' : 'reject',
        keterangan,
        oleh: user?.nama || 'Admin',
      });
      toast.success(approvalAction === 'ACC' ? 'Temuan ditutup (CLSD)!' : 'Perbaikan dikembalikan (TACC)');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memproses approval');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#FF6B1A] mb-0.5">Approval Temuan</p>
            <h2 className="font-bold text-[15px] text-[#1F2937]">Tutup Temuan (CLSD)</h2>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1F2937] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Info temuan */}
          <div className="p-3 bg-white rounded-xl border border-[#E5E7EB] text-[12px] space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#9CA3AF]">Temuan</p>
            <p className="text-[#1F2937] font-medium">{record.temuanMasalah}</p>
            <p className="text-[#6B7280]">PIC: <strong>{record.picNama}</strong> · Lokasi: {record.lokasiDivisiNama || record.lokasiDivisiId}</p>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <span className="text-[11px] text-[#6B7280] bg-[#FAFAFA] px-2 py-0.5 rounded-full">Kriteria: {record.kriteriaId}</span>
              {record.hierarkiPengendalian.map((h) => (
                <span key={h} className="text-[11px] bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">{h}</span>
              ))}
            </div>
          </div>

          {/* Bukti perbaikan */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#9CA3AF] mb-2">Bukti Perbaikan yang Disubmit</p>
            {record.dokumentasiPerbaikanFiles.length > 0
              ? <FileList files={record.dokumentasiPerbaikanFiles} />
              : <p className="text-[12px] text-[#9CA3AF] italic">Tidak ada file bukti</p>
            }
            {record.rekomendasiPerbaikan && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-[#E5E7EB]">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#9CA3AF] mb-1">Keterangan Perbaikan</p>
                <p className="text-[13px] text-[#1F2937]">{record.rekomendasiPerbaikan}</p>
              </div>
            )}
          </div>

          {/* Riwayat */}
          {record.riwayatApproval.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#9CA3AF] mb-2">Riwayat</p>
              <RiwayatTimeline riwayat={record.riwayatApproval} />
            </div>
          )}

          {/* Keputusan */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#1F2937] mb-3">Keputusan Review <span className="text-red-500">*</span></p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setApprovalAction('ACC')}
                className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all ${
                  approvalAction === 'ACC' ? 'border-green-500 bg-green-50' : 'border-[#E5E7EB] bg-white hover:border-green-300'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={approvalAction === 'ACC' ? '#16a34a' : '#9CA3AF'} strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className={`font-bold text-[13px] ${approvalAction === 'ACC' ? 'text-green-700' : 'text-[#6B7280]'}`}>ACC</span>
                <span className={`text-[11px] text-center ${approvalAction === 'ACC' ? 'text-green-600' : 'text-[#9CA3AF]'}`}>Setujui &amp; Tutup</span>
              </button>
              <button type="button" onClick={() => setApprovalAction('TACC')}
                className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all ${
                  approvalAction === 'TACC' ? 'border-red-500 bg-red-50' : 'border-[#E5E7EB] bg-white hover:border-red-300'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={approvalAction === 'TACC' ? '#dc2626' : '#9CA3AF'} strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                <span className={`font-bold text-[13px] ${approvalAction === 'TACC' ? 'text-red-700' : 'text-[#6B7280]'}`}>TACC</span>
                <span className={`text-[11px] text-center ${approvalAction === 'TACC' ? 'text-red-600' : 'text-[#9CA3AF]'}`}>Tolak &amp; Kembalikan</span>
              </button>
            </div>

            {approvalAction === 'ACC' && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-[12px] text-green-700">
                Status akan berubah menjadi <strong>CLOSED</strong>. Temuan dianggap selesai.
              </div>
            )}

            {approvalAction === 'TACC' && (
              <div className="mt-3 space-y-2">
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[12px] text-red-700">
                  Status akan kembali ke <strong>OPEN</strong>. PIC diminta memperbaiki dan upload ulang bukti.
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">
                    Alasan Penolakan <span className="text-red-500">*</span>
                  </label>
                  <textarea className={textareaCls} rows={3}
                    placeholder="Jelaskan apa yang perlu diperbaiki oleh PIC..."
                    value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
                </div>
              </div>
            )}

            {approvalAction && (
              <div className="mt-3">
                <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">
                  Catatan {approvalAction === 'TACC' ? '' : '(opsional)'}
                </label>
                {approvalAction === 'ACC' && (
                  <textarea className={textareaCls} rows={2}
                    placeholder="Catatan tambahan (opsional)..."
                    value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] flex-shrink-0">
          <button onClick={onClose} disabled={saving}
            className="px-4 py-2 text-[13px] font-semibold text-[#1F2937] bg-[#FAFAFA] rounded-xl hover:bg-[#E5E7EB] transition-colors disabled:opacity-50">
            Batal
          </button>
          <button onClick={handleApproval}
            disabled={saving || !approvalAction || (approvalAction === 'TACC' && !keterangan.trim())}
            className={`flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white rounded-xl transition-colors disabled:opacity-60 ${
              approvalAction === 'ACC' ? 'bg-green-600 hover:bg-green-700' : approvalAction === 'TACC' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#9CA3AF]'
            }`}>
            {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? 'Memproses...' : !approvalAction ? 'Pilih ACC / TACC' : approvalAction === 'ACC' ? 'Approve (ACC)' : 'Reject (TACC)'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL: Export PICA (date range picker + format selector)
// ═══════════════════════════════════════════════════════════════════════════════

interface PicaExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: PicaRecord[];
  onExportCSV:  (data: PicaRecord[]) => void;
  onExportHTML: (data: PicaRecord[], dateLabel: string) => Promise<void>;
  onExportPDF:  (data: PicaRecord[], dateLabel: string) => Promise<void>;
}

function PicaExportModal({ isOpen, onClose, records, onExportCSV, onExportHTML, onExportPDF }: PicaExportModalProps) {
  const [dateFrom,      setDateFrom]      = useState('');
  const [dateTo,        setDateTo]        = useState('');
  const [exportFormat,  setExportFormat]  = useState<'html' | 'csv' | 'pdf'>('html');
  const [exporting,     setExporting]     = useState(false);

  if (!isOpen) return null;

  function formatDateId(iso: string) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function filterByDate(recs: PicaRecord[]): PicaRecord[] {
    let result = [...recs];
    if (dateFrom) result = result.filter((r) => new Date(r.tanggalTemuan) >= new Date(dateFrom));
    if (dateTo) {
      const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
      result = result.filter((r) => new Date(r.tanggalTemuan) <= to);
    }
    return result;
  }

  const handleExport = async () => {
    const filtered = filterByDate(records);
    if (filtered.length === 0) {
      alert('Tidak ada record dalam rentang tanggal yang dipilih.');
      return;
    }
    const dateLabel = dateFrom && dateTo
      ? `Periode: ${formatDateId(dateFrom)} — ${formatDateId(dateTo)}`
      : `Dicetak: ${formatDateId(new Date().toISOString())}`;

    setExporting(true);
    try {
      if (exportFormat === 'csv')  { onExportCSV(filtered); onClose(); }
      if (exportFormat === 'html') { await onExportHTML(filtered, dateLabel); onClose(); }
      if (exportFormat === 'pdf')  { await onExportPDF(filtered, dateLabel); onClose(); }
    } finally {
      setExporting(false);
    }
  };

  const previewCount = filterByDate(records).length;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#FF6B1A] mb-0.5">Export Data</p>
            <h2 className="font-bold text-[15px] text-[#1F2937]">Download PICA</h2>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1F2937] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-[13px] text-[#6B7280]">
            Kosongkan tanggal untuk export semua record.
          </p>

          {/* Format selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#1F2937] mb-2">Format Export</label>
            <div className="grid grid-cols-3 gap-2">
              {/* HTML */}
              <button type="button" onClick={() => setExportFormat('html')}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 transition-all ${exportFormat === 'html' ? 'border-[#FF6B1A] bg-orange-50' : 'border-[#E5E7EB] hover:border-[#FF6B1A]/40'}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={exportFormat === 'html' ? '#FF6B1A' : '#9CA3AF'} strokeWidth="2">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
                <span className={`font-bold text-[11px] ${exportFormat === 'html' ? 'text-[#FF6B1A]' : 'text-[#6B7280]'}`}>HTML</span>
                <span className={`text-[9px] text-center leading-tight ${exportFormat === 'html' ? 'text-[#FF6B1A]' : 'text-[#9CA3AF]'}`}>Tabel + Foto</span>
              </button>
              {/* PDF */}
              <button type="button" onClick={() => setExportFormat('pdf')}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 transition-all ${exportFormat === 'pdf' ? 'border-red-500 bg-red-50' : 'border-[#E5E7EB] hover:border-red-300'}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={exportFormat === 'pdf' ? '#dc2626' : '#9CA3AF'} strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <span className={`font-bold text-[11px] ${exportFormat === 'pdf' ? 'text-red-700' : 'text-[#6B7280]'}`}>PDF</span>
                <span className={`text-[9px] text-center leading-tight ${exportFormat === 'pdf' ? 'text-red-600' : 'text-[#9CA3AF]'}`}>Print / Save</span>
              </button>
              {/* CSV */}
              <button type="button" onClick={() => setExportFormat('csv')}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 transition-all ${exportFormat === 'csv' ? 'border-green-500 bg-green-50' : 'border-[#E5E7EB] hover:border-green-300'}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={exportFormat === 'csv' ? '#16a34a' : '#9CA3AF'} strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
                </svg>
                <span className={`font-bold text-[11px] ${exportFormat === 'csv' ? 'text-green-700' : 'text-[#6B7280]'}`}>CSV</span>
                <span className={`text-[9px] text-center leading-tight ${exportFormat === 'csv' ? 'text-green-600' : 'text-[#9CA3AF]'}`}>Data saja</span>
              </button>
            </div>
            <p className="text-[11px] text-[#9CA3AF] mt-1.5">
              {exportFormat === 'html' && 'File .html berisi tabel lengkap + foto before/after embedded. Buka di browser untuk lihat atau print.'}
              {exportFormat === 'pdf'  && 'Buka tab baru dengan tabel A3 landscape, klik "Print" untuk simpan sebagai PDF.'}
              {exportFormat === 'csv'  && 'Data semua field + URL foto. Buka di Excel / Google Sheets.'}
            </p>
          </div>

          {/* Date range */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#1F2937] mb-1.5">Dari Tanggal Temuan</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3.5 py-2.5 text-[14px] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]/30 focus:border-[#FF6B1A]" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#1F2937] mb-1.5">Sampai Tanggal Temuan</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3.5 py-2.5 text-[14px] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]/30 focus:border-[#FF6B1A]" />
          </div>

          {/* Preview count */}
          <div className="px-3 py-2 bg-[#FAFAFA] rounded-xl border border-[#E5E7EB]">
            <p className="text-[12px] text-[#6B7280]">
              Record yang akan diexport:{' '}
              <strong className="text-[#1F2937]">{previewCount}</strong>
              {' '}dari{' '}
              <strong className="text-[#1F2937]">{records.length}</strong> total
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB]">
          <button onClick={onClose} disabled={exporting}
            className="px-4 py-2 text-[13px] font-semibold text-[#1F2937] bg-[#FAFAFA] rounded-xl hover:bg-[#E5E7EB] transition-colors">
            Batal
          </button>
          <button onClick={handleExport} disabled={exporting || previewCount === 0}
            className={`flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white rounded-xl transition-colors disabled:opacity-60 ${
              exportFormat === 'csv' ? 'bg-green-600 hover:bg-green-700' :
              exportFormat === 'pdf' ? 'bg-red-600 hover:bg-red-700' :
              'bg-[#FF6B1A] hover:bg-[#E85D0F]'
            }`}>
            {exporting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            )}
            {exporting ? 'Mengekspor...' :
              exportFormat === 'csv' ? 'Download CSV' :
              exportFormat === 'pdf' ? 'Export PDF' :
              'Export HTML + Foto'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

type FilterTab = 'ALL' | 'OPEN' | 'INPG' | 'CLSD' | 'TACC';

export default function PicaListPage() {
  const { user, isLoading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin';
  const searchParams = useSearchParams();

  const [records,    setRecords]    = useState<PicaRecord[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [activeTab,  setActiveTab]  = useState<FilterTab>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal state
  const [createOpen,        setCreateOpen]        = useState(false);
  const [editRecord,        setEditRecord]         = useState<PicaRecord | null>(null);
  const [submitRecord,      setSubmitRecord]       = useState<PicaRecord | null>(null);
  const [approvalRecord,    setApprovalRecord]     = useState<PicaRecord | null>(null);

  const fetchData = useCallback(async () => {
    // Tunggu sampai auth selesai resolve — cegah fetch sebelum divisionId tersedia
    if (authLoading) return;

    console.log('[PICA] fetchData — isAdmin:', isAdmin, '| divisionId:', user?.divisionId, '| divisi:', user?.divisi, '| role:', user?.role);

    setLoading(true);
    try {
      let result: PicaRecord[];

      if (isAdmin) {
        // Admin: ambil semua record tanpa filter
        result = await picaApi.getAll();
      } else if (user?.divisionId) {
        // Non-admin dengan divisionId → filter by UUID FK di backend
        console.log('[PICA] filter by divisiId:', user.divisionId);
        result = await picaApi.getAll({ divisiId: user.divisionId });
      } else if (user?.divisi) {
        // Non-admin tanpa divisionId tapi punya nama divisi (string lama) →
        // fetch semua lalu filter di frontend berdasarkan nama divisi
        // (fallback sementara sampai admin assign divisionId ke semua user)
        console.log('[PICA] fallback filter by nama divisi:', user.divisi);
        const data = await picaApi.getAll();
        const namaDivisiUser = user.divisi.trim().toLowerCase();
        result = data.filter((r) => {
          const namaDivisiRecord = r.lokasiDivisiNama?.trim().toLowerCase();
          return namaDivisiRecord && namaDivisiRecord === namaDivisiUser;
        });
      } else {
        // Non-admin tanpa divisionId dan tanpa nama divisi →
        // jangan tampilkan apapun, bukan semua record
        console.warn('[PICA] user tidak memiliki divisionId maupun divisi — record dikosongkan');
        result = [];
      }

      console.log('[PICA] records loaded:', result.length);
      setRecords(result);
    } catch {
      toast.error('Gagal memuat data PICA');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, authLoading, user?.divisionId, user?.divisi]);

  // Refresh data tanpa kehilangan posisi scroll (dipakai oleh onSuccess modal)
  const refreshData = useCallback(async () => {
    const scrollY = window.scrollY;
    await fetchData();
    // Restore scroll setelah React selesai render
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY, behavior: 'instant' as ScrollBehavior });
      });
    });
  }, [fetchData]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Auto-open modal jika ada ?id= di URL (dari klik notifikasi) ──
  useEffect(() => {
    const targetId = searchParams.get('id');
    if (!targetId || loading || records.length === 0) return;

    const target = records.find((r) => r.id === targetId);
    if (!target) return;

    // Buka modal yang sesuai berdasarkan status dan role
    if (isAdmin && target.statusPerbaikan === 'INPG') {
      setApprovalRecord(target);
    } else if (!isAdmin && target.statusPerbaikan === 'OPEN') {
      setSubmitRecord(target);
    } else if (isAdmin && target.statusPerbaikan === 'OPEN') {
      setEditRecord(target);
    }

    // Scroll ke baris record di tabel
    setTimeout(() => {
      const el = document.getElementById(`pica-row-${targetId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, [searchParams, records, loading, isAdmin]);

  // ── Filter & search ──
  const filtered = records.filter((r) => {
    const isTaccRecord = r.statusPerbaikan === 'OPEN' && !!r.catatanTACC;
    const matchTab =
      activeTab === 'ALL' ||
      (activeTab === 'TACC' ? isTaccRecord : r.statusPerbaikan === activeTab);

    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      r.temuanMasalah.toLowerCase().includes(q) ||
      r.picNama.toLowerCase().includes(q) ||
      r.lokasiDivisiNama?.toLowerCase().includes(q) ||
      r.kriteriaId.toLowerCase().includes(q) ||
      r.rekomendasiPerbaikan.toLowerCase().includes(q);

    return matchTab && matchSearch;
  });

  const stats = hitungStatistikPica(records);
  const taccCount = records.filter((r) => r.statusPerbaikan === 'OPEN' && !!r.catatanTACC).length;

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus record PICA ini?')) return;
    setDeletingId(id);
    try {
      await picaApi.remove(id);
      toast.success('Record berhasil dihapus');
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus record');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Export state ──
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // ── Helper: escape CSV cell ──
  function csvCell(val: string | number | null | undefined): string {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  // ── Helper: fetch gambar sebagai base64 ──
  async function fetchImageAsBase64(url: string): Promise<string | null> {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  // ── Export CSV (lengkap) ──
  function exportToCSV(data: PicaRecord[]) {
    const header = [
      'No', 'Tanggal Temuan', 'Jenis Temuan', 'Kategori',
      'Kriteria ID', 'Kriteria Deskripsi',
      'Temuan Masalah', 'Dokumentasi Teks',
      'Lokasi / Divisi', 'PIC', 'Batas Akhir', 'Status',
      'Hirarki Pengendalian', 'Rekomendasi Perbaikan',
      'Foto Before (1)', 'Foto Before (2)', 'Foto Before (3)',
      'Foto After (1)', 'Foto After (2)', 'Foto After (3)',
      'Tanggal Perbaikan', 'TACC Catatan',
      'Dibuat Oleh', 'Tanggal Dibuat',
    ];

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    const rows = data.map((r, idx) => {
      const beforeFiles = r.dokumentasiTemuanFiles ?? [];
      const afterFiles  = r.dokumentasiPerbaikanFiles ?? [];

      const beforeUrls = beforeFiles.slice(0, 3).map((f) =>
        f.fileUrl.startsWith('http') ? f.fileUrl : `${baseUrl}${f.fileUrl}`
      );
      const afterUrls = afterFiles.slice(0, 3).map((f) =>
        f.fileUrl.startsWith('http') ? f.fileUrl : `${baseUrl}${f.fileUrl}`
      );

      return [
        csvCell(idx + 1),
        csvCell(r.tanggalTemuan),
        csvCell(r.jenisTemuan),
        csvCell(KATEGORI_TEMUAN_LABELS[r.kategori]?.label ?? r.kategori),
        csvCell(r.kriteriaId),
        csvCell(r.kriteriaDeskripsi),
        csvCell(r.temuanMasalah),
        csvCell(r.dokumentasiTemuanTeks),
        csvCell(r.lokasiDivisiNama || r.lokasiDivisiId),
        csvCell(r.picNama),
        csvCell(r.batasAkhir),
        csvCell(STATUS_PERBAIKAN_LABELS[r.statusPerbaikan]?.label ?? r.statusPerbaikan),
        csvCell((r.hierarkiPengendalian ?? []).join('; ')),
        csvCell(r.rekomendasiPerbaikan),
        csvCell(beforeUrls[0] ?? ''),
        csvCell(beforeUrls[1] ?? ''),
        csvCell(beforeUrls[2] ?? ''),
        csvCell(afterUrls[0] ?? ''),
        csvCell(afterUrls[1] ?? ''),
        csvCell(afterUrls[2] ?? ''),
        csvCell(r.tanggalPerbaikan ?? ''),
        csvCell(r.catatanTACC ?? ''),
        csvCell(r.createdBy),
        csvCell(r.createdAt),
      ];
    });

    const csv = '\uFEFF' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PICA_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Export CSV berhasil (${data.length} record)`);
  }

  // ── Export HTML — format tabel seperti CrudPage non-conformity ──
  async function exportToHTML(data: PicaRecord[], dateLabel: string) {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const tanggalExport = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Pre-fetch semua foto ke base64 (embed inline agar bisa dibuka offline)
    const allPhotoUrls = new Set<string>();
    data.forEach((r) => {
      [...(r.dokumentasiTemuanFiles ?? []), ...(r.dokumentasiPerbaikanFiles ?? [])].forEach((f) => {
        if (/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f.fileName)) {
          const url = f.fileUrl.startsWith('http') ? f.fileUrl : `${baseUrl}${f.fileUrl}`;
          allPhotoUrls.add(url);
        }
      });
    });

    const base64Cache = new Map<string, string | null>();
    await Promise.all(Array.from(allPhotoUrls).map(async (url) => {
      base64Cache.set(url, await fetchImageAsBase64(url));
    }));

    // ── Styles ──
    const thStyle    = `padding:8px 10px;border:1px solid #d1d5db;background:#1F2937;color:#fff;font-size:11px;font-weight:700;text-align:left;white-space:nowrap;`;
    const thPhotoSt  = `padding:8px 10px;border:1px solid #d1d5db;background:#FF6B1A;color:#fff;font-size:11px;font-weight:700;text-align:center;white-space:nowrap;min-width:160px;`;
    const tdBase     = `padding:7px 10px;border:1px solid #e5e7eb;font-size:11px;vertical-align:top;`;

    // ── Header kolom tabel ──
    const headerCols = [
      `<th style="${thStyle}width:32px;">#</th>`,
      `<th style="${thStyle}min-width:60px;">Tgl Temuan</th>`,
      `<th style="${thStyle}min-width:110px;">Jenis Temuan</th>`,
      `<th style="${thStyle}min-width:90px;">Kategori</th>`,
      `<th style="${thStyle}min-width:80px;">Kriteria</th>`,
      `<th style="${thStyle}min-width:220px;">Temuan Masalah</th>`,
      `<th style="${thStyle}min-width:130px;">Lokasi / Divisi</th>`,
      `<th style="${thStyle}min-width:110px;">PIC</th>`,
      `<th style="${thStyle}min-width:80px;">Deadline</th>`,
      `<th style="${thStyle}min-width:100px;">Status</th>`,
      `<th style="${thStyle}min-width:160px;">Hirarki</th>`,
      `<th style="${thStyle}min-width:200px;">Rekomendasi Perbaikan</th>`,
      `<th style="${thStyle}min-width:80px;">Tgl Selesai</th>`,
      `<th style="${thStyle}min-width:100px;">Dibuat Oleh</th>`,
      `<th style="${thPhotoSt}min-width:160px;">📸 Foto Before<br/>(Temuan)</th>`,
      `<th style="${thPhotoSt}min-width:160px;">✅ Foto After<br/>(Perbaikan)</th>`,
    ].join('');

    // ── Helper render foto cell ──
    const renderPhotoCell = (files: PicaRecord['dokumentasiTemuanFiles'], emptyLabel: string) => {
      const tdSt = `${tdBase}text-align:center;vertical-align:middle;background:#fafafa;`;
      if (!files || files.length === 0) {
        return `<td style="${tdSt}color:#9ca3af;font-size:10px;">—<br/><span>${emptyLabel}</span></td>`;
      }
      const imgs = files.filter((f) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f.fileName));
      if (imgs.length === 0) {
        // Dokumen non-gambar
        const links = files.map((f) => {
          const href = f.fileUrl.startsWith('http') ? f.fileUrl : `${baseUrl}${f.fileUrl}`;
          return `<a href="${href}" target="_blank" style="font-size:10px;color:#FF6B1A;display:block;">📄 ${f.fileName}</a>`;
        }).join('');
        return `<td style="${tdSt}">${links}</td>`;
      }
      // Ambil foto pertama saja untuk kolom tabel (agar rapi)
      const f = imgs[0];
      const href = f.fileUrl.startsWith('http') ? f.fileUrl : `${baseUrl}${f.fileUrl}`;
      const b64 = base64Cache.get(href);
      const src = b64 ?? href;
      const extra = imgs.length > 1 ? `<div style="font-size:9px;color:#9ca3af;margin-top:3px;">+${imgs.length - 1} foto lainnya</div>` : '';
      return `<td style="${tdSt}">
        <img src="${src}" alt="foto"
          style="max-width:140px;max-height:110px;object-fit:cover;border-radius:5px;border:1px solid #d1d5db;display:block;margin:0 auto;" />
        ${extra}
      </td>`;
    };

    // ── Baris data ──
    const rowsHtml = data.map((r, idx) => {
      const isTacc       = r.statusPerbaikan === 'OPEN' && !!r.catatanTACC;
      const kategoriInfo = KATEGORI_TEMUAN_LABELS[r.kategori] ?? { label: r.kategori };
      const statusInfo   = STATUS_PERBAIKAN_LABELS[r.statusPerbaikan] ?? { label: r.statusPerbaikan };

      const kategoriColor =
        r.kategori === 'KRITIKAL' ? '#dc2626' :
        r.kategori === 'MAYOR'    ? '#ea580c' : '#ca8a04';
      const statusColor =
        r.statusPerbaikan === 'CLSD' ? '#16a34a' :
        r.statusPerbaikan === 'INPG' ? '#d97706' : '#2563eb';

      const rowBg = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
      const td = `${tdBase}background:${rowBg};`;

      const hirarkiTags = (r.hierarkiPengendalian ?? [])
        .map((h) => `<span style="display:inline-block;background:#fff7ed;color:#ea580c;border:1px solid #fed7aa;border-radius:10px;padding:1px 6px;font-size:10px;margin:1px 2px;">${h}</span>`)
        .join('');

      return `<tr>
        <td style="${td}text-align:center;color:#9ca3af;">${idx + 1}</td>
        <td style="${td}white-space:nowrap;">${new Date(r.tanggalTemuan).toLocaleDateString('id-ID')}</td>
        <td style="${td}">${r.jenisTemuan || '—'}</td>
        <td style="${td}text-align:center;">
          <span style="display:inline-block;padding:2px 8px;border-radius:12px;background:${kategoriColor}20;color:${kategoriColor};font-weight:700;font-size:10px;">${kategoriInfo.label}</span>
        </td>
        <td style="${td}font-size:10px;font-family:monospace;">${r.kriteriaId !== 'TBD' ? r.kriteriaId : '—'}</td>
        <td style="${td}font-weight:600;max-width:240px;">${r.temuanMasalah}</td>
        <td style="${td}">${r.lokasiDivisiNama || r.lokasiDivisiId || '—'}</td>
        <td style="${td}">${r.picNama || '—'}</td>
        <td style="${td}white-space:nowrap;">${new Date(r.batasAkhir).toLocaleDateString('id-ID')}</td>
        <td style="${td}text-align:center;">
          <span style="display:inline-block;padding:2px 8px;border-radius:12px;background:${statusColor}20;color:${statusColor};font-weight:700;font-size:10px;white-space:nowrap;">${isTacc ? 'OPEN (TACC)' : statusInfo.label}</span>
        </td>
        <td style="${td}">${hirarkiTags}</td>
        <td style="${td}max-width:220px;">${r.rekomendasiPerbaikan || '—'}</td>
        <td style="${td}white-space:nowrap;">${r.tanggalPerbaikan ? new Date(r.tanggalPerbaikan).toLocaleDateString('id-ID') : '—'}</td>
        <td style="${td}">${r.createdBy || '—'}</td>
        ${renderPhotoCell(r.dokumentasiTemuanFiles, 'Belum ada foto')}
        ${renderPhotoCell(r.dokumentasiPerbaikanFiles, 'Belum ada bukti')}
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>PICA Export — ${tanggalExport}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1f2937; padding: 16px; }
    @media print {
      body { padding: 4mm; font-size: 10px; }
      .no-print { display: none !important; }
      @page { margin: 8mm; size: A3 landscape; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      img { max-width: 120px !important; max-height: 90px !important; }
    }
    .header { background: #1F2937; color: white; padding: 16px 20px; margin-bottom: 14px; border-radius: 6px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; }
    .header h1 { font-size: 18px; margin-bottom: 3px; }
    .header p { font-size: 11px; color: #9ca3af; }
    .stats { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
    .stat { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 14px; text-align: center; min-width: 90px; }
    .stat-num { font-size: 20px; font-weight: 700; color: #FF6B1A; }
    .stat-label { font-size: 10px; color: #6b7280; }
    .print-btn { background: #FF6B1A; color: white; border: none; padding: 9px 18px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; margin-bottom: 14px; }
    .print-btn:hover { background: #E85D0F; }
    .table-wrap { overflow-x: auto; border-radius: 6px; border: 1px solid #d1d5db; }
    table { border-collapse: collapse; width: 100%; min-width: 1400px; }
    thead th { position: sticky; top: 0; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>PICA — Problem Identification &amp; Corrective Action</h1>
      <p>${dateLabel}</p>
    </div>
    <div style="text-align:right;">
      <p style="font-size:13px;font-weight:700;color:#FF6B1A;">${data.length} Record</p>
      <p style="font-size:10px;color:#9ca3af;">SMK3 Safety System</p>
    </div>
  </div>
  <div class="stats no-print">
    <div class="stat"><div class="stat-num">${data.length}</div><div class="stat-label">Total</div></div>
    <div class="stat"><div class="stat-num">${data.filter((r) => r.statusPerbaikan === 'OPEN').length}</div><div class="stat-label">OPEN</div></div>
    <div class="stat"><div class="stat-num">${data.filter((r) => r.statusPerbaikan === 'INPG').length}</div><div class="stat-label">INPG</div></div>
    <div class="stat"><div class="stat-num">${data.filter((r) => r.statusPerbaikan === 'CLSD').length}</div><div class="stat-label">CLSD</div></div>
  </div>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF (A3 Landscape)</button>
  <div class="table-wrap">
    <table>
      <thead><tr>${headerCols}</tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </div>
  <script>
    document.querySelectorAll('img').forEach(img => {
      img.onerror = function() {
        this.style.display = 'none';
        const p = document.createElement('p');
        p.style.cssText = 'font-size:9px;color:#9ca3af;text-align:center;margin-top:2px;';
        p.textContent = 'Foto tidak dapat dimuat';
        if (this.parentNode) this.parentNode.appendChild(p);
      };
    });
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `PICA_Export_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Export HTML berhasil (${data.length} record)`);
  }

  // ── Export PDF — buka window baru, tabel sama dengan HTML, auto-print A3 landscape ──
  async function exportToPDF(data: PicaRecord[], dateLabel: string) {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const tanggalExport = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Pre-fetch foto ke base64 untuk embed
    const allPhotoUrls = new Set<string>();
    data.forEach((r) => {
      [...(r.dokumentasiTemuanFiles ?? []), ...(r.dokumentasiPerbaikanFiles ?? [])].forEach((f) => {
        if (/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f.fileName)) {
          const url = f.fileUrl.startsWith('http') ? f.fileUrl : `${baseUrl}${f.fileUrl}`;
          allPhotoUrls.add(url);
        }
      });
    });

    const base64Cache = new Map<string, string | null>();
    await Promise.all(Array.from(allPhotoUrls).map(async (url) => {
      base64Cache.set(url, await fetchImageAsBase64(url));
    }));

    const thStyle   = `padding:6px 8px;border:1px solid #d1d5db;background:#1F2937;color:#fff;font-size:10px;font-weight:700;text-align:left;white-space:nowrap;`;
    const thPhotoSt = `padding:6px 8px;border:1px solid #d1d5db;background:#FF6B1A;color:#fff;font-size:10px;font-weight:700;text-align:center;white-space:nowrap;min-width:130px;`;
    const tdBase    = `padding:6px 8px;border:1px solid #e5e7eb;font-size:10px;vertical-align:top;`;

    const headerCols = [
      `<th style="${thStyle}width:28px;">#</th>`,
      `<th style="${thStyle}min-width:55px;">Tgl Temuan</th>`,
      `<th style="${thStyle}min-width:90px;">Jenis</th>`,
      `<th style="${thStyle}min-width:75px;">Kategori</th>`,
      `<th style="${thStyle}min-width:65px;">Kriteria</th>`,
      `<th style="${thStyle}min-width:200px;">Temuan Masalah</th>`,
      `<th style="${thStyle}min-width:120px;">Lokasi / Divisi</th>`,
      `<th style="${thStyle}min-width:100px;">PIC</th>`,
      `<th style="${thStyle}min-width:70px;">Deadline</th>`,
      `<th style="${thStyle}min-width:90px;">Status</th>`,
      `<th style="${thStyle}min-width:150px;">Hirarki</th>`,
      `<th style="${thStyle}min-width:180px;">Rekomendasi</th>`,
      `<th style="${thStyle}min-width:70px;">Tgl Selesai</th>`,
      `<th style="${thStyle}min-width:90px;">Dibuat Oleh</th>`,
      `<th style="${thPhotoSt}min-width:130px;">📸 Before</th>`,
      `<th style="${thPhotoSt}min-width:130px;">✅ After</th>`,
    ].join('');

    const renderPhotoCell = (files: PicaRecord['dokumentasiTemuanFiles'], emptyLabel: string) => {
      const tdSt = `${tdBase}text-align:center;vertical-align:middle;background:#fafafa;`;
      if (!files || files.length === 0) {
        return `<td style="${tdSt}color:#9ca3af;font-size:9px;">—</td>`;
      }
      const imgs = files.filter((f) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f.fileName));
      if (imgs.length === 0) {
        return `<td style="${tdSt}font-size:9px;color:#2563eb;">📄 file</td>`;
      }
      const f = imgs[0];
      const href = f.fileUrl.startsWith('http') ? f.fileUrl : `${baseUrl}${f.fileUrl}`;
      const b64 = base64Cache.get(href);
      const src = b64 ?? href;
      const extra = imgs.length > 1 ? `<div style="font-size:8px;color:#9ca3af;">+${imgs.length - 1}</div>` : '';
      return `<td style="${tdSt}">
        <img src="${src}" alt="foto"
          style="max-width:120px;max-height:90px;object-fit:cover;border-radius:4px;border:1px solid #d1d5db;display:block;margin:0 auto;" />
        ${extra}
      </td>`;
    };

    const rowsHtml = data.map((r, idx) => {
      const isTacc       = r.statusPerbaikan === 'OPEN' && !!r.catatanTACC;
      const kategoriInfo = KATEGORI_TEMUAN_LABELS[r.kategori] ?? { label: r.kategori };
      const statusInfo   = STATUS_PERBAIKAN_LABELS[r.statusPerbaikan] ?? { label: r.statusPerbaikan };

      const kategoriColor =
        r.kategori === 'KRITIKAL' ? '#dc2626' :
        r.kategori === 'MAYOR'    ? '#ea580c' : '#ca8a04';
      const statusColor =
        r.statusPerbaikan === 'CLSD' ? '#16a34a' :
        r.statusPerbaikan === 'INPG' ? '#d97706' : '#2563eb';

      const rowBg = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
      const td = `${tdBase}background:${rowBg};`;

      const hirarkiTags = (r.hierarkiPengendalian ?? [])
        .map((h) => `<span style="display:inline-block;background:#fff7ed;color:#ea580c;border:1px solid #fed7aa;border-radius:8px;padding:1px 5px;font-size:9px;margin:1px;">${h}</span>`)
        .join('');

      return `<tr>
        <td style="${td}text-align:center;color:#9ca3af;">${idx + 1}</td>
        <td style="${td}white-space:nowrap;">${new Date(r.tanggalTemuan).toLocaleDateString('id-ID')}</td>
        <td style="${td}">${r.jenisTemuan || '—'}</td>
        <td style="${td}text-align:center;">
          <span style="display:inline-block;padding:1px 6px;border-radius:10px;background:${kategoriColor}20;color:${kategoriColor};font-weight:700;font-size:9px;">${kategoriInfo.label}</span>
        </td>
        <td style="${td}font-size:9px;font-family:monospace;">${r.kriteriaId !== 'TBD' ? r.kriteriaId : '—'}</td>
        <td style="${td}font-weight:600;max-width:220px;">${r.temuanMasalah}</td>
        <td style="${td}">${r.lokasiDivisiNama || r.lokasiDivisiId || '—'}</td>
        <td style="${td}">${r.picNama || '—'}</td>
        <td style="${td}white-space:nowrap;">${new Date(r.batasAkhir).toLocaleDateString('id-ID')}</td>
        <td style="${td}text-align:center;">
          <span style="display:inline-block;padding:1px 6px;border-radius:10px;background:${statusColor}20;color:${statusColor};font-weight:700;font-size:9px;white-space:nowrap;">${isTacc ? 'OPEN (TACC)' : statusInfo.label}</span>
        </td>
        <td style="${td}">${hirarkiTags}</td>
        <td style="${td}max-width:200px;">${r.rekomendasiPerbaikan || '—'}</td>
        <td style="${td}white-space:nowrap;">${r.tanggalPerbaikan ? new Date(r.tanggalPerbaikan).toLocaleDateString('id-ID') : '—'}</td>
        <td style="${td}">${r.createdBy || '—'}</td>
        ${renderPhotoCell(r.dokumentasiTemuanFiles, 'Belum ada foto')}
        ${renderPhotoCell(r.dokumentasiPerbaikanFiles, 'Belum ada bukti')}
      </tr>`;
    }).join('');

    const printHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>PICA — ${tanggalExport}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 10px; color: #1f2937; padding: 8px; }
    @page { margin: 8mm; size: A3 landscape; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; }
      img { max-width: 110px !important; max-height: 85px !important; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    .header { background: #1F2937; color: white; padding: 12px 16px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; }
    .header h1 { font-size: 14px; margin-bottom: 2px; }
    .header p { font-size: 10px; color: #9ca3af; }
    .stats { display: flex; gap: 8px; margin-bottom: 10px; }
    .stat { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 5px 10px; text-align: center; }
    .stat-num { font-size: 16px; font-weight: 700; color: #FF6B1A; }
    .stat-label { font-size: 9px; color: #6b7280; }
    .print-btn { background: #FF6B1A; color: white; border: none; padding: 7px 14px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; margin-bottom: 10px; }
    .table-wrap { overflow-x: auto; border: 1px solid #d1d5db; border-radius: 4px; }
    table { border-collapse: collapse; width: 100%; }
    thead th { position: sticky; top: 0; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>PICA — Problem Identification &amp; Corrective Action</h1>
      <p>${dateLabel}</p>
    </div>
    <div style="text-align:right;">
      <p style="font-size:12px;font-weight:700;color:#FF6B1A;">${data.length} Record</p>
      <p style="font-size:9px;color:#9ca3af;">Internal Audit SMK3 — HAAMI System</p>
    </div>
  </div>
  <div class="stats no-print">
    <div class="stat"><div class="stat-num">${data.length}</div><div class="stat-label">Total</div></div>
    <div class="stat"><div class="stat-num">${data.filter((r) => r.statusPerbaikan === 'OPEN').length}</div><div class="stat-label">OPEN</div></div>
    <div class="stat"><div class="stat-num">${data.filter((r) => r.statusPerbaikan === 'INPG').length}</div><div class="stat-label">INPG</div></div>
    <div class="stat"><div class="stat-num">${data.filter((r) => r.statusPerbaikan === 'CLSD').length}</div><div class="stat-label">CLSD</div></div>
  </div>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF (A3 Landscape)</button>
  <div class="table-wrap">
    <table>
      <thead><tr>${headerCols}</tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </div>
  <script>
    document.querySelectorAll('img').forEach(img => {
      img.onerror = function() {
        this.style.display = 'none';
        const p = document.createElement('p');
        p.style.cssText = 'font-size:8px;color:#9ca3af;text-align:center;';
        p.textContent = '—';
        if (this.parentNode) this.parentNode.appendChild(p);
      };
    });
  </script>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) {
      toast.error('Popup diblokir browser. Izinkan popup dan coba lagi.');
      return;
    }
    win.document.write(printHtml);
    win.document.close();
    win.focus();
    win.onload = () => { setTimeout(() => win.print(), 800); };
    toast.success(`Membuka dialog print PDF (${data.length} record)…`);
  }

  const tabs: { key: FilterTab; label: string; count: number; color: string; activeColor: string }[] = [
    { key: 'ALL',  label: 'ALL',      count: stats.total,      color: 'border-[#E5E7EB] text-[#6B7280] hover:border-[#E5E7EB]',   activeColor: 'bg-[#1F2937] text-white border-[#1F2937]' },
    { key: 'OPEN', label: '🔵 OPEN',    count: stats.open,       color: 'border-[#E5E7EB] text-[#6B7280] hover:border-blue-300',     activeColor: 'bg-blue-600 text-white border-blue-600' },
    { key: 'TACC', label: '❌ TACC',    count: taccCount,        color: 'border-red-200 text-red-600 hover:border-red-400',          activeColor: 'bg-red-600 text-white border-red-600' },
    { key: 'INPG', label: '⏳ INPG',    count: stats.inProgress, color: 'border-[#E5E7EB] text-[#6B7280] hover:border-amber-300',   activeColor: 'bg-amber-500 text-white border-amber-500' },
    { key: 'CLSD', label: '✅ CLSD',    count: stats.closed,     color: 'border-[#E5E7EB] text-[#6B7280] hover:border-green-300',   activeColor: 'bg-green-600 text-white border-green-600' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* ── Header (sesuai CrudPage) ── */}
      <div className="bg-white px-6 md:px-10 py-8 border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF6B1A] mb-2">Internal Audit SMK3</p>
          <h1 className="font-bold text-[#1F2937] text-[clamp(22px,4vw,38px)] leading-tight">
            Problem Identification &amp; Corrective Action
          </h1>
          <p className="text-[#6B7280] text-[13px] mt-1.5">
            Manajemen temuan audit dan tindakan perbaikan SMK3
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">

        {/* ── Toolbar: Search + Export + Tambah (sesuai CrudPage) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text"
              placeholder="Cari temuan, kriteria, PIC, lokasi..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-[14px] bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 transition-colors" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1F2937]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          {/* Export Button → buka modal */}
          <button
            onClick={() => setExportModalOpen(true)}
            disabled={records.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#1F2937] text-[13px] font-semibold rounded-xl hover:border-green-400 hover:text-green-700 transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>

          {/* Tambah record (admin only) */}
          {isAdmin && (
            <button onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B1A] text-white text-[13px] font-semibold rounded-xl hover:bg-[#E85D0F] transition-colors whitespace-nowrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Tambah Record
            </button>
          )}
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors border ${
                activeTab === tab.key ? tab.activeColor : `bg-white ${tab.color}`
              }`}>
              {tab.label}
              {!loading && (
                <span className="ml-1.5 opacity-70">({tab.count})</span>
              )}
            </button>
          ))}
          <span className="ml-auto text-[12px] text-[#9CA3AF]">{filtered.length} record</span>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[1,2,3,4].map((i) => <div key={i} className="h-12 bg-[#FAFAFA] rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FAFAFA] flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <p className="font-semibold text-[#1F2937] text-[14px] mb-1">
                {search ? 'Tidak ada record yang sesuai' : 'Belum ada data PICA'}
              </p>
              <p className="text-[#6B7280] text-[13px]">
                {search
                  ? `Tidak ditemukan untuk "${search}"`
                  : !isAdmin && !user?.divisionId && !user?.divisi
                  ? 'Akun Anda belum terhubung ke divisi manapun. Hubungi admin untuk assign divisi.'
                  : 'Klik "+ Tambah Record" untuk menambahkan data pertama.'}
              </p>
              {/* Banner khusus: user belum di-assign ke divisi */}
              {!isAdmin && !user?.divisionId && !user?.divisi && (
                <div className="mt-4 flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl max-w-sm text-left">
                  <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <p className="text-[12px] text-amber-700 leading-relaxed">
                    Akun Anda belum di-assign ke divisi. Minta admin untuk mengatur divisi akun Anda melalui halaman <strong>Admin Panel</strong>.
                  </p>
                </div>
              )}
              {isAdmin && !search && (
                <button onClick={() => setCreateOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-[#FF6B1A] hover:underline font-medium">
                  + Buat temuan pertama
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#FAFAFA]">
                    <th className="text-left px-4 py-3 font-semibold text-[#6B7280] text-[11px] uppercase tracking-wide whitespace-nowrap">ID / Tanggal</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#6B7280] text-[11px] uppercase tracking-wide">Temuan Masalah</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#6B7280] text-[11px] uppercase tracking-wide">Lokasi</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#6B7280] text-[11px] uppercase tracking-wide">PIC</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#6B7280] text-[11px] uppercase tracking-wide whitespace-nowrap">Deadline</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#6B7280] text-[11px] uppercase tracking-wide whitespace-nowrap">Status</th>
                    <th className="text-center px-4 py-3 font-semibold text-[#6B7280] text-[11px] uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAFAFA]">
                  {filtered.map((record) => {
                    const sisa      = sisaHariDeadline(record.batasAkhir);
                    const terlambat = isTerlambat(record);
                    const isTacc    = record.statusPerbaikan === 'OPEN' && !!record.catatanTACC;
                    const canSubmit = !isAdmin && record.statusPerbaikan === 'OPEN';
                    const canApprove = isAdmin && record.statusPerbaikan === 'INPG';
                    return (
                      <tr key={record.id}
                        className={`hover:bg-[#FAFAFA] transition-colors ${
                          isTacc ? 'bg-red-50/40 border-l-2 border-l-red-400' : terlambat ? 'bg-red-50/30' : ''
                        }`}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-mono text-[10px] text-[#9CA3AF]">{record.id.slice(0, 14)}…</div>
                          <div className="text-[11px] text-[#6B7280] mt-0.5">{formatTanggalPica(record.tanggalTemuan)}</div>
                        </td>
                        <td className="px-4 py-3 max-w-[260px]">
                          <div className="font-medium text-[#1F2937] line-clamp-2 leading-snug">{record.temuanMasalah}</div>
                          {record.kriteriaDeskripsi && (
                            <div className="text-[11px] text-[#9CA3AF] mt-0.5 line-clamp-1">Kriteria {record.kriteriaId}</div>
                          )}
                          {isTacc && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-red-600">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                              <span className="line-clamp-1 italic">{record.catatanTACC}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 max-w-[140px]">
                          <div className="text-[#6B7280] text-[12px] leading-snug line-clamp-2">
                            {record.lokasiDivisiNama || record.lokasiDivisiId}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-[#6B7280] text-[12px]">{record.picNama}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-[#6B7280] text-[12px]">{formatTanggalPica(record.batasAkhir)}</div>
                          {record.statusPerbaikan !== 'CLSD' && sisa !== null && (
                            <div className={`text-[10px] mt-0.5 font-medium ${sisaHariColor(sisa)}`}>
                              {sisa < 0 ? `Terlambat ${Math.abs(sisa)} hr` : `Sisa ${sisa} hr`}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusPill status={record.statusPerbaikan} isTacc={isTacc} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">

                            {/* Submit perbaikan — user, status OPEN */}
                            {canSubmit && (
                              <button onClick={() => setSubmitRecord(record)}
                                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#FF6B1A] hover:bg-[#FAFAFA] transition-colors"
                                title="Submit Perbaikan">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M9 11l3 3L22 4"/>
                                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                </svg>
                              </button>
                            )}

                            {/* Approval — admin, status INPG */}
                            {canApprove && (
                              <button onClick={() => setApprovalRecord(record)}
                                className="p-1.5 rounded-lg text-purple-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                                title="Review / Approval">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                </svg>
                              </button>
                            )}

                            {/* Edit — admin, status OPEN */}
                            {isAdmin && record.statusPerbaikan === 'OPEN' && (
                              <button onClick={() => setEditRecord(record)}
                                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#FF6B1A] hover:bg-[#FAFAFA] transition-colors"
                                title="Edit Record">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                            )}

                            {/* Delete — admin only */}
                            {isAdmin && (
                              <button onClick={() => handleDelete(record.id)}
                                disabled={deletingId === record.id}
                                className="p-1.5 rounded-lg text-[#6B7280] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Hapus Record">
                                {deletingId === record.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="m19 6-.867 14.142A2 2 0 0 1 16.138 22H7.862a2 2 0 0 1-1.995-1.858L5 6"/>
                                    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-[#FAFAFA] flex items-center justify-between text-[12px] text-[#9CA3AF] bg-[#FAFAFA]">
              <span>{filtered.length} dari {records.length} record</span>
              {(search || activeTab !== 'ALL') && (
                <button onClick={() => { setSearch(''); setActiveTab('ALL'); }}
                  className="text-[#FF6B1A] hover:underline text-[12px] font-medium">
                  Reset filter
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <CreateEditModal
        isOpen={createOpen || !!editRecord}
        onClose={() => { setCreateOpen(false); setEditRecord(null); }}
        onSuccess={refreshData}
        record={editRecord}
        user={user}
      />

      {submitRecord && (
        <SubmitPerbaikanModal
          isOpen={!!submitRecord}
          onClose={() => setSubmitRecord(null)}
          onSuccess={refreshData}
          record={submitRecord}
          user={user}
        />
      )}

      {approvalRecord && (
        <ApprovalModal
          isOpen={!!approvalRecord}
          onClose={() => setApprovalRecord(null)}
          onSuccess={refreshData}
          record={approvalRecord}
          user={user}
        />
      )}

      {/* ── Export Modal ── */}
      <PicaExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        records={records}
        onExportCSV={exportToCSV}
        onExportHTML={exportToHTML}
        onExportPDF={exportToPDF}
      />
    </div>
  );
}
