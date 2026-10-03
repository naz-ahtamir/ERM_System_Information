'use client';

import React from 'react';
import type { SafetyRecord } from '@/lib/api';
import type { FormField } from './RecordFormModal';

interface RecordTableProps {
  records: SafetyRecord[];
  fields: FormField[];          // kolom dinamis dari field data
  isAdmin: boolean;
  isLoading: boolean;
  onEdit?: (record: SafetyRecord) => void;
  onDelete?: (record: SafetyRecord) => void;
  emptyMessage?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function RecordTable({
  records,
  fields,
  isAdmin,
  isLoading,
  onEdit,
  onDelete,
  emptyMessage = 'Belum ada record. Klik "Tambah Record" untuk memulai.',
}: RecordTableProps) {
  if (isLoading) {
    return (
      <div className="p-8 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-[#f1f0ee] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#f1f0ee] flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c5c0bb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </div>
        <p className="text-[#6b6560] text-[14px]">{emptyMessage}</p>
      </div>
    );
  }

  // Hanya tampilkan maksimal 3 kolom data agar tabel tidak terlalu lebar
  const visibleFields = fields.slice(0, 3);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b-2 border-[#e5e0db]">
            <th className="text-left py-3 px-4 font-semibold text-[#6b6560] text-[11px] uppercase tracking-wide">
              #
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[#6b6560] text-[11px] uppercase tracking-wide">
              Judul
            </th>
            {visibleFields.map((f) => (
              <th
                key={f.key}
                className="text-left py-3 px-4 font-semibold text-[#6b6560] text-[11px] uppercase tracking-wide hidden md:table-cell"
              >
                {f.label}
              </th>
            ))}
            <th className="text-left py-3 px-4 font-semibold text-[#6b6560] text-[11px] uppercase tracking-wide hidden lg:table-cell">
              Dibuat Oleh
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[#6b6560] text-[11px] uppercase tracking-wide hidden lg:table-cell">
              Tanggal
            </th>
            {isAdmin && (
              <th className="text-right py-3 px-4 font-semibold text-[#6b6560] text-[11px] uppercase tracking-wide">
                Aksi
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f1f0ee]">
          {records.map((record, idx) => (
            <tr key={record.id} className="hover:bg-[#faf9f7] transition-colors group">
              <td className="py-3 px-4 text-[#a09b96] text-[12px]">{idx + 1}</td>
              <td className="py-3 px-4">
                <span className="font-medium text-[#231f20] leading-snug">{record.title}</span>
              </td>
              {visibleFields.map((f) => (
                <td
                  key={f.key}
                  className="py-3 px-4 text-[#6b6560] hidden md:table-cell max-w-[180px]"
                >
                  <span className="truncate block">
                    {record.data?.[f.key] ? String(record.data[f.key]) : '—'}
                  </span>
                </td>
              ))}
              <td className="py-3 px-4 text-[#6b6560] hidden lg:table-cell">
                {record.createdByName || '—'}
              </td>
              <td className="py-3 px-4 text-[#6b6560] hidden lg:table-cell whitespace-nowrap">
                {formatDate(record.createdAt)}
              </td>
              {isAdmin && (
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onEdit?.(record)}
                      className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium text-[#231f20] bg-[#f1f0ee] rounded-lg hover:bg-[#e5e0db] transition-colors"
                      title="Edit record"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete?.(record)}
                      className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      title="Hapus record"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                      Hapus
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
